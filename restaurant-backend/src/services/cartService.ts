import { Order, CartItem } from "../models/order";
import * as repo from "../repositories/orderRepository";
import { getProductById } from "../repositories/productRepository";
import { v4 as uuid } from "uuid";
import { PRICING } from "../config/constants";
import { createEvent, EventType } from "../utils/eventFactory";

const calculateTotals = async (items: CartItem[]): Promise<{ subtotal: number, total: number }> => {
    let subtotal = 0;
    for (const item of items) {
        if (item.price === undefined) {
            const product = await getProductById(item.productId);
            item.price = product ? product.price : 0;
        }
        subtotal += item.price * item.quantity;
    }
    const tax = Math.round(subtotal * PRICING.TAX_RATE);
    const serviceFee = PRICING.SERVICE_FEE;
    return { subtotal, total: subtotal + tax + serviceFee };
}

/**
 * Validates selected modifiers against product definition
 */
const validateModifiers = (product: any, selectedModifiers?: Record<string, string>) => {
    const modifiers = product.modifiers || [];
    const selected = selectedModifiers || {};
    console.log("modifiers", modifiers)
    console.log("selectedModifiers", selectedModifiers)

    for (const mod of modifiers) {
        const values = selected[mod.id] || [];

        // required validation
        if (mod.required && values.length === 0) {
            throw new Error(`Modifier ${mod.name} is required`);
        }

        // maxSelect validation
        if (mod.maxSelect && values.length > mod.maxSelect) {
            throw new Error(
                `Too many selections for modifier ${mod.name}`
            );
        }

        // option validation
        for (const value of values) {
            if (!mod.options.includes(value)) {
                throw new Error(
                    `Invalid option "${value}" for modifier ${mod.name}`
                );
            }
        }
    }

    const modIds = modifiers.map((m: any) => m.id);
    for (const id of Object.keys(selected)) {
        if (!modIds.includes(id)) {
            throw new Error(`Unknown modifier ${id}`);
        }
    }
};

const areModifiersEqual = (m1?: Record<string, string>, m2?: Record<string, string>): boolean => {
    if (!m1 && !m2) return true;
    if (!m1 || !m2) return false;
    const keys1 = Object.keys(m1);
    const keys2 = Object.keys(m2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every(k => m1[k] === m2[k]);
};

const initializeCart = async (userId: string): Promise<Order> => {
    const order: Order = {
        id: uuid(),
        userId,
        items: [],
        subtotal: 0,
        total: 0,
        status: "CART"
    };
    await repo.saveOrder(order);
    await repo.appendEvent(createEvent(order.id, userId, EventType.CART_CREATED, { orderId: order.id }));
    return order;
};

export const addToCart = async (userId: string, item: Omit<CartItem, "id">) => {
    let order = await repo.getCartByUserId(userId);

    if (!order) {
        order = await initializeCart(userId);
    }

    try {
        const product = await getProductById(item.productId);
        if (!product) throw new Error("Product not found");
        validateModifiers(product, item.selectedModifiers);
    } catch (err: any) {
        await repo.appendEvent(createEvent(order.id, userId, EventType.VALIDATION_FAILED, {
            reason: err.message,
            item
        }));
        throw err;
    }

    const existing = order.items.find(i =>
        i.productId === item.productId &&
        areModifiersEqual(i.selectedModifiers, item.selectedModifiers)
    );

    // Lean product snapshot — exclude modifiers array to keep payload small
    const buildSnapshot = (p: Awaited<ReturnType<typeof getProductById>>) =>
        p ? { id: p.id, name: p.name, price: p.price } : undefined;

    if (existing) {
        existing.quantity += item.quantity;
        const product = await getProductById(item.productId);
        if (product) {
            existing.price = product.price;
            existing.product = buildSnapshot(product);
        }
    } else {
        const product = await getProductById(item.productId);
        if (!product) throw new Error("Product not found");
        order.items.push({
            ...item,
            id: uuid(),
            price: product.price,
            product: buildSnapshot(product)
        });
    }

    const totals = await calculateTotals(order.items);
    order.subtotal = totals.subtotal;
    order.total = totals.total;

    await repo.saveOrder(order);
    await repo.appendEvent(createEvent(order.id, userId, EventType.CART_ITEM_ADDED, {
        productId: item.productId,
        quantity: item.quantity,
        selectedModifiers: item.selectedModifiers
    }));
    await repo.appendEvent(createEvent(order.id, userId, EventType.PRICING_CALCULATED, { subtotal: order.subtotal, total: order.total }));

    return order;
};

export const getCart = async (userId: string) => {
    let cart = await repo.getCartByUserId(userId);
    if (!cart) {
        cart = await initializeCart(userId);
    }
    return cart;
};

export const updateCartItem = async (userId: string, itemId: string, quantity: number) => {
    const order = await repo.getCartByUserId(userId);
    if (!order) throw new Error("Cart not found");

    const itemIndex = order.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error("Item not found");

    const item = order.items[itemIndex];
    item.quantity = quantity;

    if (quantity <= 0) {
        order.items.splice(itemIndex, 1);
        await repo.appendEvent(createEvent(order.id, userId, EventType.CART_ITEM_REMOVED, { itemId }));
    } else {
        await repo.appendEvent(createEvent(order.id, userId, EventType.CART_ITEM_UPDATED, { itemId, quantity }));
    }

    const totals = await calculateTotals(order.items);
    order.subtotal = totals.subtotal;
    order.total = totals.total;

    await repo.saveOrder(order);
    await repo.appendEvent(createEvent(order.id, userId, EventType.PRICING_CALCULATED, { subtotal: order.subtotal, total: order.total }));

    return order;
};

export const removeCartItem = async (userId: string, itemId: string) => {
    return await updateCartItem(userId, itemId, 0);
};
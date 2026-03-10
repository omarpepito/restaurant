import { Product } from "./product";

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    price: number; // Unit price at the time of adding to cart
    selectedModifiers?: Record<string, string>;
    product?: Pick<Product, 'id' | 'name' | 'price'>; // Lean snapshot — no modifiers (reduces payload size)
}

export type OrderStatus = "CART" | "ORDER_PLACED" | "ORDER_PAYED" | "ORDER_COMPLETED";

export interface OrderEvent {
    eventId: string;
    timestamp: string;
    orderId: string;
    userId: string;
    type: string;
    source: "web" | "api" | "worker";
    correlationId: string;
    payload: any;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    total: number;
    status: OrderStatus;
}
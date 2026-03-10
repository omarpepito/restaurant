import { v4 as uuid } from "uuid";
import { Order } from "../models/order";
import * as repo from "../repositories/orderRepository";
import { createEvent, EventType } from "../utils/eventFactory";

export const checkoutOrder = async (order: Order, idempotencyKey: string): Promise<Order> => {
    // Check if idempotent key already used
    if (idempotencyKey) {
        const events = await repo.getOrderTimeline(order.id, 50);
        const alreadyPlaced = events.events.find(
            (e: any) => e.type === EventType.ORDER_PLACED && e.correlationId === idempotencyKey
        );
        if (alreadyPlaced) {
            return order;
        }
    }

    const previousStatus = order.status;
    order.status = "ORDER_PLACED";
    await repo.saveOrder(order);
    
    await repo.appendEvent(createEvent(order.id, order.userId, EventType.ORDER_STATUS_CHANGED, { 
        from: previousStatus,
        to: order.status
    }, idempotencyKey || uuid()));

    await repo.appendEvent(createEvent(order.id, order.userId, EventType.ORDER_PLACED, { 
        items: order.items,
        subtotal: order.subtotal,
        total: order.total
    }, idempotencyKey || uuid()));
    
    return order;
};

export const getOrder = async (orderId: string) => {
    return await repo.getOrder(orderId);
};

export const getUserOrders = async (userId: string) => {
    return await repo.getOrdersByUserId(userId);
};

export const getOrderTimeline = async (orderId: string, pageSize?: number, lastEvaluatedKey?: Record<string, any>) => {
    return await repo.getOrderTimeline(orderId, pageSize, lastEvaluatedKey);
};
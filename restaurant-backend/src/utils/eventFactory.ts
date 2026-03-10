import { v4 as uuid } from "uuid";
import { OrderEvent } from "../models/order";
import { SYSTEM } from "../config/constants";

export enum EventType {
    CART_CREATED = "CART_CREATED",
    CART_ITEM_ADDED = "CART_ITEM_ADDED",
    CART_ITEM_UPDATED = "CART_ITEM_UPDATED",
    CART_ITEM_REMOVED = "CART_ITEM_REMOVED",
    PRICING_CALCULATED = "PRICING_CALCULATED",
    ORDER_PLACED = "ORDER_PLACED",
    ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
    VALIDATION_FAILED = "VALIDATION_FAILED"
}

export enum EventSource {
    WEB = "web",
    API = "api",
    WORKER = "worker"
}

export const createEvent = (
    orderId: string, 
    userId: string, 
    type: EventType, 
    payload: any, 
    correlationId: string = uuid()
): OrderEvent => ({
    eventId: uuid(),
    timestamp: new Date().toISOString(),
    orderId,
    userId,
    type,
    source: SYSTEM.SOURCE as "web" | "api" | "worker",
    correlationId,
    payload
});

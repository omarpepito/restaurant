import * as service from "../services/orderService";
import * as cartService from "../services/cartService";
import { withMiddleware } from "../utils/handlerWrapper";

export const checkout = withMiddleware(async (event) => {
    const { userId } = JSON.parse(event.body || "{}");
    const idempotencyKey = event.headers["Idempotency-Key"] || event.headers["idempotency-key"] || "";

    const cart = await cartService.getCart(userId);
    if (!cart || !cart.items.length) {
        throw { statusCode: 400, message: "Cart empty" };
    }

    const order = await service.checkoutOrder(cart, idempotencyKey);
    return { 
        statusCode: 202, 
        body: JSON.stringify({ orderId: order.id }) 
    };
});

export const get = withMiddleware(async (event) => {
    const orderId = event.pathParameters?.orderId!;
    const order = await service.getOrder(orderId);
    if (!order) {
        throw { statusCode: 404, message: "Order not found" };
    }
    return order;
});

export const listByUser = withMiddleware(async (event) => {
    const userId = event.pathParameters?.userId!;
    return await service.getUserOrders(userId);
});

export const timeline = withMiddleware(async (event) => {
    const orderId = event.pathParameters?.orderId!;
    const pageSize = event.queryStringParameters?.pageSize ? parseInt(event.queryStringParameters.pageSize) : 50;
    
    let lastEvaluatedKey = undefined;
    if (event.queryStringParameters?.lastKey) {
        try {
            lastEvaluatedKey = JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey));
        } catch (e) {
            // ignore
        }
    }

    return await service.getOrderTimeline(orderId, pageSize, lastEvaluatedKey);
});
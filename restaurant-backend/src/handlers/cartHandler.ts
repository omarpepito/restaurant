import * as service from "../services/cartService";
import { withMiddleware } from "../utils/handlerWrapper";

export const add = withMiddleware(async (event) => {
    const body = JSON.parse(event.body || "{}");
    return await service.addToCart(body.userId, body.item);
});

export const get = withMiddleware(async (event) => {
    const userId = event.pathParameters?.userId!;
    return await service.getCart(userId);
});

export const update = withMiddleware(async (event) => {
    const userId = event.pathParameters?.userId!;
    const itemId = event.pathParameters?.itemId!;
    const { quantity } = JSON.parse(event.body || "{}");
    return await service.updateCartItem(userId, itemId, quantity);
});

export const remove = withMiddleware(async (event) => {
    const userId = event.pathParameters?.userId!;
    const itemId = event.pathParameters?.itemId!;
    await service.removeCartItem(userId, itemId);
    return { removed: itemId };
});
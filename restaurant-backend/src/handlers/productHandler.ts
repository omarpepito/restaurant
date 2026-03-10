import * as service from "../services/productService";
import { v4 as uuid } from "uuid";
import { withMiddleware } from "../utils/handlerWrapper";

export const create = withMiddleware(async (event) => {
    const body = JSON.parse(event.body || "{}");
    const product = { id: uuid(), ...body };
    return await service.createProduct(product);
});

export const get = withMiddleware(async () => {
    return await service.listProducts();
});
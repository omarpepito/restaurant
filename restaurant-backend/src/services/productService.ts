import { Product } from "../models/product";
import * as repo from "../repositories/productRepository";

export const createProduct = async (product: Product) => {
    // Business Validation
    if (product.modifiers) {
        for (const mod of product.modifiers) {
            if (mod.required && (!mod.options || !mod.options.length)) {
                throw new Error(`Required modifier ${mod.name} must have options`);
            }
        }
    }

    await repo.saveProduct(product);
    return product;
};

export const listProducts = async () => {
    return await repo.getAllProducts();
};

export const getProduct = async (id: string) => {
    return await repo.getProductById(id);
};

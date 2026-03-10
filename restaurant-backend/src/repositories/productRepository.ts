import { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/dynamoClient";
import { Product } from "../models/product";
import { TABLES } from "../config/constants";

const docClient = DynamoDBDocumentClient.from(dynamo);

export const saveProduct = async (product: Product) => {
    await docClient.send(new PutCommand({
        TableName: TABLES.PRODUCTS,
        Item: product
    }));
};

export const getProductById = async (productId: string): Promise<Product | null> => {
    const result = await docClient.send(new GetCommand({
        TableName: TABLES.PRODUCTS,
        Key: { id: productId }
    }));
    return result.Item as Product || null;
};

export const getAllProducts = async (): Promise<Product[]> => {
    const result = await docClient.send(new ScanCommand({ TableName: TABLES.PRODUCTS }));
    return result.Items as Product[];
};
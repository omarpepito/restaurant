import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../db/dynamoClient";
import { Order, OrderEvent } from "../models/order";
import { logger } from "../utils/logger";

import { TABLES } from "../config/constants";

const docClient = DynamoDBDocumentClient.from(dynamo);
const ORDERS_TABLE = TABLES.ORDERS;
const EVENTS_TABLE = TABLES.ORDER_EVENTS;

export const saveOrder = async (order: Order) => {
    await docClient.send(new PutCommand({
        TableName: ORDERS_TABLE,
        Item: order
    }));
    logger.info(`Order saved: ${order.id}`, { status: order.status });
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
    const result = await docClient.send(new GetCommand({
        TableName: ORDERS_TABLE,
        Key: { id: orderId }
    }));
    return result.Item as Order || null;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const result = await docClient.send(new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));
    return (result.Items as Order[]) || [];
};

export const appendEvent = async (event: OrderEvent) => {
    await docClient.send(new PutCommand({
        TableName: EVENTS_TABLE,
        Item: event
    }));
    logger.info(`Event appended: ${event.eventId}`, { type: event.type, orderId: event.orderId, payload: event.payload });
};

export const getOrderTimeline = async (orderId: string, pageSize = 50, lastEvaluatedKey?: Record<string, any>): Promise<{ events: OrderEvent[], lastEvaluatedKey?: Record<string, any> }> => {
    const params: any = {
        TableName: EVENTS_TABLE,
        IndexName: "OrderIdTimestampIndex",
        KeyConditionExpression: "orderId = :orderId",
        ExpressionAttributeValues: {
            ":orderId": orderId
        },
        Limit: pageSize
    };

    if (lastEvaluatedKey) {
        params.ExclusiveStartKey = lastEvaluatedKey;
    }

    const result = await docClient.send(new QueryCommand(params));
    return {
        events: (result.Items as OrderEvent[]) || [],
        lastEvaluatedKey: result.LastEvaluatedKey
    };
};

export const getCartByUserId = async (userId: string): Promise<Order | null> => {
    const result = await docClient.send(new QueryCommand({
        TableName: ORDERS_TABLE,
        IndexName: "UserIdIndex",
        KeyConditionExpression: "userId = :userId",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":userId": userId,
            ":status": "CART"
        }
    }));
    
    if (result.Items && result.Items.length > 0) {
        return result.Items[0] as Order;
    }
    return null;
};
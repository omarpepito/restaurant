import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { isPayloadTooLarge } from "./helpers";
import { logger } from "./logger";

type Handler = (event: APIGatewayProxyEvent, context: Context) => Promise<any>;

/**
 * Middleware wrapper for Lambda handlers to centralize:
 * - Payload size validation
 * - Generic error handling
 * - Standard JSON response formatting
 */
export const withMiddleware = (handler: Handler) => {
    return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
        try {
            // 1. Validation: Payload Size
            if (event.body && isPayloadTooLarge(event.body)) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: "Payload too large (limit 16KB)" })
                };
            }

            // 2. Execute original handler
            const result = await handler(event, context);

            // 3. Auto-format success response if it's not already a valid APIGatewayProxyResult
            if (result && typeof result === 'object' && 'statusCode' in result) {
                return result;
            }

            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };

        } catch (error: any) {
            logger.error("Handler Error:", error);

            return {
                statusCode: error.statusCode || 500,
                body: JSON.stringify({
                    message: error.message || "Internal Server Error",
                    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
                })
            };
        }
    };
};

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamo = new DynamoDBClient({
  region: "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://dynamodb:8000",
  credentials: {
    accessKeyId: "dummy",
    secretAccessKey: "dummy"
  }
}); 
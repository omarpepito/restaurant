const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const tables = [
  {
    TableName: "Products",
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: "Orders",
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "userId", AttributeType: "S" }
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserIdIndex",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  },
  {
    TableName: "OrderEvents",
    AttributeDefinitions: [
      { AttributeName: "eventId", AttributeType: "S" },
      { AttributeName: "orderId", AttributeType: "S" },
      { AttributeName: "timestamp", AttributeType: "S" }
    ],
    KeySchema: [{ AttributeName: "eventId", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "OrderIdTimestampIndex",
        KeySchema: [
          { AttributeName: "orderId", KeyType: "HASH" },
          { AttributeName: "timestamp", KeyType: "RANGE" }
        ],
        Projection: { ProjectionType: "ALL" }
      }
    ],
    BillingMode: "PAY_PER_REQUEST"
  }
];

async function setupTables() {
  let listResult;
  let retries = 5;
  while (retries > 0) {
    try {
      listResult = await client.send(new ListTablesCommand({}));
      break;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.name === 'ConnectTimeoutError') {
        console.log(`DynamoDB not ready, retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      } else {
        throw err;
      }
    }
  }

  if (!listResult) {
    throw new Error("Could not connect to DynamoDB after several retries.");
  }

  try {
    const existingTables = listResult.TableNames || [];

    for (const tableDef of tables) {
      if (!existingTables.includes(tableDef.TableName)) {
        await client.send(new CreateTableCommand(tableDef));
        console.log(`Created table: ${tableDef.TableName}`);
      } else {
        console.log(`Table already exists: ${tableDef.TableName}`);
      }
    }
  } catch (err) {
    console.error("Error setting up tables:", err);
  }
}

async function run() {
  await setupTables();
  console.log("Database tables setup complete.");
  console.log("To seed products, please run `node scripts/seed-products.js` afterward.");
}

run();

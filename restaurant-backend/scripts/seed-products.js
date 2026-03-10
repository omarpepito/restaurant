const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuid } = require('uuid');

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const products = [
  {
    id: "prod_1",
    name: "Classic Burger",
    price: 1250, // 12.50
    modifiers: [
      {
        id: "mod_protein",
        name: "Protein",
        options: ["Beef", "Chicken", "Veggie"],
        required: true,
        maxSelect: 1
      },
      {
        id: "mod_toppings",
        name: "Toppings",
        options: ["Lettuce", "Tomato", "Onion", "Pickles", "Bacon", "Cheese"],
        required: false,
        maxSelect: 4
      },
      {
        id: "mod_sauces",
        name: "Sauces",
        options: ["Ketchup", "Mustard", "Mayo", "BBQ", "Secret Sauce"],
        required: false,
        maxSelect: 2
      }
    ]
  },
  {
    id: "prod_2",
    name: "Spicy Chicken Sandwich",
    price: 1300, // 13.00
    modifiers: [
      {
        id: "mod_protein",
        name: "Protein",
        options: ["Fried Chicken", "Grilled Chicken"],
        required: true,
        maxSelect: 1
      },
      {
        id: "mod_toppings",
        name: "Toppings",
        options: ["Lettuce", "Tomato", "Pickles", "Jalapenos"],
        required: false,
        maxSelect: 3
      },
      {
        id: "mod_sauces",
        name: "Sauces",
        options: ["Spicy Mayo", "Ranch", "Hot Sauce"],
        required: false,
        maxSelect: 2
      }
    ]
  },
  {
    id: "prod_3",
    name: "French Fries",
    price: 450, // 4.50
    modifiers: []
  },
  {
    id: "prod_4",
    name: "Onion Rings",
    price: 550, // 5.50
    modifiers: []
  },
  {
    id: "prod_5",
    name: "Chocolate Shake",
    price: 600, // 6.00
    modifiers: []
  },
  {
    id: "prod_6",
    name: "Vanilla Shake",
    price: 600, // 6.00
    modifiers: []
  },
  {
    id: "prod_7",
    name: "Fountain Drink",
    price: 300, // 3.00
    modifiers: []
  }
];

async function checkProductsExist() {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: 'Products',
      Limit: 1
    }));
    return result.Items && result.Items.length > 0;
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      return false;
    }
    throw err;
  }
}

async function seedProducts() {
  const exists = await checkProductsExist();
  if (exists) {
    console.log("Products already exist in the database. Skipping seed.");
    return;
  }

  for (const product of products) {
    try {
      await docClient.send(new PutCommand({
        TableName: 'Products',
        Item: product
      }));
      console.log(`Product ${product.name} seeded.`);
    } catch (err) {
      console.error(`Error seeding product ${product.name}:`, err);
    }
  }
  console.log("Seeding complete.");
}

async function run() {
  let retries = 5;
  while (retries > 0) {
    try {
      await seedProducts();
      break;
    } catch (err) {
      if (err.code === 'ECONNREFUSED' || err.name === 'ConnectTimeoutError') {
        console.log(`DynamoDB not ready for seeding, retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      } else {
        console.error("Seeding failed with error:", err);
        process.exit(1);
      }
    }
  }
}

run().catch(console.error);

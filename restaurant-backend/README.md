## Restaurant Backend (Serverless + DynamoDB)

This is the backend for the restaurant ordering flow, built with the Serverless Framework and DynamoDB Local.

---

## Prerequisites

- **Node.js**: v20.x (LTS recommended)
- **Package manager**: `npm`

---

## Environment Setup

From `restaurant-backend`, create a local env file from the example:

```bash
cd restaurant-backend
cp .env.example .env
```

`.env.example` contains:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
DYNAMODB_ENDPOINT=http://localhost:8000
```

- **`AWS_REGION`**: AWS region for SDK calls (local value is fine).
- **`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`**: Dummy credentials for local DynamoDB.
- **`DYNAMODB_ENDPOINT`**: Where DynamoDB Local is running (default `http://localhost:8000`).

---

## Run the Backend Locally (Without Docker)

### 1. Install dependencies

```bash
cd restaurant-backend
npm install
```

### 2. Start DynamoDB Local (via Serverless plugin)

```bash
npm run dynamodb
```

This starts DynamoDB Local on **port 8000**. Leave this terminal open.

### 3. Start the API with Serverless Offline

Open a **new terminal**:

```bash
cd restaurant-backend

# Ensure .env exists (see above)
# Then start the offline API
npm run dev
```

This starts the HTTP API on:

- **Backend/API base**: `http://localhost:3002/dev`

---

## Seed / Sample Data

With DynamoDB Local running, you can create tables and seed products:

```bash
cd restaurant-backend
node scripts/setup-db.js
node scripts/seed-products.js
```

After this, the `/products` endpoint should return sample menu items.

---

## Example API Usage (cURL)

Assuming the backend is running on `http://localhost:3002/dev`:

### Get menu (products)

```bash
curl -X GET http://localhost:3002/dev/products
```

### Add item to cart

```bash
curl -X POST http://localhost:3002/dev/cart \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "item": {
      "productId": "prod_1",
      "quantity": 1,
      "selectedModifiers": {
        "mod_protein": ["Beef"],
        "mod_toppings": ["Lettuce", "Tomato"]
      }
    }
  }'
```

Note the `orderId` (or cart id) returned in the response.

### Get cart for a user

```bash
curl -X GET http://localhost:3002/dev/cart/user_123
```

### Checkout order

```bash
curl -X POST http://localhost:3002/dev/orders \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-req-1" \
  -d '{
    "userId": "user_123"
  }'
```

Replace `"user_123"` with the actual user id you are using.

### Get order timeline

```bash
curl -X GET http://localhost:3002/dev/orders/<ORDER_ID>/timeline
```

Replace `<ORDER_ID>` with the id returned by the checkout endpoint.

---

## Useful Scripts

From `restaurant-backend`:

- `npm run dynamodb` ? Start DynamoDB Local via Serverless plugin (port 8000).
- `npm run dev` ? Run Serverless Offline on `http://localhost:3002/dev`.
- `npm run start:docker` ? Helper used by Docker; sets up DB, seeds data, then runs Serverless Offline.

## Restaurant Frontend (Next.js)

This is the Next.js frontend for the restaurant ordering experience.

---

## Prerequisites

- **Node.js**: v20.x (LTS recommended)
- **Package manager**: `npm`

---

## Environment Setup

Create a local env file using the provided example:

```bash
cd restaurant-frontend
cp .env.example .env.local
```

`.env.example` contains:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3002/dev
REACT_EDITOR=0
```

- **`NEXT_PUBLIC_API_URL`** (required): Base URL of the backend API (usually `http://localhost:3002/dev`).
- **`REACT_EDITOR`** (optional): Disables the in-browser editor integration.

---

## Run the Frontend Locally (Without Docker)

From the project root (`restaurant-frontend`):

```bash
cd restaurant-frontend

# Install dependencies (first time only)
npm install

# Start the Next.js dev server
npm run dev
```

Then open:

- **Frontend UI**: `http://localhost:3000`

The app expects the backend/API to be reachable at the URL configured in `NEXT_PUBLIC_API_URL`.

---

## Useful Scripts

From `restaurant-frontend`:

- `npm run dev` ? Start Next.js in development mode on port 3000.
- `npm run build` ? Create a production build.
- `npm run start` ? Start the production server after building.
- `npm run lint` ? Run ESLint checks.

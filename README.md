## Restaurant Monorepo (Frontend + Backend)

This repository contains a small restaurant application with:

- **Frontend**: Next.js app in `restaurant-frontend`
- **Backend/API**: Serverless/Express app in `restaurant-backend` using DynamoDB Local
- **Local infra**: All wired together via `docker-compose.yml`

This README focuses on running the whole stack with **Docker Compose**.  
For **manual (non-Docker) instructions**, see the READMEs inside each project:

- `restaurant-frontend/README.md`
- `restaurant-backend/README.md`

---

## Prerequisites

- **Node.js**: v20.x (LTS recommended) – only needed if you want to install dependencies on the host.
- **Docker** and **Docker Compose** (required to run via `docker-compose.yml`).

---

## Environment Setup

Both apps include an `.env.example` you can copy and adjust:

- Frontend: `restaurant-frontend/.env.example`
- Backend: `restaurant-backend/.env.example`

When using Docker Compose, most variables are already provided via `docker-compose.yml`.  
On the host you typically want:

- `restaurant-frontend/.env.local`
- `restaurant-backend/.env`

See each app’s README for details.

---

## Run the Full Stack with Docker Compose

From the repo root (`sundevs`):

```bash
docker compose up --build
```

This will:

- Start **DynamoDB Local** on port **8000**
- Start the **backend/API** on port **3002**
- Start the **frontend/UI** on port **3001**

### Access URLs

- **Frontend UI**: `http://localhost:3001`
- **Backend/API base** (Serverless offline): `http://localhost:3002/dev`
- **DynamoDB Local**: `http://localhost:8000`

### Stop the stack

```bash
docker compose down
```


# Dynamic Pricing Engine

> An intelligent, production-grade e-commerce pricing system that evaluates **six independent market signals**, composes them **multiplicatively**, and generates **AI-powered natural language explanations** for every pricing recommendation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)](https://dynamic-pricing-frontend-theta.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render)](https://dynamic-pricing-engine-m3u7.onrender.com/health)

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Build & Deployment](#build--deployment)
- [API Overview](#api-overview)
- [Database Design](#database-design)
- [Security Considerations](#security-considerations)
- [Error Handling](#error-handling)
- [Performance Optimizations](#performance-optimizations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

Traditional rule-based pricing systems rely on rigid `if/else` logic — *"if demand is high, increase price by 10%."* This approach cannot handle the complexity of real markets where demand, inventory, competitor behaviour, and seasonality interact simultaneously and non-linearly.

**Dynamic Pricing Engine** treats demand, inventory, competitors, seasonality, events, and profitability as **independent signals** and composes them dynamically through a multiplicative pipeline — the same fundamental approach used by production pricing systems at scale. Every recommendation is explainable via a Gemini AI-generated rationale and is recorded in an append-only audit log.

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://dynamic-pricing-frontend-theta.vercel.app](https://dynamic-pricing-frontend-theta.vercel.app) |
| **Backend API** | [https://dynamic-pricing-engine-m3u7.onrender.com](https://dynamic-pricing-engine-m3u7.onrender.com) |
| **Health Check** | [https://dynamic-pricing-engine-m3u7.onrender.com/health](https://dynamic-pricing-engine-m3u7.onrender.com/health) |

> **Note:** The backend is hosted on Render's free tier and may cold-start in ~60 seconds after a period of inactivity. Hit the `/health` endpoint to wake it up before using the app.

---

## Key Features

### Pricing Engine
- **6-Signal Multiplicative Composition** — demand, inventory, competitor, seasonal, profitability floor, and promotional event overlay
- **EMA Demand Engine** — Exponential Moving Average of organic daily sales; distinguishes organic from promotional demand to prevent signal corruption
- **Confidence Scoring** — weighted multi-signal confidence with `HIGH` / `MEDIUM` / `LOW` classification
- **AI-Generated Explanations** — Gemini 2.0 Flash produces natural language rationale for every recommendation
- **Append-Only Audit Log** — every pricing decision stores a full snapshot of all inputs (price, inventory, competitors, demand) at decision time
- **Background Scheduler** — automatically applies high-confidence recommendations at a configurable interval (default: 30 minutes)

### Events & Promotions
- **Event Lifecycle State Machine** — `DRAFT` → `SCHEDULED` → `ACTIVE` → `EXPIRED`
- **Post-Optimization Overlay** — promotional discounts are applied *after* the market-optimal price is computed; pricing and promotions pipelines remain cleanly separated
- **Demand Attribution** — every sale is tagged as organic or promotional for accurate signal isolation
- **Event Performance Analytics** — per-event metrics including sales volume, revenue, and demand lift

### Settings & Control
- **3-Tier Seasonal Control** — global toggle, per-category exclusions, and per-product configuration
- **Scheduler Configuration** — configurable interval, auto-apply confidence threshold, and enable/disable toggle
- **Event Safety Caps** — configurable maximum discount percentage and minimum final price

---

## Architecture Overview

The pricing engine evaluates six independent market signals and composes them multiplicatively:

```
finalMultiplier    = Demand × Inventory × Competitor × Seasonal
recommendedPrice   = currentPrice × finalMultiplier
```

### Signal Pipeline

| # | Signal | Method |
|---|--------|--------|
| 1 | **Demand** | EMA (short-term 6h vs. long-term 7d baseline). Promotional sales excluded from baseline. |
| 2 | **Inventory** | Coverage days = `availableQty ÷ emaDailySales`. <7 days → price up; >15 days → price down. |
| 3 | **Competitor** | Staleness-weighted median with IQR outlier rejection. Prices older than 72h decay in influence. Max ±8% effect. |
| 4 | **Seasonal** | Sigmoid ramp function using day-of-year. 3-tier cascade: global toggle → category exclusions → per-product config. |
| 5 | **Profitability Floor** | Hard constraint: `costPrice × 1.15`. The engine cannot recommend below this floor. |
| 6 | **Event Overlay** | Promotional discount applied post-composition, leaving the market signal pipeline intact. |

### Post-Composition Constraints

After signal composition, the final price passes through:
- **Stability clamping** — maximum ±15% change per cycle
- **Profitability floor** — `costPrice × 1.15` hard minimum
- **Price ceiling** — configurable per-product maximum
- **Minimum change filter** — suppresses trivially small adjustments
- **Charm pricing** — rounds to ₹X49 or ₹X99

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Node.js 18+, Express.js |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **AI** | Google Gemini 2.0 Flash |
| **Scheduler** | node-cron |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Project Structure

```
dynamic-pricing-engine/
├── backend/
│   ├── server.js                  # Express app entry point, CORS, routes
│   ├── .env.example               # Environment variable template
│   └── src/
│       ├── config/                # DB connection (db.js), seed script
│       ├── models/                # 8 Mongoose schemas
│       ├── controllers/           # 9 controller files (one per domain)
│       ├── routes/                # 9 route files
│       ├── services/              # PricingEngine, AI, EMA, Events, Scheduler
│       ├── middleware/            # Global error handler, async wrapper
│       └── utils/                 # Charm pricing, API response formatter
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example               # Frontend environment variable template
│   └── src/
│       ├── api/                   # 8 API modules + axiosInstance
│       ├── components/            # 30+ components across 7 directories
│       ├── hooks/                 # 6 custom React hooks
│       └── pages/                 # 8 page components
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** account (free tier is sufficient)
- A **Google Gemini API** key (free tier is sufficient — [get one here](https://aistudio.google.com/app/apikey))

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy the environment variable template
cp .env.example .env

# 4. Fill in your values in .env (see Environment Variables section below)

# 5. (Optional) Seed the database with demo data
node src/config/seed.js

# 6. Start the development server
node server.js
```

The API will be available at `http://localhost:5000`.

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy the environment variable template
cp .env.example .env

# 4. Set the API URL in .env
# VITE_API_URL=http://localhost:5000/api/v1

# 5. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port the server listens on | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pass>@cluster.mongodb.net/dynamic-pricing` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIzaSy...` |
| `FRONTEND_URL` | Frontend origin for CORS whitelist | `https://your-app.vercel.app` |

**`backend/.env.example`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/dynamic-pricing
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

---

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

**`frontend/.env.example`:**
```env
# Local development
VITE_API_URL=http://localhost:5000/api/v1

# Production (set this in your Vercel environment variables)
# VITE_API_URL=https://your-backend.onrender.com/api/v1
```

> **Important:** Vite bakes environment variables into the bundle at build time. If you are deploying to Vercel, you must set `VITE_API_URL` in your Vercel project's **Settings → Environment Variables** and trigger a redeploy.

---

## Running Locally

After completing the setup above, run both servers concurrently:

**Terminal 1 — Backend:**
```bash
cd backend && node server.js
# API running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# App running at http://localhost:5173
```

To verify the backend is healthy:
```
GET http://localhost:5000/health
```

---

## Build & Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Vercel deployment steps:**
1. Connect your GitHub repository to Vercel.
2. Set the **root directory** to `frontend`.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add the `VITE_API_URL` environment variable pointing to your Render backend URL.
5. Deploy. Vercel automatically redeploys on every push to `main`.

### Backend (Render)

1. Create a new **Web Service** on Render.
2. Connect your GitHub repository and set the root directory to `backend`.
3. Set the **start command** to `node server.js`.
4. Add all required environment variables (`MONGO_URL`, `GEMINI_API_KEY`, `FRONTEND_URL`, `NODE_ENV=production`).
5. Deploy.

> **Free tier note:** Render spins down services after 15 minutes of inactivity. The `/health` endpoint is designed to be used as a warm-up ping before loading the application.

---

## API Overview

40+ REST endpoints organized across 9 resource domains. A Postman collection is available at `backend/postman_collection.json` — import it and set the `{{BASE_URL}}` variable to your backend URL.

| Domain | Count | Key Endpoint |
|--------|-------|-------------|
| Products | 5 | `GET /api/v1/products` |
| Inventory | 5 | `GET /api/v1/inventory` |
| Sales | 3 | `POST /api/v1/sales` |
| Competitors | 5 | `GET /api/v1/competitors/:productId/analysis` |
| **Pricing** | **6** | **`POST /api/v1/pricing/calculate`** |
| Events | 11 | `PATCH /api/v1/events/:id/activate` |
| Settings | 5 | `PATCH /api/v1/settings/seasonal/toggle` |
| Dashboard | 1 | `GET /api/v1/dashboard/stats` |
| Analytics | 5 | `GET /api/v1/analytics/demand-attribution/:productId` |
| Health | 1 | `GET /health` |

### Core Endpoint Example

**`POST /api/v1/pricing/calculate`** — Run the pricing engine for a product.

```json
// Request
{
  "productId": "64f1a2b3c4d5e6f7a8b9c0d1",
  "triggeredBy": "manual",
  "referenceDate": "2025-01-15T10:00:00.000Z"
}

// Response
{
  "success": true,
  "data": {
    "recommendedPrice": 1249,
    "currentPrice": 1199,
    "finalMultiplier": 1.042,
    "confidence": { "score": 0.78, "level": "HIGH" },
    "signals": { "demand": 1.08, "inventory": 1.02, "competitor": 0.97, "seasonal": 1.00 },
    "aiExplanation": "Demand velocity is trending 8% above baseline...",
    "decision": { "_id": "...", "status": "PENDING" }
  }
}
```

---

## Database Design

8 MongoDB collections with strategic indexing for time-series queries and product lookups:

| Collection | Purpose |
|------------|---------|
| `products` | Core entity — pricing config, tier, seasonal config |
| `inventories` | Stock levels, EMA daily sales, coverage days |
| `salesevents` | Individual sale records with promotional attribution |
| `competitorprices` | Multi-competitor tracking with staleness scoring |
| `pricingrecommendations` | Append-only audit log with full input snapshots |
| `promotionalevents` | Event lifecycle and discount configuration |
| `eventanalytics` | Pre-computed event performance metrics |
| `settings` | Singleton key-value store for global toggles |

---

## Security Considerations

- **CORS** is configured to a strict allowlist: `localhost:5173` (dev), `localhost:3000` (alt dev), and the production Vercel URL. Additional origins can be added via the `FRONTEND_URL` environment variable.
- **API keys** (Gemini, MongoDB) are stored exclusively in environment variables and are never committed to source control. Ensure `.env` is listed in `.gitignore`.
- **No authentication layer** is currently implemented (see [Roadmap](#roadmap)). This system is intended for internal/administrative use.
- **Input validation** is applied on all write endpoints via controller-level checks before database operations.

---

## Error Handling

- A **global error handler middleware** (`src/middleware/errorHandler.js`) catches all unhandled exceptions and formats them into a consistent `{ success: false, error: "..." }` response envelope.
- All controller functions are wrapped with an **async error wrapper** to eliminate repetitive `try/catch` boilerplate.
- The frontend `axiosInstance` includes a **response interceptor** that extracts and surfaces the most relevant error message from the API response envelope.

---

## Performance Optimizations

- **EMA pre-computation** — demand velocity is calculated incrementally and cached on the `Inventory` document, avoiding expensive aggregation on every pricing request.
- **Staleness weighting** — competitor prices older than 72 hours decay in influence rather than being filtered out entirely, reducing unnecessary query overhead.
- **Event auto-expiry** — the `node-cron` scheduler transitions expired events from `ACTIVE` → `EXPIRED` once per hour, keeping active event queries fast.
- **Background scheduler** — pricing recalculations run asynchronously at a configured interval rather than blocking API requests.
- **Strategic MongoDB indexing** — all collections are indexed on `productId` and `createdAt` for efficient time-series and product-scoped lookups.

---

## Roadmap

- [ ] **Authentication & Authorization** — JWT-based auth with role-based access control (admin, viewer)
- [ ] **Multi-tenant support** — isolate pricing data per merchant
- [ ] **Webhook notifications** — push pricing decision events to external systems
- [ ] **A/B pricing experiments** — test different pricing strategies across product segments
- [ ] **Real-time updates** — WebSocket-based live dashboard without polling
- [ ] **Bulk import/export** — CSV ingestion for competitor prices and product catalogues
- [ ] **Pluggable AI providers** — support for OpenAI and Anthropic alongside Gemini
- [ ] **Unit & integration test suite** — Jest + Supertest coverage for the pricing engine core

---

## Contributing

Contributions are welcome. To contribute:

1. **Fork** the repository.
2. Create a **feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit** your changes with clear, descriptive messages.
4. **Push** to your fork: `git push origin feature/your-feature-name`
5. Open a **Pull Request** describing what you changed and why.

### Development Guidelines

- Keep controllers thin — business logic belongs in `src/services/`.
- All new API endpoints must follow the existing `{ success, data }` response envelope.
- Update this README if your change adds or modifies a major feature, environment variable, or API endpoint.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

- [Google Gemini](https://deepmind.google/technologies/gemini/) — AI explanation layer
- [MongoDB Atlas](https://www.mongodb.com/atlas) — free-tier cloud database
- [Recharts](https://recharts.org/) — composable charting library for React
- [Lucide Icons](https://lucide.dev/) — clean, consistent icon set
- [Vercel](https://vercel.com/) & [Render](https://render.com/) — deployment infrastructure

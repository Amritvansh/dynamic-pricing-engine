# Dynamic Pricing Engine

> An intelligent e-commerce pricing system that evaluates **six independent market signals**, composes them **multiplicatively**, and generates **AI-powered explanations** for every pricing recommendation.

[![Live Demo](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://dynamic-pricing-engine.vercel.app)
[![API](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://dynamic-pricing-engine-api.onrender.com)

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | `https://dynamic-pricing-frontend-theta.vercel.app` |
| **Backend API** | `https://dynamic-pricing-engine-api.onrender.com` |

> **Note:** Render backend may cold-start in ~60 seconds. Hit `GET /health` to wake it before demo.

---

## The Problem We Solve

Traditional rule-based pricing systems use rigid `if/else` logic: *"if demand is high, increase price by 10%."* This approach cannot handle the complexity of real markets where demand, inventory, competitor behaviour, and seasonality interact simultaneously.

Our system treats **demand, inventory, competitors, season, events, and profitability** as independent signals and composes them dynamically through a multiplicative pipeline — the same fundamental approach used by production pricing systems at scale.

---

## What Makes This Different

| What We Built | What Most Students Build |
|---|---|
| 6-signal multiplicative composition (D × I × C × S) | `if/else` rules |
| EMA-based demand from real sales events | Manual "demand = high" input |
| Stock coverage days (qty ÷ sell-through velocity) | Raw quantity threshold (`if qty < 10`) |
| Staleness-weighted median + IQR outlier rejection | Simple average of competitor prices |
| Sigmoid seasonal ramp + 3-tier cascade toggle | Binary season flag (on/off) |
| Event overlay pipeline + organic/promo demand attribution | Events replace pricing logic entirely |
| Profitability floor as hard constraint | No cost awareness at all |
| Confidence scoring with weighted components | Binary recommend/don't |
| Append-only decision audit record (full input snapshot) | Simple log table |
| AI explanation with structured context (Gemini 2.0 Flash) | Generic "price changed" message |
| Background scheduler with auto-apply above threshold | Manual button only |
| Organic vs promotional demand attribution per sale | All demand treated equally |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| AI | Google Gemini 2.0 Flash |
| Deployment | Vercel (frontend), Render (backend) |
| Scheduler | node-cron |

---

## Architecture

The pricing engine evaluates four independent market signals and composes them multiplicatively:

```
finalMultiplier = Demand × Inventory × Competitor × Seasonal
recommendedPrice = currentPrice × finalMultiplier
```

1. **Demand Engine** — EMA (Exponential Moving Average) of organic daily sales. Compares short-term velocity (6h) to long-term baseline (7d). Promotional sales are attributed separately and excluded from baseline to prevent demand corruption.

2. **Inventory Engine** — Coverage days = `availableQuantity ÷ emaDailySales`. Low coverage (< 7 days) pushes price up; high coverage (> 15 days) pushes price down.

3. **Competitor Engine** — Staleness-weighted median with IQR outlier rejection. Competitor prices older than 72h decay in influence. Max ±8% influence — competitors are a signal, not a directive.

4. **Seasonal Engine** — Sigmoid ramp function with 3-tier cascade control: global toggle → category exclusions → per-product config. Uses day-of-year for smooth seasonal transitions.

After composition, the price passes through **stability clamping** (max ±15%), **profitability floor** (`costPrice × 1.15`), **price ceiling**, **minimum change filter**, and **charm pricing** (₹X49/₹X99). An optional **event overlay** applies promotional discounts *after* the market-optimal price is computed — pricing and promotions pipelines remain separate.

Every recommendation includes a **confidence score** (weighted average of signal confidences) and an **AI-generated explanation** from Gemini 2.0 Flash.

---

## Features

### Pricing Engine
- **6-Signal Multiplicative Composition** — demand, inventory, competitor, seasonal, profitability floor, promotional event overlay
- **EMA Demand Engine** — organic vs promotional demand attribution per sale
- **Confidence Scoring** — weighted multi-signal confidence with HIGH/MEDIUM/LOW levels
- **AI Explanations** — Gemini-powered natural language rationale for every recommendation
- **Pricing Decision Audit Log** — append-only record with full input snapshot at decision time
- **Background Scheduler** — auto-applies high-confidence recommendations every 30 minutes

### Events System
- **Event Lifecycle** — DRAFT → SCHEDULED → ACTIVE → EXPIRED state machine
- **Post-Optimization Overlay** — promotional discounts applied after engine recommendation
- **Demand Attribution** — every sale tagged as organic or promotional
- **Event Performance Analytics** — sales, revenue, and demand lift metrics per event

### Settings
- **3-Tier Seasonal Control** — global toggle, category exclusions, product-level config
- **Scheduler Configuration** — interval, auto-apply threshold, enable/disable
- **Event Safety Caps** — max discount percentage, minimum final price

---

## Frontend Screens

### Dashboard
Real-time overview: 5 KPI StatCards (products, critical inventory, pending recommendations, avg confidence, active events), active promotions widget with countdown, recent pricing decisions table, critical stock table sorted by urgency.

### Products
Full CRUD with category/tier filters and name search. Each product shows live inventory coverage status.

### Inventory
Coverage-days-based stock monitoring with colour-coded CoverageMeter (critical/low/normal/high). One-click stock update and sale recording, with automatic coverage recalculation.

### Competitors
Per-product competitor price tracking with gap analysis card showing your price vs. market median. Staleness indicators on each competitor entry.

### Pricing Engine ⭐
Multi-signal pricing calculator with:
- **SignalBreakdown** waterfall chart showing multiplicative price transformation
- **4 Signal Cards** with interpretation labels and multiplier values
- **AIExplanationBox** with Gemini-generated natural language rationale
- **EventOverlayCard** showing active promotional discount with price transition
- **ConfidencePanel** with score, level badge, and "what would change this" guidance
- **Pricing History** table with inline apply/reject for pending recommendations

### Events
3-tab lifecycle management (Active/Upcoming/Past) with:
- Full CRUD and status transitions (Draft → Activate → Deactivate)
- Month-view promotion calendar with colour-coded event dots
- Expandable performance metrics for past events

### Analytics
4-chart analytics dashboard:
- **Price History** — line chart tracking actual vs recommended price over time
- **Demand Velocity Trends** — organic vs promotional with toggle filter
- **Demand Attribution** — stacked bar chart showing organic/promo sales split
- **Event Performance** — 4-KPI card (total sales, revenue, organic %, promo %)

### Settings
Seasonal pricing 3-tier control: global ON/OFF toggle, per-category exclusion chips, live summary text. Scheduler interval and auto-apply threshold configuration.

---

## Setup (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Gemini API key (free tier works)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
node src/config/seed.js  # seed the database with demo data
node server.js           # start the server on port 5000
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGO_URL` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dynamic-pricing` |
| `GEMINI_API_KEY` | Google Gemini AI API key | `AIza...` |
| `FRONTEND_URL` | Frontend URL for CORS whitelist | `https://dynamic-pricing-engine.vercel.app` |

### API Structure

40+ REST endpoints across 9 resource groups. See `backend/postman_collection.json` for the complete collection.

| Resource | Endpoints | Key Route |
|----------|-----------|-----------|
| Products | 5 | `GET /api/v1/products` |
| Inventory | 5 | `GET /api/v1/inventory` |
| Sales | 3 | `POST /api/v1/sales` |
| Competitors | 5 | `GET /api/v1/competitors/:productId/analysis` |
| **Pricing** | **6** | **`POST /api/v1/pricing/calculate`** |
| Events | 11 | `PATCH /api/v1/events/:id/activate` |
| Settings | 5 | `PATCH /api/v1/settings/seasonal/toggle` |
| Dashboard | 1 | `GET /api/v1/dashboard/stats` |
| Analytics | 5 | `GET /api/v1/analytics/demand-attribution/:productId` |

### Key Design Decisions

- **Append-only PricingRecommendation audit log** — every decision stores a full snapshot of all inputs (prices, inventory, competitors, demand) at decision time. If a decision was wrong, the exact context can be reconstructed.
- **Event auto-expiry** runs on server startup and hourly via `node-cron`. Events past their `endDate` transition from ACTIVE → EXPIRED automatically.
- **CORS** configured for `localhost:5173` (dev), `localhost:3000` (alt dev), and the Vercel production URL. Additional URLs supported via `FRONTEND_URL` env var.
- **Health check at `/health`** responds before all API routes — used by Render to verify the service is alive and for pre-demo warm-up (free tier spins down after 15 min of inactivity).

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

```bash
npm run dev
# Open http://localhost:5173
```

---

## API Reference

40+ REST endpoints organized by domain:

| Domain | Endpoints | Key Route |
|--------|-----------|-----------|
| Products | 5 | `GET /api/v1/products` |
| Inventory | 5 | `GET /api/v1/inventory` |
| Sales | 3 | `POST /api/v1/sales` |
| Competitors | 5 | `GET /api/v1/competitors/:productId/analysis` |
| **Pricing** | **6** | **`POST /api/v1/pricing/calculate`** |
| Events | 11 | `PATCH /api/v1/events/:id/activate` |
| Settings | 5 | `PATCH /api/v1/settings/seasonal/toggle` |
| Dashboard | 1 | `GET /api/v1/dashboard/stats` |
| Analytics | 5 | `GET /api/v1/analytics/demand-attribution/:productId` |

Full Postman collection: `backend/postman_collection.json`
Import into Postman and set `{{BASE_URL}}` to the Render URL.

---

## Database Design

8 MongoDB collections with strategic indexing:

| Collection | Purpose |
|---|---|
| `products` | Core entity — pricing config, tier, seasonal config |
| `inventories` | Stock levels, EMA daily sales, coverage days |
| `salesevents` | Individual sale records with event attribution |
| `competitorprices` | Multi-competitor tracking with staleness scoring |
| `pricingrecommendations` | Append-only audit log with full input snapshots |
| `promotionalevents` | Event lifecycle with discount configuration |
| `eventanalytics` | Pre-computed event performance metrics |
| `settings` | Singleton key-value store for global toggles |

---

## Team

| Member | Role | Scope |
|---|---|---|
| Member 1 | Pricing Engine Lead | PricingEngine, AI Service, Scheduler, Seasonal Logic |
| Member 2 | Data Layer Lead | All Models, CRUD APIs, Deployment, Seed Data |
| Member 3 | Frontend Core | Dashboard, Products, Inventory, Settings, Layout |
| Member 4 | Pricing + Events UI | Pricing UI, Competitors, Events, Analytics, README |

---

## Demo Backup Plan

- 8 screenshots of all key screens saved in `/screenshots/` folder
- 3-minute screen recording of full demo flow
- Postman collection showing `POST /pricing/calculate` response
- If internet fails: backend at `localhost:5000`, frontend at `localhost:5173`
- To wake Render (cold start): call `GET /health` 60+ seconds before demo

---

## Project Structure

```
dynamic-pricing-engine/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── config/          # DB connection, seed script
│   │   ├── models/          # 8 Mongoose schemas
│   │   ├── controllers/     # 9 controller files
│   │   ├── routes/          # 9 route files
│   │   ├── services/        # PricingEngine, AI, EMA, Events, Scheduler
│   │   ├── middleware/      # Error handler, async wrapper
│   │   └── utils/           # Charm pricing, API response format
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── api/             # 8 API modules + axiosInstance
│   │   ├── components/      # 30+ components (7 directories)
│   │   ├── hooks/           # 6 custom hooks
│   │   └── pages/           # 8 page components
│   └── .env.example
├── master_execution_plan.md
└── README.md
```

---

## License

This project was built as an academic demonstration of production-grade pricing system design.

---

_Built with ❤️ by a team of 4 in 7 days._
_Stack: React + Tailwind CSS + Axios | Node.js + Express.js | MongoDB Atlas | Gemini AI_

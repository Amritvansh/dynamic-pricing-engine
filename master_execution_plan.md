# DYNAMIC PRICING ENGINE — MASTER EXECUTION DOCUMENT
## _Complete Implementation Blueprint | 4 Members | 7 Days_

> **Start Date:** June 20, 2026 | **Hard Deadline:** June 27, 2026
> **Stack:** React + Tailwind CSS + Axios | Node.js + Express.js | MongoDB Atlas
> **Team:** 4 Members | **Version Control:** Git + GitHub

> [!IMPORTANT]
> This is the ONLY document your team needs. Every schema, every API, every component, every formula, every daily task is specified here. Do NOT create separate planning documents. Execute directly from this blueprint.

---

# TABLE OF CONTENTS

| # | Section | What You'll Find |
|---|---------|-----------------|
| 1 | [Project Overview](#part-1--project-overview) | Goals, what makes this different |
| 2 | [Architecture](#part-2--architecture) | System design, module architecture, data flow |
| 3 | [Backend Structure](#part-3--backend-folder-structure) | Complete file tree |
| 4 | [Frontend Structure](#part-4--frontend-folder-structure) | Complete file tree |
| 5 | [Database Design](#part-5--database-design) | 8 MongoDB schemas with indexes and explanations |
| 6 | [API Design](#part-6--api-design) | 40+ endpoints with request/response bodies |
| 7 | [Pricing Engine](#part-7--pricing-engine) | All formulas, signal functions, composition logic |
| 8 | [Demand Engine](#part-8--demand-engine) | EMA, velocity, organic vs promotional attribution |
| 9 | [Inventory Engine](#part-9--inventory-engine) | Coverage days, stock pressure, risk levels |
| 10 | [Competitor Engine](#part-10--competitor-engine) | Staleness weighting, IQR outlier rejection, gap analysis |
| 11 | [Seasonal Engine](#part-11--seasonal-engine) | Sigmoid ramp, 3-tier cascade toggle |
| 12 | [Events Module](#part-12--promotional-events-module) | Full lifecycle, discount overlay, demand attribution |
| 13 | [Recalculation Engine](#part-13--recalculation-engine) | Scheduler, auto-apply, manual trigger |
| 14 | [Dashboard & Frontend Screens](#part-14--dashboard--frontend-screens) | All 8 screens with components and state |
| 15 | [Team Allocation](#part-15--team-allocation) | Exact file ownership per member |
| 16 | [Git Workflow](#part-16--git-workflow) | Branches, PRs, merge rules |
| 17 | [Development Roadmap](#part-17--development-roadmap) | Day-by-day tasks per member |
| 18 | [Testing Plan](#part-18--testing-plan) | Backend, pricing logic, API, frontend test cases |
| 19 | [Demo Preparation](#part-19--demo-preparation) | Demo script, interview talking points |

---

# PART 1 — PROJECT OVERVIEW

## 1.1 What We Are Building

A Dynamic Pricing Engine for e-commerce that evaluates **six independent market signals** — demand, inventory, competitor pricing, seasonal trends, promotional events, and profitability — and composes them into a single pricing recommendation with a confidence score and an AI-generated explanation.

## 1.2 What Makes This Different From Typical Student Projects

| What We Build | What Most Students Build |
|---------------|--------------------------|
| Multiplicative signal composition (D × I × C × S) | `if demand == high: price += 10%` |
| EMA-based demand from real sales events | Admin manually types "demand = high" |
| Stock coverage days (quantity ÷ sell-through rate) | Raw quantity threshold (`if qty < 10`) |
| Staleness-weighted median competitor with IQR outlier rejection | Simple average of all competitor prices |
| Sigmoid seasonal ramp with 3-tier cascade toggle | Binary season flag (on/off) |
| Promotional event overlay pipeline with demand attribution | Events replace pricing logic entirely |
| Profitability floor as hard constraint | No cost awareness at all |
| Confidence scoring per recommendation | Binary recommend/don't |
| Append-only Pricing Decision Record (audit log) | Simple log table |
| AI explanation with structured context (Gemini) | Generic "price changed" message |
| Background scheduler with auto-apply above threshold | Manual button only |

## 1.3 Core Business Concept

```
PRICING PIPELINE:

  ┌─────────────┐
  │ Sales Data  │──→ Demand Signal   ──→ multiplier (e.g. 1.08)
  └─────────────┘
  ┌─────────────┐
  │ Stock Data  │──→ Inventory Signal ──→ multiplier (e.g. 1.06)
  └─────────────┘
  ┌─────────────┐
  │ Competitor  │──→ Competitor Signal──→ multiplier (e.g. 0.97)
  │ Prices      │
  └─────────────┘
  ┌─────────────┐
  │ Season &    │──→ Seasonal Signal ──→ multiplier (e.g. 1.04)
  │ Calendar    │
  └─────────────┘

  COMPOSITION:
  finalMultiplier = 1.08 × 1.06 × 0.97 × 1.04 = 1.155

  PRICE CALCULATION:
  rawPrice = currentPrice × 1.155
  → Apply stability clamp (max ±15% per cycle)
  → Apply profitability floor (costPrice × 1.15)
  → Apply price ceiling (currentPrice × 1.5)
  → Apply charm pricing (round to ₹X49/₹X99)
  → recommendedPrice = ₹919

  EVENT OVERLAY (if active):
  → Apply promotional discount (e.g. 10% off ₹919 = ₹827)
  → Check profitability floor again
  → finalCustomerPrice = ₹827
```

---

# PART 2 — ARCHITECTURE

## 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BROWSER (React + Tailwind CSS)                    │
│                                                                       │
│  Dashboard │ Products │ Inventory │ Competitors │ Pricing │ Analytics │
│  Events    │ Settings                                                 │
│                        ↕ Axios HTTP                                   │
└───────────────────────────────────────────────────────────────────────┘
                               │
                               │ REST API (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Node.js + Express.js API Server                    │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                       Middleware Layer                        │    │
│  │  CORS │ JSON Parser │ Error Handler │ Request Logger          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌───────────┐ ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐  │
│  │ /products │ │/inventory│ │/competitor│ │ /pricing │ │/events │  │
│  │  Router   │ │ Router   │ │  Router   │ │  Router  │ │ Router │  │
│  └─────┬─────┘ └────┬─────┘ └────┬──────┘ └────┬─────┘ └───┬────┘  │
│        │             │            │              │           │       │
│  ┌─────┴─────┐ ┌─────┴────┐ ┌────┴──────┐      │     ┌─────┴────┐  │
│  │ /sales    │ │/dashboard│ │/analytics │      │     │/settings │  │
│  │  Router   │ │  Router  │ │  Router   │      │     │  Router  │  │
│  └───────────┘ └──────────┘ └───────────┘      │     └──────────┘  │
│                                                  │                   │
│                        Controllers Layer         │                   │
│                              │                   │                   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │                       Services Layer                           │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐ ┌──────────────┐ ┌────────────────────┐  │   │
│  │  │  PricingEngine  │ │  AIService   │ │   EventService     │  │   │
│  │  │  (core logic)   │ │  (Gemini)    │ │   (overlay/match)  │  │   │
│  │  └─────────────────┘ └──────────────┘ └────────────────────┘  │   │
│  │                                                                 │   │
│  │  ┌─────────────────┐ ┌──────────────┐ ┌────────────────────┐  │   │
│  │  │ DemandAttrib.   │ │  EMAService  │ │    Scheduler       │  │   │
│  │  │ (organic/promo) │ │  (smoothing) │ │    (node-cron)     │  │   │
│  │  └─────────────────┘ └──────────────┘ └────────────────────┘  │   │
│  └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MongoDB Atlas                                  │
│                                                                       │
│  products │ inventories │ salesevents │ competitorprices │            │
│  pricingrecommendations │ promotionalevents │ eventanalytics │       │
│  settings                                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## 2.2 Module Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     PRICING ENGINE (Orchestrator)                  │
│                                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌───────────┐ │
│  │   Demand    │ │  Inventory  │ │  Competitor   │ │ Seasonal  │ │
│  │   Engine    │ │   Engine    │ │   Engine      │ │  Engine   │ │
│  │             │ │             │ │              │ │           │ │
│  │ EMA sales   │ │ Coverage    │ │ Staleness    │ │ Sigmoid   │ │
│  │ Velocity    │ │ days calc   │ │ weighting    │ │ ramp      │ │
│  │ Attribution │ │ Stock risk  │ │ IQR filter   │ │ Cascade   │ │
│  │             │ │             │ │ Gap analysis │ │ toggle    │ │
│  └──────┬──────┘ └──────┬──────┘ └──────┬───────┘ └─────┬─────┘ │
│         │               │               │               │        │
│         └───────────────┴───────────────┴───────────────┘        │
│                              │                                    │
│                    Multiplicative Composition                     │
│                    D × I × C × S = rawMultiplier                  │
│                              │                                    │
│                    ┌─────────▼──────────┐                        │
│                    │ Stability Clamp    │                         │
│                    │ Profit Floor       │                         │
│                    │ Price Ceiling      │                         │
│                    │ Minimum Change     │                         │
│                    │ Charm Pricing      │                         │
│                    └─────────┬──────────┘                        │
│                              │                                    │
│                    ┌─────────▼──────────┐                        │
│                    │ Event Overlay      │ ← Discount applied     │
│                    │ (if event active)  │   AFTER recommendation │
│                    └─────────┬──────────┘                        │
│                              │                                    │
│                    ┌─────────▼──────────┐                        │
│                    │ Confidence Score   │                         │
│                    │ AI Explanation     │                         │
│                    │ Decision Record    │                         │
│                    └────────────────────┘                        │
└──────────────────────────────────────────────────────────────────┘
```

## 2.3 Request Flow — Pricing Calculation

```
Frontend                    Backend                         Database
   │                           │                               │
   │  POST /pricing/calculate  │                               │
   │──────────────────────────→│                               │
   │  { productId }            │                               │
   │                           │  Find Product                 │
   │                           │──────────────────────────────→│
   │                           │  Find Inventory               │
   │                           │──────────────────────────────→│
   │                           │  Find Competitors             │
   │                           │──────────────────────────────→│
   │                           │  Find Sales Events (30d)      │
   │                           │──────────────────────────────→│
   │                           │  Check Settings (seasonal)    │
   │                           │──────────────────────────────→│
   │                           │  Find Active Event            │
   │                           │──────────────────────────────→│
   │                           │                               │
   │                           │  ┌──────────────────────┐     │
   │                           │  │ Compute 4 Signals    │     │
   │                           │  │ Compose Multiplier   │     │
   │                           │  │ Apply Constraints    │     │
   │                           │  │ Apply Event Overlay  │     │
   │                           │  │ Compute Confidence   │     │
   │                           │  │ Generate AI Text     │     │
   │                           │  └──────────────────────┘     │
   │                           │                               │
   │                           │  Save Decision Record         │
   │                           │──────────────────────────────→│
   │                           │                               │
   │  200 OK                   │                               │
   │←──────────────────────────│                               │
   │  { recommendation }       │                               │
```

## 2.4 Data Flow — Demand Attribution

```
┌──────────────────────────────────────────────────────┐
│              SALE RECORDED (POST /sales)              │
│                                                        │
│  Is a promotional event active for this product?       │
│       │                          │                     │
│      YES                        NO                     │
│       │                          │                     │
│  eventId = active event ID  eventId = null             │
│  isPromotional = true       isPromotional = false      │
│       │                          │                     │
│       ▼                          ▼                     │
│  PROMOTIONAL SALE            ORGANIC SALE               │
│  (excluded from EMA)        (included in EMA)          │
│  (excluded from baseline)   (used for velocity)        │
└──────────────────────────────────────────────────────┘
```

---

# PART 3 — BACKEND FOLDER STRUCTURE

```
backend/
├── server.js                              ← Entry point (wire routes, start scheduler)
├── .env                                   ← PORT, MONGO_URL, GEMINI_API_KEY
├── .env.example                           ← Template for team members
├── package.json
└── src/
    ├── config/
    │   ├── db.js                          ← MongoDB connection (EXISTS)
    │   └── seed.js                        ← Seed script for demo data
    ├── models/
    │   ├── product.js                     ← REWRITE (add costPrice, tier, seasonalConfig)
    │   ├── inventory.js                   ← REWRITE (add EMA fields, coverageDays)
    │   ├── competitorPrice.js             ← REWRITE (add staleness, outlier flag)
    │   ├── salesEvent.js                  ← NEW (individual sale records with eventId)
    │   ├── pricingRecommendation.js       ← REWRITE (full decision record with event overlay)
    │   ├── promotionalEvent.js            ← NEW (event/promotion lifecycle)
    │   ├── eventAnalytics.js              ← NEW (event performance metrics)
    │   └── settings.js                    ← NEW (singleton config: toggles, thresholds)
    ├── controllers/
    │   ├── productController.js           ← IMPLEMENT (currently empty shell)
    │   ├── inventoryController.js         ← IMPLEMENT (currently empty shell)
    │   ├── competitorController.js        ← IMPLEMENT (currently empty shell)
    │   ├── pricingController.js           ← IMPLEMENT (currently empty shell)
    │   ├── salesController.js             ← NEW
    │   ├── eventController.js             ← NEW (CRUD + lifecycle transitions)
    │   ├── settingsController.js          ← NEW (seasonal toggle, event settings)
    │   ├── dashboardController.js         ← NEW (aggregated KPI stats)
    │   └── analyticsController.js         ← NEW (charts data, demand attribution)
    ├── routes/
    │   ├── productRoutes.js               ← EXISTS (update paths)
    │   ├── inventoryRoutes.js             ← EXISTS (update paths)
    │   ├── competitorRoutes.js            ← EXISTS (update paths)
    │   ├── pricingRoutes.js               ← EXISTS (update paths)
    │   ├── salesRoutes.js                 ← NEW
    │   ├── eventRoutes.js                 ← NEW
    │   ├── settingsRoutes.js              ← NEW
    │   ├── dashboardRoutes.js             ← NEW
    │   └── analyticsRoutes.js             ← NEW
    ├── services/
    │   ├── pricingEngine.js               ← REWRITE (multiplicative composition)
    │   ├── emaService.js                  ← NEW (EMA computation)
    │   ├── demandAttribution.js           ← NEW (organic vs promotional split)
    │   ├── eventService.js                ← NEW (find active event, apply discount)
    │   ├── aiService.js                   ← NEW (Gemini API integration)
    │   └── scheduler.js                   ← NEW (node-cron background jobs)
    ├── middleware/
    │   ├── errorHandler.js                ← EXISTS (enhance)
    │   └── asyncHandler.js                ← NEW (wrap async controllers)
    └── utils/
        ├── pricingUtils.js                ← NEW (charm pricing, clamping, getDayOfYear)
        └── apiResponse.js                 ← NEW (standardized { success, data } format)
```

**Packages to install:**
```bash
# Backend
cd backend
npm install @google/generative-ai node-cron
```

---

# PART 4 — FRONTEND FOLDER STRUCTURE

> [!IMPORTANT]
> The current frontend has MUI installed. We are switching to **Tailwind CSS**. You will need to uninstall MUI packages and install Tailwind.

```bash
# Frontend setup
cd frontend
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install -D tailwindcss @tailwindcss/vite
npm install recharts react-icons lucide-react
```

```
frontend/
├── index.html
├── vite.config.js                         ← Add Tailwind plugin
├── tailwind.config.js                     ← NEW (configure theme)
└── src/
    ├── index.css                          ← Tailwind directives + custom styles
    ├── main.jsx                           ← Entry point with BrowserRouter
    ├── App.jsx                            ← All routes (UPDATE: add events, settings, analytics)
    ├── api/
    │   ├── axiosInstance.js               ← NEW (baseURL + interceptors)
    │   ├── productApi.js                  ← NEW
    │   ├── inventoryApi.js                ← NEW
    │   ├── competitorApi.js               ← NEW
    │   ├── pricingApi.js                  ← NEW
    │   ├── salesApi.js                    ← NEW
    │   ├── eventApi.js                    ← NEW
    │   ├── settingsApi.js                 ← NEW
    │   └── dashboardApi.js                ← NEW
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx                 ← Sidebar + Outlet wrapper
    │   │   └── Sidebar.jsx                ← Navigation (8 routes)
    │   ├── common/
    │   │   ├── LoadingSpinner.jsx          ← Animated spinner
    │   │   ├── ErrorAlert.jsx             ← Error display
    │   │   ├── StatCard.jsx               ← Dashboard KPI card
    │   │   ├── ConfidenceBadge.jsx        ← GREEN/YELLOW/RED confidence
    │   │   ├── SignalCard.jsx             ← Individual signal display
    │   │   └── Modal.jsx                  ← Reusable modal wrapper
    │   ├── products/
    │   │   ├── ProductTable.jsx           ← Sortable product table
    │   │   ├── ProductForm.jsx            ← Create/edit modal
    │   │   └── ProductTierBadge.jsx       ← Budget/mid/premium badge
    │   ├── inventory/
    │   │   ├── InventoryTable.jsx         ← With coverage indicators
    │   │   ├── CoverageMeter.jsx          ← Visual bar (red/orange/green/blue)
    │   │   ├── StockUpdateModal.jsx       ← Update quantity
    │   │   └── SaleRecordModal.jsx        ← Record a sale event
    │   ├── competitor/
    │   │   ├── CompetitorTable.jsx         ← With staleness indicators
    │   │   ├── CompetitorForm.jsx         ← Add/edit competitor price
    │   │   └── GapAnalysisCard.jsx        ← Our price vs median competitor
    │   ├── pricing/
    │   │   ├── PricingForm.jsx            ← Product selector + calculate button
    │   │   ├── RecommendationCard.jsx     ← THE HERO COMPONENT
    │   │   ├── SignalBreakdown.jsx        ← Waterfall chart (recharts)
    │   │   ├── ConfidencePanel.jsx        ← Score + what-would-change-this
    │   │   ├── AIExplanationBox.jsx       ← Gemini explanation display
    │   │   └── EventOverlayCard.jsx       ← Active event discount display
    │   ├── events/
    │   │   ├── EventTable.jsx             ← All events with status badges
    │   │   ├── EventForm.jsx              ← Full create/edit form
    │   │   ├── EventStatusBadge.jsx       ← DRAFT/SCHEDULED/ACTIVE/EXPIRED
    │   │   ├── EventCalendar.jsx          ← Month-view calendar
    │   │   └── EventCard.jsx              ← Active event summary card
    │   ├── settings/
    │   │   ├── SeasonalToggle.jsx         ← Global + category toggle
    │   │   └── SettingsPanel.jsx          ← All settings groups
    │   └── analytics/
    │       ├── PriceHistoryChart.jsx      ← recharts line chart
    │       ├── DemandTrendChart.jsx        ← recharts line chart
    │       ├── DemandAttributionChart.jsx ← Organic vs promotional
    │       └── EventPerformanceCard.jsx   ← Event metrics display
    ├── pages/
    │   ├── DashboardPage.jsx              ← REWRITE
    │   ├── ProductsPage.jsx               ← REWRITE
    │   ├── InventoryPage.jsx              ← REWRITE
    │   ├── CompetitorPage.jsx             ← REWRITE
    │   ├── PricingPage.jsx                ← REWRITE (star page)
    │   ├── AnalyticsPage.jsx              ← NEW
    │   ├── EventsPage.jsx                 ← NEW
    │   └── SettingsPage.jsx               ← NEW
    └── hooks/
        ├── useProducts.js                 ← NEW
        ├── useInventory.js                ← NEW
        ├── usePricing.js                  ← NEW
        ├── useEvents.js                   ← NEW
        ├── useSettings.js                 ← NEW
        └── useDashboard.js                ← NEW
```

---

# PART 5 — DATABASE DESIGN

## Why 8 Collections?

| Collection | Why It Exists |
|------------|--------------|
| `products` | Core entity — everything references this |
| `inventories` | Separated from product because stock changes frequently; EMA fields update hourly |
| `salesevents` | Individual sale records power demand velocity; `eventId` enables attribution |
| `competitorprices` | Multiple competitors per product; staleness scoring requires timestamps |
| `pricingrecommendations` | Append-only audit log — never update, only insert; enables decision traceability |
| `promotionalevents` | Event lifecycle with scheduling, targeting, and discount configuration |
| `eventanalytics` | Pre-computed event performance metrics per product |
| `settings` | Singleton key-value store for global toggles and thresholds |

---

## Schema 1: Product

```javascript
// src/models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName:  { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  sku:          { type: String, required: true, unique: true, uppercase: true, trim: true },
  category:     { type: String, required: true, trim: true,
                  enum: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books',
                         'Food', 'Beauty', 'Toys', 'Automotive', 'Other'] },
  description:  { type: String, default: '' },

  // PRICING FIELDS
  costPrice:    { type: Number, required: true, min: 0 },       // what we pay to acquire
  basePrice:    { type: Number, required: true, min: 0 },       // MSRP / launch price
  currentPrice: { type: Number, required: true, min: 0 },       // live selling price
  targetMargin: { type: Number, default: 0.15, min: 0, max: 1 }, // 15% default minimum margin

  // TIER — affects pricing aggressiveness
  tier: {
    type: String,
    enum: ['budget', 'mid', 'premium'],
    default: 'mid'
  },

  // PRICING STRATEGY — per-product behavior overrides
  pricingStrategy: {
    mode:                 { type: String, enum: ['auto', 'manual'], default: 'auto' },
    maxIncreasePct:       { type: Number, default: 0.15 },  // max +15% per cycle
    maxDecreasePct:       { type: Number, default: 0.15 },  // max -15% per cycle
    minTimeBetweenChanges:{ type: Number, default: 60 },    // minutes
  },

  // SEASONAL CONFIGURATION (per-product level of the cascade)
  seasonalConfig: {
    season:       { type: String, enum: ['monsoon','summer','winter','festive','none'], default: 'none' },
    startDate:    { type: String },   // 'MM-DD' format e.g. '06-01'
    peakDate:     { type: String },   // 'MM-DD'
    endDate:      { type: String },   // 'MM-DD'
    maxBoost:     { type: Number, default: 0.12 },  // max 12% seasonal price boost
  },

  // LIFECYCLE
  isActive:     { type: Boolean, default: true },
  lastPricedAt: { type: Date, default: null },

}, { timestamps: true });

// INDEXES
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ lastPricedAt: 1 });

module.exports = mongoose.model('Product', productSchema);
```

**Key design decisions:**
- `costPrice` exists so the profitability floor (`costPrice × (1 + targetMargin)`) can be enforced
- `tier` affects how aggressively the engine moves prices (premium products get less aggressive swings)
- `seasonalConfig` is the product-level layer of the 3-tier cascade
- `pricingStrategy.mode = 'manual'` excludes the product from the scheduler

---

## Schema 2: Inventory

```javascript
// src/models/inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
  availableQuantity: { type: Number, required: true, min: 0, validate: { validator: Number.isInteger } },
  reservedQuantity:  { type: Number, default: 0, min: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  reorderPoint:      { type: Number, default: 20 },

  // EMA DEMAND TRACKING — updated by background job
  emaDailySales:      { type: Number, default: null },   // units/day (Exponential Moving Average)
  emaSalesUpdatedAt:  { type: Date, default: null },
  coverageDays:       { type: Number, default: null },   // availableQty / emaDailySales
  inventoryStatus:    { type: String, enum: ['critical','low','normal','high','unknown'], default: 'unknown' },

}, { timestamps: true });

inventorySchema.index({ productId: 1 }, { unique: true });
inventorySchema.index({ inventoryStatus: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
```

**Why separate from Product?** Inventory data changes frequently (every sale, every restock). Keeping it separate prevents write contention on the Product document and allows the EMA background job to update inventory records independently.

---

## Schema 3: SalesEvent

```javascript
// src/models/salesEvent.js — NEW
const mongoose = require('mongoose');

const salesEventSchema = new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:      { type: Number, required: true, min: 1 },
  priceAtSale:   { type: Number, required: true, min: 0 },
  channel:       { type: String, enum: ['web', 'mobile', 'store', 'manual'], default: 'manual' },

  // DEMAND ATTRIBUTION — the key field
  eventId:       { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionalEvent', default: null },
  // If eventId is null   → this is an ORGANIC sale    → included in EMA baseline
  // If eventId is set    → this is a PROMOTIONAL sale → excluded from EMA baseline

  isPromotional: { type: Boolean, default: false },
  isCancelled:   { type: Boolean, default: false },
  soldAt:        { type: Date, default: Date.now },
}, { timestamps: true });

// INDEXES — these power all demand calculations
salesEventSchema.index({ productId: 1, soldAt: -1 });          // range queries per product
salesEventSchema.index({ soldAt: -1 });                         // cross-product time queries
salesEventSchema.index({ productId: 1, isCancelled: 1, eventId: 1 }); // attribution filter
salesEventSchema.index({ eventId: 1 });                         // all sales for an event

// TTL: auto-delete events older than 90 days (7776000 seconds)
salesEventSchema.index({ soldAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('SalesEvent', salesEventSchema);
```

**Why individual sale records instead of aggregated counts?** Because we need:
1. Time-windowed velocity calculations (last 6h vs last 7d)
2. Promotional vs organic attribution per sale
3. Hourly EMA recomputation from raw data

---

## Schema 4: CompetitorPrice

```javascript
// src/models/competitorPrice.js
const mongoose = require('mongoose');

const competitorPriceSchema = new mongoose.Schema({
  productId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  competitorName: { type: String, required: true, trim: true },
  competitorPrice:{ type: Number, required: true, min: 0 },
  competitorUrl:  { type: String, default: '' },
  isOutlier:      { type: Boolean, default: false },      // set by IQR outlier detection
  stalenessScore: { type: Number, default: 1.0 },         // 1 = fresh, 0 = stale (computed)
  recordedAt:     { type: Date, default: Date.now },
}, { timestamps: true });

competitorPriceSchema.index({ productId: 1, updatedAt: -1 });
competitorPriceSchema.index({ updatedAt: 1 });

// TTL: auto-delete competitor records older than 30 days (2592000 seconds)
competitorPriceSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('CompetitorPrice', competitorPriceSchema);
```

---

## Schema 5: PricingRecommendation (Append-Only Decision Record)

This is the most important schema. It is an **audit log** — every pricing decision ever made is stored with the full snapshot of inputs at decision time.

```javascript
// src/models/pricingRecommendation.js
const mongoose = require('mongoose');

const pricingRecommendationSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

  // SNAPSHOT OF ALL INPUTS AT DECISION TIME
  inputSnapshot: {
    currentPrice:      { type: Number },
    costPrice:         { type: Number },
    basePrice:         { type: Number },
    availableQuantity: { type: Number },
    emaDailySales:     { type: Number },
    coverageDays:      { type: Number },
    referenceDate:     { type: Date },
    competitorPrices:  [{ competitorName: String, price: Number, recordedAt: Date }],
  },

  // SUB-SIGNAL RESULTS
  signals: {
    demand: {
      multiplier:      { type: Number },
      confidence:      { type: Number },
      velocityRatio:   { type: Number },
      interpretation:  { type: String },    // 'SURGE'|'HIGH'|'RISING'|'STABLE'|'FALLING'|'LOW'
      organicRate:     { type: Number },     // organic sales/hour
      promoRate:       { type: Number },     // promotional sales/hour
    },
    inventory: {
      multiplier:      { type: Number },
      confidence:      { type: Number },
      coverageDays:    { type: Number },
      interpretation:  { type: String },    // 'ZERO'|'CRITICAL'|'LOW'|'NORMAL'|'HIGH'
    },
    competitor: {
      multiplier:      { type: Number },
      confidence:      { type: Number },
      medianPrice:     { type: Number },
      gapPercent:      { type: Number },
      interpretation:  { type: String },    // 'COMPETITORS_EXPENSIVE'|'NEAR_PARITY'|'COMPETITORS_CHEAPER'
    },
    seasonal: {
      multiplier:      { type: Number },
      phase:           { type: String },    // 'ramp_up'|'peak'|'ramp_down'|'off_season'|'disabled_global'|'disabled_category'
      intensity:       { type: Number },
      season:          { type: String },
    },
  },

  // DECISION OUTPUT
  outcome: {
    rawMultiplier:      { type: Number },
    finalMultiplier:    { type: Number },
    recommendedPrice:   { type: Number, required: true },
    adjustmentPercent:  { type: Number },
    confidenceScore:    { type: Number },
    confidenceLevel:    { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'] },
    shouldApply:        { type: Boolean },
    constraintApplied:  { type: String, enum: ['PROFIT_FLOOR', 'CEILING', 'STABILITY', 'MINIMUM_CHANGE', 'NONE'] },
    primaryDriver:      { type: String },
  },

  // EVENT OVERLAY (populated if a promotional event was active)
  eventOverlay: {
    eventId:             { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionalEvent', default: null },
    eventName:           { type: String, default: null },
    discountType:        { type: String, default: null },
    discountValue:       { type: Number, default: null },
    priceBeforeDiscount: { type: Number, default: null },
    priceAfterDiscount:  { type: Number, default: null },
    constraintApplied:   { type: String, default: null },
  },

  // AI EXPLANATION
  aiExplanation: {
    text:          { type: String, default: null },
    model:         { type: String, default: 'gemini-2.0-flash' },
    failed:        { type: Boolean, default: false },
    failureReason: { type: String, default: null },
    generatedAt:   { type: Date, default: null },
  },

  // STATUS LIFECYCLE
  status:         { type: String, enum: ['PENDING', 'APPLIED', 'REJECTED', 'EXPIRED'], default: 'PENDING' },
  appliedAt:      { type: Date, default: null },
  rejectedReason: { type: String, default: null },
  triggeredBy:    { type: String, enum: ['manual', 'scheduler', 'api'], default: 'manual' },

}, { timestamps: true });

pricingRecommendationSchema.index({ productId: 1, createdAt: -1 });
pricingRecommendationSchema.index({ status: 1 });
pricingRecommendationSchema.index({ 'outcome.confidenceScore': -1 });
pricingRecommendationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PricingRecommendation', pricingRecommendationSchema);
```

---

## Schema 6: PromotionalEvent

```javascript
// src/models/promotionalEvent.js — NEW
const mongoose = require('mongoose');

const promotionalEventSchema = new mongoose.Schema({
  // IDENTITY
  eventName:    { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  eventType:    {
    type: String, required: true,
    enum: ['weekend_sale', 'festival_sale', 'anniversary_sale', 'flash_sale',
           'clearance_sale', 'product_specific', 'category_sale', 'custom']
  },
  description:  { type: String, default: '' },

  // SCHEDULING
  startDate:    { type: Date, required: true },
  endDate:      { type: Date, required: true },

  // LIFECYCLE STATUS
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'ACTIVE', 'INACTIVE', 'EXPIRED'],
    default: 'DRAFT'
  },

  // PRIORITY (1 = highest, 10 = lowest)
  // When multiple events match a product, the highest priority (lowest number) wins.
  priority:     { type: Number, default: 5, min: 1, max: 10 },

  // DISCOUNT CONFIGURATION
  discountType: {
    type: String, required: true,
    enum: ['percentage', 'flat_amount', 'fixed_price']
    // percentage:   10% off recommended price
    // flat_amount:  ₹200 off recommended price
    // fixed_price:  override to ₹499 (ignores engine recommendation)
  },
  discountValue: { type: Number, required: true, min: 0 },

  // TARGETING
  targetType:   {
    type: String, required: true,
    enum: ['all_products', 'specific_products', 'specific_categories']
  },
  targetProducts:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  targetCategories: [{ type: String }],

  // CONSTRAINTS
  maxDiscountCap:     { type: Number, default: null },  // max ₹ discount allowed
  minFinalPrice:      { type: Number, default: null },  // floor price during event
  respectProfitFloor: { type: Boolean, default: true }, // never go below costPrice×(1+margin)

  // RECURRENCE (for weekend sales, etc.)
  isRecurring:      { type: Boolean, default: false },
  recurrencePattern: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', null],
    default: null
  },
  recurrenceDays:   [{ type: Number, min: 0, max: 6 }], // 0=Sunday, 6=Saturday

  // METADATA
  createdBy:    { type: String, default: 'admin' },

}, { timestamps: true });

// INDEXES
promotionalEventSchema.index({ status: 1 });
promotionalEventSchema.index({ startDate: 1, endDate: 1 });
promotionalEventSchema.index({ targetProducts: 1 });
promotionalEventSchema.index({ targetCategories: 1 });
promotionalEventSchema.index({ status: 1, startDate: 1, endDate: 1 });

// VALIDATION: endDate must be after startDate
promotionalEventSchema.pre('validate', function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('endDate must be after startDate'));
  }
  next();
});

module.exports = mongoose.model('PromotionalEvent', promotionalEventSchema);
```

**Event lifecycle state machine:**
```
DRAFT  →(activate)→  SCHEDULED  →(startDate reached)→  ACTIVE  →(endDate reached)→  EXPIRED
  ↑                                                       │
  └──────────────────(deactivate)─────────────────────────┘
                                                  → INACTIVE
```

---

## Schema 7: EventAnalytics

```javascript
// src/models/eventAnalytics.js — NEW
const mongoose = require('mongoose');

const eventAnalyticsSchema = new mongoose.Schema({
  eventId:     { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionalEvent', required: true },
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

  // SALES METRICS
  totalSalesDuringEvent:   { type: Number, default: 0 },
  totalRevenueDuringEvent: { type: Number, default: 0 },

  // DEMAND ATTRIBUTION
  organicSales:       { type: Number, default: 0 },
  promotionalSales:   { type: Number, default: 0 },
  demandLift:         { type: Number, default: null },   // % increase over baseline

  // PRICE IMPACT
  avgPriceBeforeEvent: { type: Number, default: null },
  avgPriceDuringEvent: { type: Number, default: null },
  discountAmountTotal: { type: Number, default: 0 },

  // REVENUE ANALYSIS
  revenueWithoutEvent:  { type: Number, default: null },
  revenueWithEvent:     { type: Number, default: null },
  netRevenueImpact:     { type: Number, default: null },

  computedAt:  { type: Date, default: Date.now },
}, { timestamps: true });

eventAnalyticsSchema.index({ eventId: 1 });
eventAnalyticsSchema.index({ eventId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('EventAnalytics', eventAnalyticsSchema);
```

---

## Schema 8: Settings

```javascript
// src/models/settings.js — NEW (singleton key-value store)
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key:         { type: String, required: true, unique: true },
  value:       { type: mongoose.Schema.Types.Mixed, required: true },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);

// SEED DATA (insert once on first server start):
// { key: 'schedulerEnabled',            value: true,   description: 'Enable background price recalculation' }
// { key: 'schedulerIntervalMinutes',    value: 30,     description: 'Minutes between auto-recalculation runs' }
// { key: 'autoApplyThreshold',          value: 0.80,   description: 'Confidence threshold for auto-apply' }
// { key: 'minChangeThreshold',          value: 0.01,   description: '1% minimum change to avoid noise' }
// { key: 'seasonalPricingEnabled',      value: true,   description: 'Master toggle for seasonal pricing' }
// { key: 'seasonalDisabledCategories',  value: [],     description: 'Categories excluded from seasonal pricing' }
// { key: 'eventsEnabled',              value: true,   description: 'Master toggle for promotional events' }
// { key: 'maxGlobalDiscountPercent',    value: 0.30,   description: 'Global max discount safety cap (30%)' }
```

---

# PART 6 — API DESIGN

> **Base URL:** `/api/v1`

## 6.1 Product APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/products` | List all active products |
| GET | `/products/:id` | Get single product with inventory |
| POST | `/products` | Create product |
| PATCH | `/products/:id` | Update product fields |
| DELETE | `/products/:id` | Soft delete (sets `isActive: false`) |

**POST /api/v1/products — Request:**
```json
{
  "productName": "Wireless Mouse",
  "sku": "WM-001",
  "category": "Electronics",
  "costPrice": 400,
  "basePrice": 799,
  "currentPrice": 799,
  "targetMargin": 0.15,
  "tier": "mid",
  "description": "Ergonomic wireless mouse",
  "pricingStrategy": { "mode": "auto", "maxIncreasePct": 0.15, "maxDecreasePct": 0.15 },
  "seasonalConfig": { "season": "none" }
}
```

**POST /api/v1/products — Response 201:**
```json
{
  "success": true,
  "data": {
    "_id": "665abc123...",
    "productName": "Wireless Mouse",
    "sku": "WM-001",
    "category": "Electronics",
    "currentPrice": 799,
    "costPrice": 400,
    "tier": "mid",
    "isActive": true,
    "createdAt": "2026-06-20T..."
  }
}
```

**GET /api/v1/products — Response 200:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "productName": "Wireless Mouse",
      "sku": "WM-001",
      "category": "Electronics",
      "currentPrice": 799,
      "costPrice": 400,
      "tier": "mid",
      "inventory": { "availableQuantity": 45, "inventoryStatus": "normal", "coverageDays": 6.5 },
      "lastPricedAt": "2026-06-20T..."
    }
  ]
}
```

---

## 6.2 Inventory APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/inventory` | List all inventory with product details |
| GET | `/inventory/:productId` | Single product inventory |
| POST | `/inventory` | Create inventory record |
| PATCH | `/inventory/:productId` | Update quantity |
| GET | `/inventory/status/critical` | List critical/low stock products |

**GET /api/v1/inventory — Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "productId": { "_id": "...", "productName": "Wireless Mouse", "currentPrice": 799 },
      "availableQuantity": 45,
      "coverageDays": 6.5,
      "inventoryStatus": "low",
      "emaDailySales": 6.9,
      "emaSalesUpdatedAt": "2026-06-20T..."
    }
  ]
}
```

---

## 6.3 Sales APIs

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/sales` | Record a sale event (drives demand calculation) |
| GET | `/sales/:productId` | Get recent sales for a product |
| GET | `/sales/:productId/velocity` | Get computed velocity stats |

**POST /api/v1/sales — Request:**
```json
{
  "productId": "665abc123...",
  "quantity": 3,
  "priceAtSale": 799,
  "channel": "web",
  "soldAt": "2026-06-20T10:30:00Z"
}
```
> The backend auto-detects if a promotional event is active for this product at `soldAt` time and populates `eventId` automatically.

**GET /api/v1/sales/:productId/velocity — Response 200:**
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "organicShortTermRate": 5.2,
    "organicLongTermRate": 3.1,
    "velocityRatio": 1.68,
    "interpretation": "RISING",
    "promoShortTermRate": 8.1,
    "organicPercentage": 39.1,
    "promoPercentage": 60.9,
    "isEventActive": true,
    "totalSalesCount": 156,
    "confidence": 0.75
  }
}
```

---

## 6.4 Competitor APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/competitors/:productId` | List competitor prices for product |
| POST | `/competitors` | Add competitor price |
| PATCH | `/competitors/:id` | Update competitor price |
| DELETE | `/competitors/:id` | Remove competitor price |
| GET | `/competitors/:productId/analysis` | Gap analysis result |

**GET /api/v1/competitors/:productId/analysis — Response 200:**
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "ourPrice": 799,
    "medianCompetitorPrice": 749,
    "gapPercent": -6.26,
    "interpretation": "COMPETITORS_CHEAPER",
    "freshCount": 3,
    "staleCount": 1,
    "outlierCount": 0,
    "signal": "downward",
    "multiplier": 0.965
  }
}
```

---

## 6.5 Pricing Engine APIs

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/pricing/calculate` | **MAIN API** — run pricing engine for a product |
| PATCH | `/pricing/:decisionId/apply` | Apply a pending recommendation |
| PATCH | `/pricing/:decisionId/reject` | Reject a recommendation |
| GET | `/pricing/recommendations` | List all recommendations |
| GET | `/pricing/recommendations/:productId` | Product-specific history |
| POST | `/pricing/recalculate-all` | Trigger batch recalculation |

**POST /api/v1/pricing/calculate — Request:**
```json
{
  "productId": "665abc123...",
  "triggeredBy": "manual",
  "referenceDate": "2026-06-20T10:00:00Z"
}
```

**POST /api/v1/pricing/calculate — Response 200 (THE STAR RESPONSE):**
```json
{
  "success": true,
  "data": {
    "decisionId": "665def456...",
    "product": {
      "name": "Wireless Mouse",
      "sku": "WM-001",
      "category": "Electronics",
      "tier": "mid"
    },
    "pricing": {
      "currentPrice": 1000,
      "recommendedPrice": 1099,
      "adjustmentPercent": "+9.9",
      "profitFloor": 460,
      "priceCeiling": 1500,
      "constraintApplied": "NONE"
    },
    "signals": {
      "demand": {
        "multiplier": 1.08,
        "velocityRatio": 1.63,
        "interpretation": "RISING",
        "confidence": 0.75,
        "organicRate": 5.2,
        "promoRate": 0
      },
      "inventory": {
        "multiplier": 1.06,
        "coverageDays": 4.2,
        "interpretation": "LOW",
        "confidence": 1.0
      },
      "competitor": {
        "multiplier": 0.99,
        "medianPrice": 990,
        "gapPercent": -1.0,
        "interpretation": "NEAR_PARITY",
        "confidence": 0.8
      },
      "seasonal": {
        "multiplier": 1.04,
        "phase": "ramp_up",
        "intensity": 0.34,
        "season": "monsoon"
      }
    },
    "decision": {
      "finalMultiplier": 1.178,
      "confidenceScore": 0.82,
      "confidenceLevel": "HIGH",
      "shouldApply": true,
      "primaryDriver": "Low inventory (4.2 days coverage) + rising demand"
    },
    "eventOverlay": {
      "eventApplied": true,
      "eventName": "Weekend Sale",
      "discountType": "percentage",
      "discountValue": 10,
      "priceBeforeDiscount": 1099,
      "priceAfterDiscount": 989,
      "finalCustomerPrice": 989,
      "constraintApplied": "NONE"
    },
    "explanation": {
      "aiText": "Wireless Mouse demand is accelerating 1.6× above baseline while inventory covers only 4.2 days. A price increase to ₹1,099 is recommended. The active Weekend Sale applies a 10% discount, bringing the customer price to ₹989.",
      "headline": "Price increase recommended: +₹99 (+9.9%)",
      "primaryDriver": "Low inventory + Rising demand",
      "whatWouldChangeThis": [
        "If inventory coverage rises above 7 days → upward pressure removed",
        "If demand velocity falls below 1× baseline → neutral signal",
        "If competitor undercuts by more than 5% → downward pressure activates"
      ]
    },
    "status": "PENDING"
  }
}
```

---

## 6.6 Event APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/events` | List all events (query: `?status=ACTIVE`) |
| GET | `/events/:id` | Get single event with analytics summary |
| POST | `/events` | Create event (starts in DRAFT) |
| PATCH | `/events/:id` | Update event (only DRAFT/SCHEDULED) |
| DELETE | `/events/:id` | Delete event (only DRAFT/INACTIVE) |
| PATCH | `/events/:id/activate` | Transition to SCHEDULED/ACTIVE |
| PATCH | `/events/:id/deactivate` | Transition to INACTIVE |
| GET | `/events/active` | List currently active events |
| GET | `/events/upcoming` | List scheduled future events |
| GET | `/events/:id/analytics` | Event performance analytics |
| GET | `/events/:id/products` | List affected products |

**POST /api/v1/events — Request:**
```json
{
  "eventName": "Monsoon Electronics Sale",
  "eventType": "category_sale",
  "description": "20% off all electronics",
  "startDate": "2026-06-25T00:00:00Z",
  "endDate": "2026-06-30T23:59:59Z",
  "priority": 3,
  "discountType": "percentage",
  "discountValue": 20,
  "targetType": "specific_categories",
  "targetCategories": ["Electronics"],
  "respectProfitFloor": true
}
```

---

## 6.7 Settings APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/settings` | Get all settings |
| PATCH | `/settings/:key` | Update a setting value |
| GET | `/settings/seasonal` | Get seasonal toggle config |
| PATCH | `/settings/seasonal/toggle` | Toggle seasonal ON/OFF |
| PATCH | `/settings/seasonal/categories` | Update disabled categories list |

**PATCH /api/v1/settings/seasonal/toggle — Request:**
```json
{ "enabled": false }
```

**GET /api/v1/settings/seasonal — Response 200:**
```json
{
  "success": true,
  "data": {
    "seasonalPricingEnabled": true,
    "seasonalDisabledCategories": ["Food", "Books"],
    "summary": "Seasonal pricing is ON globally, disabled for: Food, Books"
  }
}
```

---

## 6.8 Dashboard & Analytics APIs

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/dashboard/stats` | Main dashboard KPIs |
| GET | `/analytics/price-history/:productId` | Price over time chart data |
| GET | `/analytics/demand-trends/:productId` | Demand velocity over time |
| GET | `/analytics/demand-attribution/:productId` | Organic vs promotional split |
| GET | `/analytics/event-performance/:eventId` | Event metrics |
| GET | `/analytics/event-summary` | Aggregate event performance |

**GET /api/v1/dashboard/stats — Response 200:**
```json
{
  "success": true,
  "data": {
    "products": { "total": 12, "active": 10, "pricedToday": 7 },
    "inventory": {
      "critical": 2, "low": 3, "normal": 5, "high": 0,
      "totalValue": 245000
    },
    "pricing": {
      "pendingRecommendations": 4,
      "appliedToday": 3,
      "avgConfidenceScore": 0.76,
      "avgAdjustmentPercent": 4.2
    },
    "events": {
      "activeEvents": 2,
      "upcomingEvents": 3,
      "totalDiscountToday": 4500,
      "topEvent": { "name": "Weekend Sale", "salesCount": 42 }
    },
    "seasonalConfig": {
      "globalEnabled": true,
      "disabledCategories": ["Food"]
    },
    "recentRecommendations": []
  }
}
```

**GET /api/v1/analytics/demand-attribution/:productId — Response 200:**
```json
{
  "success": true,
  "data": {
    "productId": "...",
    "period": "last_30_days",
    "totalSales": 450,
    "organicSales": 380,
    "promotionalSales": 70,
    "organicPercentage": 84.4,
    "promotionalPercentage": 15.6,
    "organicRevenue": 303200,
    "promotionalRevenue": 49000
  }
}
```

---

# PART 7 — PRICING ENGINE

## 7.1 Complete Implementation

```javascript
// ═══════════════════════════════════════════════════════
// src/services/pricingEngine.js — THE CORE OF THE PROJECT
// ═══════════════════════════════════════════════════════

const Product = require('../models/product');
const Inventory = require('../models/inventory');
const CompetitorPrice = require('../models/competitorPrice');
const PricingRecommendation = require('../models/pricingRecommendation');
const Settings = require('../models/settings');
const { computeAttributedDemand } = require('./demandAttribution');
const eventService = require('./eventService');
const aiService = require('./aiService');
const { charmPrice, getDayOfYear } = require('../utils/pricingUtils');

// ─── MAIN ORCHESTRATOR ──────────────────────────────────
async function runPricingEngine(productId, referenceDate = new Date(), triggeredBy = 'manual') {

  // STEP 1: Fetch all needed data
  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new Error('Product not found or inactive');

  const inventory = await Inventory.findOne({ productId });
  if (!inventory) throw new Error('Inventory record not found');

  const competitors = await CompetitorPrice.find({ productId });

  // STEP 2: Compute sub-signals
  const attributedDemand = await computeAttributedDemand(productId, referenceDate);
  const demandSignal     = computeDemandSignal(attributedDemand);
  const inventorySignal  = computeInventorySignal(inventory, attributedDemand);
  const competitorSignal = computeCompetitorSignal(competitors, product.currentPrice);
  const seasonalSignal   = await computeSeasonalSignal(product, referenceDate);

  // STEP 3: Compose final recommendation
  const recommendation = composePriceRecommendation({
    product, demandSignal, inventorySignal, competitorSignal, seasonalSignal
  });

  // STEP 4: Get AI explanation (non-blocking)
  let aiExplanation = { text: null, failed: false };
  try {
    aiExplanation = await aiService.generateExplanation({
      product, recommendation, demandSignal, inventorySignal, competitorSignal, seasonalSignal
    });
  } catch (e) {
    aiExplanation = { text: null, failed: true, failureReason: e.message };
  }

  // STEP 5: Save decision record
  const decision = await PricingRecommendation.create({
    productId,
    inputSnapshot: {
      currentPrice: product.currentPrice,
      costPrice: product.costPrice,
      basePrice: product.basePrice,
      availableQuantity: inventory.availableQuantity,
      emaDailySales: attributedDemand.longTermRate * 24,
      coverageDays: inventorySignal.coverageDays,
      referenceDate,
      competitorPrices: competitors.map(c => ({
        competitorName: c.competitorName, price: c.competitorPrice, recordedAt: c.recordedAt
      })),
    },
    signals: {
      demand: { ...demandSignal, organicRate: attributedDemand.organicShortTermRate, promoRate: attributedDemand.promoShortTermRate },
      inventory: inventorySignal,
      competitor: competitorSignal,
      seasonal: seasonalSignal,
    },
    outcome: recommendation,
    aiExplanation,
    status: 'PENDING',
    triggeredBy,
  });

  // STEP 5.5: Event Overlay — apply promotional discount if active
  let eventOverlay = { eventApplied: false };
  const activeEvent = await eventService.findActiveEventForProduct(product, referenceDate);

  if (activeEvent) {
    eventOverlay = eventService.applyEventDiscount(activeEvent, recommendation.recommendedPrice, product);
    decision.eventOverlay = eventOverlay;
    await decision.save();
  }

  // STEP 6: Update product.lastPricedAt
  await Product.findByIdAndUpdate(productId, { lastPricedAt: new Date() });

  return { ...decision.toObject(), product, eventOverlay };
}

// ─── DEMAND SIGNAL ──────────────────────────────────────
function computeDemandSignal(attributedDemand) {
  const { shortTermRate, longTermRate, totalSalesCount, isEventActive } = attributedDemand;
  const velocityRatio = longTermRate > 0 ? shortTermRate / longTermRate : 1.0;
  let confidence = Math.min(1.0, totalSalesCount / 20); // need 20+ sales for full confidence

  let interpretation, baseMultiplier;
  if (velocityRatio > 5)       { interpretation = 'SURGE';   baseMultiplier = 1.15; }
  else if (velocityRatio > 2)  { interpretation = 'HIGH';    baseMultiplier = 1.10; }
  else if (velocityRatio > 1.2){ interpretation = 'RISING';  baseMultiplier = 1.05; }
  else if (velocityRatio > 0.8){ interpretation = 'STABLE';  baseMultiplier = 1.00; }
  else if (velocityRatio > 0.5){ interpretation = 'FALLING'; baseMultiplier = 0.96; }
  else                         { interpretation = 'LOW';     baseMultiplier = 0.92; }

  // Confidence penalty during active promotions — organic signal is unreliable
  if (isEventActive && velocityRatio >= 0.8 && velocityRatio <= 1.2) {
    confidence *= 0.7; // 30% penalty
  }

  // Volume damping: low-volume products get less aggressive multipliers
  const multiplier = 1.0 + (baseMultiplier - 1.0) * confidence;

  return { multiplier, confidence, velocityRatio, interpretation };
}

// ─── INVENTORY SIGNAL ───────────────────────────────────
function computeInventorySignal(inventory, attributedDemand) {
  const { availableQuantity } = inventory;
  const emaDailySales = (attributedDemand.longTermRate * 24) || 1; // convert hourly to daily, fallback 1
  const coverageDays = availableQuantity / emaDailySales;

  let interpretation, multiplier;
  if (coverageDays === 0)      { interpretation = 'ZERO';     multiplier = 1.20; }
  else if (coverageDays < 3)   { interpretation = 'CRITICAL'; multiplier = 1.15; }
  else if (coverageDays < 7)   { interpretation = 'LOW';      multiplier = 1.06; }
  else if (coverageDays < 15)  { interpretation = 'NORMAL';   multiplier = 1.00; }
  else                         { interpretation = 'HIGH';     multiplier = 0.92; }

  return {
    multiplier,
    confidence: 1.0,
    coverageDays: parseFloat(coverageDays.toFixed(1)),
    interpretation
  };
}

// ─── COMPETITOR SIGNAL ──────────────────────────────────
function computeCompetitorSignal(competitorRecords, ourPrice) {
  if (!competitorRecords || competitorRecords.length === 0) {
    return { multiplier: 1.0, confidence: 0, medianPrice: null, gapPercent: 0, interpretation: 'NO_DATA' };
  }

  const now = Date.now();
  // Filter stale (>72h old) and compute staleness weight
  const fresh = competitorRecords
    .map(r => ({ price: r.competitorPrice, age: (now - new Date(r.updatedAt)) / 3_600_000 }))
    .filter(r => r.age <= 72)
    .map(r => ({ price: r.price, weight: 1 - r.age / 72 }));

  if (fresh.length === 0) {
    return { multiplier: 1.0, confidence: 0, medianPrice: null, gapPercent: 0, interpretation: 'ALL_STALE' };
  }

  // IQR outlier rejection
  const prices = fresh.map(r => r.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor(prices.length * 0.25)] ?? prices[0];
  const q3 = prices[Math.floor(prices.length * 0.75)] ?? prices[prices.length - 1];
  const iqr = q3 - q1;
  const inliers = fresh.filter(r => r.price >= q1 - 1.5 * iqr && r.price <= q3 + 1.5 * iqr);
  const medianPrice = inliers[Math.floor(inliers.length / 2)]?.price ?? ourPrice;

  const gapPercent = ((medianPrice - ourPrice) / ourPrice) * 100;
  // Competitor is a SIGNAL, not a directive. Max ±8% influence.
  const rawInfluence = gapPercent * 0.4;
  const clampedInfluence = Math.max(-8, Math.min(8, rawInfluence));
  const multiplier = 1.0 + clampedInfluence / 100;

  let interpretation;
  if (gapPercent > 5)       interpretation = 'COMPETITORS_EXPENSIVE';
  else if (gapPercent > 1)  interpretation = 'SLIGHTLY_EXPENSIVE';
  else if (gapPercent > -1) interpretation = 'NEAR_PARITY';
  else if (gapPercent > -5) interpretation = 'SLIGHTLY_CHEAPER';
  else                      interpretation = 'COMPETITORS_CHEAPER';

  return {
    multiplier,
    confidence: Math.min(1, inliers.length / 5),
    medianPrice,
    gapPercent: parseFloat(gapPercent.toFixed(2)),
    interpretation
  };
}

// ─── SEASONAL SIGNAL (with 3-tier cascade) ──────────────
async function computeSeasonalSignal(product, referenceDate) {
  // TIER 1: Global Toggle
  const globalSetting = await Settings.findOne({ key: 'seasonalPricingEnabled' });
  if (!globalSetting || globalSetting.value === false) {
    return { multiplier: 1.0, phase: 'disabled_global', intensity: 0,
             reason: 'Seasonal pricing disabled globally' };
  }

  // TIER 2: Category Override
  const disabledCats = await Settings.findOne({ key: 'seasonalDisabledCategories' });
  if (disabledCats && Array.isArray(disabledCats.value) && disabledCats.value.includes(product.category)) {
    return { multiplier: 1.0, phase: 'disabled_category', intensity: 0,
             reason: `Seasonal pricing disabled for ${product.category}` };
  }

  // TIER 3: Product Config
  const sc = product.seasonalConfig;
  if (!sc || sc.season === 'none') {
    return { multiplier: 1.0, phase: 'off_season', intensity: 0 };
  }

  // TIER 4: Compute seasonal signal with sigmoid ramp
  const doy = getDayOfYear(referenceDate);
  const startDoy = getDayOfYear(sc.startDate);
  const peakDoy  = getDayOfYear(sc.peakDate);
  const endDoy   = getDayOfYear(sc.endDate);
  const maxBoost = sc.maxBoost || 0.12;
  const sigmoid = (x) => 1 / (1 + Math.exp(-10 * (x - 0.5)));

  if (doy >= startDoy && doy <= peakDoy) {
    const progress = (doy - startDoy) / (peakDoy - startDoy || 1);
    const intensity = sigmoid(progress);
    return { multiplier: 1.0 + maxBoost * intensity, phase: 'ramp_up', intensity, season: sc.season };
  }
  if (doy > peakDoy && doy <= endDoy) {
    const progress = (doy - peakDoy) / (endDoy - peakDoy || 1);
    const intensity = 1 - sigmoid(progress);
    return { multiplier: 1.0 + maxBoost * intensity, phase: 'ramp_down', intensity, season: sc.season };
  }
  return { multiplier: 1.0, phase: 'off_season', intensity: 0 };
}

// ─── COMPOSITION (Multiplicative) ───────────────────────
function composePriceRecommendation({ product, demandSignal, inventorySignal, competitorSignal, seasonalSignal }) {
  const { currentPrice, costPrice, targetMargin, pricingStrategy } = product;

  // STEP A: Multiplicative composition
  const rawMultiplier = demandSignal.multiplier
                      * inventorySignal.multiplier
                      * competitorSignal.multiplier
                      * seasonalSignal.multiplier;

  // STEP B: Stability clamp — max change per cycle
  const maxUp   = 1 + (pricingStrategy?.maxIncreasePct || 0.15);
  const maxDown = 1 - (pricingStrategy?.maxDecreasePct || 0.15);
  const finalMultiplier = Math.max(maxDown, Math.min(maxUp, rawMultiplier));

  let recommendedPrice = currentPrice * finalMultiplier;
  let constraintApplied = 'NONE';

  // STEP C: Profitability floor — non-negotiable
  const profitFloor = costPrice * (1 + targetMargin);
  if (recommendedPrice < profitFloor) {
    recommendedPrice = profitFloor;
    constraintApplied = 'PROFIT_FLOOR';
  }

  // STEP D: Price ceiling
  const priceCeiling = currentPrice * 1.5;
  if (recommendedPrice > priceCeiling) {
    recommendedPrice = priceCeiling;
    constraintApplied = 'CEILING';
  }

  // STEP E: Minimum change threshold — avoid noise
  const changePercent = Math.abs(recommendedPrice - currentPrice) / currentPrice;
  if (changePercent < 0.01) {
    recommendedPrice = currentPrice;
    constraintApplied = 'MINIMUM_CHANGE';
  }

  // STEP F: Charm pricing — round to ₹X49/₹X99
  recommendedPrice = charmPrice(Math.round(recommendedPrice));

  // STEP G: Confidence score
  const confidenceScore = parseFloat((
    0.40 * demandSignal.confidence +
    0.30 * inventorySignal.confidence +
    0.20 * (competitorSignal.confidence || 0) +
    0.10 * 1.0 // seasonal always has confidence 1.0
  ).toFixed(2));

  const confidenceLevel = confidenceScore >= 0.75 ? 'HIGH' : confidenceScore >= 0.50 ? 'MEDIUM' : 'LOW';
  const shouldApply = confidenceScore >= 0.5 && constraintApplied !== 'MINIMUM_CHANGE';

  // STEP H: Primary driver — dominant signal
  const signals = [
    { name: 'demand', impact: Math.abs(demandSignal.multiplier - 1) },
    { name: 'inventory', impact: Math.abs(inventorySignal.multiplier - 1) },
    { name: 'competitor', impact: Math.abs(competitorSignal.multiplier - 1) },
    { name: 'seasonal', impact: seasonalSignal.phase?.startsWith('disabled') ? 0 : Math.abs(seasonalSignal.multiplier - 1) },
  ].sort((a, b) => b.impact - a.impact);
  const primaryDriver = signals[0].name;

  return {
    rawMultiplier: parseFloat(rawMultiplier.toFixed(4)),
    finalMultiplier: parseFloat(finalMultiplier.toFixed(4)),
    recommendedPrice,
    adjustmentPercent: parseFloat(((recommendedPrice - currentPrice) / currentPrice * 100).toFixed(2)),
    confidenceScore,
    confidenceLevel,
    shouldApply,
    constraintApplied,
    primaryDriver,
  };
}

module.exports = { runPricingEngine, computeDemandSignal, computeInventorySignal, computeCompetitorSignal, computeSeasonalSignal, composePriceRecommendation };
```

## 7.2 Utility Functions

```javascript
// src/utils/pricingUtils.js

function charmPrice(price) {
  // Round to nearest 50, then subtract 1 → ₹849, ₹899, ₹949, ₹999
  const rounded = Math.round(price / 50) * 50;
  return rounded - 1;
}

function getDayOfYear(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86_400_000);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

module.exports = { charmPrice, getDayOfYear, clamp };
```

```javascript
// src/utils/apiResponse.js

function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

module.exports = { sendSuccess, sendError };
```

```javascript
// src/middleware/asyncHandler.js

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
```

---

# PART 8 — DEMAND ENGINE

## 8.1 EMA (Exponential Moving Average)

**Formula:** `new_EMA = α × today's_value + (1 - α) × previous_EMA` where α = 0.3

**Example:**
```
Day 1: 10 units → EMA = 10.0
Day 2: 20 units → EMA = 0.3 × 20 + 0.7 × 10 = 13.0
Day 3:  5 units → EMA = 0.3 × 5  + 0.7 × 13 = 10.6
Day 4: 25 units → EMA = 0.3 × 25 + 0.7 × 10.6 = 14.92
```

**Why EMA instead of simple average?** Recent days matter more. A spike 3 weeks ago should not distort today's pricing decision.

## 8.2 Demand Attribution Service

```javascript
// src/services/demandAttribution.js

const SalesEvent = require('../models/salesEvent');

async function computeAttributedDemand(productId, referenceDate = new Date()) {
  const sixHoursAgo = new Date(referenceDate - 6 * 3600 * 1000);
  const sevenDaysAgo = new Date(referenceDate - 7 * 24 * 3600 * 1000);

  // SHORT TERM (6h window) — all sales
  const shortTermSales = await SalesEvent.find({
    productId, isCancelled: false,
    soldAt: { $gte: sixHoursAgo, $lte: referenceDate }
  });

  const shortTermOrganic = shortTermSales.filter(s => !s.eventId);
  const shortTermPromo   = shortTermSales.filter(s => !!s.eventId);

  const shortTermOrganicRate = shortTermOrganic.reduce((sum, s) => sum + s.quantity, 0) / 6;
  const shortTermPromoRate   = shortTermPromo.reduce((sum, s) => sum + s.quantity, 0) / 6;
  const shortTermTotalRate   = shortTermOrganicRate + shortTermPromoRate;

  // LONG TERM (7d baseline) — ORGANIC ONLY
  const longTermSales = await SalesEvent.find({
    productId, isCancelled: false,
    eventId: null,  // ORGANIC ONLY for baseline
    soldAt: { $gte: sevenDaysAgo, $lte: referenceDate }
  });

  const longTermOrganicTotal = longTermSales.reduce((sum, s) => sum + s.quantity, 0);
  const longTermOrganicRate  = longTermOrganicTotal / (7 * 24);

  // VELOCITY RATIO (organic-only) — this is the KEY decision
  const organicVelocityRatio = longTermOrganicRate > 0
    ? shortTermOrganicRate / longTermOrganicRate
    : (shortTermOrganicRate > 0 ? 2.0 : 1.0);

  return {
    shortTermRate: shortTermOrganicRate,
    longTermRate: longTermOrganicRate,
    velocityRatio: organicVelocityRatio,
    totalShortTermRate: shortTermTotalRate,
    organicShortTermRate: shortTermOrganicRate,
    promoShortTermRate: shortTermPromoRate,
    organicPercentage: shortTermTotalRate > 0 ? (shortTermOrganicRate / shortTermTotalRate * 100) : 100,
    promoPercentage: shortTermTotalRate > 0 ? (shortTermPromoRate / shortTermTotalRate * 100) : 0,
    totalSalesCount: shortTermSales.length + longTermSales.length,
    isEventActive: shortTermPromo.length > 0,
  };
}

module.exports = { computeAttributedDemand };
```

**Why organic-only velocity?** During a "Weekend Sale 10% off", sales spike from 10/hour to 50/hour. Without attribution, the engine sees `velocityRatio = 5.0` → "SURGE" → recommends PRICE INCREASE. But the demand is artificial — it will vanish when the sale ends. Using organic-only demand prevents this feedback loop.

## 8.3 EMA Service

```javascript
// src/services/emaService.js

const SalesEvent = require('../models/salesEvent');
const Inventory = require('../models/inventory');

async function updateEMAForProduct(productId, alpha = 0.3) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  // Fetch ORGANIC-ONLY sales for EMA baseline
  const sales = await SalesEvent.find({
    productId,
    isCancelled: false,
    eventId: null,  // organic only
    soldAt: { $gte: thirtyDaysAgo }
  }).sort({ soldAt: 1 });

  if (sales.length === 0) return;

  // Group by day
  const dailyTotals = {};
  sales.forEach(sale => {
    const day = sale.soldAt.toISOString().slice(0, 10);
    dailyTotals[day] = (dailyTotals[day] || 0) + sale.quantity;
  });

  // Compute EMA
  const days = Object.keys(dailyTotals).sort();
  let ema = dailyTotals[days[0]];
  for (let i = 1; i < days.length; i++) {
    ema = alpha * dailyTotals[days[i]] + (1 - alpha) * ema;
  }

  // Compute coverage
  const inventory = await Inventory.findOne({ productId });
  const coverageDays = ema > 0 ? inventory.availableQuantity / ema : null;

  let inventoryStatus = 'unknown';
  if (coverageDays === 0) inventoryStatus = 'critical';
  else if (coverageDays < 3) inventoryStatus = 'critical';
  else if (coverageDays < 7) inventoryStatus = 'low';
  else if (coverageDays < 15) inventoryStatus = 'normal';
  else inventoryStatus = 'high';

  // Update inventory record
  await Inventory.findOneAndUpdate({ productId }, {
    emaDailySales: parseFloat(ema.toFixed(2)),
    emaSalesUpdatedAt: new Date(),
    coverageDays: coverageDays ? parseFloat(coverageDays.toFixed(1)) : null,
    inventoryStatus,
  });
}

module.exports = { updateEMAForProduct };
```

---

# PART 9 — INVENTORY ENGINE

## Formulas

```
Coverage Days = availableQuantity / emaDailySales
  Example: 45 units / 6.9 units per day = 6.5 days of stock remaining

Inventory Status:
  coverageDays = 0        → ZERO     (multiplier: 1.20)
  coverageDays < 3        → CRITICAL (multiplier: 1.15)
  coverageDays < 7        → LOW      (multiplier: 1.06)
  coverageDays < 15       → NORMAL   (multiplier: 1.00)
  coverageDays >= 15      → HIGH     (multiplier: 0.92)
```

**Why coverage days instead of raw quantity?** 45 units for a product selling 7/day = 6.5 days (LOW). 45 units for a product selling 1/day = 45 days (HIGH). The same quantity means completely different things depending on sell-through rate.

---

# PART 10 — COMPETITOR ENGINE

## Staleness Weighting

```
stalenessWeight = 1 - (ageInHours / 72)
  0h old → weight = 1.0 (fully fresh)
  36h old → weight = 0.5
  72h+ → excluded entirely
```

## IQR Outlier Rejection

```
1. Sort all non-stale competitor prices
2. Q1 = price at 25th percentile
3. Q3 = price at 75th percentile
4. IQR = Q3 - Q1
5. Reject any price outside [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
6. Compute median from remaining inliers
```

## Gap Analysis

```
gapPercent = ((medianCompetitorPrice - ourPrice) / ourPrice) × 100

Interpretation:
  gapPercent > 5%   → COMPETITORS_EXPENSIVE (our price is below market)
  gapPercent > 1%   → SLIGHTLY_EXPENSIVE
  |gapPercent| < 1% → NEAR_PARITY
  gapPercent < -1%  → SLIGHTLY_CHEAPER
  gapPercent < -5%  → COMPETITORS_CHEAPER (we're overpriced)

Multiplier:
  rawInfluence = gapPercent × 0.4
  clampedInfluence = clamp(rawInfluence, -8, +8)  ← max ±8% influence
  multiplier = 1.0 + clampedInfluence / 100
```

**Why is competitor a signal and NOT a rule?** If demand is surging and inventory is critically low, reducing price because a competitor is slightly cheaper would be a terrible business decision. So competitor is bounded to ±8% influence maximum, while demand and inventory can move price by ±15%.

---

# PART 11 — SEASONAL ENGINE

## Sigmoid Ramp

Instead of a binary on/off flag, we use a sigmoid function for smooth seasonal transitions:

```
sigmoid(x) = 1 / (1 + e^(-10 × (x - 0.5)))

During ramp-up (startDate → peakDate):
  progress = (currentDay - startDay) / (peakDay - startDay)
  intensity = sigmoid(progress)
  multiplier = 1.0 + maxBoost × intensity

During ramp-down (peakDate → endDate):
  progress = (currentDay - peakDay) / (endDay - peakDay)
  intensity = 1 - sigmoid(progress)
  multiplier = 1.0 + maxBoost × intensity
```

**Example:** maxBoost = 0.12 (12%), product in monsoon season:
```
June 1 (start) → intensity ≈ 0.01 → multiplier = 1.001 (almost no effect)
June 15         → intensity ≈ 0.50 → multiplier = 1.06  (half boost)
July 1 (peak)   → intensity ≈ 0.99 → multiplier = 1.12  (full boost)
July 15          → intensity ≈ 0.50 → multiplier = 1.06  (tapering)
Aug 1 (end)     → intensity ≈ 0.01 → multiplier = 1.001 (almost no effect)
```

## 3-Tier Cascade Toggle

```
EVALUATION ORDER (short-circuit):

1. Is Global seasonal toggle OFF?        → multiplier = 1.0 (SKIP)
      ↓ (if ON)
2. Is this product's category disabled?   → multiplier = 1.0 (SKIP)
      ↓ (if not disabled)
3. Is this product's season = 'none'?     → multiplier = 1.0 (SKIP)
      ↓ (if season configured)
4. Compute seasonal signal normally       → multiplier = 1.0 + boost
```

**Why 3-tier cascade?**

| Approach | Use Case |
|----------|----------|
| **Global toggle** | Emergency off — "all seasonal pricing is wrong, kill it" |
| **Category override** | "Electronics are seasonal in monsoon, Food is not" |
| **Product-level** | Already exists — `product.seasonalConfig.season = 'none'` |

This is the same pattern used in AWS IAM policy evaluation and feature flag systems. In an interview, you can say: *"We implemented a cascading configuration hierarchy for seasonal pricing control."*

---

# PART 12 — PROMOTIONAL EVENTS MODULE

## Event Overlay Pipeline

```
PRICING PIPELINE:

  Current Price ₹1,000
       ↓
  Pricing Engine → Recommended Price ₹1,100 (+10%)
       ↓
  Is there an active event for this product?
       │
      YES → Apply event discount
       │    10% off ₹1,100 = ₹990
       │    Check profitability floor (costPrice × 1.15 = ₹690)
       │    ₹990 >= ₹690 ✓
       │    Final Customer Price = ₹990
       │
      NO → Final Customer Price = ₹1,100
```

**Why discount on the recommendation (not current price)?**

If demand is surging and inventory is low, the engine recommends ₹1,100. If we discount from ₹1,100, the customer gets ₹990 — which is still near the original ₹1,000. Revenue is protected. If we discounted from ₹1,000, the customer gets ₹900 — a much steeper cut that ignores market conditions. Amazon and Flipkart both compute the optimal price first, then apply promotions as a separate layer.

## Event Priority Rules

```
RULE 1: Only ONE event applies to a product at a time (no stacking)
RULE 2: If multiple events match, highest priority (lowest number) wins
RULE 3: Product-specific events override category-wide events at same priority
```

## Event Service

```javascript
// src/services/eventService.js

const PromotionalEvent = require('../models/promotionalEvent');
const Settings = require('../models/settings');

async function findActiveEventForProduct(product, referenceDate = new Date()) {
  const eventsEnabled = await Settings.findOne({ key: 'eventsEnabled' });
  if (!eventsEnabled || eventsEnabled.value === false) return null;

  const activeEvents = await PromotionalEvent.find({
    status: 'ACTIVE',
    startDate: { $lte: referenceDate },
    endDate:   { $gte: referenceDate },
  }).sort({ priority: 1 }); // lower number = higher priority

  for (const event of activeEvents) {
    if (doesEventMatchProduct(event, product)) return event;
  }
  return null;
}

function doesEventMatchProduct(event, product) {
  switch (event.targetType) {
    case 'all_products':        return true;
    case 'specific_products':   return event.targetProducts.some(id => id.toString() === product._id.toString());
    case 'specific_categories': return event.targetCategories.includes(product.category);
    default:                    return false;
  }
}

function applyEventDiscount(event, recommendedPrice, product) {
  let discountedPrice;
  switch (event.discountType) {
    case 'percentage':   discountedPrice = recommendedPrice * (1 - event.discountValue / 100); break;
    case 'flat_amount':  discountedPrice = recommendedPrice - event.discountValue; break;
    case 'fixed_price':  discountedPrice = event.discountValue; break;
    default:             discountedPrice = recommendedPrice;
  }

  // Apply profitability floor
  let constraintApplied = 'NONE';
  if (event.respectProfitFloor !== false) {
    const profitFloor = product.costPrice * (1 + (product.targetMargin || 0.15));
    if (discountedPrice < profitFloor) {
      discountedPrice = profitFloor;
      constraintApplied = 'PROFIT_FLOOR';
    }
  }

  return {
    eventApplied: true,
    eventId: event._id,
    eventName: event.eventName,
    discountType: event.discountType,
    discountValue: event.discountValue,
    priceBeforeDiscount: recommendedPrice,
    priceAfterDiscount: Math.round(discountedPrice),
    finalCustomerPrice: Math.round(discountedPrice),
    constraintApplied,
  };
}

module.exports = { findActiveEventForProduct, applyEventDiscount, doesEventMatchProduct };
```

---

# PART 13 — RECALCULATION ENGINE

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                 SCHEDULER (node-cron)                  │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Every N minutes (configurable: 15/30/60):      │   │
│  │   1. Fetch all active, mode='auto' products    │   │
│  │   2. For each product: runPricingEngine()      │   │
│  │   3. If confidence >= threshold: auto-apply    │   │
│  │   4. Log results                               │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  ┌────────────────────────────────────────────────┐   │
│  │ Every hour:                                     │   │
│  │   1. Update EMA for all products               │   │
│  │   2. Update inventory coverage days             │   │
│  │   3. Expire past events (ACTIVE → EXPIRED)     │   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  Manual Trigger:                                       │
│  POST /api/v1/pricing/recalculate-all                 │
│  → Same as scheduled run, but on-demand               │
└───────────────────────────────────────────────────────┘
```

## Implementation

```javascript
// src/services/scheduler.js

const cron = require('node-cron');
const Product = require('../models/product');
const Settings = require('../models/settings');
const { runPricingEngine } = require('./pricingEngine');
const { updateEMAForProduct } = require('./emaService');

let pricingTask = null;
let emaTask = null;

async function startScheduler() {
  const settings = await Settings.findOne({ key: 'schedulerIntervalMinutes' });
  const interval = settings?.value || 30;

  // Pricing recalculation
  pricingTask = cron.schedule(`*/${interval} * * * *`, async () => {
    console.log(`[Scheduler] Running batch recalculation at ${new Date().toISOString()}`);
    const products = await Product.find({ isActive: true, 'pricingStrategy.mode': 'auto' });

    let applied = 0, skipped = 0, failed = 0;
    for (const product of products) {
      try {
        const result = await runPricingEngine(product._id, new Date(), 'scheduler');
        if (result.outcome?.shouldApply && result.outcome?.confidenceScore >= 0.80) {
          // Auto-apply high-confidence recommendations
          await Product.findByIdAndUpdate(product._id, {
            currentPrice: result.eventOverlay?.eventApplied
              ? result.eventOverlay.priceAfterDiscount
              : result.outcome.recommendedPrice
          });
          applied++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`[Scheduler] Failed for ${product._id}:`, err.message);
        failed++;
      }
    }
    console.log(`[Scheduler] Done: ${applied} applied, ${skipped} skipped, ${failed} failed`);
  });

  // EMA update (hourly)
  emaTask = cron.schedule('0 * * * *', async () => {
    console.log(`[EMA] Updating EMA for all products`);
    const products = await Product.find({ isActive: true });
    for (const product of products) {
      try {
        await updateEMAForProduct(product._id);
      } catch (err) {
        console.error(`[EMA] Failed for ${product._id}:`, err.message);
      }
    }
  });

  console.log(`[Scheduler] Started — pricing every ${interval}min, EMA every 1h`);
}

function stopScheduler() {
  if (pricingTask) { pricingTask.stop(); pricingTask = null; }
  if (emaTask) { emaTask.stop(); emaTask = null; }
}

module.exports = { startScheduler, stopScheduler };
```

## AI Service (Gemini)

```javascript
// src/services/aiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

async function generateExplanation({ product, recommendation, demandSignal, inventorySignal, competitorSignal, seasonalSignal }) {
  const prompt = `
You are a pricing analyst for an Indian e-commerce platform.
Explain this pricing recommendation in 2-3 clear sentences for a business manager.

Product: ${product.productName} (${product.category}, ${product.tier} tier)
Current Price: ₹${product.currentPrice}
Recommended Price: ₹${recommendation.recommendedPrice}
Change: ${recommendation.adjustmentPercent}%

Demand: ${demandSignal.interpretation} (velocity ${demandSignal.velocityRatio?.toFixed(2)}× baseline)
Inventory: ${inventorySignal.interpretation} (${inventorySignal.coverageDays} days coverage)
Competitor: ${competitorSignal.interpretation} (median: ₹${competitorSignal.medianPrice ?? 'N/A'})
Seasonal: ${seasonalSignal.phase} (${product.seasonalConfig?.season ?? 'none'})
Confidence: ${recommendation.confidenceLevel} (${recommendation.confidenceScore})

Rules: Plain English, no jargon, mention 1-2 most important signals, currency in ₹, max 3 sentences.
  `.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return { text, model: 'gemini-2.0-flash', failed: false, generatedAt: new Date() };
}

module.exports = { generateExplanation };
```

---

# PART 14 — DASHBOARD & FRONTEND SCREENS

## Screen 1: Dashboard (`/`)

**KPI Cards (top row):**
- Total Products | Critical Stock | Pending Recommendations | Avg Confidence | Active Events

**Sections:**
- Inventory coverage table (sorted by coverage days, red highlighting for critical)
- Recent recommendations list (last 5 with status badges)
- Active events widget (countdown timers)
- Demand attribution mini-chart (organic vs promotional pie)

**API:** `GET /api/v1/dashboard/stats`

---

## Screen 2: Products (`/products`)

**Features:**
- Product table (SKU, Name, Category, Cost, Current Price, Tier, Status, Actions)
- Create/Edit modal with all fields
- Product tier badge (budget=green, mid=blue, premium=purple)
- Filters: category dropdown, tier filter, search by name
- Delete with confirmation dialog

**API Calls:** Product CRUD endpoints

---

## Screen 3: Inventory (`/inventory`)

**Features:**
- Inventory table with coverage meter per row
- Coverage meter visual: red(CRITICAL) → orange(LOW) → green(NORMAL) → blue(HIGH)
- Stock update modal
- Sale record modal (records demand data)
- Filter by status

**Coverage meter example:**
```
[████░░░░░░░░░░░░░░░░]  2.1 days — CRITICAL (red)
[████████████░░░░░░░░]  6.5 days — LOW      (orange)
[████████████████████]  12  days — NORMAL    (green)
[████████████████████]  25+ days — HIGH      (blue)
```

**API Calls:** Inventory + Sales endpoints

---

## Screen 4: Competitors (`/competitors`)

**Features:**
- Product selector dropdown
- Competitor table (Name, Price, Gap%, Freshness indicator, Outlier flag)
- Gap analysis card
- Add/edit competitor modal
- Staleness indicator (color fades as data ages)

**Gap analysis card:**
```
Our Price:         ₹799
Median Competitor: ₹749
Gap:               -6.3% ↓
Signal:            Mild downward pressure
Competitors:       3 fresh / 1 stale / 0 outliers
```

---

## Screen 5: Pricing Engine (`/pricing`) — THE STAR SCREEN

**Layout:** Split — Left: Input | Right: Results

**Features:**
- Product selector + Calculate button
- **RecommendationCard** — hero component showing full result
- **SignalBreakdown** — waterfall chart (recharts BarChart)
- **ConfidencePanel** — score + level badge + what-would-change-this
- **AIExplanationBox** — Gemini explanation with fade-in animation
- **EventOverlayCard** — active event discount display (if applicable)
- Apply / Reject / Apply Without Discount buttons
- Pricing history table

**Waterfall visualization:**
```
Current Price: ₹1,000
│
├── Demand Signal:     × 1.08  → +₹80   [green bar up]
├── Inventory Signal:  × 1.06  → +₹64   [orange bar up]
├── Competitor Signal: × 0.99  → -₹11   [red bar down]
├── Seasonal Signal:   × 1.04  → +₹44   [blue bar up]
│
├── Stability Clamp:   max +15%  → ₹1,099
├── Event Overlay:     -10%      → ₹989
└── Final Price:       ₹989     [final bar]
```

**Confidence badge:**
```
HIGH   [████████▓░]  0.82   → Green badge
MEDIUM [█████░░░░░]  0.57   → Yellow badge
LOW    [██░░░░░░░░]  0.31   → Red badge
```

---

## Screen 6: Analytics (`/analytics`)

**Features:**
- Product selector
- Price history line chart (recharts)
- Demand trend line chart
- Demand attribution chart (organic vs promotional stacked bar)
- Event performance selector and metrics card
- Toggle: "All Demand" vs "Organic Only"

---

## Screen 7: Events (`/events`)

**Layout:** 3-tab layout: Active | Upcoming | Past

**Features:**
- Event table with status badges (DRAFT=grey, SCHEDULED=blue, ACTIVE=green, EXPIRED=red)
- Create/edit modal with all fields
- Activate / Deactivate buttons
- Event calendar (month view with event date ranges)
- Event performance metrics for past events

---

## Screen 8: Settings (`/settings`)

**Layout:** Card-based settings groups

**Groups:**
- **Seasonal Pricing:** Global toggle (ON/OFF) + category exclusion chips
- **Events System:** Global toggle + max discount slider
- **Scheduler:** Enable/disable + interval setting + auto-apply threshold
- **Display:** "Seasonal pricing is ON for all categories except: Food, Books"

---

# PART 15 — TEAM ALLOCATION

## Member 1 — Backend: Pricing Engine + AI + Scheduler + Seasonal + Events Integration

**Role:** The intelligence core. Owns all business logic.

**Files Owned:**
```
backend/src/services/pricingEngine.js         ← Primary ownership
backend/src/services/aiService.js             ← Primary ownership
backend/src/services/emaService.js            ← Primary ownership
backend/src/services/demandAttribution.js     ← Primary ownership
backend/src/services/eventService.js          ← Primary ownership
backend/src/services/scheduler.js             ← Primary ownership
backend/src/utils/pricingUtils.js             ← Primary ownership
backend/src/controllers/pricingController.js  ← Primary ownership
backend/src/routes/pricingRoutes.js           ← Primary ownership
backend/src/models/pricingRecommendation.js   ← Primary ownership
```

**APIs Owned:**
- `POST /pricing/calculate`
- `PATCH /pricing/:id/apply`
- `PATCH /pricing/:id/reject`
- `GET /pricing/recommendations`
- `POST /pricing/recalculate-all`

**Integration Points:**
- Consumes: Product, Inventory, CompetitorPrice, SalesEvent models (built by M2)
- Produces: PricingRecommendation records
- Exposes: `runPricingEngine()` used by scheduler and pricing controller

---

## Member 2 — Backend: Data Layer + All CRUD APIs + Events CRUD

**Role:** The data foundation. Everything depends on this work.

**Files Owned:**
```
backend/src/models/product.js                 ← Rebuild
backend/src/models/inventory.js               ← Rebuild
backend/src/models/competitorPrice.js         ← Rebuild
backend/src/models/salesEvent.js              ← New
backend/src/models/promotionalEvent.js        ← New
backend/src/models/eventAnalytics.js          ← New
backend/src/models/settings.js                ← New
backend/src/controllers/productController.js  ← Implement
backend/src/controllers/inventoryController.js← Implement
backend/src/controllers/competitorController.js← Implement
backend/src/controllers/salesController.js    ← New
backend/src/controllers/eventController.js    ← New
backend/src/controllers/settingsController.js ← New
backend/src/controllers/dashboardController.js← New
backend/src/controllers/analyticsController.js← New
backend/src/routes/* (all route files)        ← Create/update
backend/src/middleware/errorHandler.js        ← Enhance
backend/src/middleware/asyncHandler.js        ← New
backend/src/utils/apiResponse.js             ← New
backend/src/config/seed.js                   ← New
backend/server.js                            ← Update routes
backend/.env                                 ← Fix
```

**APIs Owned:** All CRUD (Products, Inventory, Competitors, Sales, Events, Settings, Dashboard, Analytics)

---

## Member 3 — Frontend: Dashboard + Products + Inventory + Settings + Layout

**Role:** Core data management UI and application shell.

**Files Owned:**
```
frontend/src/index.css                        ← Tailwind setup
frontend/vite.config.js                       ← Tailwind plugin
frontend/src/App.jsx                          ← Add all routes
frontend/src/api/axiosInstance.js              ← Base config
frontend/src/api/productApi.js
frontend/src/api/inventoryApi.js
frontend/src/api/salesApi.js
frontend/src/api/dashboardApi.js
frontend/src/api/settingsApi.js
frontend/src/hooks/useProducts.js
frontend/src/hooks/useInventory.js
frontend/src/hooks/useDashboard.js
frontend/src/hooks/useSettings.js
frontend/src/components/layout/Layout.jsx
frontend/src/components/layout/Sidebar.jsx
frontend/src/components/common/LoadingSpinner.jsx
frontend/src/components/common/ErrorAlert.jsx
frontend/src/components/common/StatCard.jsx
frontend/src/components/common/Modal.jsx
frontend/src/components/products/ProductTable.jsx
frontend/src/components/products/ProductForm.jsx
frontend/src/components/products/ProductTierBadge.jsx
frontend/src/components/inventory/InventoryTable.jsx
frontend/src/components/inventory/CoverageMeter.jsx
frontend/src/components/inventory/StockUpdateModal.jsx
frontend/src/components/inventory/SaleRecordModal.jsx
frontend/src/components/settings/SeasonalToggle.jsx
frontend/src/components/settings/SettingsPanel.jsx
frontend/src/pages/DashboardPage.jsx
frontend/src/pages/ProductsPage.jsx
frontend/src/pages/InventoryPage.jsx
frontend/src/pages/SettingsPage.jsx
```

---

## Member 4 — Frontend: Pricing UI + Competitors + Events + Analytics

**Role:** The showcase UI. This is what the demo presents first.

**Files Owned:**
```
frontend/src/api/competitorApi.js
frontend/src/api/pricingApi.js
frontend/src/api/eventApi.js
frontend/src/hooks/usePricing.js
frontend/src/hooks/useEvents.js
frontend/src/components/competitor/CompetitorTable.jsx
frontend/src/components/competitor/CompetitorForm.jsx
frontend/src/components/competitor/GapAnalysisCard.jsx
frontend/src/components/pricing/PricingForm.jsx
frontend/src/components/pricing/RecommendationCard.jsx   ← HERO component
frontend/src/components/pricing/SignalBreakdown.jsx       ← Waterfall chart
frontend/src/components/pricing/ConfidencePanel.jsx
frontend/src/components/pricing/AIExplanationBox.jsx
frontend/src/components/pricing/EventOverlayCard.jsx
frontend/src/components/common/ConfidenceBadge.jsx
frontend/src/components/common/SignalCard.jsx
frontend/src/components/events/EventTable.jsx
frontend/src/components/events/EventForm.jsx
frontend/src/components/events/EventStatusBadge.jsx
frontend/src/components/events/EventCalendar.jsx
frontend/src/components/events/EventCard.jsx
frontend/src/components/analytics/PriceHistoryChart.jsx
frontend/src/components/analytics/DemandTrendChart.jsx
frontend/src/components/analytics/DemandAttributionChart.jsx
frontend/src/components/analytics/EventPerformanceCard.jsx
frontend/src/pages/CompetitorPage.jsx
frontend/src/pages/PricingPage.jsx
frontend/src/pages/AnalyticsPage.jsx
frontend/src/pages/EventsPage.jsx
```

---

# PART 16 — GIT WORKFLOW

## Branch Strategy

```
main              ← production only — merge on Day 6 only
  └── develop     ← integration branch — PRs merge here daily
        ├── feat/m1-pricing-engine
        ├── feat/m1-ai-service
        ├── feat/m1-scheduler
        ├── feat/m1-event-integration
        ├── feat/m2-models
        ├── feat/m2-product-api
        ├── feat/m2-inventory-api
        ├── feat/m2-event-api
        ├── feat/m2-settings-api
        ├── feat/m3-tailwind-layout
        ├── feat/m3-products-page
        ├── feat/m3-inventory-page
        ├── feat/m3-settings-page
        ├── feat/m4-pricing-page
        ├── feat/m4-competitor-page
        ├── feat/m4-events-page
        └── feat/m4-analytics-page
```

## Daily Git Discipline (Non-Negotiable)

```bash
# START OF EACH DAY (every member)
git checkout develop
git pull origin develop
git checkout feat/your-branch
git merge develop

# COMMIT EVERY 2 HOURS (minimum)
git add .
git commit -m "feat: implement computeDemandSignal with EMA"

# END OF EACH DAY (every member)
git push origin feat/your-branch
# Create PR: feat/xxx → develop
```

## Commit Convention

```
feat:     new feature
fix:      bug fix
refactor: restructure (no behavior change)
style:    formatting, UI tweaks
docs:     README, comments
chore:    package installs, config
```

## PR Rules

1. Every PR targets `develop` (never `main`)
2. PR must have description: "What was built? How to test?"
3. At least 1 team member reviews before merge
4. No broken imports or unresolved conflicts
5. `main` gets one final merge from `develop` on Day 6

---

# PART 17 — DEVELOPMENT ROADMAP

> ✅ = must complete | ⚠️ = blocks others | 🎯 = target

---

## Day 1 — June 20: Foundation + Models + Setup

### Member 1 (Pricing Engine Lead)
- [ ] ⚠️ Install: `cd backend && npm install @google/generative-ai node-cron`
- [ ] Read and fully understand the pricing algorithm from Part 7
- [ ] Write `src/utils/pricingUtils.js` — `charmPrice()`, `getDayOfYear()`, `clamp()`
- [ ] Write `src/utils/apiResponse.js` — `sendSuccess()`, `sendError()`
- [ ] Write `src/middleware/asyncHandler.js`
- [ ] Start `src/services/emaService.js` — `updateEMAForProduct()` skeleton
- [ ] **EOD:** Utils + middleware complete. EMA skeleton started.

### Member 2 (Data Layer Lead)
- [ ] ⚠️ Fix `.env`: add `PORT=5000`, `GEMINI_API_KEY=your_key`, fix MONGO_URL password
- [ ] ⚠️ Rebuild `product.js` — full schema from Part 5
- [ ] ⚠️ Rebuild `inventory.js` — full schema from Part 5
- [ ] ⚠️ Rebuild `competitorPrice.js` — full schema from Part 5
- [ ] ⚠️ Create `salesEvent.js` — new schema from Part 5
- [ ] ⚠️ Create `promotionalEvent.js` — new schema from Part 5
- [ ] Create `eventAnalytics.js` — new schema from Part 5
- [ ] Create `settings.js` — new schema from Part 5
- [ ] Rebuild `pricingRecommendation.js` (was pricingHistory.js) — full PDR from Part 5
- [ ] Enhance `errorHandler.js`
- [ ] **EOD:** All 8 models complete. Server starts with new schemas.

### Member 3 (Frontend Core)
- [ ] ⚠️ Remove MUI: `npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled`
- [ ] ⚠️ Install Tailwind: `npm install -D tailwindcss @tailwindcss/vite`
- [ ] Install: `npm install recharts react-icons lucide-react`
- [ ] Configure `vite.config.js` with Tailwind plugin
- [ ] Set up `src/index.css` with Tailwind directives and dark theme custom CSS
- [ ] Create `src/api/axiosInstance.js` — baseURL from `import.meta.env.VITE_API_URL`
- [ ] Create `src/components/common/LoadingSpinner.jsx`
- [ ] Create `src/components/common/ErrorAlert.jsx`
- [ ] Create `src/components/common/StatCard.jsx`
- [ ] Create `src/components/common/Modal.jsx` — reusable modal
- [ ] Build `src/components/layout/Sidebar.jsx` — 8 navigation items
- [ ] Wire `src/components/layout/Layout.jsx` with Sidebar + `<Outlet />`
- [ ] Update `App.jsx` — add all 8 routes
- [ ] **EOD:** Frontend renders with dark theme, sidebar, 8 empty pages.

### Member 4 (Pricing + Events UI)
- [ ] Study API response format for `POST /pricing/calculate` from Part 6
- [ ] Study event schema and lifecycle from Part 12
- [ ] Design `RecommendationCard` component structure on paper
- [ ] Create `src/api/pricingApi.js` — `calculatePrice()`, `getHistory()`, `applyDecision()`
- [ ] Create `src/api/competitorApi.js`
- [ ] Create `src/api/eventApi.js`
- [ ] Create `src/components/common/ConfidenceBadge.jsx`
- [ ] Create `src/components/common/SignalCard.jsx`
- [ ] Create `src/components/events/EventStatusBadge.jsx`
- [ ] **EOD:** API files ready. Common components render visually.

**🔗 Day 1 Integration Checkpoint (EOD):**
- Server starts with 8 new models ✓
- Frontend renders with dark Tailwind theme and sidebar ✓
- No cross-team dependencies yet — everyone works independently

---

## Day 2 — June 21: Core CRUD + Demand Service + Event CRUD

### Member 1
- [ ] Complete `emaService.js` — `updateEMAForProduct()` fully working
- [ ] Write `src/services/demandAttribution.js` — `computeAttributedDemand()` full implementation
- [ ] Start `pricingEngine.js`: `computeDemandSignal()` + `computeInventorySignal()`
- [ ] Test demand signal with console.log: various velocity ratios
- [ ] **EOD:** Demand + inventory signals compute correctly.

### Member 2
- [ ] ⚠️ Implement `productController.js` — all 5 CRUD operations
- [ ] ⚠️ Implement `inventoryController.js` — CRUD + populate productId
- [ ] Implement `competitorController.js` — CRUD + staleness score on GET
- [ ] Create `salesController.js` — `recordSale()` with auto eventId detection, `getProductSales()`, `getVelocity()`
- [ ] Create `eventController.js` — CRUD + activate/deactivate lifecycle
- [ ] Create `settingsController.js` — get/update settings + seasonal shortcuts
- [ ] Create all new route files and wire into `server.js`
- [ ] Test all APIs in Postman
- [ ] **EOD:** Product + Inventory + Competitor + Sales + Events + Settings CRUD all work in Postman.

### Member 3
- [ ] Create `src/api/productApi.js` — all 5 product API calls
- [ ] Create `src/api/inventoryApi.js`
- [ ] Create `src/api/salesApi.js`
- [ ] Create `src/hooks/useProducts.js`
- [ ] Create `src/hooks/useInventory.js`
- [ ] Build `ProductTable.jsx` — table with sortable columns
- [ ] Build `ProductTierBadge.jsx`
- [ ] Start `ProductForm.jsx` — modal with all fields
- [ ] **EOD:** Product list renders from real API.

### Member 4
- [ ] Build `CompetitorTable.jsx`
- [ ] Build `CompetitorForm.jsx` — add/edit modal
- [ ] Build `GapAnalysisCard.jsx` (static data first)
- [ ] Build skeleton `PricingForm.jsx` (product selector + calculate button)
- [ ] Build `EventTable.jsx` with status badges
- [ ] Start `EventForm.jsx` — modal skeleton
- [ ] **EOD:** Competitor table renders. Event table renders.

**🔗 Day 2 Integration Checkpoint:**
- All CRUD APIs working in Postman ✓
- Product list shows real data from MongoDB ✓

---

## Day 3 — June 22: Pricing Engine + Frontend Integration Round 1

### Member 1
- [ ] Complete `pricingEngine.js`:
  - [ ] `computeCompetitorSignal()` with IQR filtering
  - [ ] `computeSeasonalSignal()` with sigmoid ramp + 3-tier cascade
  - [ ] `composePriceRecommendation()` — multiplicative composition
  - [ ] `runPricingEngine()` orchestrator (no AI yet)
- [ ] Write `eventService.js` — `findActiveEventForProduct()`, `applyEventDiscount()`
- [ ] Integrate event overlay into `runPricingEngine()` Step 5.5
- [ ] Implement `pricingController.js`:
  - [ ] `calculatePrice()` calls `runPricingEngine()`
  - [ ] `applyRecommendation()` — APPLIED + update currentPrice
  - [ ] `rejectRecommendation()`
  - [ ] `getRecommendations()` — paginated
- [ ] Test `POST /pricing/calculate` in Postman
- [ ] **EOD:** Full pricing cycle works in Postman.

### Member 2
- [ ] Implement `dashboardController.js` — aggregate KPIs across all collections
- [ ] Implement `analyticsController.js` — `getPriceHistory()`, `getDemandTrends()`, `getDemandAttribution()`
- [ ] Create `GET /competitors/:productId/analysis` endpoint
- [ ] Create `GET /sales/:productId/velocity` endpoint
- [ ] Create seed script: `backend/src/config/seed.js` — 5 products + inventory + competitors + sales
- [ ] Run seed, verify dashboard API returns data
- [ ] **EOD:** Dashboard API works. Analytics endpoints work.

### Member 3
- [ ] Complete `ProductForm.jsx` — create + edit working end-to-end
- [ ] Complete `ProductsPage.jsx` — table + form + delete confirmation
- [ ] Build `InventoryTable.jsx` with `CoverageMeter.jsx`
- [ ] Build `StockUpdateModal.jsx` + `SaleRecordModal.jsx`
- [ ] Complete `InventoryPage.jsx`
- [ ] Create `src/api/dashboardApi.js` + `src/hooks/useDashboard.js`
- [ ] Start `DashboardPage.jsx` — wire StatCards to real API
- [ ] **EOD:** Products and Inventory pages fully functional.

### Member 4
- [ ] Wire `CompetitorPage.jsx` to real API
- [ ] Wire `GapAnalysisCard.jsx` to analysis endpoint
- [ ] Build `PricingForm.jsx` — product selector + calculate button
- [ ] Build `RecommendationCard.jsx` — display full pricing response
- [ ] Build `ConfidencePanel.jsx`
- [ ] Complete `EventForm.jsx` — all fields
- [ ] Test full pricing flow: select product → calculate → see result
- [ ] **EOD:** Pricing flow visible in UI.

**🔗 Day 3 Integration Checkpoint (CRITICAL):**
- `POST /pricing/calculate` returns full response with all signals ✓
- Products + Inventory pages work end-to-end ✓
- Pricing form triggers calculation and shows result ✓

---

## Day 4 — June 23: AI + Event Overlay + Signal Waterfall + Dashboard

### Member 1
- [ ] Integrate `aiService.js` — Gemini API with structured prompt
- [ ] Wire AI into `runPricingEngine()` — non-blocking try/catch
- [ ] Test: pricing response includes `aiExplanation.text`
- [ ] Implement `scheduler.js` — cron jobs for pricing + EMA
- [ ] Wire scheduler into `server.js` startup
- [ ] Add `POST /pricing/recalculate-all` manual trigger
- [ ] Update AI prompt to mention active events
- [ ] **EOD:** AI explanation appears. Scheduler runs.

### Member 2
- [ ] Update all GET responses to include computed fields
- [ ] Add `GET /inventory/status/critical` endpoint
- [ ] Wire analytics: `GET /analytics/demand-attribution/:productId`
- [ ] Wire analytics: `GET /analytics/event-performance/:eventId`
- [ ] Add `GET /dashboard/stats` events + seasonal sections
- [ ] Add request validation (required fields, valid ObjectIds)
- [ ] Handle all error cases: product not found, inventory not found, etc.
- [ ] Add event lifecycle scheduler: auto-expire past events
- [ ] **EOD:** All APIs return proper errors. No 500s on bad input.

### Member 3
- [ ] Complete `DashboardPage.jsx` — all StatCards + inventory table + recent recommendations
- [ ] Build active events widget for dashboard
- [ ] Add loading states (skeleton loaders) and error states to all pages
- [ ] Build `SettingsPage.jsx` — card layout with settings groups
- [ ] Build `SeasonalToggle.jsx` — global switch + category exclusion chips
- [ ] Build `SettingsPanel.jsx` — events toggle, scheduler controls
- [ ] Create `src/api/settingsApi.js` + `src/hooks/useSettings.js`
- [ ] **EOD:** Dashboard looks production-grade. Settings page works.

### Member 4
- [ ] Build `AIExplanationBox.jsx` — Gemini explanation display
- [ ] Build `SignalBreakdown.jsx` — recharts waterfall chart
- [ ] Build `EventOverlayCard.jsx` — event discount display
- [ ] Wire all components into `PricingPage.jsx`
- [ ] Add Apply/Reject buttons
- [ ] Complete `EventsPage.jsx` — 3-tab layout (Active/Upcoming/Past)
- [ ] Build `EventCalendar.jsx` — month view
- [ ] Start `AnalyticsPage.jsx` — price history chart
- [ ] **EOD:** Pricing page fully functional with AI + waterfall + event overlay.

**🔗 Day 4 Integration Checkpoint:**
- AI explanation appears in pricing results ✓
- Events can be created, activated, and show in pricing overlay ✓
- Dashboard shows all KPIs from real data ✓
- Settings toggle seasonal ON/OFF and it affects pricing ✓

---

## Day 5 — June 24: Analytics + Polish + Integration Testing

### Member 1
- [ ] Write test cases for pricing engine (see Part 18)
- [ ] Test: pricing with event → discount applied correctly
- [ ] Test: seasonal disabled → multiplier = 1.0
- [ ] Test: demand during event → organic-only velocity
- [ ] Document pricing engine logic in code comments
- [ ] Help debug integration issues
- [ ] **EOD:** Pricing engine tested and documented.

### Member 2
- [ ] Fix any CORS issues
- [ ] Ensure list endpoints support: `?limit=20&status=ACTIVE`
- [ ] Add basic request logging middleware
- [ ] Write Postman collection with all 40+ endpoints
- [ ] Final data validation pass on all controllers
- [ ] **EOD:** Postman collection complete. All APIs clean.

### Member 3
- [ ] Add product search/filter on ProductsPage
- [ ] Add category filter on InventoryPage
- [ ] Add SaleRecordModal integration on InventoryPage
- [ ] UI polish: consistent spacing, hover states, transitions
- [ ] Responsive layout check (1280px+)
- [ ] **EOD:** Products, Inventory, Settings pages polished.

### Member 4
- [ ] Complete `AnalyticsPage.jsx` — price history + demand trend + attribution charts
- [ ] Build `DemandAttributionChart.jsx` — stacked bar organic vs promo
- [ ] Build `EventPerformanceCard.jsx` — event metrics display
- [ ] Complete `EventsPage.jsx` — all 3 tabs working end-to-end
- [ ] End-to-end test: add product → set inventory → add competitor → record sales → calculate price → see AI → apply → create event → recalculate with event → see overlay
- [ ] **EOD:** Full user journey works end-to-end.

**🔗 Day 5 Integration Checkpoint:**
- Complete end-to-end flow works without errors ✓
- All 8 pages render real data ✓
- Events, settings, and pricing interact correctly ✓

---

## Day 6 — June 25: Deployment + Seed Data + Pre-Demo

### Member 1
- [ ] Create comprehensive seed script with:
  - 5 realistic products (different categories, tiers)
  - 20+ sales events per product (spread over 7 days, mix organic + promotional)
  - 2-3 competitor prices per product
  - 2 sample events (1 ACTIVE, 1 EXPIRED)
- [ ] Run seed on production MongoDB Atlas
- [ ] Verify pricing engine produces interesting, varied results
- [ ] **EOD:** Production database seeded.

### Member 2
- [ ] Deploy backend to Render:
  - Start: `node server.js`
  - Env: `MONGO_URL`, `PORT`, `GEMINI_API_KEY`
- [ ] Test all Postman requests against Render URL
- [ ] Whitelist all IPs in MongoDB Atlas (or 0.0.0.0/0 for dev)
- [ ] **EOD:** Backend live on Render.

### Member 3
- [ ] Build frontend: `npm run build`
- [ ] Deploy to Vercel
- [ ] Set `VITE_API_URL` env var to Render backend URL
- [ ] Test all pages on deployed URL
- [ ] **EOD:** Frontend live on Vercel.

### Member 4
- [ ] Update CORS on backend: add Vercel URL
- [ ] Smoke test entire deployed app
- [ ] Take screenshots of all key screens
- [ ] Begin README.md with setup instructions + deployed URLs
- [ ] **EOD:** Full application live. Screenshots captured.

---

## Day 7 — June 26: Final Polish + Dry Run + Submit

| Task | Owner |
|------|-------|
| Full demo dry run (30 min — follow Part 19 script) | ALL |
| Fix any bugs found during dry run | ALL |
| Complete README.md | M4 |
| Add .env.example file | M2 |
| Remove all console.log debug statements | ALL |
| Final commit to main branch | M2 |
| Verify deployed URLs are live and responsive | ALL |
| Prepare individual talking points (Part 19.2) | ALL |

---

# PART 18 — TESTING PLAN

## Backend API Tests (Postman)

```
PRODUCT TESTS
□ POST /products — valid data → 201
□ POST /products — missing costPrice → 400
□ POST /products — duplicate SKU → 400
□ GET /products → 200 + array with inventory populated
□ PATCH /products/:id — update price → 200
□ DELETE /products/:id → isActive: false

INVENTORY TESTS
□ POST /inventory — create → 201
□ PATCH /inventory/:productId — update qty → 200
□ GET /inventory — returns coverageDays

SALES TESTS
□ POST /sales — organic sale (no event) → 201, eventId: null
□ POST /sales — during active event → 201, eventId auto-populated
□ GET /sales/:productId/velocity → velocityRatio + attribution split

COMPETITOR TESTS
□ POST /competitors → 201
□ GET /competitors/:productId/analysis — 0 competitors → confidence 0, no crash
□ GET /competitors/:productId/analysis — with outlier → outlier removed

EVENT TESTS
□ POST /events → 201, status: DRAFT
□ PATCH /events/:id/activate → SCHEDULED
□ DELETE /events/:id — ACTIVE event → 400 (cannot delete active)
□ GET /events?status=ACTIVE → only active events

SETTINGS TESTS
□ PATCH /settings/seasonal/toggle {enabled: false} → 200
□ GET /settings/seasonal → returns current state

PRICING ENGINE TESTS (Most Critical)
□ POST /pricing/calculate — high demand + low inventory → price UP
□ POST /pricing/calculate — low demand + high inventory → price DOWN
□ POST /pricing/calculate — no competitor data → runs, confidence 0
□ POST /pricing/calculate — zero inventory → ZERO interpretation
□ POST /pricing/calculate — change < 1% → MINIMUM_CHANGE constraint
□ POST /pricing/calculate — new product (no sales) → cold start handling
□ POST /pricing/calculate — seasonal product in peak → boost applied
□ POST /pricing/calculate — recommendedPrice NEVER below profitFloor
□ POST /pricing/calculate — seasonal OFF → multiplier = 1.0
□ POST /pricing/calculate — seasonal ON, category disabled → multiplier = 1.0
□ POST /pricing/calculate — event active → eventOverlay populated
□ POST /pricing/calculate — event active → finalCustomerPrice < recommendedPrice
□ POST /pricing/calculate — event pushes below floor → clamped to floor
□ POST /pricing/calculate — no event → eventOverlay.eventApplied = false
□ POST /pricing/calculate — promo demand → organic-only velocity used
□ PATCH /pricing/:id/apply → APPLIED, product.currentPrice updated
□ PATCH /pricing/:id/reject → REJECTED

DEMAND ATTRIBUTION TESTS
□ POST /sales with eventId → promotional sale
□ POST /sales without eventId → organic sale
□ GET /analytics/demand-attribution/:productId → correct split
```

## Pricing Engine Unit Tests

```javascript
// backend/test.js — run with: node test.js
const { computeDemandSignal, computeInventorySignal, composePriceRecommendation } = require('./src/services/pricingEngine');

function assert(condition, msg) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`✅ PASS: ${msg}`);
}

// Test 1: High demand + low inventory = price up
const t1 = composePriceRecommendation({
  product: { currentPrice: 799, costPrice: 400, targetMargin: 0.15, pricingStrategy: {} },
  demandSignal:     { multiplier: 1.10, confidence: 0.9, velocityRatio: 2.5, interpretation: 'HIGH' },
  inventorySignal:  { multiplier: 1.06, confidence: 1.0, coverageDays: 4, interpretation: 'LOW' },
  competitorSignal: { multiplier: 1.0,  confidence: 0.0, medianPrice: null, gapPercent: 0 },
  seasonalSignal:   { multiplier: 1.0,  phase: 'off_season', intensity: 0 },
});
assert(t1.recommendedPrice > 799, 'High demand + Low inventory → price UP');

// Test 2: Low demand + high inventory = price down
const t2 = composePriceRecommendation({
  product: { currentPrice: 799, costPrice: 400, targetMargin: 0.15, pricingStrategy: {} },
  demandSignal:     { multiplier: 0.92, confidence: 0.8, velocityRatio: 0.4, interpretation: 'LOW' },
  inventorySignal:  { multiplier: 0.92, confidence: 1.0, coverageDays: 20, interpretation: 'HIGH' },
  competitorSignal: { multiplier: 1.0,  confidence: 0.0, medianPrice: null, gapPercent: 0 },
  seasonalSignal:   { multiplier: 1.0,  phase: 'off_season', intensity: 0 },
});
assert(t2.recommendedPrice < 799, 'Low demand + High inventory → price DOWN');

// Test 3: Profit floor never breached
const t3 = composePriceRecommendation({
  product: { currentPrice: 500, costPrice: 480, targetMargin: 0.15, pricingStrategy: {} },
  demandSignal:     { multiplier: 0.88, confidence: 0.9, velocityRatio: 0.3, interpretation: 'LOW' },
  inventorySignal:  { multiplier: 0.90, confidence: 1.0, coverageDays: 25, interpretation: 'HIGH' },
  competitorSignal: { multiplier: 0.94, confidence: 0.8, medianPrice: 460, gapPercent: -8 },
  seasonalSignal:   { multiplier: 1.0,  phase: 'off_season', intensity: 0 },
});
assert(t3.recommendedPrice >= 480 * 1.15, 'Price NEVER below profit floor');
assert(t3.constraintApplied === 'PROFIT_FLOOR', 'Constraint flagged as PROFIT_FLOOR');

// Test 4: Minimum change threshold
const t4 = composePriceRecommendation({
  product: { currentPrice: 799, costPrice: 400, targetMargin: 0.15, pricingStrategy: {} },
  demandSignal:     { multiplier: 1.001, confidence: 0.5, velocityRatio: 1.0, interpretation: 'STABLE' },
  inventorySignal:  { multiplier: 1.001, confidence: 1.0, coverageDays: 8, interpretation: 'NORMAL' },
  competitorSignal: { multiplier: 1.001, confidence: 0.5, medianPrice: 800, gapPercent: 0.1 },
  seasonalSignal:   { multiplier: 1.0,   phase: 'off_season', intensity: 0 },
});
assert(t4.constraintApplied === 'MINIMUM_CHANGE', 'Trivial change blocked');

console.log('\n🎉 All pricing engine tests passed!');
```

## Frontend Testing Checklist

```
NAVIGATION
□ All 8 nav links work
□ Active nav item highlighted
□ Layout renders on 1280px+

PRODUCTS
□ Add product → appears in list
□ Edit → form prefills
□ Delete → confirmation → removed

INVENTORY
□ Coverage meter correct colors
□ Update stock → quantity changes
□ Record sale → works

COMPETITORS
□ Product selector loads list
□ Gap analysis updates on product change

PRICING (Most Critical)
□ Calculate → loading spinner → result card
□ Signal waterfall shows 4 bars
□ AI explanation renders
□ Event overlay shows when event active
□ Apply button updates price
□ Confidence badge correct color

EVENTS
□ Create event → DRAFT status
□ Activate → SCHEDULED
□ 3 tabs filter correctly

SETTINGS
□ Seasonal toggle ON/OFF works
□ Category exclusion chips add/remove

DASHBOARD
□ StatCards show real numbers
□ Active events widget displays
```

---

# PART 19 — DEMO PREPARATION

## 19.1 The Demo Script (8 Minutes)

**Minute 1 — Introduction:**
> "This is a Dynamic Pricing Engine for e-commerce. Unlike simple rule-based systems that say 'if demand is high, increase price', our system evaluates six independent market signals — demand, inventory, competitor pricing, seasonal trends, promotional events, and profitability — composes them multiplicatively, and generates an AI-powered explanation for every recommendation."

**Minute 2 — Dashboard:**
> "The dashboard shows real-time system state. Notice — inventory uses coverage days, not raw quantity. We also see active promotional events and the organic/promotional demand split."

**Minute 3 — Add Product + Set Inventory:**
> Walk through adding a product with cost price, tier, and seasonal config. Set inventory. Show coverage meter.

**Minute 4 — Add Competitors + Record Sales:**
> Add 2-3 competitors. Show gap analysis. Record several sales. Show velocity calculation.

**Minute 5 — Calculate Price (THE MONEY MOMENT):**
> Go to Pricing page. Select product. Hit Calculate.
> **Show:** Recommendation card, signal waterfall, confidence badge, AI explanation.

**Minute 6 — Create and Activate an Event:**
> Go to Events. Create "Weekend Sale 10% off Electronics". Activate it.
> Return to Pricing. Recalculate. **Show the event overlay:** recommendation ₹1,099 → 10% off → ₹989.

**Minute 7 — Settings + Seasonal Toggle:**
> Show Settings. Toggle seasonal OFF. Recalculate. Seasonal multiplier = 1.0. Toggle back ON. Seasonal multiplier returns.

**Minute 8 — Analytics + Architecture:**
> Show analytics: demand attribution chart (organic vs promotional). Show price history chart.
> Briefly show architecture diagram. Close with: "Questions?"

---

## 19.2 Interview Talking Points (Every Member Should Know These)

**1. "Why multiplicative composition instead of additive scoring?"**
> "Additive mixes different units. Multiplicative means each signal independently modulates the price. 1.08 × 1.06 = 1.145× — the compounding naturally captures multiple positive signals reinforcing each other."

**2. "Why is competitor pricing a signal, not a rule?"**
> "If demand is surging and inventory is critical, reducing price because a competitor is slightly cheaper would be bad business. Competitor is capped at ±8% influence; demand and inventory can move ±15%. Demand and inventory always dominate."

**3. "What is the profitability floor?"**
> "costPrice × (1 + targetMargin). It's a non-negotiable hard constraint applied after all signals. No pricing decision ever sells below cost. Even promotional events check this floor."

**4. "How does demand measurement work?"**
> "Individual sales events with timestamps. EMA of daily sales weighted toward recent days. We compare short-term rate (last 6h) vs long-term baseline (last 7d). Velocity ratio > 1.2× = demand rising."

**5. "How do you prevent promotional demand from corrupting the signal?"**
> "Every sale records which event was active. EMA baseline uses organic sales only. Velocity ratio uses organic sales only. During active promotions, we apply a 30% confidence penalty because the organic signal is less reliable."

**6. "How do promotional events interact with pricing?"**
> "The engine computes the market-optimal price first. Promotional discounts are applied as a post-processing overlay — discount from the recommendation, not from the current price. This mirrors Amazon's approach: pricing pipeline and promotions pipeline are separate."

**7. "What is the Pricing Decision Record?"**
> "Append-only audit log. Every decision stores the complete snapshot of every input at decision time — exact prices, inventory, competitors, demand. If a decision was wrong, we can reconstruct exactly why. This is a compliance pattern from production pricing systems."

**8. "Why 3-tier seasonal cascade?"**
> "Global toggle = emergency off. Category-level = practical daily control. Product-level = already exists. Same pattern as AWS IAM policy evaluation — cascading configuration hierarchy."

---

## 19.3 What Makes This Different (Summary Table)

| What We Built | What Most Students Build |
|---------------|--------------------------|
| 6-signal multiplicative composition | `if/else` rules |
| EMA-based demand from sales events | Manual "demand = high" input |
| Stock coverage days (qty ÷ velocity) | Raw quantity threshold |
| Staleness-weighted median + IQR outlier rejection | Simple average |
| Sigmoid seasonal ramp + 3-tier cascade | Binary flag |
| Event overlay pipeline + demand attribution | Events replace pricing |
| Profitability floor as hard constraint | No cost awareness |
| Confidence scoring with weighted components | Binary recommend/don't |
| Append-only decision audit record | Simple log table |
| AI explanation with structured context | Generic message |
| Background scheduler with auto-apply | Manual button only |
| Organic vs promotional demand attribution | All demand treated equally |

---

## 19.4 Deployment URLs (Fill on Day 6)

```
Backend (Render):   https://dynamic-pricing-engine-api.onrender.com
Frontend (Vercel):  https://dynamic-pricing-engine.vercel.app
MongoDB Atlas:      Cluster0 (private)
```

## 19.5 Backup Plan

- 5 screenshots of key screens saved locally
- 3-minute screen recording of full demo flow
- Postman collection open showing `/pricing/calculate` response
- If internet fails: run locally (backend localhost:5000, frontend localhost:5173)

---

_Master Execution Document by: Antigravity AI_
_Team: 4 Members | Deadline: June 27, 2026_
_Stack: React + Tailwind CSS + Axios | Node.js + Express.js | MongoDB Atlas_
_Total: 8 schemas, 40+ APIs, 8 frontend pages, 60+ components, 6 signal engines_

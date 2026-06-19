# 🏗️ Dynamic Pricing Engine — Complete Project Audit

> **Deadline:** June 27, 2026 | **Team:** 4 Members | **Stack:** React + Node.js + MongoDB + AI
> **Audit Date:** June 19, 2026 | **Days Remaining:** 8

---

## ⚠️ CRITICAL STATUS SUMMARY

| Component              | Status                           | Completion |
| ---------------------- | -------------------------------- | ---------- |
| Backend server.js      | ❌ Empty file                    | 0%         |
| Backend routes         | ❌ Not created                   | 0%         |
| Backend controllers    | ❌ Not created                   | 0%         |
| Backend middleware     | ❌ Not created                   | 0%         |
| Backend config (DB)    | ❌ Not created                   | 0%         |
| Product model          | ❌ Missing                       | 0%         |
| Inventory model        | ❌ Missing                       | 0%         |
| Competitor Price model | ✅ Created                       | 100%       |
| Pricing History model  | ✅ Partially (missing fields)    | 70%        |
| Pricing Engine logic   | ❌ Not created                   | 0%         |
| AI Explanation module  | ❌ Not created                   | 0%         |
| Frontend (React app)   | ❌ Not created                   | 0%         |
| .env configuration     | ⚠️ Incomplete (missing API keys) | 30%        |

### **Overall Completion Estimate: ~8%**

---

# PHASE 1: PROJECT UNDERSTANDING

## 1.1 Problem Statement Summary

An e-commerce company sells products via multiple channels. Prices need to be **automatically adjusted** based on four real-world conditions:

1. **Demand** — how fast a product is selling
2. **Inventory** — how much stock remains
3. **Competitor Pricing** — what rivals are charging
4. **Time-based rules** — weekends, festivals, end-of-month

The system must **recommend** (not force) the best selling price using predefined business rules, then use AI to **explain** the recommendation in plain English.

---

## 1.2 Core Objectives

| #   | Objective                                                             |
| --- | --------------------------------------------------------------------- |
| 1   | Build a pricing recommendation engine using rule-based logic          |
| 2   | Manage products and their base prices                                 |
| 3   | Track and manage inventory levels                                     |
| 4   | Simulate competitor pricing (manually entered — no scraping required) |
| 5   | Apply business rules to recommend a new price                         |
| 6   | Use AI (OpenAI or Gemini) to generate a human-readable explanation    |
| 7   | Display analytics: price trends, inventory status, recommendations    |

---

## 1.3 Functional Requirements

### Product Management

- Add a product (name, category, current price)
- Edit product details
- Delete a product
- View all products in a catalog

### Inventory Management

- Set/update stock quantity per product
- View inventory levels
- Identify low-stock and high-stock products

### Competitor Pricing

- Manually add competitor prices for a product
- Update competitor prices
- Compare our price vs. competitor price

### Pricing Engine

- Accept product ID as input
- Evaluate all four rule categories
- Calculate a recommended price
- Store pricing history with reason and applied rules
- Trigger AI explanation generation

### Analytics Dashboard

- Total products count
- Low stock products count
- Recent price recommendations
- Recent price change log

---

## 1.4 Non-Functional Requirements (Inferred from assignment context)

| Requirement      | Detail                                                    |
| ---------------- | --------------------------------------------------------- |
| Simplicity       | Rule-based, no ML required                                |
| Explainability   | AI provides human-readable explanation                    |
| Data Persistence | MongoDB Atlas                                             |
| Deployment       | Frontend → Vercel, Backend → Render                       |
| Tech Stack       | React + Material UI + Axios / Node.js + Express / MongoDB |
| AI               | OpenAI API or Gemini API for explanation only             |

---

## 1.5 Mandatory Deliverables

1. Functional backend API (Node.js + Express + MongoDB)
2. Functional frontend (React + Material UI)
3. Working pricing engine with at least 4 rules
4. AI explanation module
5. Analytics dashboard
6. Deployed application (Vercel + Render)
7. Documented codebase

---

## 1.6 Assumptions

- Demand is **simulated** — it is a number field that users enter (not computed from real sales data)
- Competitor prices are **manually entered** — no web scraping
- Authentication is listed under Student 2's responsibilities but **not explicitly required** in the functional requirements — treat it as optional or implement basic admin login
- AI explanation uses a **prompt template** sent to Gemini/OpenAI with pricing factors as context
- Currency is **Indian Rupees (₹)**

---

## 1.7 What Is Completed

| Item                                     | Status                                  |
| ---------------------------------------- | --------------------------------------- |
| `competitorPrice.js` model               | ✅ Complete and correct                 |
| `pricingHistory.js` model                | ✅ Mostly correct (minor field missing) |
| `package.json` with correct dependencies | ✅ Done                                 |
| `.env` file created                      | ⚠️ Incomplete (no PORT, no AI key)      |
| MongoDB Atlas cluster configured         | ✅ Cluster URL exists                   |

## 1.8 What Is Partially Completed

| Item                | Issue                                                             |
| ------------------- | ----------------------------------------------------------------- |
| `pricingHistory.js` | Missing `demandLevel`, `inventoryLevel` fields for full context   |
| `.env`              | Missing `PORT`, `JWT_SECRET`, `GEMINI_API_KEY` / `OPENAI_API_KEY` |
| `package.json`      | Missing `start` and `dev` scripts                                 |

## 1.9 What Is Missing (Critical)

| Missing Item                                              | Priority   |
| --------------------------------------------------------- | ---------- |
| `server.js` content                                       | 🔴 BLOCKER |
| `src/config/db.js` — MongoDB connection                   | 🔴 BLOCKER |
| `src/models/product.js`                                   | 🔴 BLOCKER |
| `src/models/inventory.js`                                 | 🔴 BLOCKER |
| All controllers (product, inventory, competitor, pricing) | 🔴 BLOCKER |
| All routes files                                          | 🔴 BLOCKER |
| Pricing engine logic (`src/services/pricingEngine.js`)    | 🔴 BLOCKER |
| AI explanation service                                    | 🔴 HIGH    |
| Entire React frontend                                     | 🔴 BLOCKER |
| Deployment configuration                                  | 🟡 MEDIUM  |

---

# PHASE 2: ARCHITECTURE REVIEW

## 2.1 Target Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React.js Frontend (Vercel)               │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │Dashboard │ │ Products  │ │Inventory │ │Pricing │ │  │
│  │  │  Page    │ │   Page    │ │  Page    │ │  Page  │ │  │
│  │  └──────────┘ └───────────┘ └──────────┘ └────────┘ │  │
│  │         ↕           ↕            ↕            ↕       │  │
│  │              Axios HTTP Client                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │ REST API (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVER LAYER (Render)                   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                Node.js + Express Server               │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌────────┐ │  │
│  │  │ Product  │ │ Inventory │ │Competitor│ │Pricing │ │  │
│  │  │  Router  │ │  Router   │ │  Router  │ │ Router │ │  │
│  │  └────┬─────┘ └─────┬─────┘ └────┬─────┘ └───┬────┘ │  │
│  │       │             │             │             │      │  │
│  │  ┌────▼─────────────▼─────────────▼─────────────▼───┐ │  │
│  │  │              Controllers Layer                     │ │  │
│  │  └────────────────────┬──────────────────────────────┘ │  │
│  │                       │                                  │  │
│  │  ┌────────────────────▼──────────────────────────────┐ │  │
│  │  │           Services Layer                           │ │  │
│  │  │  ┌─────────────────┐  ┌──────────────────────┐   │ │  │
│  │  │  │  Pricing Engine  │  │  AI Explanation Svc  │   │ │  │
│  │  │  └─────────────────┘  └──────────────────────┘   │ │  │
│  │  └───────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │ Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (MongoDB Atlas)                  │
│                                                             │
│   ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌────────┐ │
│   │ Products │  │ Inventory │  │ Competitor │  │Pricing │ │
│   │          │  │           │  │   Prices   │  │History │ │
│   └──────────┘  └───────────┘  └────────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │  External APIs   │
                   │ Gemini/OpenAI    │
                   └──────────────────┘
```

## 2.2 Data Flow Diagram

```
User Action (e.g., "Calculate Price for Product X")
       │
       ▼
React UI → POST /api/calculate-price { productId }
       │
       ▼
Express Router → pricingController.calculatePrice()
       │
       ├──► Fetch Product from DB (currentPrice)
       ├──► Fetch Inventory from DB (availableQuantity)
       ├──► Fetch Competitor Prices from DB (competitorPrice[])
       │
       ▼
pricingEngine.calculate(product, inventory, competitorPrices)
       │
       ├──► Apply Rule 1: demand+inventory → priceAdjustment
       ├──► Apply Rule 2: competitor → priceAdjustment
       ├──► Apply Rule 3: time-based → priceAdjustment
       │
       ▼
recommendedPrice = currentPrice * adjustment factors
       │
       ▼
aiService.explain(factors) → "The recommended price is ₹X because..."
       │
       ▼
Save PricingHistory to DB
       │
       ▼
Return { recommendedPrice, explanation, appliedRules } to Frontend
       │
       ▼
React displays Pricing Recommendation Page
```

## 2.3 Request Flow

```
Browser → GET /api/products
        → CORS middleware
        → Express router (/api/products)
        → productController.getAllProducts()
        → Product.find() [Mongoose]
        → MongoDB Atlas query
        → JSON response → React State → UI render
```

## 2.4 Component Hierarchy (Frontend)

```
<App>
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route "/" → <Dashboard /> />
      <Route "/products" → <ProductsPage /> />
        <ProductList />
        <ProductForm /> (Add/Edit modal)
      <Route "/inventory" → <InventoryPage /> />
        <InventoryTable />
        <StockUpdateModal />
      <Route "/competitors" → <CompetitorPage /> />
        <CompetitorTable />
        <AddCompetitorForm />
      <Route "/pricing" → <PricingPage /> />
        <PricingForm /> (select product, enter demand)
        <PricingResult /> (shows recommended price + AI explanation)
        <PricingHistoryTable />
    </Routes>
  </BrowserRouter>
</App>
```

---

# PHASE 3: DYNAMIC PRICING ENGINE ANALYSIS

## 3.1 Business Logic

The pricing engine is **purely rule-based**. No machine learning is required. The engine evaluates 4 input dimensions and applies percentage-based adjustments to the current base price.

### Factors That Influence Price

| Factor           | How It Works                        | Direction                                                       |
| ---------------- | ----------------------------------- | --------------------------------------------------------------- |
| Demand           | Simulated score entered by admin    | High → price up, Low → price down                               |
| Inventory        | Available stock quantity            | Low stock → price up, High stock → price down                   |
| Competitor Price | Manually entered competitor price   | Lower competitor → our price down, Higher competitor → price up |
| Time-Based       | Day of week / special occasion flag | Weekend/festival → optional discount                            |

---

## 3.2 Mathematical Model

### Step 1: Demand Classification

```
demandScore = user-entered number (0 – 100)

demandLevel =
  IF demandScore >= 70  → "HIGH"
  IF demandScore >= 40  → "MEDIUM"
  ELSE                  → "LOW"
```

**Inputs:** demandScore (integer 0–100)
**Outputs:** demandLevel string ("HIGH" | "MEDIUM" | "LOW")
**Edge cases:** demandScore = 0 → LOW; demandScore = 100 → HIGH; null → treat as MEDIUM

---

### Step 2: Inventory Classification

```
inventoryQuantity = availableQuantity from Inventory collection

inventoryLevel =
  IF inventoryQuantity <= 10  → "LOW"
  IF inventoryQuantity <= 50  → "MEDIUM"
  ELSE                        → "HIGH"
```

**Inputs:** availableQuantity (integer)
**Outputs:** inventoryLevel string ("LOW" | "MEDIUM" | "HIGH")
**Edge cases:** quantity = 0 → LOW (critical); null/missing → treat as HIGH (safe default)

---

### Step 3: Rule Application

#### Rule 1 — Demand + Inventory (Combined)

```
IF demandLevel == "HIGH" AND inventoryLevel == "LOW"
  adjustment += +10%   (scarcity + high demand → premium price)

IF demandLevel == "LOW" AND inventoryLevel == "HIGH"
  adjustment += -10%   (oversupply + low demand → discount to clear)
```

**Reasoning:** This is the classic supply-demand curve. High demand with low supply → seller's market → increase price. Excess supply with low demand → buyer's market → decrease price.

---

#### Rule 2 — Competitor Price

```
avgCompetitorPrice = AVERAGE of all competitor prices for this product

IF avgCompetitorPrice < currentPrice * 0.95
  (competitor is cheaper by > 5%)
  adjustment += -5%    (stay competitive)

IF avgCompetitorPrice > currentPrice * 1.03
  (competitor is more expensive by > 3%)
  adjustment += +3%    (exploit our advantage)
```

**Inputs:** List of competitorPrice values, currentPrice
**Outputs:** Price adjustment percentage
**Edge cases:** No competitor prices → skip this rule; single competitor → use that price

---

#### Rule 3 — Time-Based

```
today = new Date()
dayOfWeek = today.getDay()   // 0=Sunday, 6=Saturday

IF dayOfWeek == 0 OR dayOfWeek == 6
  adjustment += -2%   (weekend sale incentive)
```

**Inputs:** Current date/time
**Outputs:** Optional negative adjustment
**Edge cases:** This rule is optional for demo; implement for completeness

---

### Step 4: Final Price Calculation

```
totalAdjustmentFactor = 1 + (sum of all adjustment percentages / 100)

recommendedPrice = currentPrice * totalAdjustmentFactor

// Guardrails (prevent extreme prices):
MIN_PRICE = currentPrice * 0.70   (never go below 70% of base)
MAX_PRICE = currentPrice * 1.50   (never exceed 150% of base)

finalRecommendedPrice = CLAMP(recommendedPrice, MIN_PRICE, MAX_PRICE)
```

**Example walkthrough:**

```
Product: Wireless Mouse
currentPrice = ₹799
demandScore = 80 → HIGH
inventoryQuantity = 5 → LOW
competitorPrices = [₹849, ₹820] → avg = ₹834.50 → higher than ₹799 → +3%
dayOfWeek = Wednesday → no time rule

appliedRules = [
  "High demand + Low inventory → +10%",
  "Competitor price higher → +3%"
]

totalAdjustment = 1 + (10 + 3) / 100 = 1.13
recommendedPrice = 799 * 1.13 = ₹902.87 → round to ₹903

Guardrail check:
  MIN = 799 * 0.70 = ₹559 ✓
  MAX = 799 * 1.50 = ₹1198 ✓
  903 is within bounds ✓

finalRecommendedPrice = ₹903
```

---

## 3.3 Demand Calculation

Since this is a college project, demand is **not computed from actual sales data**. Instead:

- **Demand Score** is a number (0–100) that the admin enters when requesting a price calculation
- It represents the admin's assessment of how well a product is selling

| Demand Score | Category | Behavior                   |
| ------------ | -------- | -------------------------- |
| 70–100       | HIGH     | Price increases            |
| 40–69        | MEDIUM   | No demand-based adjustment |
| 0–39         | LOW      | Price decreases            |

**Implementation Strategy:**

```javascript
function classifyDemand(demandScore) {
  if (demandScore >= 70) return "HIGH";
  if (demandScore >= 40) return "MEDIUM";
  return "LOW";
}
```

---

## 3.4 Pricing Workflow (Step-by-Step)

```
INPUT DATA
├── productId (from frontend form)
├── demandScore (0-100, entered by admin)
└── (inventory + competitor data fetched from DB automatically)
          │
          ▼
DEMAND CALCULATION
├── demandScore → demandLevel ("HIGH" / "MEDIUM" / "LOW")
└── inventoryQuantity → inventoryLevel ("LOW" / "MEDIUM" / "HIGH")
          │
          ▼
RULE EVALUATION (each rule independently checked)
├── Rule 1: demandLevel + inventoryLevel → ±10% or 0
├── Rule 2: avgCompetitorPrice vs currentPrice → ±5%/+3% or 0
├── Rule 3: dayOfWeek → -2% or 0
└── Collect: appliedRules[] array, totalAdjustment%
          │
          ▼
PRICE CALCULATION
├── recommendedPrice = currentPrice * (1 + totalAdjustment/100)
└── Apply guardrails: CLAMP to [70%, 150%] of currentPrice
          │
          ▼
AI EXPLANATION (Gemini/OpenAI API call)
├── Build prompt with: productName, currentPrice, demandLevel,
│   inventoryLevel, avgCompetitorPrice, recommendedPrice, appliedRules
└── Receive: 1-2 sentence plain English explanation
          │
          ▼
PERSIST TO DB
└── PricingHistory.create({ productId, oldPrice, recommendedPrice,
                            reason, appliedRules, aiExplanation })
          │
          ▼
RETURN TO FRONTEND
└── { recommendedPrice, appliedRules, explanation, pricingHistoryId }
```

---

# PHASE 4: DATABASE REVIEW

## 4.1 Products Collection

**Purpose:** Store product catalog with base price.

| Field          | Type     | Required | Validation                         |
| -------------- | -------- | -------- | ---------------------------------- |
| `_id`          | ObjectId | Auto     | Mongoose default                   |
| `productName`  | String   | ✅       | trim, minLen 2, maxLen 100         |
| `category`     | String   | ✅       | trim, enum or free-text            |
| `currentPrice` | Number   | ✅       | min: 0                             |
| `basePrice`    | Number   | ✅       | min: 0 (original price, reference) |
| `description`  | String   | ❌       | optional                           |
| `createdAt`    | Date     | Auto     | timestamps: true                   |
| `updatedAt`    | Date     | Auto     | timestamps: true                   |

> **Note:** Assignment says `basePrice` should exist but only lists `currentPrice`. Add `basePrice` as the original price — this helps reset prices if needed.

**Relationships:** Referenced by Inventory, CompetitorPrice, PricingHistory via `productId`.

---

## 4.2 Inventory Collection

**Purpose:** Track available stock per product.

| Field               | Type     | Required | Validation       |
| ------------------- | -------- | -------- | ---------------- |
| `_id`               | ObjectId | Auto     | —                |
| `productId`         | ObjectId | ✅       | ref: 'Product'   |
| `availableQuantity` | Number   | ✅       | min: 0, integer  |
| `lowStockThreshold` | Number   | ❌       | default: 10      |
| `updatedAt`         | Date     | Auto     | timestamps: true |

**Missing in current codebase:** This model doesn't exist yet. Must be created.

---

## 4.3 Competitor Prices Collection ✅ (Exists)

**Purpose:** Track competitor prices per product.

| Field             | Type     | Required | Validation     | Status |
| ----------------- | -------- | -------- | -------------- | ------ |
| `_id`             | ObjectId | Auto     | —              | ✅     |
| `productId`       | ObjectId | ✅       | ref: 'Product' | ✅     |
| `competitorName`  | String   | ✅       | trim           | ✅     |
| `competitorPrice` | Number   | ✅       | min: 0         | ✅     |
| `createdAt`       | Date     | Auto     | timestamps     | ✅     |
| `updatedAt`       | Date     | Auto     | timestamps     | ✅     |

**Assessment:** ✅ Complete and correct. No changes needed.

---

## 4.4 Pricing History Collection ⚠️ (Partially Correct)

**Purpose:** Audit trail of all pricing recommendations.

| Field              | Type     | Required | Current Status        |
| ------------------ | -------- | -------- | --------------------- |
| `_id`              | ObjectId | Auto     | ✅                    |
| `productId`        | ObjectId | ✅       | ❌ MISSING — must add |
| `oldPrice`         | Number   | ✅       | ✅                    |
| `recommendedPrice` | Number   | ✅       | ✅                    |
| `reason`           | String   | ✅       | ✅                    |
| `appliedRules`     | [String] | ✅       | ✅                    |
| `aiExplanation`    | String   | ❌       | ✅                    |
| `demandScore`      | Number   | ❌       | ❌ MISSING            |
| `demandLevel`      | String   | ❌       | ❌ MISSING            |
| `inventoryLevel`   | String   | ❌       | ❌ MISSING            |
| `createdAt`        | Date     | Auto     | ✅                    |

**Fix Required:** Add `productId` as required field (currently missing completely!). Add `demandScore` and `demandLevel` for context.

---

## 4.5 Performance & Optimization Notes

- Add index on `productId` for all collections — especially PricingHistory which will grow fast
- Limit PricingHistory query to last 50 records in the dashboard (don't fetch all)
- Use `.populate('productId', 'productName currentPrice')` to avoid N+1 queries

---

# PHASE 5: API REVIEW

## 5.1 Complete API Map

### Base URL: `/api`

---

### Product APIs

| Endpoint            | Method | Status     |
| ------------------- | ------ | ---------- |
| `/api/products`     | POST   | ❌ Missing |
| `/api/products`     | GET    | ❌ Missing |
| `/api/products/:id` | PUT    | ❌ Missing |
| `/api/products/:id` | DELETE | ❌ Missing |

**POST /api/products**

```json
Request Body:
{
  "productName": "Wireless Mouse",
  "category": "Electronics",
  "currentPrice": 799,
  "basePrice": 799,
  "description": "Optional"
}

Response 201:
{
  "success": true,
  "data": { "_id": "...", "productName": "Wireless Mouse", ... }
}

Errors: 400 (validation), 500 (server)
```

**GET /api/products**

```json
Response 200:
{
  "success": true,
  "count": 5,
  "data": [ { product objects } ]
}
```

---

### Inventory APIs

| Endpoint             | Method | Status     |
| -------------------- | ------ | ---------- |
| `/api/inventory`     | POST   | ❌ Missing |
| `/api/inventory`     | GET    | ❌ Missing |
| `/api/inventory/:id` | PUT    | ❌ Missing |

**POST /api/inventory**

```json
Request Body:
{
  "productId": "60d...",
  "availableQuantity": 45
}

Response 201:
{
  "success": true,
  "data": { inventory object }
}
```

**GET /api/inventory**

```json
Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "productId": { "productName": "Wireless Mouse", "currentPrice": 799 },
      "availableQuantity": 45,
      "stockStatus": "MEDIUM"
    }
  ]
}
```

---

### Competitor Price APIs

| Endpoint                     | Method | Status     |
| ---------------------------- | ------ | ---------- |
| `/api/competitor-prices`     | POST   | ❌ Missing |
| `/api/competitor-prices`     | GET    | ❌ Missing |
| `/api/competitor-prices/:id` | PUT    | ❌ Missing |

**POST /api/competitor-prices**

```json
Request Body:
{
  "productId": "60d...",
  "competitorName": "Flipkart",
  "competitorPrice": 749
}
```

---

### Pricing APIs

| Endpoint               | Method | Status     |
| ---------------------- | ------ | ---------- |
| `/api/calculate-price` | POST   | ❌ Missing |
| `/api/pricing-history` | GET    | ❌ Missing |

**POST /api/calculate-price** ← THE MOST IMPORTANT API

```json
Request Body:
{
  "productId": "60d...",
  "demandScore": 80
}

Response 200:
{
  "success": true,
  "data": {
    "productName": "Wireless Mouse",
    "currentPrice": 799,
    "recommendedPrice": 903,
    "demandLevel": "HIGH",
    "inventoryLevel": "LOW",
    "appliedRules": [
      "High demand + Low inventory → +10%",
      "Competitor price higher → +3%"
    ],
    "aiExplanation": "The recommended price is ₹903 because demand is high, inventory is limited, and competitor prices are currently higher.",
    "adjustment": "+13%"
  }
}

Errors:
  404: Product or Inventory not found
  400: Invalid demandScore (must be 0-100)
  500: AI service failure (but still return pricing data without explanation)
```

**GET /api/pricing-history**

```json
Query Params: ?productId=xxx&limit=20

Response 200:
{
  "success": true,
  "data": [ { pricing history records } ]
}
```

---

### Dashboard API (Bonus — reduces frontend API calls)

| Endpoint               | Method | Status     |
| ---------------------- | ------ | ---------- |
| `/api/dashboard/stats` | GET    | ❌ Missing |

```json
Response 200:
{
  "success": true,
  "data": {
    "totalProducts": 10,
    "lowStockCount": 3,
    "recentRecommendations": [ last 5 pricing history items ],
    "recentPriceChanges": [ last 5 pricing history items ]
  }
}
```

---

## 5.2 Missing APIs Priority

| Priority | API                         | Reason                      |
| -------- | --------------------------- | --------------------------- |
| 🔴 P0    | POST /api/calculate-price   | Core feature                |
| 🔴 P0    | GET /api/products           | Everything needs products   |
| 🔴 P0    | POST /api/products          | Can't demo without products |
| 🔴 P0    | POST /api/inventory         | Required for pricing engine |
| 🔴 P0    | GET /api/inventory          | Required for pricing engine |
| 🔴 P0    | POST /api/competitor-prices | Required for pricing engine |
| 🟡 P1    | GET /api/pricing-history    | Demo requirement            |
| 🟡 P1    | PUT /api/products/:id       | Product management          |
| 🟡 P1    | PUT /api/inventory/:id      | Stock update                |
| 🟢 P2    | DELETE /api/products/:id    | Nice to have                |
| 🟢 P2    | GET /api/dashboard/stats    | Simplifies frontend         |

---

# PHASE 6: TEAM TASK DISTRIBUTION

> **8 days remaining (June 19 → June 27)**. Work must be parallelized immediately.

---

## Member 1 — Frontend Developer

**Primary Focus:** React App Setup + UI Components

### Responsibilities

- Initialize React app with Vite + Material UI
- Build Navbar and routing structure
- Build Dashboard page
- Build Products management page (list + add/edit modal)
- Build Inventory management page

### Deliverables

| Deliverable                                 | Due                  |
| ------------------------------------------- | -------------------- |
| React project initialized, MUI installed    | Day 1 (June 20)      |
| Navbar + Router + 5 page shells             | Day 1                |
| Dashboard page (hardcoded data initially)   | Day 2 (June 21)      |
| Product List page + Add Product form        | Day 2                |
| Inventory page                              | Day 3 (June 22)      |
| Connect all pages to backend APIs via Axios | Day 4–5 (June 23–24) |
| Final polish + responsive layout            | Day 6 (June 25)      |

### Estimated Hours: ~35–40 hours

---

## Member 2 — Backend Developer

**Primary Focus:** Server Setup + All APIs + Database

### Responsibilities

- Create `server.js` with Express
- Create MongoDB connection (`src/config/db.js`)
- Create all Mongoose models (Product, Inventory)
- Create all routes and controllers
- Test all APIs with Postman/Thunder Client

### Deliverables

| Deliverable                                | Due             |
| ------------------------------------------ | --------------- |
| `server.js` + `db.js` + `.env` complete    | Day 1 (June 20) |
| Product model + CRUD routes + controller   | Day 1–2         |
| Inventory model + routes + controller      | Day 2           |
| Competitor routes + controller             | Day 2           |
| Pricing history routes + controller        | Day 3           |
| All APIs tested and returning correct data | Day 3           |
| Error handling middleware                  | Day 3           |

### Estimated Hours: ~30–35 hours

---

## Member 3 — Pricing Engine + AI Developer

**Primary Focus:** Core business logic + AI integration

### Responsibilities

- Implement `src/services/pricingEngine.js`
- Implement all 4 pricing rules
- Integrate Gemini API for AI explanations
- Build POST `/api/calculate-price` controller
- Write test cases for the pricing engine

### Deliverables

| Deliverable                                      | Due             |
| ------------------------------------------------ | --------------- |
| `pricingEngine.js` with all 4 rules              | Day 2 (June 21) |
| Manual test cases (paper/console.log)            | Day 2           |
| Gemini/OpenAI API integration                    | Day 3 (June 22) |
| `pricingController.js` complete                  | Day 3           |
| Edge case handling (no inventory, no competitor) | Day 3           |
| Pricing history stored correctly                 | Day 4           |

### Estimated Hours: ~25–30 hours

---

## Member 4 — Frontend Developer + Integration + Deployment

**Primary Focus:** Pricing UI + Integration + Deployment

### Responsibilities

- Build Competitor Pricing page
- Build Pricing Recommendation page (the STAR of the demo)
- Build Pricing History view
- API integration (connect all Axios calls)
- Deploy backend to Render
- Deploy frontend to Vercel
- Write project README

### Deliverables

| Deliverable                           | Due             |
| ------------------------------------- | --------------- |
| Competitor pricing page               | Day 2 (June 21) |
| Pricing recommendation page           | Day 3 (June 22) |
| Pricing history page/section          | Day 3           |
| Full API integration (all pages live) | Day 4–5         |
| Backend deployed to Render            | Day 5 (June 24) |
| Frontend deployed to Vercel           | Day 6 (June 25) |
| README + documentation                | Day 7 (June 26) |

### Estimated Hours: ~35–40 hours

---

# PHASE 7: GIT WORKFLOW

## 7.1 Branch Strategy

```
main ─────────────────────────────────────────────────────► (production)
  └── develop ──────────────────────────────────────────► (integration)
        ├── feature/backend-setup           (Member 2)
        ├── feature/product-api             (Member 2)
        ├── feature/inventory-api           (Member 2)
        ├── feature/competitor-api          (Member 2)
        ├── feature/pricing-engine          (Member 3)
        ├── feature/ai-integration          (Member 3)
        ├── feature/frontend-setup          (Member 1)
        ├── feature/dashboard-page          (Member 1)
        ├── feature/products-page           (Member 1)
        ├── feature/inventory-page          (Member 1)
        ├── feature/competitor-page         (Member 4)
        ├── feature/pricing-page            (Member 4)
        └── feature/deployment              (Member 4)
```

## 7.2 Naming Conventions

```
feature/[area]-[short-description]
bugfix/[area]-[what-was-broken]
hotfix/[critical-issue]

Examples:
  feature/pricing-engine-rules
  bugfix/product-delete-not-working
  hotfix/db-connection-timeout
```

## 7.3 Daily Git Commands (Exact)

**Start of each day — sync with develop:**

```bash
git checkout develop
git pull origin develop
git checkout feature/your-branch-name
git merge develop
# resolve conflicts if any
```

**During work — commit often:**

```bash
git add .
git commit -m "feat: add product CRUD controller"
# Use prefixes: feat:, fix:, docs:, style:, refactor:
```

**Push and create PR:**

```bash
git push origin feature/your-branch-name
# Then create Pull Request on GitHub: feature/xxx → develop
```

**Merge to develop (team lead approves PR):**

```bash
# On GitHub: merge the PR
# Then locally:
git checkout develop
git pull origin develop
```

**Final merge to main (only for deployment):**

```bash
git checkout main
git merge develop
git push origin main
git tag v1.0.0
git push origin v1.0.0
```

## 7.4 Daily Sync Process

- **Morning (9 AM):** Pull latest develop, share blockers in WhatsApp/Discord
- **Evening (9 PM):** Push all work, create PRs before sleeping
- **Code review:** Each PR must be reviewed by at least 1 teammate before merge

## 7.5 PR Workflow

```
1. Feature branch ready → Push to GitHub
2. Open PR: feature/xxx → develop
3. Fill PR description: "What was built? What to test?"
4. Tag 1 reviewer
5. Reviewer checks code, leaves comments
6. Author fixes issues, pushes again
7. Reviewer approves → Merge
8. Delete feature branch after merge
```

---

# PHASE 8: DAY-BY-DAY EXECUTION PLAN

> **Start:** June 19, 2026 | **Deadline:** June 27, 2026 | **Days:** 8

---

## Day 1 — June 19 (TODAY): Foundation Setup 🔴 CRITICAL

**All Members Start Immediately**

| Task                                                                                        | Owner | Expected Output              |
| ------------------------------------------------------------------------------------------- | ----- | ---------------------------- |
| Initialize React frontend (`npm create vite@latest frontend -- --template react`)           | M1    | React app running locally    |
| Install MUI: `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material` | M1    | MUI working                  |
| Install Axios: `npm install axios`                                                          | M1    | Axios installed              |
| Create `server.js` with Express, CORS, dotenv                                               | M2    | Server runs on PORT 5000     |
| Create `src/config/db.js` with Mongoose connection                                          | M2    | DB connection successful     |
| Update `.env` with PORT, JWT_SECRET, GEMINI_API_KEY                                         | M2    | No connection errors         |
| Add `dev` script to `package.json` (nodemon server.js)                                      | M2    | `npm run dev` works          |
| Create `src/models/product.js`                                                              | M2    | Model created                |
| Create `src/models/inventory.js`                                                            | M2    | Model created                |
| Fix `pricingHistory.js` — add productId field                                               | M3    | Model corrected              |
| Get Gemini API key from Google AI Studio                                                    | M3    | Key in .env                  |
| Create GitHub branches for each member                                                      | M4    | All feature branches created |
| Create shared Postman collection                                                            | M4    | Postman workspace ready      |

**Dependencies:** M2's server must be up before M3 can test pricing engine.
**Risk:** DB connection issue → M2 must resolve before EOD.

---

## Day 2 — June 20: API Development

| Task                                                         | Owner | Expected Output                            |
| ------------------------------------------------------------ | ----- | ------------------------------------------ |
| Product routes + controller (POST, GET, PUT, DELETE)         | M2    | Products CRUD working in Postman           |
| Inventory routes + controller (POST, GET, PUT)               | M2    | Inventory CRUD working                     |
| Error handling middleware (`src/middleware/errorHandler.js`) | M2    | Consistent error responses                 |
| Navbar + React Router setup (5 page routes)                  | M1    | Navigation works                           |
| Dashboard page layout (MUI Grid, cards)                      | M1    | Dashboard renders                          |
| Product List page (MUI Table)                                | M1    | Table renders with hardcoded data          |
| Start `pricingEngine.js` — demand + inventory rules          | M3    | Rules 1 & 2 working with console.log tests |
| Competitor routes + controller                               | M2    | Competitor CRUD in Postman                 |
| Competitor pricing page (MUI)                                | M4    | Competitor page renders                    |

---

## Day 3 — June 21: Core Features Complete

| Task                                                  | Owner | Expected Output                  |
| ----------------------------------------------------- | ----- | -------------------------------- |
| Inventory management page (MUI)                       | M1    | Inventory page renders           |
| Add/Edit product modal (MUI Dialog)                   | M1    | Modal opens, form works          |
| Complete `pricingEngine.js` — competitor + time rules | M3    | All 4 rules implemented          |
| Gemini API integration (`src/services/aiService.js`)  | M3    | AI explanation generates         |
| POST `/api/calculate-price` controller + route        | M3    | Full pricing response in Postman |
| Pricing recommendation page — input form              | M4    | Form renders                     |
| Pricing recommendation page — result display          | M4    | Results display correctly        |
| Pricing history route + controller                    | M2    | GET /api/pricing-history works   |

---

## Day 4 — June 22: Frontend-Backend Integration

| Task                                             | Owner | Expected Output                    |
| ------------------------------------------------ | ----- | ---------------------------------- |
| Connect Dashboard → GET /api/dashboard/stats     | M1    | Live data on dashboard             |
| Connect Products page → all product APIs         | M1    | CRUD fully working on UI           |
| Connect Inventory page → inventory APIs          | M1    | Stock management live              |
| Connect Competitor page → competitor APIs        | M4    | Competitor data persists           |
| Connect Pricing page → POST /api/calculate-price | M4    | Full pricing flow works end-to-end |
| Pricing history section                          | M4    | History shows past recommendations |
| Fix any CORS / API issues                        | M2    | No blocked requests                |
| Edge case: no inventory record exists            | M3    | Graceful handling                  |

---

## Day 5 — June 23: Full Integration Testing

| Task                                                                            | Owner | Expected Output             |
| ------------------------------------------------------------------------------- | ----- | --------------------------- |
| End-to-end test: Add product → Set inventory → Add competitor → Calculate price | ALL   | Full flow works             |
| Test all 4 pricing rules manually                                               | M3    | Each rule fires correctly   |
| Test edge cases (0 inventory, 100 demand, no competitor)                        | M3    | No crashes                  |
| Mobile responsiveness check                                                     | M1    | UI works on mobile viewport |
| Fix all bugs found during testing                                               | ALL   | Zero blocking bugs          |
| Prepare Render deployment config                                                | M4    | Render account ready        |

---

## Day 6 — June 24: Deployment

| Task                                  | Owner | Expected Output                |
| ------------------------------------- | ----- | ------------------------------ |
| Deploy backend to Render              | M4    | Backend URL live               |
| Set environment variables on Render   | M4    | DB connects on Render          |
| Build React frontend: `npm run build` | M1    | Build succeeds                 |
| Deploy frontend to Vercel             | M4    | Frontend URL live              |
| Update Axios base URL to Render URL   | M4    | Frontend hits live backend     |
| Smoke test on deployed URLs           | ALL   | Everything works in production |

---

## Day 7 — June 25: Polish + Documentation

| Task                                                  | Owner | Expected Output          |
| ----------------------------------------------------- | ----- | ------------------------ |
| UI polish — colors, spacing, loading states           | M1    | Professional look        |
| Add loading spinners (MUI CircularProgress)           | M1    | No jarring UI            |
| Add success/error snackbars (MUI Alert)               | M1+M4 | User feedback on actions |
| Write README.md with setup instructions               | M4    | README complete          |
| Prepare demo script (what to click and in what order) | ALL   | Demo plan ready          |
| Record backup screenshots/screen recording            | M4    | Screenshots saved        |

---

## Day 8 — June 26: Final Buffer + Dry Run

| Task                                    | Owner | Expected Output           |
| --------------------------------------- | ----- | ------------------------- |
| Full demo dry run (15-minute rehearsal) | ALL   | Everyone knows their part |
| Fix any remaining minor bugs            | ALL   | Zero bugs on demo path    |
| Verify deployed URLs still work         | ALL   | Live and stable           |
| Final commit to main branch             | M4    | Clean repo                |
| Submit project                          | ALL   | ✅ Submitted              |

---

# PHASE 9: TESTING STRATEGY

## 9.1 Backend Testing Checklist

```
□ POST /api/products — creates product, returns 201
□ POST /api/products — with missing fields, returns 400
□ GET /api/products — returns array of products
□ PUT /api/products/:id — updates product name/price
□ PUT /api/products/:invalid-id — returns 404
□ DELETE /api/products/:id — deletes product
□ POST /api/inventory — creates inventory record
□ PUT /api/inventory/:id — updates quantity
□ POST /api/competitor-prices — creates competitor entry
□ GET /api/competitor-prices — returns all competitor prices
□ POST /api/calculate-price — valid input, full response
□ POST /api/calculate-price — missing productId → 400
□ POST /api/calculate-price — demandScore > 100 → 400
□ POST /api/calculate-price — product has no inventory → graceful
□ POST /api/calculate-price — no competitor prices → skip Rule 2
□ GET /api/pricing-history — returns history records
```

## 9.2 Frontend Testing Checklist

```
□ Dashboard loads with stats
□ Product add form opens, submits, new product appears in list
□ Product edit modal pre-fills existing data
□ Product delete removes from list
□ Inventory stock update persists
□ Competitor form adds competitor, appears in table
□ Pricing form: select product, enter demand score, click "Calculate"
□ Pricing result shows: recommended price, rules applied, AI explanation
□ Pricing history shows past recommendations
□ Error message shows when API fails
□ Loading state shows while API is fetching
```

## 9.3 Pricing Engine Test Cases

| Test                              | Input                                              | Expected Output                    |
| --------------------------------- | -------------------------------------------------- | ---------------------------------- |
| High demand + Low inventory       | demand=80, qty=5, noCompetitor                     | +10% adjustment                    |
| Low demand + High inventory       | demand=20, qty=100, noCompetitor                   | -10% adjustment                    |
| Medium demand + Medium inventory  | demand=50, qty=30, noCompetitor                    | 0% adjustment                      |
| Competitor cheaper (>5%)          | currentPrice=799, competitorAvg=740, noOtherRules  | -5% adjustment                     |
| Competitor more expensive (>3%)   | currentPrice=799, competitorAvg=840, noOtherRules  | +3% adjustment                     |
| Competitor slightly cheaper (<5%) | currentPrice=799, competitorAvg=780                | 0% from Rule 2                     |
| All rules fire at once            | demand=80, qty=5, competitorAvg=850, weekend=false | +13%                               |
| Weekend rule                      | dayOfWeek=Saturday                                 | -2% adjustment                     |
| Price exceeds MAX guardrail       | very high adjustments                              | clamped at 150%                    |
| Price drops below MIN guardrail   | very low adjustments                               | clamped at 70%                     |
| Zero inventory                    | qty=0                                              | classifies as LOW → Rule 1 applies |
| No competitor prices              | empty array                                        | Rule 2 skipped, no crash           |

## 9.4 AI Explanation Test Cases

```
□ Normal case: AI returns explanation string
□ AI API key missing: return default explanation, no crash
□ AI API timeout: return pricing result without explanation
□ AI explanation references the correct product name
□ AI explanation mentions demand level
□ AI explanation mentions inventory status
```

---

# PHASE 10: FINAL DELIVERY CHECKLIST

## 10.1 Demo Readiness Checklist

```
□ Deployed backend URL is live and responding
□ Deployed frontend URL is live
□ At least 5 sample products seeded in the database
□ Inventory records for all products exist
□ At least 3 competitor price entries exist
□ Demo pricing flow rehearsed (add product → set inventory → add competitor → calculate price)
□ AI explanation generates correctly in the live demo
□ Pricing history shows at least 3 past recommendations
□ Dashboard shows correct counts
```

## 10.2 Presentation Checklist

```
□ Be ready to answer: "How does your pricing engine work?"
□ Be ready to answer: "What rules did you implement?"
□ Be ready to answer: "Why did you use AI just for explanation?"
□ Be ready to answer: "How would you scale this?"
□ Show the Pricing Recommendation page as the MAIN demo page
□ Walk through the application flow step-by-step
□ Prepare 2-minute intro and 5-minute demo
□ Have backup screenshots if live demo fails
```

## 10.3 Deployment Checklist

```
□ Backend: Deployed to Render
   □ Environment variables set (MONGO_URL, PORT, GEMINI_API_KEY)
   □ Start command: node server.js
   □ Free plan selected
□ Frontend: Deployed to Vercel
   □ Build command: npm run build
   □ Output directory: dist (Vite) or build (CRA)
   □ VITE_API_URL environment variable set to Render URL
□ MongoDB Atlas:
   □ Network access: allow all IPs (0.0.0.0/0) for demo
   □ DB user credentials correct in MONGO_URL
□ CORS: Backend allows frontend Vercel URL
```

## 10.4 Documentation Checklist

```
□ README.md has:
   □ Project description
   □ Setup instructions (clone, npm install, .env setup, npm run dev)
   □ API endpoints list
   □ Deployed URLs
   □ Team member names
□ Code has comments explaining pricing rules
□ .env.example file committed (with placeholder values, not real keys)
□ .gitignore includes: node_modules, .env, dist, build
```

## 10.5 Submission Checklist

```
□ GitHub repository is public (or shared with instructor)
□ All code committed and pushed to main
□ README is complete
□ Deployed application URLs are in README
□ No console errors on the deployed frontend
□ No `console.log` debug statements left in production code
□ Team member names and roles documented
```

---

# 🚨 CRITICAL RISKS & BLOCKERS

| Risk                                 | Severity   | Mitigation                                      |
| ------------------------------------ | ---------- | ----------------------------------------------- |
| `server.js` is empty — nothing works | 🔴 BLOCKER | Member 2 must complete this TODAY               |
| No frontend at all                   | 🔴 BLOCKER | Member 1 must init React app TODAY              |
| AI API key not obtained              | 🔴 HIGH    | Get Gemini API key free at ai.google.dev        |
| MongoDB connection string incomplete | 🔴 HIGH    | Fix `MOGO_URL` typo → `MONGO_URL`, add password |
| CORS issues blocking frontend        | 🟡 MEDIUM  | Set `cors({ origin: '*' })` initially for dev   |
| Time running out                     | 🔴 HIGH    | No new features — finish what's required first  |
| `.env` has `MOGO_URL` (typo!)        | 🟡 MEDIUM  | Must fix to `MONGO_URL` in server.js + .env     |

---

# 📋 IMMEDIATE ACTION ITEMS (Do Today — June 19)

1. **Fix `.env`** — rename `MOGO_URL` to `MONGO_URL`, add real DB password, add `PORT=5000`, add `GEMINI_API_KEY`
2. **Member 2**: Write `server.js` (30 lines of code — Express + CORS + dotenv + routes + port listen)
3. **Member 2**: Create `src/config/db.js` (10 lines — Mongoose connect)
4. **Member 1**: Run `npm create vite@latest frontend -- --template react` to init React
5. **Member 3**: Get free Gemini API key at `https://aistudio.google.com`
6. **All**: Create GitHub feature branches and start coding

---

_Audit completed by: Antigravity AI | June 19, 2026_

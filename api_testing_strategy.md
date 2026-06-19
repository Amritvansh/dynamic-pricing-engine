# 🧪 API Testing Strategy

> **Project:** Dynamic Pricing Engine
> **Focus:** Ensuring data integrity, rule precision, and AI fallback gracefully.

---

## 1. Postman Testing Workflow (End-to-End)

To ensure the system works coherently, you must run your API tests in the following sequence. This mimics the actual user flow of the application.

1. **Create Product (`POST /api/products`)**: Capture the returned `_id` and set it as the `{{productId}}` environment variable in Postman.
2. **Add Inventory (`POST /api/inventory`)**: Use the `{{productId}}`. Set stock to a "LOW" value (e.g., `5`).
3. **Add Competitor (`POST /api/competitor-prices`)**: Add a competitor price that is intentionally lower (e.g., `749` when base is `799`).
4. **Trigger Engine (`POST /api/calculate-price`)**: Send a demand score.
5. **Verify AI & Math**: Check the JSON response to ensure the rules fired correctly and the AI generated an explanation.

---

## 2. Unit Testing the Pricing Engine Logic

The core logic resides in `/api/calculate-price`. You must simulate specific conditions to guarantee the math is working.

### Scenario A: High Scarcity & High Demand (Premium Pricing)
- **Inventory:** 5 (LOW)
- **Demand:** 85 (HIGH)
- **Competitors:** None
- **Expected Result:** `+10%` adjustment. Rules applied array must include `"High demand + Low inventory"`.

### Scenario B: Excess Stock & Low Demand (Clearance Pricing)
- **Inventory:** 100 (HIGH)
- **Demand:** 20 (LOW)
- **Competitors:** None
- **Expected Result:** `-10%` adjustment. Rules applied array must include `"Oversupply + Low demand"`.

### Scenario C: Market Competition
- **Current Price:** ₹799
- **Competitor Average:** ₹700 (Cheaper by >5%)
- **Expected Result:** `-5%` adjustment. Rules applied array must include `"Competitor price lower"`.

### Scenario D: Guardrail Limits
- Apply massive negative adjustments to force the price down.
- **Expected Result:** The price never drops below `70%` of the base price.

---

## 3. Edge Case Handling

Your tests must actively try to "break" the system:

1. **Zero Inventory (`0`):** Should strictly classify as "LOW" and not crash or divide by zero.
2. **Missing Product:** Sending a valid `ObjectId` that doesn't exist in the DB to `calculate-price` should return a clean `404 Not Found`.
3. **No Competitor Data:** Calculating a price when the competitor array is empty should skip the competitor rule entirely and apply the remaining rules.
4. **Invalid Demand Score (`150` or `-10`):** Should be caught by the validator and return `400 Bad Request`.

---

## 4. AI Failure & Resilience Testing

The AI component (Gemini/OpenAI) relies on an external network call, which can fail, timeout, or hit rate limits.

**How to test resilience:**
1. Temporarily change your `GEMINI_API_KEY` in your `.env` to an invalid string.
2. Hit `POST /api/calculate-price`.
3. **Expected Behavior:** The API should **NOT** return a 500 error. The calculation must still succeed, and `aiExplanation` should contain a default fallback string (e.g., *"Price calculated based on internal business rules. AI explanation unavailable."*).

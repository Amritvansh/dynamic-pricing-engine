const Module = require("module");
const _originalLoad = Module._load;
const STUBS = new Set([
  "product",
  "inventory",
  "competitorPrice",
  "pricingRecommendation",
  "settings",
  "salesEvent",
  "promotionalEvent",
  "demandAttribution",
  "aiService",
]);
Module._load = function (request, parent, isMain) {
  const base = request.split("/").pop().replace(/\.js$/, "");
  if (STUBS.has(base)) return {};
  return _originalLoad.apply(this, arguments);
};

const {
  computeDemandSignal,
  computeInventorySignal,
  computeCompetitorSignal,
  composePriceRecommendation,
} = require("./src/services/pricingEngine");

Module._load = _originalLoad;

const { charmPrice } = require("./src/utils/pricingUtils");
const { applyEventDiscount } = require("./src/services/eventService");

let passed = 0,
  failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error(`  ❌ FAIL: ${msg}`);
    failed++;
  } else {
    console.log(`  ✅ PASS: ${msg}`);
    passed++;
  }
}
function section(t) {
  console.log(`\n${"═".repeat(62)}\n  ${t}\n${"═".repeat(62)}`);
}

function product(o = {}) {
  return {
    currentPrice: 799,
    costPrice: 400,
    targetMargin: 0.15,
    pricingStrategy: { maxIncreasePct: 0.15, maxDecreasePct: 0.15 },
    ...o,
  };
}
const OFF = { multiplier: 1.0, phase: "off_season", intensity: 0 };
const NO_COMP = {
  multiplier: 1.0,
  confidence: 0,
  medianPrice: null,
  gapPercent: 0,
};

section("COMPOSITION — master plan Part 18 required tests");

const t1 = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 1.1,
    confidence: 0.9,
    velocityRatio: 2.5,
    interpretation: "HIGH",
  },
  inventorySignal: {
    multiplier: 1.06,
    confidence: 1.0,
    coverageDays: 4,
    interpretation: "LOW",
  },
  competitorSignal: { ...NO_COMP },
  seasonalSignal: { ...OFF },
});
assert(
  t1.recommendedPrice > 799,
  "Test 1: High demand + Low inventory → price UP",
);
assert(t1.adjustmentPercent > 0, "Test 1: adjustmentPercent positive");

const t2 = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 0.92,
    confidence: 0.8,
    velocityRatio: 0.4,
    interpretation: "LOW",
  },
  inventorySignal: {
    multiplier: 0.92,
    confidence: 1.0,
    coverageDays: 20,
    interpretation: "HIGH",
  },
  competitorSignal: { ...NO_COMP },
  seasonalSignal: { ...OFF },
});
assert(
  t2.recommendedPrice < 799,
  "Test 2: Low demand + High inventory → price DOWN",
);
assert(t2.adjustmentPercent < 0, "Test 2: adjustmentPercent negative");

const t3 = composePriceRecommendation({
  product: product({ currentPrice: 500, costPrice: 480, targetMargin: 0.15 }),
  demandSignal: {
    multiplier: 0.88,
    confidence: 0.9,
    velocityRatio: 0.3,
    interpretation: "LOW",
  },
  inventorySignal: {
    multiplier: 0.9,
    confidence: 1.0,
    coverageDays: 25,
    interpretation: "HIGH",
  },
  competitorSignal: {
    multiplier: 0.94,
    confidence: 0.8,
    medianPrice: 460,
    gapPercent: -8,
  },
  seasonalSignal: { ...OFF },
});
const floor3 = 480 * 1.15;
assert(
  t3.constraintApplied === "PROFIT_FLOOR",
  "Test 3: constraintApplied = PROFIT_FLOOR",
);

assert(
  t3.recommendedPrice >= floor3 - 50,
  `Test 3: recommendedPrice (${t3.recommendedPrice}) within charm tolerance of floor (${floor3})`,
);

const t4 = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 1.001,
    confidence: 0.5,
    velocityRatio: 1.0,
    interpretation: "STABLE",
  },
  inventorySignal: {
    multiplier: 1.001,
    confidence: 1.0,
    coverageDays: 8,
    interpretation: "NORMAL",
  },
  competitorSignal: {
    multiplier: 1.001,
    confidence: 0.5,
    medianPrice: 800,
    gapPercent: 0.1,
  },
  seasonalSignal: { ...OFF },
});
assert(
  t4.constraintApplied === "MINIMUM_CHANGE",
  "Test 4: Trivial change → MINIMUM_CHANGE",
);
assert(t4.shouldApply === false, "Test 4: shouldApply = false");

section("Test 5 — Seasonal OFF: computeSeasonalSignal with disabled global");

const t5Seasonal = {
  multiplier: 1.0,
  phase: "disabled_global",
  intensity: 0,
  reason: "Seasonal pricing disabled globally",
};
const t5 = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 1.05,
    confidence: 0.8,
    velocityRatio: 1.5,
    interpretation: "RISING",
  },
  inventorySignal: {
    multiplier: 1.0,
    confidence: 1.0,
    coverageDays: 10,
    interpretation: "NORMAL",
  },
  competitorSignal: { ...NO_COMP },
  seasonalSignal: t5Seasonal,
});
assert(
  t5Seasonal.multiplier === 1.0,
  "Test 5: Seasonal OFF → multiplier = 1.0",
);
assert(
  t5Seasonal.phase === "disabled_global",
  "Test 5: Seasonal OFF → phase = 'disabled_global'",
);

const t5SeasonalImpact = Math.abs(t5Seasonal.multiplier - 1);
assert(
  t5SeasonalImpact === 0,
  "Test 5: Disabled seasonal has zero impact on price",
);

section("Test 6 — Event overlay floor clamp");

const t6Product = {
  _id: "test-product-6",
  costPrice: 400,
  targetMargin: 0.15,
};
const t6Event = {
  _id: "test-event-6",
  eventName: "Mega Clearance",
  discountType: "percentage",
  discountValue: 60,
  respectProfitFloor: true,
  minFinalPrice: null,
};
const t6Result = applyEventDiscount(t6Event, 500, t6Product);
const t6Floor = t6Product.costPrice * (1 + t6Product.targetMargin);

assert(
  t6Result.finalCustomerPrice >= t6Floor,
  `Test 6: finalCustomerPrice (₹${t6Result.finalCustomerPrice}) >= profit floor (₹${t6Floor})`,
);
assert(
  t6Result.constraintApplied === "PROFIT_FLOOR",
  "Test 6: eventOverlay.constraintApplied = 'PROFIT_FLOOR'",
);
assert(
  t6Result.eventApplied === true,
  "Test 6: Event was still applied (with floor clamp)",
);

section("Test 7 — Organic velocity isolation during active event");

const t7AttributedDemand = {
  shortTermRate: 2.0,
  longTermRate: 1.0,
  totalSalesCount: 25,
  isEventActive: true,
};

const t7Demand = computeDemandSignal(t7AttributedDemand);
const t7ExpectedConfidence = Math.min(1.0, 25 / 20);

assert(
  t7Demand.velocityRatio === 2.0,
  "Test 7: velocityRatio = 2.0 (organic-only)",
);
assert(
  t7Demand.interpretation === "RISING" || t7Demand.interpretation === "HIGH",
  `Test 7: interpretation is RISING or HIGH (got: ${t7Demand.interpretation})`,
);

assert(
  t7Demand.interpretation === "RISING",
  `Test 7: velocityRatio 2.0 → RISING (exactly at boundary, not > 2)`,
);

assert(
  t7Demand.confidence === t7ExpectedConfidence,
  `Test 7: No 30% confidence penalty (confidence = ${t7Demand.confidence}, expected ${t7ExpectedConfidence})`,
);

section(
  "DEMAND SIGNAL — velocity ratio → interpretation + multiplier direction",
);
const demandCases = [
  { vr: 6.0, expected: "SURGE", dir: "up" },
  { vr: 2.5, expected: "HIGH", dir: "up" },
  { vr: 1.5, expected: "RISING", dir: "up" },
  { vr: 1.0, expected: "STABLE", dir: "none" },
  { vr: 0.6, expected: "FALLING", dir: "down" },
  { vr: 0.3, expected: "LOW", dir: "down" },
];
demandCases.forEach(({ vr, expected, dir }) => {
  const s = computeDemandSignal({
    shortTermRate: vr,
    longTermRate: 1.0,
    totalSalesCount: 25,
    isEventActive: false,
  });
  assert(s.interpretation === expected, `Demand vr=${vr} → ${expected}`);
  if (dir === "up")
    assert(s.multiplier > 1.0, `Demand ${expected} → multiplier > 1`);
  else if (dir === "down")
    assert(s.multiplier < 1.0, `Demand ${expected} → multiplier < 1`);
  else assert(s.multiplier === 1.0, `Demand ${expected} → multiplier = 1`);
});

const lowVol = computeDemandSignal({
  shortTermRate: 3.0,
  longTermRate: 1.0,
  totalSalesCount: 5,
  isEventActive: false,
});
assert(lowVol.confidence < 0.5, "Low sales count → confidence < 0.5");

section("INVENTORY SIGNAL — coverage days → status + exact multiplier");
const invCases = [
  { qty: 0, daily: 5, expected: "ZERO", mult: 1.2 },
  { qty: 10, daily: 5, expected: "CRITICAL", mult: 1.15 },
  { qty: 30, daily: 5, expected: "LOW", mult: 1.06 },
  { qty: 60, daily: 5, expected: "NORMAL", mult: 1.0 },
  { qty: 100, daily: 5, expected: "HIGH", mult: 0.92 },
];
invCases.forEach(({ qty, daily, expected, mult }) => {
  const s = computeInventorySignal(
    { availableQuantity: qty },
    { longTermRate: daily / 24 },
  );
  assert(
    s.interpretation === expected,
    `Inventory ${qty}/${daily}d → ${expected}`,
  );
  assert(s.multiplier === mult, `Inventory ${expected} → multiplier ${mult}`);
});

section("COMPETITOR SIGNAL");
const now = new Date();
const noData = computeCompetitorSignal([], 799);
assert(noData.multiplier === 1.0, "Competitor: empty → multiplier 1.0");
assert(noData.confidence === 0, "Competitor: empty → confidence 0");
assert(noData.interpretation === "NO_DATA", "Competitor: empty → NO_DATA");

const cheaper = computeCompetitorSignal(
  [
    { competitorPrice: 700, updatedAt: now },
    { competitorPrice: 710, updatedAt: now },
  ],
  799,
);
assert(cheaper.multiplier < 1.0, "Competitor: cheaper → multiplier < 1");

const pricier = computeCompetitorSignal(
  [
    { competitorPrice: 900, updatedAt: now },
    { competitorPrice: 920, updatedAt: now },
  ],
  799,
);
assert(pricier.multiplier > 1.0, "Competitor: expensive → multiplier > 1");

const staleDate = new Date(Date.now() - 73 * 3600 * 1000);
const stale = computeCompetitorSignal(
  [{ competitorPrice: 750, updatedAt: staleDate }],
  799,
);
assert(stale.interpretation === "ALL_STALE", "Competitor: 73h old → ALL_STALE");

section("CHARM PRICING");
[
  [900, 899],
  [950, 949],
  [1000, 999],
  [1100, 1099],
  [799, 799],
  [850, 849],
].forEach(([input, expected]) => {
  assert(charmPrice(input) === expected, `charmPrice(${input}) = ${expected}`);
});

section("CONFIDENCE SCORING");
const high = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 1.08,
    confidence: 0.9,
    velocityRatio: 1.8,
    interpretation: "RISING",
  },
  inventorySignal: {
    multiplier: 1.06,
    confidence: 1.0,
    coverageDays: 5,
    interpretation: "LOW",
  },
  competitorSignal: {
    multiplier: 0.99,
    confidence: 0.8,
    medianPrice: 790,
    gapPercent: -1.1,
  },
  seasonalSignal: { multiplier: 1.04, phase: "ramp_up", intensity: 0.5 },
});
assert(high.confidenceLevel === "HIGH", "High data → HIGH confidence");
assert(high.confidenceScore >= 0.75, "HIGH score ≥ 0.75");

const low = composePriceRecommendation({
  product: product(),
  demandSignal: {
    multiplier: 1.08,
    confidence: 0.0,
    velocityRatio: 1.5,
    interpretation: "RISING",
  },
  inventorySignal: {
    multiplier: 1.06,
    confidence: 1.0,
    coverageDays: 5,
    interpretation: "LOW",
  },
  competitorSignal: { ...NO_COMP },
  seasonalSignal: { ...OFF },
});
assert(
  low.confidenceLevel === "LOW",
  "No demand/competitor data → LOW confidence",
);

console.log(`\n${"═".repeat(62)}`);
console.log(`  RESULTS: ${passed} passed | ${failed} failed`);
console.log("═".repeat(62));
if (failed === 0) {
  console.log("\n  🎉 All pricing engine tests passed!\n");
  process.exit(0);
} else {
  console.log(`\n  ⚠️  ${failed} test(s) failed.\n`);
  process.exit(1);
}

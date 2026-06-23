const Product = require("../models/product");
const Inventory = require("../models/inventory");
const CompetitorPrice = require("../models/competitorPrice");
const PricingRecommendation = require("../models/pricingRecommendation");
const Settings = require("../models/settings");
const { computeAttributedDemand } = require("./demandAttribution");
const eventService = require("./eventService");
const aiService = require("./aiService");
const { charmPrice, getDayOfYear } = require("../utils/pricingUtils");

async function runPricingEngine(
  productId,
  referenceDate = new Date(),
  triggeredBy = "manual",
) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive)
    throw new Error("Product not found or inactive");

  const inventory = await Inventory.findOne({ productId });
  if (!inventory) throw new Error("Inventory record not found");

  const competitors = await CompetitorPrice.find({ productId });

  const attributedDemand = await computeAttributedDemand(
    productId,
    referenceDate,
  );
  const demandSignal = computeDemandSignal(attributedDemand);
  const inventorySignal = computeInventorySignal(inventory, attributedDemand);
  const competitorSignal = computeCompetitorSignal(
    competitors,
    product.currentPrice,
  );
  const seasonalSignal = await computeSeasonalSignal(product, referenceDate);

  const recommendation = composePriceRecommendation({
    product,
    demandSignal,
    inventorySignal,
    competitorSignal,
    seasonalSignal,
  });

  let eventOverlay = { eventApplied: false };
  const activeEvent = await eventService.findActiveEventForProduct(
    product,
    referenceDate,
  );

  if (activeEvent) {
    eventOverlay = eventService.applyEventDiscount(
      activeEvent,
      recommendation.recommendedPrice,
      product,
    );
  }

  let aiExplanation = { text: null, failed: false };
  try {
    aiExplanation = await aiService.generateExplanation({
      product,
      recommendation,
      demandSignal,
      inventorySignal,
      competitorSignal,
      seasonalSignal,
      eventOverlay,
    });
  } catch (e) {
    aiExplanation = { text: null, failed: true, failureReason: e.message };
  }

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
      competitorPrices: competitors.map((c) => ({
        competitorName: c.competitorName,
        price: c.competitorPrice,
        recordedAt: c.recordedAt,
      })),
    },
    signals: {
      demand: {
        ...demandSignal,
        organicRate: attributedDemand.organicShortTermRate,
        promoRate: attributedDemand.promoShortTermRate,
      },
      inventory: inventorySignal,
      competitor: competitorSignal,
      seasonal: seasonalSignal,
    },
    outcome: recommendation,
    eventOverlay: activeEvent ? eventOverlay : undefined,
    aiExplanation,
    status: "PENDING",
    triggeredBy,
  });

  await Product.findByIdAndUpdate(productId, { lastPricedAt: new Date() });

  return { ...decision.toObject(), product, eventOverlay };
}

function computeDemandSignal(attributedDemand) {
  const { shortTermRate, longTermRate, totalSalesCount, isEventActive } =
    attributedDemand;
  const velocityRatio = longTermRate > 0 ? shortTermRate / longTermRate : 1.0;

  let confidence = Math.min(1.0, totalSalesCount / 20);

  let interpretation, baseMultiplier;
  if (velocityRatio > 5) {
    interpretation = "SURGE";
    baseMultiplier = 1.15;
  } else if (velocityRatio > 2) {
    interpretation = "HIGH";
    baseMultiplier = 1.1;
  } else if (velocityRatio > 1.2) {
    interpretation = "RISING";
    baseMultiplier = 1.05;
  } else if (velocityRatio > 0.8) {
    interpretation = "STABLE";
    baseMultiplier = 1.0;
  } else if (velocityRatio > 0.5) {
    interpretation = "FALLING";
    baseMultiplier = 0.96;
  } else {
    interpretation = "LOW";
    baseMultiplier = 0.92;
  }

  if (isEventActive && velocityRatio >= 0.8 && velocityRatio <= 1.2) {
    confidence *= 0.7;
  }

  const multiplier = 1.0 + (baseMultiplier - 1.0) * confidence;

  return { multiplier, confidence, velocityRatio, interpretation };
}

function computeInventorySignal(inventory, attributedDemand) {
  const { availableQuantity } = inventory;

  const emaDailySales = attributedDemand.longTermRate * 24 || 1;

  const coverageDays = availableQuantity / emaDailySales;

  let interpretation, multiplier;
  if (coverageDays === 0) {
    interpretation = "ZERO";
    multiplier = 1.2;
  } else if (coverageDays < 3) {
    interpretation = "CRITICAL";
    multiplier = 1.15;
  } else if (coverageDays < 7) {
    interpretation = "LOW";
    multiplier = 1.06;
  } else if (coverageDays < 15) {
    interpretation = "NORMAL";
    multiplier = 1.0;
  } else {
    interpretation = "HIGH";
    multiplier = 0.92;
  }

  return {
    multiplier,
    confidence: 1.0,
    coverageDays: parseFloat(coverageDays.toFixed(1)),
    interpretation,
  };
}

function computeCompetitorSignal(competitorRecords, ourPrice) {
  if (!competitorRecords || competitorRecords.length === 0) {
    return {
      multiplier: 1.0,
      confidence: 0,
      medianPrice: null,
      gapPercent: 0,
      interpretation: "NO_DATA",
    };
  }

  const now = Date.now();

  const fresh = competitorRecords
    .map((r) => ({
      price: r.competitorPrice,
      age: (now - new Date(r.updatedAt)) / 3600000,
    }))
    .filter((r) => r.age <= 72)
    .map((r) => ({ price: r.price, weight: 1 - r.age / 72 }));

  if (fresh.length === 0) {
    return {
      multiplier: 1.0,
      confidence: 0,
      medianPrice: null,
      gapPercent: 0,
      interpretation: "ALL_STALE",
    };
  }

  const prices = fresh.map((r) => r.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor(prices.length * 0.25)] ?? prices[0];
  const q3 =
    prices[Math.floor(prices.length * 0.75)] ?? prices[prices.length - 1];
  const iqr = q3 - q1;
  const inliers = fresh.filter(
    (r) => r.price >= q1 - 1.5 * iqr && r.price <= q3 + 1.5 * iqr,
  );
  const medianPrice =
    inliers[Math.floor(inliers.length / 2)]?.price ?? ourPrice;

  const gapPercent = ((medianPrice - ourPrice) / ourPrice) * 100;

  const rawInfluence = gapPercent * 0.4;
  const clampedInfluence = Math.max(-8, Math.min(8, rawInfluence));
  const multiplier = 1.0 + clampedInfluence / 100;

  let interpretation;
  if (gapPercent > 5) interpretation = "COMPETITORS_EXPENSIVE";
  else if (gapPercent > 1) interpretation = "SLIGHTLY_EXPENSIVE";
  else if (gapPercent > -1) interpretation = "NEAR_PARITY";
  else if (gapPercent > -5) interpretation = "SLIGHTLY_CHEAPER";
  else interpretation = "COMPETITORS_CHEAPER";

  return {
    multiplier,
    confidence: Math.min(1, inliers.length / 5),
    medianPrice,
    gapPercent: parseFloat(gapPercent.toFixed(2)),
    interpretation,
  };
}

async function computeSeasonalSignal(product, referenceDate) {
  const globalSetting = await Settings.findOne({
    key: "seasonalPricingEnabled",
  });
  if (!globalSetting || globalSetting.value === false) {
    return {
      multiplier: 1.0,
      phase: "disabled_global",
      intensity: 0,
      reason: "Seasonal pricing disabled globally",
    };
  }

  const disabledCats = await Settings.findOne({
    key: "seasonalDisabledCategories",
  });
  if (
    disabledCats &&
    Array.isArray(disabledCats.value) &&
    disabledCats.value.includes(product.category)
  ) {
    return {
      multiplier: 1.0,
      phase: "disabled_category",
      intensity: 0,
      reason: `Seasonal pricing disabled for ${product.category}`,
    };
  }

  const sc = product.seasonalConfig;
  if (!sc || sc.season === "none") {
    return { multiplier: 1.0, phase: "off_season", intensity: 0 };
  }

  const doy = getDayOfYear(referenceDate);
  const startDoy = getDayOfYear(sc.startDate);
  const peakDoy = getDayOfYear(sc.peakDate);
  const endDoy = getDayOfYear(sc.endDate);
  const maxBoost = sc.maxBoost || 0.12;
  const sigmoid = (x) => 1 / (1 + Math.exp(-10 * (x - 0.5)));

  if (doy >= startDoy && doy <= peakDoy) {
    const progress = (doy - startDoy) / (peakDoy - startDoy || 1);
    const intensity = sigmoid(progress);
    return {
      multiplier: 1.0 + maxBoost * intensity,
      phase: "ramp_up",
      intensity,
      season: sc.season,
    };
  }
  if (doy > peakDoy && doy <= endDoy) {
    const progress = (doy - peakDoy) / (endDoy - peakDoy || 1);
    const intensity = 1 - sigmoid(progress);
    return {
      multiplier: 1.0 + maxBoost * intensity,
      phase: "ramp_down",
      intensity,
      season: sc.season,
    };
  }
  return { multiplier: 1.0, phase: "off_season", intensity: 0 };
}

function composePriceRecommendation({
  product,
  demandSignal,
  inventorySignal,
  competitorSignal,
  seasonalSignal,
}) {
  const { currentPrice, costPrice, targetMargin, pricingStrategy } = product;

  const rawMultiplier =
    demandSignal.multiplier *
    inventorySignal.multiplier *
    competitorSignal.multiplier *
    seasonalSignal.multiplier;

  const maxUp = 1 + (pricingStrategy?.maxIncreasePct || 0.15);
  const maxDown = 1 - (pricingStrategy?.maxDecreasePct || 0.15);
  const finalMultiplier = Math.max(maxDown, Math.min(maxUp, rawMultiplier));

  let recommendedPrice = currentPrice * finalMultiplier;
  let constraintApplied = "NONE";

  const profitFloor = costPrice * (1 + targetMargin);
  if (recommendedPrice < profitFloor) {
    recommendedPrice = profitFloor;
    constraintApplied = "PROFIT_FLOOR";
  }

  const priceCeiling = currentPrice * 1.5;
  if (recommendedPrice > priceCeiling) {
    recommendedPrice = priceCeiling;
    constraintApplied = "CEILING";
  }

  const changePercent =
    Math.abs(recommendedPrice - currentPrice) / currentPrice;
  if (changePercent < 0.01) {
    recommendedPrice = currentPrice;
    constraintApplied = "MINIMUM_CHANGE";
  }

  recommendedPrice = charmPrice(Math.round(recommendedPrice));

  const confidenceScore = parseFloat(
    (
      0.4 * demandSignal.confidence +
      0.3 * inventorySignal.confidence +
      0.2 * (competitorSignal.confidence || 0) +
      0.1 * 1.0
    ).toFixed(2),
  );

  const confidenceLevel =
    confidenceScore >= 0.75
      ? "HIGH"
      : confidenceScore >= 0.5
        ? "MEDIUM"
        : "LOW";
  const shouldApply =
    confidenceScore >= 0.5 && constraintApplied !== "MINIMUM_CHANGE";

  const signalList = [
    { name: "demand", impact: Math.abs(demandSignal.multiplier - 1) },
    { name: "inventory", impact: Math.abs(inventorySignal.multiplier - 1) },
    { name: "competitor", impact: Math.abs(competitorSignal.multiplier - 1) },
    {
      name: "seasonal",
      impact: seasonalSignal.phase?.startsWith("disabled")
        ? 0
        : Math.abs(seasonalSignal.multiplier - 1),
    },
  ].sort((a, b) => b.impact - a.impact);
  const primaryDriver = signalList[0].name;

  return {
    rawMultiplier: parseFloat(rawMultiplier.toFixed(4)),
    finalMultiplier: parseFloat(finalMultiplier.toFixed(4)),
    recommendedPrice,
    adjustmentPercent: parseFloat(
      (((recommendedPrice - currentPrice) / currentPrice) * 100).toFixed(2),
    ),
    confidenceScore,
    confidenceLevel,
    shouldApply,
    constraintApplied,
    primaryDriver,
  };
}

module.exports = {
  runPricingEngine,
  computeDemandSignal,
  computeInventorySignal,
  computeCompetitorSignal,
  computeSeasonalSignal,
  composePriceRecommendation,
};

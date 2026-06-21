const PricingRecommendation = require("../models/pricingRecommendation");
const Product = require("../models/product");
const { runPricingEngine } = require("../services/pricingEngine");
const { sendSuccess, sendError } = require("../utils/apiResponse");

const calculatePrice = async (req, res) => {
  const { productId, triggeredBy = "manual", referenceDate } = req.body;

  if (!productId) {
    return sendError(res, "productId is required", 400);
  }

  const refDate = referenceDate ? new Date(referenceDate) : new Date();
  if (isNaN(refDate.getTime())) {
    return sendError(
      res,
      "Invalid referenceDate — use ISO 8601 format (e.g. 2026-06-22T10:00:00Z)",
      400,
    );
  }

  const result = await runPricingEngine(productId, refDate, triggeredBy);
  const { product, eventOverlay } = result;
  const snap = result.inputSnapshot;
  const outcome = result.outcome;
  const signals = result.signals;

  const adjustmentStr =
    outcome.adjustmentPercent > 0
      ? `+${outcome.adjustmentPercent}`
      : String(outcome.adjustmentPercent);

  const priceDiff = outcome.recommendedPrice - snap.currentPrice;
  const headline =
    priceDiff > 0
      ? `Price increase recommended: +₹${priceDiff} (${adjustmentStr}%)`
      : priceDiff < 0
        ? `Price decrease recommended: -₹${Math.abs(priceDiff)} (${adjustmentStr}%)`
        : "No price change needed";

  return sendSuccess(res, {
    decisionId: result._id,

    product: {
      name: product.productName,
      sku: product.sku,
      category: product.category,
      tier: product.tier,
    },

    pricing: {
      currentPrice: snap.currentPrice,
      recommendedPrice: outcome.recommendedPrice,
      adjustmentPercent: adjustmentStr,
      profitFloor: snap.costPrice
        ? parseFloat(
            (snap.costPrice * (1 + (product.targetMargin || 0.15))).toFixed(2),
          )
        : null,
      priceCeiling: parseFloat((snap.currentPrice * 1.5).toFixed(2)),
      constraintApplied: outcome.constraintApplied,
    },

    signals: {
      demand: {
        multiplier: signals.demand.multiplier,
        velocityRatio: signals.demand.velocityRatio,
        interpretation: signals.demand.interpretation,
        confidence: signals.demand.confidence,
        organicRate: signals.demand.organicRate,
        promoRate: signals.demand.promoRate,
      },
      inventory: {
        multiplier: signals.inventory.multiplier,
        coverageDays: signals.inventory.coverageDays,
        interpretation: signals.inventory.interpretation,
        confidence: signals.inventory.confidence,
      },
      competitor: {
        multiplier: signals.competitor.multiplier,
        medianPrice: signals.competitor.medianPrice,
        gapPercent: signals.competitor.gapPercent,
        interpretation: signals.competitor.interpretation,
        confidence: signals.competitor.confidence,
      },
      seasonal: {
        multiplier: signals.seasonal.multiplier,
        phase: signals.seasonal.phase,
        intensity: signals.seasonal.intensity,
        season: signals.seasonal.season || null,
      },
    },

    decision: {
      finalMultiplier: outcome.finalMultiplier,
      confidenceScore: outcome.confidenceScore,
      confidenceLevel: outcome.confidenceLevel,
      shouldApply: outcome.shouldApply,
      primaryDriver: outcome.primaryDriver,
    },

    eventOverlay: eventOverlay.eventApplied
      ? {
          eventApplied: true,
          eventName: eventOverlay.eventName,
          discountType: eventOverlay.discountType,
          discountValue: eventOverlay.discountValue,
          priceBeforeDiscount: eventOverlay.priceBeforeDiscount,
          priceAfterDiscount: eventOverlay.priceAfterDiscount,
          finalCustomerPrice: eventOverlay.priceAfterDiscount,
          constraintApplied: eventOverlay.constraintApplied,
        }
      : { eventApplied: false },

    explanation: {
      aiText: result.aiExplanation?.text || null,
      headline,
      primaryDriver: outcome.primaryDriver,
      whatWouldChangeThis: _whatWouldChangeThis(signals),
    },

    status: result.status,
  });
};

const applyRecommendation = async (req, res) => {
  const { decisionId } = req.params;
  const { applyWithDiscount = false } = req.body;

  const decision = await PricingRecommendation.findById(decisionId);
  if (!decision) return sendError(res, "Recommendation not found", 404);
  if (decision.status !== "PENDING") {
    return sendError(
      res,
      `Cannot apply — recommendation is already ${decision.status}`,
      400,
    );
  }

  const priceToApply =
    applyWithDiscount && decision.eventOverlay?.priceAfterDiscount
      ? decision.eventOverlay.priceAfterDiscount
      : decision.outcome.recommendedPrice;

  await Product.findByIdAndUpdate(decision.productId, {
    currentPrice: priceToApply,
  });

  decision.status = "APPLIED";
  decision.appliedAt = new Date();
  await decision.save();

  return sendSuccess(res, {
    decisionId: decision._id,
    status: "APPLIED",
    priceApplied: priceToApply,
    appliedAt: decision.appliedAt,
  });
};

const rejectRecommendation = async (req, res) => {
  const { decisionId } = req.params;
  const { reason = "" } = req.body;

  const decision = await PricingRecommendation.findById(decisionId);
  if (!decision) return sendError(res, "Recommendation not found", 404);
  if (decision.status !== "PENDING") {
    return sendError(
      res,
      `Cannot reject — recommendation is already ${decision.status}`,
      400,
    );
  }

  decision.status = "REJECTED";
  decision.rejectedReason = reason;
  await decision.save();

  return sendSuccess(res, { decisionId: decision._id, status: "REJECTED" });
};

const getRecommendations = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const filter = {};
  if (req.query.status) filter.status = req.query.status.toUpperCase();

  const [records, total] = await Promise.all([
    PricingRecommendation.find(filter)
      .populate("productId", "productName sku category currentPrice")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    PricingRecommendation.countDocuments(filter),
  ]);

  return sendSuccess(res, { total, page, limit, records });
};

const getProductRecommendations = async (req, res) => {
  const { productId } = req.params;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

  const records = await PricingRecommendation.find({ productId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return sendSuccess(res, records);
};

function _whatWouldChangeThis(signals) {
  const bullets = [];
  const inv = signals?.inventory;
  const dem = signals?.demand;
  const comp = signals?.competitor;
  const seas = signals?.seasonal;

  if (inv?.interpretation === "LOW" || inv?.interpretation === "CRITICAL") {
    bullets.push(
      `If inventory coverage rises above 7 days → upward inventory pressure removed`,
    );
  }
  if (
    dem?.interpretation === "RISING" ||
    dem?.interpretation === "HIGH" ||
    dem?.interpretation === "SURGE"
  ) {
    bullets.push(`If demand velocity falls below 1× baseline → neutral signal`);
  }
  if (comp?.gapPercent !== undefined && Math.abs(comp.gapPercent) < 5) {
    bullets.push(
      `If competitor undercuts by more than 5% → downward competitive pressure activates`,
    );
  }
  if (seas?.phase === "off_season" || seas?.phase?.startsWith("disabled")) {
    bullets.push(
      `If seasonal pricing is enabled and product enters its peak season → upward seasonal boost applies`,
    );
  }

  return bullets.length > 0
    ? bullets
    : ["No significant threshold changes detected near current signal values"];
}

module.exports = {
  calculatePrice,
  applyRecommendation,
  rejectRecommendation,
  getRecommendations,
  getProductRecommendations,
};

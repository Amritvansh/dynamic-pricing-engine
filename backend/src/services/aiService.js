async function generateExplanation({
  product,
  recommendation,
  demandSignal,
  inventorySignal,
  competitorSignal,
  seasonalSignal,
  eventOverlay,
}) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      text: _fallbackText(
        product,
        recommendation,
        demandSignal,
        inventorySignal,
        eventOverlay,
      ),
      model: "fallback",
      failed: false,
      failureReason: null,
      generatedAt: new Date(),
    };
  }

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt = `
You are a pricing analyst for an Indian e-commerce platform.
Explain this pricing recommendation in 2-3 clear sentences for a business manager.

Product: ${product.productName} (${product.category}, ${product.tier} tier)
Current Price: ₹${product.currentPrice}
Recommended Price: ₹${recommendation.recommendedPrice}
Change: ${recommendation.adjustmentPercent > 0 ? "+" : ""}${recommendation.adjustmentPercent}%

Demand: ${demandSignal.interpretation} (velocity ${(demandSignal.velocityRatio || 0).toFixed(2)}× baseline)
Inventory: ${inventorySignal.interpretation} (${inventorySignal.coverageDays} days coverage)
Competitor: ${competitorSignal.interpretation} (median: ₹${competitorSignal.medianPrice ?? "N/A"})
Seasonal: ${seasonalSignal.phase} (${product.seasonalConfig?.season ?? "none"})
Confidence: ${recommendation.confidenceLevel} (${recommendation.confidenceScore})`;

    if (eventOverlay?.eventApplied) {
      prompt += `\nActive Event: ${eventOverlay.eventName} — ${eventOverlay.discountValue}% discount applied, customer price ₹${eventOverlay.priceAfterDiscount} (before discount: ₹${eventOverlay.priceBeforeDiscount})`;
    }

    prompt += `

Rules: Plain English, no jargon, mention 1-2 most important signals, currency in ₹, max 3 sentences.`;

    prompt = prompt.trim();

    const result = await model.generateContent(prompt);
    return {
      text: result.response.text(),
      model: "gemini-2.0-flash",
      failed: false,
      failureReason: null,
      generatedAt: new Date(),
    };
  } catch (err) {
    return {
      text: _fallbackText(
        product,
        recommendation,
        demandSignal,
        inventorySignal,
        eventOverlay,
      ),
      model: "fallback",
      failed: true,
      failureReason: err.message,
      generatedAt: new Date(),
    };
  }
}

function _fallbackText(
  product,
  recommendation,
  demandSignal,
  inventorySignal,
  eventOverlay,
) {
  const direction =
    recommendation.adjustmentPercent > 0
      ? "increase"
      : recommendation.adjustmentPercent < 0
        ? "decrease"
        : "maintain";

  let text;
  if (direction === "maintain") {
    text =
      `The price for ${product.productName} remains at ₹${product.currentPrice}. ` +
      `Market signals show ${(demandSignal.interpretation || "stable").toLowerCase()} demand ` +
      `with ${(inventorySignal.interpretation || "normal").toLowerCase()} inventory — no meaningful change is warranted.`;
  } else {
    const adj = Math.abs(recommendation.adjustmentPercent).toFixed(1);
    text =
      `The recommended price for ${product.productName} is ₹${recommendation.recommendedPrice} ` +
      `(${direction === "increase" ? "+" : "-"}${adj}%). ` +
      `Demand is ${(demandSignal.interpretation || "stable").toLowerCase()} ` +
      `with ${(inventorySignal.interpretation || "normal").toLowerCase()} inventory ` +
      `(${inventorySignal.coverageDays} days of stock), driving this ${direction} recommendation ` +
      `with ${(recommendation.confidenceLevel || "medium").toLowerCase()} confidence.`;
  }

  if (eventOverlay?.eventApplied) {
    text +=
      ` The active "${eventOverlay.eventName}" applies a ${eventOverlay.discountValue}% discount,` +
      ` bringing the customer price to ₹${eventOverlay.priceAfterDiscount}.`;
  }

  return text;
}

module.exports = { generateExplanation };

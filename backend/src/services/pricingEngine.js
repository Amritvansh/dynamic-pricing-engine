function classifyDemand(demandScore) {
  if (demandScore == null || isNaN(demandScore)) return "MEDIUM";
  if (demandScore >= 70) return "HIGH";
  if (demandScore >= 40) return "MEDIUM";
  return "LOW";
}

function classifyInventory(inventoryQuantity) {
  if (inventoryQuantity == null || isNaN(inventoryQuantity)) return "HIGH";
  if (inventoryQuantity <= 10) return "LOW";
  if (inventoryQuantity <= 50) return "MEDIUM";
  return "HIGH";
}

function calculateAverageCompetitorPrice(competitorPrices) {
  if (!competitorPrices || competitorPrices.length === 0) return null;
  const sum = competitorPrices.reduce((acc, price) => acc + price, 0);
  return sum / competitorPrices.length;
}

function calculatePrice(
  currentPrice,
  demandScore,
  inventoryQuantity,
  competitorPrices,
) {
  if (currentPrice == null || isNaN(currentPrice) || currentPrice <= 0) {
    throw new Error("Valid currentPrice is required");
  }

  const demandLevel = classifyDemand(demandScore);
  const inventoryLevel = classifyInventory(inventoryQuantity);
  const avgCompetitorPrice = calculateAverageCompetitorPrice(competitorPrices);

  let totalAdjustmentPercentage = 0;
  const appliedRules = [];

  if (demandLevel === "HIGH" && inventoryLevel === "LOW") {
    totalAdjustmentPercentage += 10;
    appliedRules.push("High demand + Low inventory → +10%");
  } else if (demandLevel === "LOW" && inventoryLevel === "HIGH") {
    totalAdjustmentPercentage -= 10;
    appliedRules.push("Low demand + High inventory → -10%");
  }

  if (avgCompetitorPrice !== null) {
    if (avgCompetitorPrice < currentPrice * 0.95) {
      totalAdjustmentPercentage -= 5;
      appliedRules.push("Competitor price significantly lower → -5%");
    } else if (avgCompetitorPrice > currentPrice * 1.03) {
      totalAdjustmentPercentage += 3;
      appliedRules.push("Competitor price higher → +3%");
    }
  }

  const today = new Date();
  const dayOfWeek = today.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    totalAdjustmentPercentage -= 2;
    appliedRules.push("Weekend discount → -2%");
  }

  const totalAdjustmentFactor = 1 + totalAdjustmentPercentage / 100;
  let recommendedPrice = currentPrice * totalAdjustmentFactor;

  const minPrice = currentPrice * 0.7;
  const maxPrice = currentPrice * 1.5;

  recommendedPrice = Math.min(Math.max(recommendedPrice, minPrice), maxPrice);

  recommendedPrice = Math.round(recommendedPrice);

  return {
    recommendedPrice,
    appliedRules,
    demandLevel,
    inventoryLevel,
    avgCompetitorPrice: avgCompetitorPrice
      ? Math.round(avgCompetitorPrice)
      : null,
    totalAdjustmentPercentage,
  };
}

module.exports = {
  calculatePrice,
  classifyDemand,
  classifyInventory,
  calculateAverageCompetitorPrice,
};

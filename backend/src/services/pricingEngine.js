/**
 * Helper to classify demand based on 0-100 score
 * @param {number} demandScore
 * @returns {string} HIGH, MEDIUM, LOW
 */
function classifyDemand(demandScore) {
  if (demandScore == null || isNaN(demandScore)) return 'MEDIUM';
  if (demandScore >= 70) return 'HIGH';
  if (demandScore >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Helper to classify inventory level based on available quantity
 * @param {number} inventoryQuantity
 * @returns {string} HIGH, MEDIUM, LOW
 */
function classifyInventory(inventoryQuantity) {
  if (inventoryQuantity == null || isNaN(inventoryQuantity)) return 'HIGH'; // Safe default
  if (inventoryQuantity <= 10) return 'LOW';
  if (inventoryQuantity <= 50) return 'MEDIUM';
  return 'HIGH';
}

/**
 * Helper to calculate average competitor price
 * @param {Array<number>} competitorPrices
 * @returns {number|null} average price or null if no competitors
 */
function calculateAverageCompetitorPrice(competitorPrices) {
  if (!competitorPrices || competitorPrices.length === 0) return null;
  const sum = competitorPrices.reduce((acc, price) => acc + price, 0);
  return sum / competitorPrices.length;
}

/**
 * Core Pricing Engine Calculation
 * @param {number} currentPrice - Current price of the product
 * @param {number} demandScore - Simulated demand score (0-100)
 * @param {number} inventoryQuantity - Available inventory count
 * @param {Array<number>} competitorPrices - Array of competitor prices
 * @returns {Object} result - Recommended price, applied rules, factors
 */
function calculatePrice(currentPrice, demandScore, inventoryQuantity, competitorPrices) {
  if (currentPrice == null || isNaN(currentPrice) || currentPrice <= 0) {
    throw new Error('Valid currentPrice is required');
  }

  const demandLevel = classifyDemand(demandScore);
  const inventoryLevel = classifyInventory(inventoryQuantity);
  const avgCompetitorPrice = calculateAverageCompetitorPrice(competitorPrices);

  let totalAdjustmentPercentage = 0;
  const appliedRules = [];

  // Rule 1: Demand + Inventory
  if (demandLevel === 'HIGH' && inventoryLevel === 'LOW') {
    totalAdjustmentPercentage += 10;
    appliedRules.push('High demand + Low inventory → +10%');
  } else if (demandLevel === 'LOW' && inventoryLevel === 'HIGH') {
    totalAdjustmentPercentage -= 10;
    appliedRules.push('Low demand + High inventory → -10%');
  }

  // Rule 2: Competitor Pricing
  if (avgCompetitorPrice !== null) {
    if (avgCompetitorPrice < currentPrice * 0.95) {
      totalAdjustmentPercentage -= 5;
      appliedRules.push('Competitor price significantly lower → -5%');
    } else if (avgCompetitorPrice > currentPrice * 1.03) {
      totalAdjustmentPercentage += 3;
      appliedRules.push('Competitor price higher → +3%');
    }
  }

  // Rule 3: Time-based (Weekend)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    totalAdjustmentPercentage -= 2;
    appliedRules.push('Weekend discount → -2%');
  }

  // Calculate recommended price
  const totalAdjustmentFactor = 1 + (totalAdjustmentPercentage / 100);
  let recommendedPrice = currentPrice * totalAdjustmentFactor;

  // Apply Guardrails (70% - 150%)
  const minPrice = currentPrice * 0.70;
  const maxPrice = currentPrice * 1.50;

  recommendedPrice = Math.min(Math.max(recommendedPrice, minPrice), maxPrice);

  // Round to nearest integer (assuming currency without decimals like INR)
  recommendedPrice = Math.round(recommendedPrice);

  return {
    recommendedPrice,
    appliedRules,
    demandLevel,
    inventoryLevel,
    avgCompetitorPrice: avgCompetitorPrice ? Math.round(avgCompetitorPrice) : null,
    totalAdjustmentPercentage
  };
}

module.exports = {
  calculatePrice,
  classifyDemand,
  classifyInventory,
  calculateAverageCompetitorPrice
};

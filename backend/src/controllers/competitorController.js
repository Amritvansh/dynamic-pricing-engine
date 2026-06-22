const asyncHandler = require('../middleware/asyncHandler');
const CompetitorPrice = require('../models/competitorPrice');
const Product = require('../models/product');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    List competitor prices for product (with dynamic staleness)
// @route   GET /api/v1/competitors/:productId
const getCompetitors = asyncHandler(async (req, res) => {
  const competitors = await CompetitorPrice.find({ productId: req.params.productId }).sort({ recordedAt: -1 });

  // Compute dynamic staleness per Part 10
  const now = Date.now();
  const data = competitors.map(c => {
    const ageHours = (now - new Date(c.updatedAt).getTime()) / 3_600_000;
    return {
      ...c.toObject(),
      stalenessScore: parseFloat(Math.max(0, 1 - ageHours / 72).toFixed(2)),
    };
  });

  sendSuccess(res, data);
});

// @desc    Add competitor price
// @route   POST /api/v1/competitors
const addCompetitor = asyncHandler(async (req, res) => {
  const competitor = await CompetitorPrice.create(req.body);
  sendSuccess(res, competitor, 201);
});

// @desc    Update competitor price
// @route   PATCH /api/v1/competitors/:id
const updateCompetitor = asyncHandler(async (req, res) => {
  const competitor = await CompetitorPrice.findByIdAndUpdate(
    req.params.id,
    { ...req.body, recordedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!competitor) return sendError(res, 'Competitor price not found', 404);
  sendSuccess(res, competitor);
});

// @desc    Remove competitor price
// @route   DELETE /api/v1/competitors/:id
const deleteCompetitor = asyncHandler(async (req, res) => {
  const competitor = await CompetitorPrice.findByIdAndDelete(req.params.id);
  if (!competitor) return sendError(res, 'Competitor price not found', 404);
  sendSuccess(res, { message: 'Competitor price removed' });
});

// @desc    Gap analysis result
// @route   GET /api/v1/competitors/:productId/analysis
const getCompetitorAnalysis = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return sendError(res, 'Product not found', 404);

  const competitors = await CompetitorPrice.find({ productId: req.params.productId });
  const ourPrice = product.currentPrice;
  const now = Date.now();

  // Filter stale (>72h old)
  const fresh = competitors
    .map(r => ({ price: r.competitorPrice, age: (now - new Date(r.updatedAt).getTime()) / 3_600_000 }))
    .filter(r => r.age <= 72);
  const staleCount = competitors.length - fresh.length;

  if (fresh.length === 0) {
    return sendSuccess(res, {
      productId: product._id, ourPrice, medianCompetitorPrice: null,
      gapPercent: 0, interpretation: 'NO_DATA', freshCount: 0, staleCount,
      outlierCount: 0, signal: 'neutral', multiplier: 1.0,
    });
  }

  // IQR outlier rejection
  const prices = fresh.map(r => r.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor(prices.length * 0.25)] ?? prices[0];
  const q3 = prices[Math.floor(prices.length * 0.75)] ?? prices[prices.length - 1];
  const iqr = q3 - q1;
  const inliers = fresh.filter(r => r.price >= q1 - 1.5 * iqr && r.price <= q3 + 1.5 * iqr);
  const outlierCount = fresh.length - inliers.length;
  const medianPrice = inliers.length > 0
    ? inliers.map(r => r.price).sort((a, b) => a - b)[Math.floor(inliers.length / 2)]
    : ourPrice;

  const gapPercent = parseFloat(((medianPrice - ourPrice) / ourPrice * 100).toFixed(2));

  let interpretation;
  if (gapPercent > 5) interpretation = 'COMPETITORS_EXPENSIVE';
  else if (gapPercent > 1) interpretation = 'SLIGHTLY_EXPENSIVE';
  else if (gapPercent > -1) interpretation = 'NEAR_PARITY';
  else if (gapPercent > -5) interpretation = 'SLIGHTLY_CHEAPER';
  else interpretation = 'COMPETITORS_CHEAPER';

  // Multiplier — clamped ±8% influence
  const rawInfluence = gapPercent * 0.4;
  const clampedInfluence = Math.max(-8, Math.min(8, rawInfluence));
  const multiplier = parseFloat((1.0 + clampedInfluence / 100).toFixed(4));

  let signal;
  if (gapPercent < -1) signal = 'downward';
  else if (gapPercent > 1) signal = 'upward';
  else signal = 'neutral';

  sendSuccess(res, {
    productId: product._id, ourPrice, medianCompetitorPrice: medianPrice,
    gapPercent, interpretation, freshCount: fresh.length, staleCount,
    outlierCount, signal, multiplier,
  });
});

module.exports = { getCompetitors, addCompetitor, updateCompetitor, deleteCompetitor, getCompetitorAnalysis };

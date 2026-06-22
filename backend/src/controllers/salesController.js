const asyncHandler = require('../middleware/asyncHandler');
const SalesEvent = require('../models/salesEvent');
const Product = require('../models/product');
const { findActiveEventForProduct } = require('../services/eventService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Record a sale event (drives demand calculation)
// @route   POST /api/v1/sales
const recordSale = asyncHandler(async (req, res) => {
  const { productId, quantity, priceAtSale, channel, soldAt } = req.body;
  const saleDate = soldAt ? new Date(soldAt) : new Date();

  const product = await Product.findById(productId);
  if (!product) return sendError(res, 'Product not found', 404);

  // Auto-detect if a promotional event is active for this product at soldAt time
  const activeEvent = await findActiveEventForProduct(product, saleDate);

  const sale = await SalesEvent.create({
    productId,
    quantity,
    priceAtSale,
    channel: channel || 'manual',
    soldAt: saleDate,
    eventId: activeEvent ? activeEvent._id : null,
    isPromotional: !!activeEvent,
  });

  sendSuccess(res, sale, 201);
});

// @desc    Get recent sales for a product
// @route   GET /api/v1/sales/:productId
const getProductSales = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const sales = await SalesEvent.find({ productId: req.params.productId })
    .sort({ soldAt: -1 })
    .limit(limit);
  sendSuccess(res, sales);
});

// @desc    Get computed velocity stats
// @route   GET /api/v1/sales/:productId/velocity
const getVelocity = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const referenceDate = new Date();
  const sixHoursAgo = new Date(referenceDate - 6 * 3600 * 1000);
  const sevenDaysAgo = new Date(referenceDate - 7 * 24 * 3600 * 1000);

  // SHORT TERM (6h window) — all sales
  const shortTermSales = await SalesEvent.find({
    productId, isCancelled: false,
    soldAt: { $gte: sixHoursAgo, $lte: referenceDate }
  });

  const shortTermOrganic = shortTermSales.filter(s => !s.eventId);
  const shortTermPromo = shortTermSales.filter(s => !!s.eventId);

  const organicShortTermRate = shortTermOrganic.reduce((sum, s) => sum + s.quantity, 0) / 6;
  const promoShortTermRate = shortTermPromo.reduce((sum, s) => sum + s.quantity, 0) / 6;
  const shortTermTotalRate = organicShortTermRate + promoShortTermRate;

  // LONG TERM (7d baseline) — ORGANIC ONLY
  const longTermSales = await SalesEvent.find({
    productId, isCancelled: false,
    eventId: null,
    soldAt: { $gte: sevenDaysAgo, $lte: referenceDate }
  });

  const longTermOrganicTotal = longTermSales.reduce((sum, s) => sum + s.quantity, 0);
  const organicLongTermRate = longTermOrganicTotal / (7 * 24);

  // VELOCITY RATIO (organic-only)
  const velocityRatio = organicLongTermRate > 0
    ? parseFloat((organicShortTermRate / organicLongTermRate).toFixed(2))
    : (organicShortTermRate > 0 ? 2.0 : 1.0);

  let interpretation;
  if (velocityRatio > 5) interpretation = 'SURGE';
  else if (velocityRatio > 2) interpretation = 'HIGH';
  else if (velocityRatio > 1.2) interpretation = 'RISING';
  else if (velocityRatio > 0.8) interpretation = 'STABLE';
  else if (velocityRatio > 0.5) interpretation = 'FALLING';
  else interpretation = 'LOW';

  const totalSalesCount = shortTermSales.length + longTermSales.length;
  const confidence = parseFloat(Math.min(1.0, totalSalesCount / 20).toFixed(2));

  sendSuccess(res, {
    productId,
    organicShortTermRate: parseFloat(organicShortTermRate.toFixed(2)),
    organicLongTermRate: parseFloat(organicLongTermRate.toFixed(2)),
    velocityRatio,
    interpretation,
    promoShortTermRate: parseFloat(promoShortTermRate.toFixed(2)),
    organicPercentage: shortTermTotalRate > 0 ? parseFloat((organicShortTermRate / shortTermTotalRate * 100).toFixed(1)) : 100,
    promoPercentage: shortTermTotalRate > 0 ? parseFloat((promoShortTermRate / shortTermTotalRate * 100).toFixed(1)) : 0,
    isEventActive: shortTermPromo.length > 0,
    totalSalesCount,
    confidence,
  });
});

module.exports = { recordSale, getProductSales, getVelocity };

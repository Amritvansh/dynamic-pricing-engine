const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const PricingRecommendation = require('../models/pricingRecommendation');
const SalesEvent = require('../models/salesEvent');
const EventAnalytics = require('../models/eventAnalytics');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Price over time chart data
// @route   GET /api/v1/analytics/price-history/:productId
const getPriceHistory = asyncHandler(async (req, res) => {
  const recommendations = await PricingRecommendation.find({
    productId: req.params.productId,
    status: 'APPLIED',
  }).sort({ appliedAt: 1 }).select('appliedAt outcome.recommendedPrice inputSnapshot.currentPrice');

  const data = recommendations.map(r => ({
    date: r.appliedAt,
    previousPrice: r.inputSnapshot?.currentPrice,
    newPrice: r.outcome?.recommendedPrice,
  }));

  sendSuccess(res, data);
});

// @desc    Demand velocity over time
// @route   GET /api/v1/analytics/demand-trends/:productId
const getDemandTrends = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const productObjId = new mongoose.Types.ObjectId(req.params.productId);

  const dailySales = await SalesEvent.aggregate([
    { $match: { productId: productObjId, isCancelled: false, soldAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } },
        totalQuantity: { $sum: '$quantity' },
        organicQuantity: { $sum: { $cond: [{ $eq: ['$isPromotional', false] }, '$quantity', 0] } },
        promoQuantity: { $sum: { $cond: [{ $eq: ['$isPromotional', true] }, '$quantity', 0] } },
        totalRevenue: { $sum: { $multiply: ['$quantity', '$priceAtSale'] } },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  sendSuccess(res, dailySales);
});

// @desc    Organic vs promotional split
// @route   GET /api/v1/analytics/demand-attribution/:productId
const getDemandAttribution = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const sales = await SalesEvent.find({
    productId: req.params.productId,
    isCancelled: false,
    soldAt: { $gte: thirtyDaysAgo },
  });

  let totalSales = 0, organicSales = 0, promotionalSales = 0;
  let organicRevenue = 0, promotionalRevenue = 0;

  sales.forEach(s => {
    totalSales += s.quantity;
    if (s.isPromotional) {
      promotionalSales += s.quantity;
      promotionalRevenue += s.quantity * s.priceAtSale;
    } else {
      organicSales += s.quantity;
      organicRevenue += s.quantity * s.priceAtSale;
    }
  });

  sendSuccess(res, {
    productId: req.params.productId,
    period: 'last_30_days',
    totalSales,
    organicSales,
    promotionalSales,
    organicPercentage: totalSales > 0 ? parseFloat((organicSales / totalSales * 100).toFixed(1)) : 100,
    promotionalPercentage: totalSales > 0 ? parseFloat((promotionalSales / totalSales * 100).toFixed(1)) : 0,
    organicRevenue: Math.round(organicRevenue),
    promotionalRevenue: Math.round(promotionalRevenue),
  });
});

// @desc    Event metrics
// @route   GET /api/v1/analytics/event-performance/:eventId
const getEventPerformance = asyncHandler(async (req, res) => {
  const analytics = await EventAnalytics.find({ eventId: req.params.eventId })
    .populate('productId', 'productName sku currentPrice');
  sendSuccess(res, analytics);
});

// @desc    Aggregate event performance
// @route   GET /api/v1/analytics/event-summary
const getEventSummary = asyncHandler(async (req, res) => {
  const summary = await EventAnalytics.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: '$totalSalesDuringEvent' },
        totalRevenue: { $sum: '$totalRevenueDuringEvent' },
        totalDiscount: { $sum: '$discountAmountTotal' },
        avgLift: { $avg: '$demandLift' },
      }
    }
  ]);
  sendSuccess(res, summary.length > 0 ? summary[0] : { totalSales: 0, totalRevenue: 0, totalDiscount: 0, avgLift: null });
});

module.exports = { getPriceHistory, getDemandTrends, getDemandAttribution, getEventPerformance, getEventSummary };

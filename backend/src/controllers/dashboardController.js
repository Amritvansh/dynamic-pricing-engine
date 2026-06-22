const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const PricingRecommendation = require('../models/pricingRecommendation');
const PromotionalEvent = require('../models/promotionalEvent');
const SalesEvent = require('../models/salesEvent');
const Settings = require('../models/settings');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Main dashboard KPIs
// @route   GET /api/v1/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // PRODUCTS
  const totalProducts = await Product.countDocuments();
  const activeProducts = await Product.countDocuments({ isActive: true });
  const pricedToday = await Product.countDocuments({ lastPricedAt: { $gte: today } });

  // INVENTORY
  const criticalCount = await Inventory.countDocuments({ inventoryStatus: 'critical' });
  const lowCount = await Inventory.countDocuments({ inventoryStatus: 'low' });
  const normalCount = await Inventory.countDocuments({ inventoryStatus: 'normal' });
  const highCount = await Inventory.countDocuments({ inventoryStatus: 'high' });

  // Total inventory value: sum of (availableQuantity * product.costPrice)
  const inventories = await Inventory.find().populate('productId', 'costPrice');
  let totalValue = 0;
  inventories.forEach(inv => {
    if (inv.productId && inv.productId.costPrice) {
      totalValue += inv.availableQuantity * inv.productId.costPrice;
    }
  });

  // PRICING
  const pendingRecommendations = await PricingRecommendation.countDocuments({ status: 'PENDING' });
  const appliedToday = await PricingRecommendation.countDocuments({ status: 'APPLIED', appliedAt: { $gte: today } });

  const recentApplied = await PricingRecommendation.find({ status: 'APPLIED' }).sort({ appliedAt: -1 }).limit(20);
  let avgConfidenceScore = 0;
  let avgAdjustmentPercent = 0;
  if (recentApplied.length > 0) {
    avgConfidenceScore = recentApplied.reduce((s, r) => s + (r.outcome?.confidenceScore || 0), 0) / recentApplied.length;
    avgAdjustmentPercent = recentApplied.reduce((s, r) => s + Math.abs(r.outcome?.adjustmentPercent || 0), 0) / recentApplied.length;
  }

  // EVENTS
  const now = new Date();
  const activeEvents = await PromotionalEvent.countDocuments({ status: 'ACTIVE' });
  const upcomingEvents = await PromotionalEvent.countDocuments({ status: 'SCHEDULED' });

  // Total discount today (rough: sum of promotional sales today)
  const promoSalesToday = await SalesEvent.find({
    isPromotional: true, isCancelled: false,
    soldAt: { $gte: today }
  });
  const totalDiscountToday = promoSalesToday.reduce((s, sale) => s + (sale.quantity * sale.priceAtSale * 0.1), 0); // rough estimate

  // Top event
  let topEvent = null;
  const activeEventsList = await PromotionalEvent.find({ status: 'ACTIVE' }).limit(1);
  if (activeEventsList.length > 0) {
    const eventSales = await SalesEvent.countDocuments({ eventId: activeEventsList[0]._id, isCancelled: false });
    topEvent = { name: activeEventsList[0].eventName, salesCount: eventSales };
  }

  // SEASONAL CONFIG
  const seasonalEnabled = await Settings.findOne({ key: 'seasonalPricingEnabled' });
  const seasonalCategories = await Settings.findOne({ key: 'seasonalDisabledCategories' });

  // RECENT RECOMMENDATIONS
  const recentRecommendations = await PricingRecommendation.find()
    .sort({ createdAt: -1 }).limit(5)
    .populate('productId', 'productName sku category currentPrice tier');

  sendSuccess(res, {
    products: { total: totalProducts, active: activeProducts, pricedToday },
    inventory: {
      critical: criticalCount, low: lowCount, normal: normalCount, high: highCount,
      totalValue: Math.round(totalValue),
    },
    pricing: {
      pendingRecommendations,
      appliedToday,
      avgConfidenceScore: parseFloat(avgConfidenceScore.toFixed(2)),
      avgAdjustmentPercent: parseFloat(avgAdjustmentPercent.toFixed(1)),
    },
    events: {
      activeEvents,
      upcomingEvents,
      totalDiscountToday: Math.round(totalDiscountToday),
      topEvent,
    },
    seasonalConfig: {
      globalEnabled: seasonalEnabled ? seasonalEnabled.value : false,
      disabledCategories: (seasonalCategories && Array.isArray(seasonalCategories.value)) ? seasonalCategories.value : [],
    },
    recentRecommendations,
  });
});

module.exports = { getDashboardStats };

const asyncHandler = require('../middleware/asyncHandler');
const PromotionalEvent = require('../models/promotionalEvent');
const EventAnalytics = require('../models/eventAnalytics');
const Product = require('../models/product');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    List all events (query: ?status=ACTIVE or ?status=SCHEDULED,DRAFT)
// @route   GET /api/v1/events
const getEvents = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.status) {
    // Support comma-separated values, e.g. ?status=SCHEDULED,DRAFT
    const statuses = req.query.status.split(',').map(s => s.trim()).filter(Boolean);
    query.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
  }
  const events = await PromotionalEvent.find(query).sort({ startDate: 1 });
  sendSuccess(res, events);
});

// @desc    Get single event with analytics summary
// @route   GET /api/v1/events/:id
const getEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  const analytics = await EventAnalytics.find({ eventId: event._id });
  const data = event.toObject();
  data.analyticsSummary = analytics;
  sendSuccess(res, data);
});

// @desc    Create event (starts in DRAFT)
// @route   POST /api/v1/events
const createEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.create({ ...req.body, status: 'DRAFT' });
  sendSuccess(res, event, 201);
});

// @desc    Update event (only DRAFT/SCHEDULED)
// @route   PATCH /api/v1/events/:id
const updateEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  if (!['DRAFT', 'SCHEDULED'].includes(event.status)) {
    return sendError(res, 'Can only update events in DRAFT or SCHEDULED status', 400);
  }
  const updated = await PromotionalEvent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  sendSuccess(res, updated);
});

// @desc    Delete event (only DRAFT/INACTIVE)
// @route   DELETE /api/v1/events/:id
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  if (!['DRAFT', 'INACTIVE'].includes(event.status)) {
    return sendError(res, 'Can only delete events in DRAFT or INACTIVE status', 400);
  }
  await PromotionalEvent.findByIdAndDelete(req.params.id);
  sendSuccess(res, { message: 'Event deleted' });
});

// @desc    Transition to SCHEDULED/ACTIVE
// @route   PATCH /api/v1/events/:id/activate
const activateEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  const now = new Date();
  event.status = (now >= event.startDate && now <= event.endDate) ? 'ACTIVE' : 'SCHEDULED';
  await event.save();
  sendSuccess(res, event);
});

// @desc    Transition to INACTIVE
// @route   PATCH /api/v1/events/:id/deactivate
const deactivateEvent = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  event.status = 'INACTIVE';
  await event.save();
  sendSuccess(res, event);
});

// @desc    List currently active events
// @route   GET /api/v1/events/active
const getActiveEvents = asyncHandler(async (req, res) => {
  const now = new Date();
  const events = await PromotionalEvent.find({
    status: 'ACTIVE',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ priority: 1 });
  sendSuccess(res, events);
});

// @desc    List scheduled future events
// @route   GET /api/v1/events/upcoming
const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await PromotionalEvent.find({ status: 'SCHEDULED' }).sort({ startDate: 1 });
  sendSuccess(res, events);
});

// @desc    Event performance analytics
// @route   GET /api/v1/events/:id/analytics
const getEventAnalytics = asyncHandler(async (req, res) => {
  const analytics = await EventAnalytics.find({ eventId: req.params.id })
    .populate('productId', 'productName sku currentPrice');
  sendSuccess(res, analytics);
});

// @desc    List affected products
// @route   GET /api/v1/events/:id/products
const getEventProducts = asyncHandler(async (req, res) => {
  const event = await PromotionalEvent.findById(req.params.id);
  if (!event) return sendError(res, 'Event not found', 404);
  let products;
  if (event.targetType === 'all_products') {
    products = await Product.find({ isActive: true });
  } else if (event.targetType === 'specific_products') {
    products = await Product.find({ _id: { $in: event.targetProducts }, isActive: true });
  } else if (event.targetType === 'specific_categories') {
    products = await Product.find({ category: { $in: event.targetCategories }, isActive: true });
  } else {
    products = [];
  }
  sendSuccess(res, products);
});

module.exports = {
  getEvents, getEvent, createEvent, updateEvent, deleteEvent,
  activateEvent, deactivateEvent, getActiveEvents, getUpcomingEvents,
  getEventAnalytics, getEventProducts,
};

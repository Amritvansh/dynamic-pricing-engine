const asyncHandler = require('../middleware/asyncHandler');
const Inventory = require('../models/inventory');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    List all inventory with product details
// @route   GET /api/v1/inventory
const getInventories = asyncHandler(async (req, res) => {
  const inventories = await Inventory.find().populate('productId', 'productName currentPrice category sku tier');
  sendSuccess(res, inventories);
});

// @desc    Single product inventory
// @route   GET /api/v1/inventory/:productId
const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ productId: req.params.productId }).populate('productId', 'productName currentPrice category sku tier');
  if (!inventory) return sendError(res, 'Inventory not found for this product', 404);
  sendSuccess(res, inventory);
});

// @desc    Create inventory record
// @route   POST /api/v1/inventory
const createInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.create(req.body);
  sendSuccess(res, inventory, 201);
});

// @desc    Update quantity
// @route   PATCH /api/v1/inventory/:productId
const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOneAndUpdate(
    { productId: req.params.productId },
    req.body,
    { new: true, runValidators: true }
  ).populate('productId', 'productName currentPrice category sku tier');
  if (!inventory) return sendError(res, 'Inventory not found for this product', 404);
  sendSuccess(res, inventory);
});

// @desc    List critical/low stock products
// @route   GET /api/v1/inventory/status/critical
const getCriticalInventory = asyncHandler(async (req, res) => {
  const inventories = await Inventory.find({
    inventoryStatus: { $in: ['critical', 'low'] }
  }).populate('productId', 'productName currentPrice category sku tier');
  sendSuccess(res, inventories);
});

module.exports = { getInventories, getInventory, createInventory, updateInventory, getCriticalInventory };

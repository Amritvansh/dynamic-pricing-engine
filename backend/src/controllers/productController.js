const asyncHandler = require('../middleware/asyncHandler');
const Product = require('../models/product');
const Inventory = require('../models/inventory');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    List all active products (with inventory summary)
// @route   GET /api/v1/products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });

  // Attach lightweight inventory data per product
  const productIds = products.map(p => p._id);
  const inventories = await Inventory.find({ productId: { $in: productIds } })
    .select('productId availableQuantity inventoryStatus coverageDays');

  const invMap = {};
  inventories.forEach(inv => { invMap[inv.productId.toString()] = inv; });

  const data = products.map(p => {
    const pObj = p.toObject();
    const inv = invMap[p._id.toString()];
    pObj.inventory = inv
      ? { availableQuantity: inv.availableQuantity, inventoryStatus: inv.inventoryStatus, coverageDays: inv.coverageDays }
      : null;
    return pObj;
  });

  sendSuccess(res, data);
});

// @desc    Get single product with inventory
// @route   GET /api/v1/products/:id
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return sendError(res, 'Product not found', 404);

  const inventory = await Inventory.findOne({ productId: product._id });
  const data = product.toObject();
  data.inventory = inventory
    ? { availableQuantity: inventory.availableQuantity, inventoryStatus: inventory.inventoryStatus, coverageDays: inventory.coverageDays, emaDailySales: inventory.emaDailySales, emaSalesUpdatedAt: inventory.emaSalesUpdatedAt }
    : null;

  sendSuccess(res, data);
});

// @desc    Create product
// @route   POST /api/v1/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  
  // Auto-create an initial inventory record
  await Inventory.create({
    productId: product._id,
    availableQuantity: req.body.initialQuantity || 0
  });

  sendSuccess(res, product, 201);
});

// @desc    Update product fields
// @route   PATCH /api/v1/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!product) return sendError(res, 'Product not found', 404);
  sendSuccess(res, product);
});

// @desc    Soft delete (sets isActive: false)
// @route   DELETE /api/v1/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) return sendError(res, 'Product not found', 404);
  sendSuccess(res, product);
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };

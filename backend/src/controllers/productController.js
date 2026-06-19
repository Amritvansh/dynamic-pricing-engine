// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get all products' });
};

// @desc    Create new product
// @route   POST /api/products
// @access  Public
const createProduct = async (req, res) => {
  res.status(201).json({ success: true, message: 'Create new product' });
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Public
const updateProduct = async (req, res) => {
  res.status(200).json({ success: true, message: `Update product ${req.params.id}` });
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Public
const deleteProduct = async (req, res) => {
  res.status(200).json({ success: true, message: `Delete product ${req.params.id}` });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

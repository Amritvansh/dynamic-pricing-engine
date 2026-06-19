// @desc    Get inventory
// @route   GET /api/inventory
// @access  Public
const getInventory = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get inventory' });
};

// @desc    Create inventory
// @route   POST /api/inventory
// @access  Public
const createInventory = async (req, res) => {
  res.status(201).json({ success: true, message: 'Create inventory' });
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Public
const updateInventory = async (req, res) => {
  res.status(200).json({ success: true, message: `Update inventory ${req.params.id}` });
};

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
};

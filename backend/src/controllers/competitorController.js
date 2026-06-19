// @desc    Get competitor prices
// @route   GET /api/competitor-prices
// @access  Public
const getCompetitorPrices = async (req, res) => {
  res.status(200).json({ success: true, message: 'Get competitor prices' });
};

// @desc    Create competitor price
// @route   POST /api/competitor-prices
// @access  Public
const createCompetitorPrice = async (req, res) => {
  res.status(201).json({ success: true, message: 'Create competitor price' });
};

// @desc    Update competitor price
// @route   PUT /api/competitor-prices/:id
// @access  Public
const updateCompetitorPrice = async (req, res) => {
  res.status(200).json({ success: true, message: `Update competitor price ${req.params.id}` });
};

module.exports = {
  getCompetitorPrices,
  createCompetitorPrice,
  updateCompetitorPrice,
};

const getCompetitorPrices = async (req, res) => {
  res.status(200).json({ success: true, message: "Get competitor prices" });
};

const createCompetitorPrice = async (req, res) => {
  res.status(201).json({ success: true, message: "Create competitor price" });
};

const updateCompetitorPrice = async (req, res) => {
  res.status(200).json({
    success: true,
    message: `Update competitor price ${req.params.id}`,
  });
};

module.exports = {
  getCompetitorPrices,
  createCompetitorPrice,
  updateCompetitorPrice,
};

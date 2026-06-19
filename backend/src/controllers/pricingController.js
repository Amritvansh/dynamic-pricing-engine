const calculatePrice = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Calculate recommended price" });
};

const getPricingHistory = async (req, res) => {
  res.status(200).json({ success: true, message: "Get pricing history" });
};

module.exports = {
  calculatePrice,
  getPricingHistory,
};

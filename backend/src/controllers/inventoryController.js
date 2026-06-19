const getInventory = async (req, res) => {
  res.status(200).json({ success: true, message: "Get inventory" });
};

const createInventory = async (req, res) => {
  res.status(201).json({ success: true, message: "Create inventory" });
};

const updateInventory = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: `Update inventory ${req.params.id}` });
};

module.exports = {
  getInventory,
  createInventory,
  updateInventory,
};

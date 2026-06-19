const getProducts = async (req, res) => {
  res.status(200).json({ success: true, message: "Get all products" });
};

const createProduct = async (req, res) => {
  res.status(201).json({ success: true, message: "Create new product" });
};

const updateProduct = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: `Update product ${req.params.id}` });
};

const deleteProduct = async (req, res) => {
  res
    .status(200)
    .json({ success: true, message: `Delete product ${req.params.id}` });
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};

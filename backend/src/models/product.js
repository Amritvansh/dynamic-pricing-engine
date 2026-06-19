const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
      minlength: [2, "Name can not be less than 2 characters"],
      maxlength: [100, "Name can not be more than 100 characters"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      trim: true,
    },
    currentPrice: {
      type: Number,
      required: [true, "Please add a current price"],
      min: [0, "Price cannot be negative"],
    },
    basePrice: {
      type: Number,
      required: [true, "Please add a base price"],
      min: [0, "Base price cannot be negative"],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);

const mongoose = require('mongoose');

const pricingHistorySchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    recommendedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    reason: {
      type: String,
      required: true,
    },
    appliedRules: {
      type: [String],
      default: [],
    },
    aiExplanation: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PricingHistory', pricingHistorySchema);
const mongoose = require('mongoose');

const competitorPriceSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    competitorName: {
      type: String,
      required: true,
      trim: true,
    },
    competitorPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompetitorPrice', competitorPriceSchema);
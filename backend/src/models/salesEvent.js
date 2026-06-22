const mongoose = require('mongoose');

const salesEventSchema = new mongoose.Schema({
  productId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:      { type: Number, required: true, min: 1 },
  priceAtSale:   { type: Number, required: true, min: 0 },
  channel:       { type: String, enum: ['web', 'mobile', 'store', 'manual'], default: 'manual' },

  // DEMAND ATTRIBUTION
  eventId:       { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionalEvent', default: null },
  isPromotional: { type: Boolean, default: false },
  isCancelled:   { type: Boolean, default: false },
  soldAt:        { type: Date, default: Date.now },
}, { timestamps: true });

// INDEXES
salesEventSchema.index({ productId: 1, soldAt: -1 });
salesEventSchema.index({ soldAt: -1 });
salesEventSchema.index({ productId: 1, isCancelled: 1, eventId: 1 });
salesEventSchema.index({ eventId: 1 });
salesEventSchema.index({ soldAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('SalesEvent', salesEventSchema);

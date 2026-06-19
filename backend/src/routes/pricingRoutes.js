const express = require("express");
const router = express.Router();
const {
  calculatePrice,
  getPricingHistory,
} = require("../controllers/pricingController");

router.post("/calculate-price", calculatePrice);
router.get("/pricing-history", getPricingHistory);

module.exports = router;

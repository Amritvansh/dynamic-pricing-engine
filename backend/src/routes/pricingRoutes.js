const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const {
  calculatePrice,
  applyRecommendation,
  rejectRecommendation,
  getRecommendations,
  getProductRecommendations,
} = require("../controllers/pricingController");

router.post("/calculate", asyncHandler(calculatePrice));

router.patch("/:decisionId/apply", asyncHandler(applyRecommendation));
router.patch("/:decisionId/reject", asyncHandler(rejectRecommendation));

router.get(
  "/recommendations/:productId",
  asyncHandler(getProductRecommendations),
);
router.get("/recommendations", asyncHandler(getRecommendations));

module.exports = router;

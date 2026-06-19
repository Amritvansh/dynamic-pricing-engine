const express = require('express');
const router = express.Router();
const {
  getCompetitorPrices,
  createCompetitorPrice,
  updateCompetitorPrice,
} = require('../controllers/competitorController');

router.route('/').get(getCompetitorPrices).post(createCompetitorPrice);
router.route('/:id').put(updateCompetitorPrice);

module.exports = router;

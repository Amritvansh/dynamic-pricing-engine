const express = require("express");
const router = express.Router();
const {
  getInventory,
  createInventory,
  updateInventory,
} = require("../controllers/inventoryController");

router.route("/").get(getInventory).post(createInventory);
router.route("/:id").put(updateInventory);

module.exports = router;

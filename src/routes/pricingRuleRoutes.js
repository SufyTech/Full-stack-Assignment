const express = require("express");
const router = express.Router();
const PricingRule = require("../models/PricingRule");

// GET active pricing rules
router.get("/", async (req, res) => {
  try {
    const rules = await PricingRule.find({ isActive: true });
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

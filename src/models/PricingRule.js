const mongoose = require("mongoose");

const pricingRuleSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["peak", "weekend", "indoor"],
  },
  multiplier: Number,
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("PricingRule", pricingRuleSchema);

const PricingRule = require("../models/PricingRule");

const calculatePrice = async ({ basePrice, isIndoor, date, slot }) => {
  let price = basePrice;

  const rules = await PricingRule.find({ isActive: true });

  const isWeekend =
    new Date(date).getDay() === 0 || new Date(date).getDay() === 6;
  const isPeak = slot >= "18:00" && slot <= "21:00";

  rules.forEach((rule) => {
    if (
      (rule.type === "indoor" && isIndoor) ||
      (rule.type === "weekend" && isWeekend) ||
      (rule.type === "peak" && isPeak)
    ) {
      price *= rule.multiplier;
    }
  });

  return Math.round(price);
};

module.exports = { calculatePrice };

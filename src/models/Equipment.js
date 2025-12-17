const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: String,
  totalQuantity: Number,
  availableQuantity: Number,
  pricePerHour: Number,
});

module.exports = mongoose.model("Equipment", equipmentSchema);

const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
  name: String,
  totalQuantity: Number,
  pricePerHour: Number,
  bookedSlots: [
    {
      date: String, // YYYY-MM-DD
      slot: String, // e.g., "09:00"
      qtyBooked: { type: Number, default: 0 },
    },
  ],
});

module.exports = mongoose.model("Equipment", equipmentSchema);

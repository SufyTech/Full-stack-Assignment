const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema({
  name: String,
  hourlyRate: Number,
  status: { type: String, default: "active" },
  bookedSlots: [
    {
      date: String, // YYYY-MM-DD
      slot: String, // e.g., "09:00"
    },
  ],
});

module.exports = mongoose.model("Coach", coachSchema);

const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userName: String,
  date: String,
  slot: String,
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
  },
  equipment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
  ],
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coach",
  },
  totalPrice: Number,
  status: {
    type: String,
    enum: ["confirmed", "cancelled", "waitlisted"], // added waitlisted
    default: "confirmed",
  },
  priority: {
    type: Number, // for waitlist ordering: lower = earlier
    default: 0,
  },
});

module.exports = mongoose.model("Booking", bookingSchema);

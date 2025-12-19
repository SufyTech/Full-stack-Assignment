// src/models/Waitlist.js
const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
    required: true,
  },
  users: {
    type: [String], // Array of user names
    required: true,
    default: [],
  },
  date: {
    type: String, // "YYYY-MM-DD" format
    required: true,
  },
  slot: {
    type: String, // e.g., "09:00", "12:00"
    required: true,
  },
});

module.exports = mongoose.model("Waitlist", waitlistSchema);

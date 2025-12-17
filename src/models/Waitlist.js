const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  date: String,
  slot: String,
  court: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Court",
  },
  users: [String],
});

module.exports = mongoose.model("Waitlist", waitlistSchema);

const mongoose = require("mongoose");

const coachSchema = new mongoose.Schema({
  name: String,
  hourlyRate: Number,
  availability: [
    {
      date: String,
      slots: [String],
    },
  ],
});

module.exports = mongoose.model("Coach", coachSchema);

const mongoose = require("mongoose");

const courtSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: ["indoor", "outdoor"],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Court", courtSchema);

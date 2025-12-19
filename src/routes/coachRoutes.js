const express = require("express");
const router = express.Router();
const Coach = require("../models/Coach");

// GET all coaches
router.get("/", async (req, res) => {
  try {
    const coaches = await Coach.find();
    res.status(200).json(coaches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

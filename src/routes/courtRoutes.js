const express = require("express");
const router = express.Router();
const Court = require("../models/Court");

// GET all active courts
router.get("/", async (req, res) => {
  try {
    const courts = await Court.find({ isActive: true });
    res.status(200).json(courts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
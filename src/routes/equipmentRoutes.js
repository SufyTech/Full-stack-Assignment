const express = require("express");
const router = express.Router();
const Equipment = require("../models/Equipment");

// GET all equipment
router.get("/", async (req, res) => {
  try {
    const equipment = await Equipment.find();
    res.status(200).json(equipment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

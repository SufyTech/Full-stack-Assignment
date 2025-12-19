// src/routes/waitlistRoutes.js
const express = require("express");
const router = express.Router();
const Waitlist = require("../models/Waitlist");
const Booking = require("../models/Booking");
const Court = require("../models/Court");
const Coach = require("../models/Coach");
const Equipment = require("../models/Equipment");

// GET all waitlist entries (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const waitlists = await Waitlist.find().populate("court", "name type"); // populate court name
    const formatted = waitlists.map((w) => ({
      _id: w._id,
      date: w.date,
      slot: w.slot,
      court: w.court, // populated court object
      users: w.users, // array of user names
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a user to waitlist
router.post("/", async (req, res) => {
  const { userName, courtId, date, slot } = req.body;
  if (!userName || !courtId || !date || !slot)
    return res
      .status(400)
      .json({ message: "userName, courtId, date, slot required" });

  try {
    let waitlistEntry = await Waitlist.findOne({ court: courtId, date, slot });
    if (!waitlistEntry) {
      waitlistEntry = await Waitlist.create({
        court: courtId,
        date,
        slot,
        users: [userName],
      });
    } else if (!waitlistEntry.users.includes(userName)) {
      waitlistEntry.users.push(userName);
      await waitlistEntry.save();
    }
    res
      .status(201)
      .json({ message: "Added to waitlist", waitlist: waitlistEntry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// REMOVE a waitlist entry by ID
router.delete("/:id", async (req, res) => {
  try {
    const waitlistEntry = await Waitlist.findById(req.params.id);
    if (!waitlistEntry)
      return res.status(404).json({ message: "Waitlist entry not found" });

    await Waitlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Waitlist entry removed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PROMOTE first user from waitlist and create booking
router.post("/:id/promote", async (req, res) => {
  try {
    const waitlistEntry = await Waitlist.findById(req.params.id);
    if (!waitlistEntry || waitlistEntry.users.length === 0)
      return res.status(404).json({ message: "No users to promote" });

    const nextUser = waitlistEntry.users.shift(); // remove first user
    await waitlistEntry.save();

    // Create a new booking
    const newBooking = await Booking.create({
      userName: nextUser,
      court: waitlistEntry.court,
      date: waitlistEntry.date,
      slot: waitlistEntry.slot,
      equipment: [], // optionally, add default or selected equipment
      coach: null, // optionally, assign a coach
      status: "confirmed",
      totalPrice: 0, // calculate if needed
    });

    // Update bookedSlots for coach if assigned
    if (newBooking.coach) {
      const coach = await Coach.findById(newBooking.coach);
      if (!coach.bookedSlots) coach.bookedSlots = [];
      coach.bookedSlots.push({
        date: newBooking.date,
        slot: newBooking.slot,
      });
      await coach.save();
    }

    // Update bookedSlots for each equipment if any
    for (let eqId of newBooking.equipment) {
      const eq = await Equipment.findById(eqId);
      if (!eq.bookedSlots) eq.bookedSlots = [];
      const existing = eq.bookedSlots.find(
        (b) => b.date === newBooking.date && b.slot === newBooking.slot
      );
      if (existing) existing.qtyBooked += 1;
      else
        eq.bookedSlots.push({
          date: newBooking.date,
          slot: newBooking.slot,
          qtyBooked: 1,
        });
      await eq.save();
    }

    res.json({
      message: `User '${nextUser}' promoted from waitlist and booking created`,
      booking: newBooking,
    });
  } catch (err) {
    console.error("Promotion error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

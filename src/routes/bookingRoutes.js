// src/routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const {
  createBooking,
  cancelBooking,
} = require("../controller/bookingController");
const Booking = require("../models/Booking");
const Court = require("../models/Court");
const Equipment = require("../models/Equipment");
const Coach = require("../models/Coach");
const Waitlist = require("../models/Waitlist");

// Mapping of coach IDs to names
const coachMap = {
  "694479f9a532961fcd0ffcd6": "Coach John",
  "694479f9a532961fcd0ffcd7": "Coach Sarah",
  "694479f9a532961fcd0ffcd8": "Coach Mike",
  null: "No Coach",
};

// CREATE BOOKING
router.post("/", async (req, res) => {
  await createBooking(req, res);
});

// CANCEL BOOKING
router.patch("/:id/cancel", async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // 1️⃣ Update EQUIPMENT
    for (let eqId of booking.equipment) {
      const eq = await Equipment.findById(eqId);
      if (!eq || !eq.bookedSlots) continue;

      const booked = eq.bookedSlots.find(
        (b) => b.date === booking.date && b.slot === booking.slot
      );
      if (booked) {
        booked.qtyBooked -= 1;
        if (booked.qtyBooked <= 0) {
          eq.bookedSlots = eq.bookedSlots.filter(
            (b) => !(b.date === booking.date && b.slot === booking.slot)
          );
        }
        await eq.save();
      }
    }

    // 2️⃣ Update COACH
    if (booking.coach) {
      const coach = await Coach.findById(booking.coach);
      if (coach && coach.bookedSlots) {
        coach.bookedSlots = coach.bookedSlots.filter(
          (b) => !(b.date === booking.date && b.slot === booking.slot)
        );
        await coach.save();
      }
    }

    // 3️⃣ Delete booking
    await Booking.findByIdAndDelete(bookingId);

    // 4️⃣ Promote first user from waitlist (if any)
    const waitlistEntry = await Waitlist.findOne({
      court: booking.court,
      date: booking.date,
      slot: booking.slot,
    });

    if (waitlistEntry && waitlistEntry.users.length > 0) {
      const nextUser = waitlistEntry.users.shift(); // remove first user
      await waitlistEntry.save();

      const newBooking = await Booking.create({
        userName: nextUser,
        court: booking.court,
        date: booking.date,
        slot: booking.slot,
        equipment: [], // optionally add equipment
        coach: booking.coach || null,
        status: "confirmed",
        totalPrice: booking.totalPrice, // optional: copy price
      });

      // Update coach & equipment bookedSlots
      if (newBooking.coach) {
        const coach = await Coach.findById(newBooking.coach);
        if (!coach.bookedSlots) coach.bookedSlots = [];
        coach.bookedSlots.push({
          date: newBooking.date,
          slot: newBooking.slot,
        });
        await coach.save();
      }

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

      return res.status(200).json({
        message: `Booking cancelled. Next user '${nextUser}' promoted from waitlist.`,
      });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET Booking History
router.get("/history", async (req, res) => {
  const { userName } = req.query;
  if (!userName)
    return res.status(400).json({ message: "userName is required" });

  try {
    const bookings = await Booking.find({ userName })
      .sort({ date: -1, slot: 1 })
      .populate("court", "name type")
      .populate("equipment", "name pricePerHour")
      .populate("coach", "name");

    const formatted = bookings.map((b) => ({
      _id: b._id,
      date: b.date,
      slot: b.slot,
      status: b.status,
      totalPrice: b.totalPrice,
      courtName: b.court ? b.court.name : "Unknown",
      equipment: b.equipment ? b.equipment.map((e) => e.name) : [],
      coach: b.coach ? b.coach.name : "None",
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET WAITLIST (Admin view)
// GET WAITLIST - Populated courts
router.get("/waitlist", async (req, res) => {
  try {
    // Fetch all waitlist entries and populate the 'court' field
    const waitlistEntries = await Waitlist.find()
      .populate("court", "name type") // populate court name and type
      .sort({ date: 1, slot: 1 }); // sort by date, then slot

    // Format data for frontend
    const formatted = waitlistEntries.map((w) => ({
      _id: w._id,
      users: w.users,
      court: w.court, // now contains { _id, name, type }
      date: w.date,
      slot: w.slot,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Waitlist fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

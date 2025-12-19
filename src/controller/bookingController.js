const Booking = require("../models/Booking");
const Court = require("../models/Court");
const Equipment = require("../models/Equipment");
const Coach = require("../models/Coach");
const Waitlist = require("../models/Waitlist");

// PRICE CALCULATION
const calculatePrice = async ({ court, equipmentIds, coachId }) => {
  let total = 0;
  total += court.type === "indoor" ? 500 : 300;

  for (let id of equipmentIds) {
    const eq = await Equipment.findById(id);
    if (eq) total += eq.pricePerHour;
  }

  if (coachId) {
    const coach = await Coach.findById(coachId);
    if (coach) total += coach.hourlyRate;
  }

  return total;
};

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const {
      userName,
      courtId,
      equipmentIds = [],
      coachId,
      date,
      slot,
    } = req.body;

    if (!userName || !courtId || !date || !slot)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await Booking.findOne({
      userName,
      court: courtId,
      date,
      slot,
    });
    if (existing)
      return res.status(400).json({ message: "Already booked or waitlisted" });

    const court = await Court.findById(courtId);
    if (!court || !court.isActive)
      return res.status(404).json({ message: "Court not available" });

    const isCourtAvailable = !(await Booking.findOne({
      court: courtId,
      date,
      slot,
      status: "confirmed",
    }));

    // CHECK EQUIPMENT
    const unavailableEquipment = [];
    for (let id of equipmentIds) {
      const eq = await Equipment.findById(id);
      if (!eq)
        return res.status(400).json({ message: `Equipment not found: ${id}` });

      if (!eq.bookedSlots) eq.bookedSlots = [];

      const booked = eq.bookedSlots.find(
        (b) => b.date === date && b.slot === slot
      );
      const qtyBooked = booked ? booked.qtyBooked : 0;

      if (qtyBooked >= eq.totalQuantity) unavailableEquipment.push(eq.name);
    }

    if (unavailableEquipment.length > 0)
      return res.status(400).json({
        message: `Equipment not available: ${unavailableEquipment.join(", ")}`,
      });

    // CHECK COACH
    if (coachId) {
      const coach = await Coach.findById(coachId);
      if (!coach || coach.status !== "active")
        return res.status(400).json({ message: "Coach not available" });

      const alreadyBooked = coach.bookedSlots.find(
        (b) => b.date === date && b.slot === slot
      );
      if (alreadyBooked)
        return res.status(400).json({ message: "Coach not available" });
    }

    const totalPrice = await calculatePrice({ court, equipmentIds, coachId });
    let status = isCourtAvailable ? "confirmed" : "waitlisted";

    if (!isCourtAvailable)
      await Waitlist.create({ userName, court: courtId, date, slot });

    const booking = await Booking.create({
      userName,
      court: courtId,
      equipment: equipmentIds,
      coach: coachId,
      date,
      slot,
      totalPrice,
      status,
      priority: Date.now(),
    });

    // UPDATE EQUIPMENT BOOKED SLOTS
    if (status === "confirmed") {
      for (let id of equipmentIds) {
        const eq = await Equipment.findById(id);
        if (!eq.bookedSlots) eq.bookedSlots = [];

        const booked = eq.bookedSlots.find(
          (b) => b.date === date && b.slot === slot
        );
        if (booked) {
          booked.qtyBooked += 1;
        } else {
          eq.bookedSlots.push({ date, slot, qtyBooked: 1 });
        }
        await eq.save();
      }

      // UPDATE COACH BOOKED SLOTS
      if (coachId) {
        const coach = await Coach.findById(coachId);
        coach.bookedSlots.push({ date, slot });
        await coach.save();
      }
    }

    res.status(201).json({
      message:
        status === "waitlisted"
          ? "Court full, added to waitlist"
          : "Booking confirmed",
      booking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // UPDATE EQUIPMENT
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

    // UPDATE COACH
    if (booking.coach) {
      const coach = await Coach.findById(booking.coach);
      if (coach && coach.bookedSlots) {
        coach.bookedSlots = coach.bookedSlots.filter(
          (b) => !(b.date === booking.date && b.slot === booking.slot)
        );
        await coach.save();
      }
    }

    await Booking.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createBooking, cancelBooking };

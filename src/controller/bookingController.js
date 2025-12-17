const Booking = require("../models/Booking");
const Court = require("../models/Court");
const { calculatePrice } = require("../services/pricingService");
const { isCourtAvailable } = require("../services/availabilityService");

exports.createBooking = async (req, res) => {
  try {
    const { userName, courtId, date, slot } = req.body;

    const court = await Court.findById(courtId);
    if (!court) return res.status(404).json({ message: "Court not found" });

    const available = await isCourtAvailable(courtId, date, slot);
    if (!available) {
      return res.status(409).json({ message: "Slot already booked" });
    }

    const basePrice = court.type === "indoor" ? 500 : 300;

    const totalPrice = await calculatePrice({
      basePrice,
      isIndoor: court.type === "indoor",
      date,
      slot,
    });

    const booking = await Booking.create({
      userName,
      court: courtId,
      date,
      slot,
      totalPrice,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

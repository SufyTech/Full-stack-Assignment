// src/services/availabilityService.js
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");
const Coach = require("../models/Coach");

// Check if court is available for a given date and slot
const isCourtAvailable = async (courtId, date, slot) => {
  const existingBooking = await Booking.findOne({
    court: courtId,
    date,
    slot,
    status: "confirmed",
  });
  return !existingBooking; // true if no confirmed booking exists
};

// Check if equipment is available
const isEquipmentAvailable = async (equipmentIds = []) => {
  for (let id of equipmentIds) {
    const equipment = await Equipment.findById(id);
    if (!equipment) return false;

    // Treat empty bookedSlots as available
    const booked = equipment.bookedSlots || [];
    const totalBookedForAllSlots = booked.reduce(
      (sum, b) => sum + (b.qtyBooked || 0),
      0
    );

    if (totalBookedForAllSlots >= equipment.totalQuantity) return false;
  }
  return true;
};

// Check if coach is available for a given date and slot
const isCoachAvailable = async (coachId, date, slot) => {
  if (!coachId) return true;

  const coach = await Coach.findById(coachId);
  if (!coach) return false;

  // Treat empty availableSlots as available for all
  const slots = coach.availableSlots || [];
  const slotAvailable = slots.length === 0 || slots.includes(slot);

  // Status default to active if missing
  const isActive = !coach.status || coach.status === "active";

  // Ensure coach is not already booked
  const existingBooking = await Booking.findOne({
    coach: coachId,
    date,
    slot,
    status: "confirmed",
  });

  return slotAvailable && isActive && !existingBooking;
};

module.exports = { isCourtAvailable, isEquipmentAvailable, isCoachAvailable };

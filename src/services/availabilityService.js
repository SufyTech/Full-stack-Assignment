const Booking = require("../models/Booking");

const isCourtAvailable = async (courtId, date, slot) => {
  const booking = await Booking.findOne({ court: courtId, date, slot });
  return !booking;
};

module.exports = { isCourtAvailable };

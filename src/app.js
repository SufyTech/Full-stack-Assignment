const express = require("express");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const courtRoutes = require("./routes/courtRoutes");
const coachRoutes = require("./routes/coachRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const pricingRuleRoutes = require("./routes/pricingRuleRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/bookings", bookingRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/pricing-rules", pricingRuleRoutes);
app.use("/api/waitlist", waitlistRoutes);

module.exports = app;

const express = require("express");
const cors = require("cors");

// Import routes
const bookingRoutes = require("./routes/bookingRoutes");
const courtRoutes = require("./routes/courtRoutes");
const coachRoutes = require("./routes/coachRoutes");
const equipmentRoutes = require("./routes/equipmentRoutes");
const pricingRuleRoutes = require("./routes/pricingRuleRoutes");
const waitlistRoutes = require("./routes/waitlistRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());

// Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/pricing-rules", pricingRuleRoutes);
app.use("/api/waitlist", waitlistRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("CourtBook Backend is running!");
});

module.exports = app;

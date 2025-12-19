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

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000", // Local development
  "https://fullstacktask-theta.vercel.app", // Your deployed frontend
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
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

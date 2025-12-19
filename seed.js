// seed.js
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// Helper to safely require models
const safeRequire = (modelName) => {
  let modelPath = path.join(__dirname, "models", modelName);
  if (!fs.existsSync(modelPath + ".js")) {
    modelPath = path.join(__dirname, "src", "models", modelName);
    if (!fs.existsSync(modelPath + ".js")) {
      console.error(`❌ Cannot find model ${modelName}`);
      process.exit(1);
    }
  }
  return require(modelPath);
};

// Load models
const Court = safeRequire("Court");
const Equipment = safeRequire("Equipment");
const Coach = safeRequire("Coach");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/courtBooking");
    console.log("✅ MongoDB connected successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  try {
    // Clear previous data
    await Court.deleteMany({});
    await Equipment.deleteMany({});
    await Coach.deleteMany({});

    // COURTS
    const courts = [
      { name: "Court 1", type: "indoor", isActive: true },
      { name: "Court 2", type: "indoor", isActive: true },
      { name: "Court 3", type: "outdoor", isActive: true },
      { name: "Court 4", type: "outdoor", isActive: true },
    ];

    // EQUIPMENT
    const equipment = [
      { name: "Racket", totalQuantity: 10, pricePerHour: 5, bookedSlots: [] },
      { name: "Shoes", totalQuantity: 10, pricePerHour: 3, bookedSlots: [] },
    ];

    // COACHES
    const coaches = [
      { name: "Coach John", hourlyRate: 10, status: "active", bookedSlots: [] },
      {
        name: "Coach Sarah",
        hourlyRate: 12,
        status: "active",
        bookedSlots: [],
      },
      { name: "Coach Mike", hourlyRate: 8, status: "active", bookedSlots: [] },
    ];

    // Insert all into DB
    await Court.insertMany(courts);
    await Equipment.insertMany(equipment);
    await Coach.insertMany(coaches);

    console.log("✅ Database seeding completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected.");
  }
};

seed();

const mongoose = require("mongoose");
require("dotenv").config();

const Court = require("./models/Court");
const PricingRule = require("./models/PricingRule");

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
  await Court.deleteMany();
  await PricingRule.deleteMany();

  await Court.insertMany([
    { name: "Court 1", type: "indoor" },
    { name: "Court 2", type: "indoor" },
    { name: "Court 3", type: "outdoor" },
    { name: "Court 4", type: "outdoor" },
  ]);

  await PricingRule.insertMany([
    { name: "Indoor Premium", type: "indoor", multiplier: 1.3 },
    { name: "Peak Hour", type: "peak", multiplier: 1.5 },
    { name: "Weekend", type: "weekend", multiplier: 1.2 },
  ]);

  console.log("Seed data inserted");
  process.exit();
};

seedData();

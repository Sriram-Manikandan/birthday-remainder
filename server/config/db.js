const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in .env");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;

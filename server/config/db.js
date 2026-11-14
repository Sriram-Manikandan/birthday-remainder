const mongoose = require("mongoose");

// System design basics: Mongoose connects the backend API to its persistent MongoDB store.
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

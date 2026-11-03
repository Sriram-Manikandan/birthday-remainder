const mongoose = require("mongoose");

// "people" collection. Primary key = _id (Mongo makes it automatically).
const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    // Stored as "YYYY-MM-DD" text so timezones can never shift the day
    birthday: {
      type: String,
      required: [true, "Birthday is required"],
      match: [/^\d{4}-\d{2}-\d{2}$/, "Birthday must look like YYYY-MM-DD"],
    },
    group: { type: String, enum: ["friend", "family"], required: true },
    gift: { type: String, default: "" },
    about: { type: String, default: "" },
    instagramCaption: { type: String, default: "" },
  },
  { timestamps: true }
);

// Secondary index: makes "give me all friends" fast
personSchema.index({ group: 1 });

module.exports = mongoose.model("Person", personSchema);

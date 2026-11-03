const mongoose = require("mongoose");

// "reminders" collection. Primary key = _id.
// "person" is a FOREIGN KEY pointing to people._id (one person -> many reminders)
const reminderSchema = new mongoose.Schema(
  {
    person: { type: mongoose.Schema.Types.ObjectId, ref: "Person", required: true },
    daysBefore: { type: Number, required: true, min: 0, max: 60 }, // 0 = on the day, 7 = a week before
    time: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Time must look like HH:MM (24 hour)"],
    },
  },
  { timestamps: true }
);

// Secondary key: look up reminders by person quickly
reminderSchema.index({ person: 1 });
// Same person can't have the exact same reminder twice (causes a 409 Conflict)
reminderSchema.index({ person: 1, daysBefore: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Reminder", reminderSchema);

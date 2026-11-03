const express = require("express");
const Reminder = require("../models/Reminder");
const Person = require("../models/Person");
const asyncHandler = require("../middleware/asyncHandler");
const { validateReminder } = require("../middleware/validate");

const router = express.Router();

// READ all -> GET /api/reminders  (or ?person=<id>)
// populate() swaps the foreign key for the real person data (like a JOIN)
router.get("/", asyncHandler(async (req, res) => {
  const filter = req.query.person ? { person: req.query.person } : {};
  const reminders = await Reminder.find(filter).populate("person", "name birthday group");
  res.status(200).json(reminders);
}));

// CREATE -> POST /api/reminders
router.post("/", validateReminder, asyncHandler(async (req, res) => {
  const owner = await Person.findById(req.body.person);
  if (!owner) return res.status(404).json({ message: "Person not found for this reminder" });
  const { person, daysBefore, time } = req.body;
  const reminder = await Reminder.create({ person, daysBefore, time });
  res.status(201).json(reminder);
}));

// DELETE -> DELETE /api/reminders/:id
router.delete("/:id", asyncHandler(async (req, res) => {
  const reminder = await Reminder.findByIdAndDelete(req.params.id);
  if (!reminder) return res.status(404).json({ message: "Reminder not found" });
  res.status(200).json({ message: "Reminder deleted" });
}));

module.exports = router;

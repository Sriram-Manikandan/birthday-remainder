const express = require("express");
const Person = require("../models/Person");
const Reminder = require("../models/Reminder");
const asyncHandler = require("../middleware/asyncHandler");
const { validatePerson } = require("../middleware/validate");

const router = express.Router();

// Only take the fields we allow from the request body
const pickFields = ({ name, birthday, group, gift, about, instagramCaption }) => ({
  name, birthday, group, gift, about, instagramCaption,
});

// READ all  -> GET /api/people?group=friend
router.get("/", asyncHandler(async (req, res) => {
  const filter = req.query.group ? { group: req.query.group } : {};
  const people = await Person.find(filter).sort({ name: 1 });
  res.status(200).json(people);
}));

// READ one  -> GET /api/people/:id
router.get("/:id", asyncHandler(async (req, res) => {
  const person = await Person.findById(req.params.id);
  if (!person) return res.status(404).json({ message: "Person not found" });
  res.status(200).json(person);
}));

// CREATE    -> POST /api/people
router.post("/", validatePerson, asyncHandler(async (req, res) => {
  const person = await Person.create(pickFields(req.body));
  res.status(201).json(person);
}));

// UPDATE    -> PUT /api/people/:id
router.put("/:id", validatePerson, asyncHandler(async (req, res) => {
  const person = await Person.findByIdAndUpdate(req.params.id, pickFields(req.body), {
    new: true,
    runValidators: true,
  });
  if (!person) return res.status(404).json({ message: "Person not found" });
  res.status(200).json(person);
}));

// DELETE    -> DELETE /api/people/:id  (also removes their reminders)
router.delete("/:id", asyncHandler(async (req, res) => {
  const person = await Person.findByIdAndDelete(req.params.id);
  if (!person) return res.status(404).json({ message: "Person not found" });
  await Reminder.deleteMany({ person: req.params.id });
  res.status(200).json({ message: "Person deleted" });
}));

module.exports = router;

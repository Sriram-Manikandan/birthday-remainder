// Validation middleware: stops bad data BEFORE it reaches the route.
function validatePerson(req, res, next) {
  const { name, birthday, group } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "Name is required" });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday || ""))
    return res.status(400).json({ message: "Birthday must look like YYYY-MM-DD" });
  if (!["friend", "family"].includes(group))
    return res.status(400).json({ message: "Group must be 'friend' or 'family'" });
  next();
}

function validateReminder(req, res, next) {
  const { person, daysBefore, time } = req.body;
  if (!person) return res.status(400).json({ message: "person id is required" });
  if (typeof daysBefore !== "number" || daysBefore < 0)
    return res.status(400).json({ message: "daysBefore must be a number (0 or more)" });
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time || ""))
    return res.status(400).json({ message: "time must look like HH:MM (24 hour)" });
  next();
}

module.exports = { validatePerson, validateReminder };

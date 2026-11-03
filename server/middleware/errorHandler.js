// 404 - no route matched
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Central error handler (4 arguments = Express knows it's an error handler)
function errorHandler(err, req, res, next) {
  console.error("Error:", err.message);

  if (err.name === "ValidationError")
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(", ") });
  if (err.name === "CastError")
    return res.status(400).json({ message: "Invalid id format" });
  if (err.code === 11000)
    return res.status(409).json({ message: "That already exists (duplicate)" });

  res.status(500).json({ message: "Something went wrong on the server" });
}

module.exports = { notFound, errorHandler };

require("dotenv").config(); // loads .env into process.env
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middleware: each request passes through these shared CORS, parsing, and logging steps.
app.use(cors());
app.use(express.json()); // lets us read req.body
app.use(logger("API"));

// System design basics: Express routes connect client requests to MongoDB-backed operations.
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/people", require("./routes/people"));
app.use("/api/reminders", require("./routes/reminders"));

// ---- These two MUST come last ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});

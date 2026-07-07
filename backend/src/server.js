require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ name: "GrowEasy CSV Importer API", status: "running" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 GrowEasy CSV Importer API listening on port ${PORT}`);
  console.log(`   AI provider: ${process.env.OPENAI_API_KEY ? "OpenAI (" + (process.env.OPENAI_MODEL || "gpt-4o-mini") + ")" : "heuristic fallback (no OPENAI_API_KEY set)"}`);
});

module.exports = app;

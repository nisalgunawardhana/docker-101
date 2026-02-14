const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({
    message: "Custom App - Docker 101 Lab 3",
    hostname: os.hostname(),
    platform: process.platform,
    node: process.version,
    time_utc: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", time_utc: new Date().toISOString() });
});

app.get("/env", (req, res) => {
  res.json({
    env: process.env.NODE_ENV || "not_set",
    port: PORT,
    pid: process.pid
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down...");
  process.exit(0);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

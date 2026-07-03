const express = require("express");
const os = require("os");

const app = express();

app.get("/", (req, res) => {
  res.json({
    message: "Custom Docker App",
    version: "1.0.0",
    hostname: os.hostname()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
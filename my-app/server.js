const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect("mongodb://mongo:27017/testdb")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Node + Docker + MongoDB is working!");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

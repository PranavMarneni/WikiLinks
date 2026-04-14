const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3001;

const FILE = path.join(__dirname, "challenges.json");
const cors = require("cors");
app.use(cors());
app.get("/api/challenges", (req, res) => {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: "No challenges available" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
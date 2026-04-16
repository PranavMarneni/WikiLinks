require("dotenv").config();

const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;
const FILE = path.join(__dirname, "challenges.json");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const realtimeEnabled = Boolean(
  process.env.MONGODB_URI && process.env.FIREBASE_PROJECT_ID
);

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, realtimeEnabled });
});

app.get("/api/challenges", (_req, res) => {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: "No challenges available" });
  }
});

if (realtimeEnabled) {
  const connectDB = require("./config/db");
  const initSocket = require("./socket");

  initSocket(httpServer);
  connectDB().catch((error) => {
    console.error("DB connection failed:", error.message);
  });
} else {
  console.log(
    "Realtime features disabled. Set MONGODB_URI and FIREBASE_PROJECT_ID to enable sockets."
  );
}

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
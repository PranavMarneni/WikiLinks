require("dotenv").config();

const express = require("express");
const fs = require("fs");
const http = require("http");
const path = require("path");
const cors = require("cors");
const Challenges = require("./models/Challenges");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 3001;
const FILE = path.join(__dirname, "challenges.json");
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const mongoConfigured = Boolean(process.env.MONGODB_URI);
const realtimeEnabled = mongoConfigured && Boolean(process.env.FIREBASE_PROJECT_ID);

app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, realtimeEnabled });
});

app.get("/api/challenges", async (_req, res) => {
  if (mongoConfigured) {
    try {
      const doc = await Challenges.findById("current").lean();
      if (doc) {
        return res.json({ challenges: doc.challenges });
      }
    } catch (err) {
      console.error("Failed to read challenges from MongoDB:", err.message);
    }
  }

  try {
    const data = fs.readFileSync(FILE, "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(500).json({ error: "No challenges available" });
  }
});

if (mongoConfigured) {
  const connectDB = require("./config/db");
  connectDB().catch((error) => {
    console.error("DB connection failed:", error.message);
  });
}

let io = null;

if (realtimeEnabled) {
  const initSocket = require("./socket");
  io = initSocket(httpServer);
} else {
  console.log(
    "Realtime features disabled. Set MONGODB_URI and FIREBASE_PROJECT_ID to enable sockets."
  );
}

if (process.env.OPENROUTER_API_KEY) {
  const initScheduler = require("./scheduler");
  initScheduler(io);
} else {
  console.log(
    "Daily challenge generation disabled. Set OPENROUTER_API_KEY to enable it."
  );
}

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
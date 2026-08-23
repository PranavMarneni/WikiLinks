require("dotenv").config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { generateWithRetry } = require("./generate");
const Challenges = require("./models/Challenges");
const APP_TIMEZONE = require("./config/timezone");
const registerGameHandlers = require("./socket/gameHandlers");
const { getLeaderboard } = registerGameHandlers;

const FILE = path.join(__dirname, "challenges.json");
const mongoConfigured = Boolean(process.env.MONGODB_URI);

async function persist(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

  if (mongoConfigured) {
    try {
      await Challenges.findOneAndUpdate(
        { _id: "current" },
        { $set: { challenges: data.challenges } },
        { upsert: true }
      );
    } catch (err) {
      console.error("Failed to persist challenges to MongoDB:", err.message);
    }
  }
}

async function hasStoredChallenges() {
  if (mongoConfigured) {
    try {
      const existing = await Challenges.findById("current").lean();
      return Boolean(existing);
    } catch (err) {
      console.error("Failed to check MongoDB for existing challenges:", err.message);
      return fs.existsSync(FILE);
    }
  }
  return fs.existsSync(FILE);
}

async function run(io) {
  try {
    console.log("Generating new challenges...");

    const data = await generateWithRetry();

    await persist(data);

    console.log("New challenges generated.");

    // Push the new day's challenges and a fresh leaderboard to anyone already
    // connected — otherwise a browser tab open through midnight would keep
    // showing yesterday's challenges/leaderboard until its next refresh.
    if (io) {
      io.emit("challenges:updated", { challenges: data.challenges });
      try {
        const board = await getLeaderboard();
        io.emit("leaderboard:update", board);
      } catch (err) {
        console.error("Failed to broadcast reset leaderboard:", err.message);
      }
    }
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

function initScheduler(io) {
  cron.schedule("0 0 * * *", () => {
    console.log("12:00 AM trigger.");
    run(io);
  }, { timezone: APP_TIMEZONE });

  (async () => {
    if (await hasStoredChallenges()) {
      console.log("Challenges found. Waiting for 12:00 AM.");
    } else {
      console.log("No challenges found, generating...");
      run(io);
    }
  })();
}

module.exports = initScheduler;

require("dotenv").config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { generateWithRetry } = require("./generate");
const Challenges = require("./models/Challenges");

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

async function run() {
  try {
    console.log("Generating new challenges...");

    const data = await generateWithRetry();

    await persist(data);

    console.log("New challenges generated.");
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

cron.schedule("0 0 * * *", () => {
  console.log("12:00 AM trigger.");
  run();
});

(async () => {
  if (await hasStoredChallenges()) {
    console.log("Challenges found. Waiting for 12:00 AM.");
  } else {
    console.log("No challenges found, generating...");
    run();
  }
})();

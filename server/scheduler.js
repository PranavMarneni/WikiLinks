require("dotenv").config();
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const { generateWithRetry } = require("./generate");

const FILE = path.join(__dirname, "challenges.json");

async function run() {
  try {
    console.log("Generating new challenges...");

    const data = await generateWithRetry();

    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));

    console.log("New challenges generated.");
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

cron.schedule("00 00 * * *", () => {
  console.log("12:00 AM trigger.");
  run();
});

if (!fs.existsSync(FILE)) {
  console.log("No challenges found, generating...");
  run();
} else {
  console.log("Challenges found. Waiting for 12:00 AM.");
}
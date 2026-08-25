require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const UserProfile = require("./models/UserProfile");

async function main() {
  await connectDB();

  const profiles = await UserProfile.find({ phoneNumber: { $ne: null } })
    .select("phoneNumber displayName -_id")
    .lean();

  const outPath = path.join(__dirname, "phone-numbers.csv");
  const rows = ["phoneNumber,displayName"];
  for (const p of profiles) {
    const name = (p.displayName || "").replace(/"/g, '""');
    rows.push(`${p.phoneNumber},"${name}"`);
  }
  fs.writeFileSync(outPath, rows.join("\n"));

  console.log(`Exported ${profiles.length} phone numbers to ${outPath}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});

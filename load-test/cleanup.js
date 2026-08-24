require("dotenv").config({ path: "../server/.env" });
const path = require("path");
const mongoose = require("mongoose");
const admin = require("firebase-admin");

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "service-account.json");
const UID_PREFIX = "loadtest-user-";

async function cleanupMongo() {
  // Use raw collection access on this package's own mongoose connection rather
  // than importing ../server/models/GameSession — that file's own `require('mongoose')`
  // resolves to server/node_modules' separate copy, a different module instance
  // than this one, so it would never see this connection (hangs until buffering
  // timeout instead of erroring cleanly).
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.db
    .collection("gamesessions")
    .deleteMany({ userId: { $regex: `^${UID_PREFIX}` } });
  console.log(`Deleted ${result.deletedCount} GameSession documents.`);
  await mongoose.disconnect();
}

async function cleanupFirebaseUsers() {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  let uidsToDelete = [];
  let nextPageToken;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    uidsToDelete.push(
      ...result.users.filter((u) => u.uid.startsWith(UID_PREFIX)).map((u) => u.uid)
    );
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log(`Found ${uidsToDelete.length} load-test Firebase Auth users to delete.`);

  for (let i = 0; i < uidsToDelete.length; i += 1000) {
    const batch = uidsToDelete.slice(i, i + 1000);
    await admin.auth().deleteUsers(batch);
    console.log(`  Deleted ${Math.min(i + 1000, uidsToDelete.length)}/${uidsToDelete.length}`);
  }
}

async function main() {
  console.log("Cleaning up load-test data...");
  await cleanupMongo();
  await cleanupFirebaseUsers();
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});

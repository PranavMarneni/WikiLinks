require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "service-account.json");
const API_KEY = process.env.VITE_APP_FIREBASE_API_KEY;
const USER_COUNT = parseInt(process.argv[2], 10) || 300;
const BATCH_SIZE = 10;
const BATCH_DELAY_MS = 1200;
const OUT_FILE = path.join(__dirname, "tokens.csv");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`Missing ${SERVICE_ACCOUNT_PATH} — download it from Firebase Console > Project Settings > Service Accounts.`);
  process.exit(1);
}
if (!API_KEY) {
  console.error("VITE_APP_FIREBASE_API_KEY not found in ../.env");
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function withRetry(fn, label, attempt = 1) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === "auth/quota-exceeded" && attempt < 5) {
      const delay = 2000 * attempt;
      console.log(`  Quota hit on ${label}, backing off ${delay}ms...`);
      await sleep(delay);
      return withRetry(fn, label, attempt + 1);
    }
    throw err;
  }
}

async function ensureTestUser(uid, displayName) {
  // getUser is a read against a much more generous quota than create/update,
  // so only pay the write-quota cost for users that don't exist yet —
  // avoids re-hitting the account-management rate limit on every re-run.
  try {
    await admin.auth().getUser(uid);
    return;
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
  }
  await withRetry(() => admin.auth().createUser({ uid, displayName }), `createUser(${uid})`);
}

async function mintIdToken(uid) {
  const customToken = await withRetry(() => admin.auth().createCustomToken(uid), `createCustomToken(${uid})`);
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const data = await res.json();
  if (!data.idToken) {
    throw new Error(`Failed to exchange custom token for ${uid}: ${JSON.stringify(data)}`);
  }
  return data.idToken;
}

async function generateOne(i) {
  const uid = `loadtest-user-${i}`;
  const displayName = `LoadTest ${i}`;
  await ensureTestUser(uid, displayName);
  return mintIdToken(uid);
}

async function main() {
  console.log(`Generating ${USER_COUNT} test users + ID tokens...`);
  const tokens = [];

  for (let start = 0; start < USER_COUNT; start += BATCH_SIZE) {
    const batchIndices = Array.from(
      { length: Math.min(BATCH_SIZE, USER_COUNT - start) },
      (_, k) => start + k + 1
    );
    const batchTokens = await Promise.all(batchIndices.map(generateOne));
    tokens.push(...batchTokens);
    console.log(`  ${tokens.length}/${USER_COUNT} done`);
    await sleep(BATCH_DELAY_MS);
  }

  // no header row — Artillery's CSV payload treats every line as data when `fields` is set explicitly
  fs.writeFileSync(OUT_FILE, tokens.join("\n"));
  console.log(`Wrote ${tokens.length} tokens to ${OUT_FILE}`);
  console.log("Note: Firebase ID tokens expire after 1 hour — run the load test soon after generating these.");
  process.exit(0);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});

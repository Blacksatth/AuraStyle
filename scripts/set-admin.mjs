import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const uid = process.argv[2];

if (!uid) {
  console.error("Uso: node scripts/set-admin.mjs <UID>");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync(new URL("../serviceAccountKey.json", import.meta.url), "utf8"),
);

initializeApp({ credential: cert(serviceAccount) });

await getAuth().setCustomUserClaims(uid, { admin: true });
console.log(`Usuario ${uid} marcado como admin`);

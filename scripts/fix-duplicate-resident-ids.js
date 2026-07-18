/**
 * Migration script to fix duplicated or missing residentIDs in Firestore.
 *
 * Usage:
 *   Set `GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON, then run:
 *     node scripts/fix-duplicate-resident-ids.js
 */

const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Please set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

const db = admin.firestore();

function extractPrefixedNumber(value, prefix) {
  if (typeof value !== "string" || !value.startsWith(prefix)) return null;
  const numericPart = parseInt(value.slice(prefix.length), 10);
  return Number.isFinite(numericPart) ? numericPart : null;
}

function formatPrefixedNumber(prefix, value, width = 3) {
  return `${prefix}${String(value).padStart(width, "0")}`;
}

async function main() {
  console.log("Fetching users...");
  const usersSnap = await db.collection("users").get();
  const users = [];
  usersSnap.forEach((d) => users.push({ id: d.id, data: d.data() }));

  // Build map of residentID -> [users]
  const byId = new Map();
  let maxNumber = 0;

  for (const u of users) {
    const rid = String((u.data && u.data.residentID) || "").trim();
    const num = extractPrefixedNumber(rid, "R");
    if (typeof num === "number") maxNumber = Math.max(maxNumber, num);
    const key = rid.toLowerCase();
    if (!byId.has(key)) byId.set(key, []);
    byId.get(key).push(u);
  }

  // Determine which users need new IDs: empty or duplicate groups
  const changes = [];
  for (const [ridLower, arr] of byId.entries()) {
    if (ridLower === "" || arr.length > 1) {
      // If empty, all users need new IDs. If duplicates, keep first and reassign others.
      for (let i = 0; i < arr.length; i++) {
        const user = arr[i];
        const currentRid = String((user.data && user.data.residentID) || "").trim();
        if (currentRid === "") {
          changes.push({ userId: user.id, oldId: currentRid, assignNew: true });
        } else if (arr.length > 1 && i > 0) {
          // keep the first occurrence, reassign subsequent duplicates
          changes.push({ userId: user.id, oldId: currentRid, assignNew: true });
        }
      }
    }
  }

  if (changes.length === 0) {
    console.log("No duplicate or empty residentIDs found. Nothing to do.");
    return;
  }

  // Assign new IDs sequentially
  const mapping = {};
  for (const c of changes) {
    maxNumber += 1;
    const newId = formatPrefixedNumber("R", maxNumber, 3);
    mapping[c.userId] = { oldId: c.oldId, newId };
  }

  console.log("Planned reassignment for", Object.keys(mapping).length, "users");

  // Update user docs and related collections
  const relatedCollections = [
    "complaints",
    "pickupRequests",
    "wasteCollections",
    "redemptions",
    "notifications",
    "collectionCenters",
    "collection-center",
  ];

  // Helper to batch update
  const BATCH_LIMIT = 500;

  // Update user documents
  const userIds = Object.keys(mapping);
  let i = 0;
  while (i < userIds.length) {
    const batch = db.batch();
    const slice = userIds.slice(i, i + BATCH_LIMIT);
    for (const uid of slice) {
      const { newId } = mapping[uid];
      const ref = db.collection("users").doc(uid);
      batch.update(ref, { residentID: newId });
    }
    await batch.commit();
    i += slice.length;
  }

  console.log("Updated user documents.");

  // Update related collections where residentID field equals oldId
  for (const uid of userIds) {
    const { oldId, newId } = mapping[uid];
    if (!oldId) {
      // nothing to replace in other collections
      continue;
    }

    for (const col of relatedCollections) {
      const qSnap = await db.collection(col).where("residentID", "==", oldId).get();
      if (qSnap.empty) continue;
      console.log(`Updating ${qSnap.size} docs in ${col} from ${oldId} -> ${newId}`);
      let j = 0;
      const docs = [];
      qSnap.forEach((d) => docs.push(d));
      while (j < docs.length) {
        const batch = db.batch();
        const slice = docs.slice(j, j + BATCH_LIMIT);
        for (const d of slice) {
          batch.update(d.ref, { residentID: newId });
        }
        await batch.commit();
        j += slice.length;
      }
    }
  }

  console.log("Migration complete. Mapping (userId -> oldId -> newId):");
  console.log(mapping);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

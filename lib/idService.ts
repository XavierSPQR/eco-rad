import { doc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";
import { formatPrefixedNumber } from "./idFormat";

// Atomically allocate the next numeric ID for a given prefix using a counter
export async function getNextPrefixedId(prefix = "R", width = 3) {
  const counterRef = doc(db, "counters", "ids");

  const newId = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    let lastNumber = 0;
    if (snap.exists()) {
      const data = snap.data() as { lastNumber?: number };
      lastNumber = Number.isFinite(data.lastNumber as any) ? (data.lastNumber as number) : 0;
    }

    const next = lastNumber + 1;
    tx.set(counterRef, { lastNumber: next }, { merge: true });

    return formatPrefixedNumber(prefix, next, width);
  });

  return newId;
}

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, query, collection, where, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { getNextPrefixedId } from "./idService";

export type UserRole = "resident" | "collector" | "admin";

export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  district: string;
  address: string;
  nic: string;
  routeID?: string;
  residentID?: string;
  employeeID?: string;
  role: UserRole;
  points: number;
  residences: number;
  badgeLevel?: string;
  badgeProgress?: number;
};

export async function signUpResident(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "role" | "points" | "residences">
) {
  // Step 1: Create the Firebase Auth user
  let user: User;
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    user = credential.user;
  } catch (authError: any) {
    // Re-throw auth errors as-is — they already carry the correct Firebase error code
    // e.g. auth/email-already-in-use, auth/weak-password, auth/invalid-email
    console.error("[signUpResident] Auth error:", authError.code, authError.message);
    throw authError;
  }

  // Step 2: Write the Firestore user profile document
  try {
    // Allocate a residentID server-side (transactionally) if none provided
    const residentID = profile.residentID?.trim()
      ? profile.residentID
      : await getNextPrefixedId("R", 3);

    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      uid: user.uid,
      email, // always use the canonical email param
      role: "resident" as UserRole,
      residentID,
      routeID: profile.routeID ?? "",
      points: 0,
      residences: 0,
      badgeLevel: "Green Contributor",
      badgeProgress: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (firestoreError: any) {
    // The auth user was created successfully but the Firestore write failed.
    // Re-throw with a clear code so the UI can display a meaningful message.
    console.error(
      "[signUpResident] Firestore write error:",
      firestoreError.code,
      firestoreError.message
    );
    const err: any = new Error(
      firestoreError.message ?? "Failed to save user profile to database."
    );
    err.code = firestoreError.code ?? "firestore/write-failed";
    throw err;
  }

  return user;
}

export async function signIn(email: string, password: string) {
  let user: User;
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    user = credential.user;
  } catch (authError: any) {
    console.error("[signIn] Auth error:", authError.code, authError.message);
    throw authError;
  }

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    return { user, profile: snap.exists() ? (snap.data() as UserProfile) : null };
  } catch (firestoreError: any) {
    console.error(
      "[signIn] Firestore read error:",
      firestoreError.code,
      firestoreError.message
    );
    // Still return the user even if profile fetch fails — the UI can handle a null profile
    return { user, profile: null };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("[logOut] Error:", error.code, error.message);
    throw error;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("[sendPasswordReset] Error:", error.code, error.message);
    throw error;
  }
}

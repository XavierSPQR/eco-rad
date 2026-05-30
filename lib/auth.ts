import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "resident" | "collector" | "admin";

export type UserProfile = {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  district: string;
  address: string;
  nic: string;
  role: UserRole;
  points: number;
  residences: number;
};

export async function signUpResident(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "role" | "points" | "residences">
) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    role: "resident",
    points: 0,
    residences: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...profile,
    email, // Ensure email from auth is used if not in profile, but it's already in profile
  });

  return user;
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", user.uid));
  return { user, profile: snap.data() as UserProfile };
}

export async function logOut() {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
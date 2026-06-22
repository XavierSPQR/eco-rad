import { db } from "./firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export type NotificationType = "truck" | "verified" | "reward" | "resolved" | "announcement";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: any;
  read: boolean;
};

export function subscribeToNotifications(userId: string, callback: (items: Notification[]) => void) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Notification[];
    callback(items);
  });
}

export async function markAllRead(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);
    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { read: true });
    });
    await batch.commit();
  } catch (e) {
    console.error("Failed to mark all notifications as read:", e);
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (e) {
    console.error("Failed to mark notification as read:", e);
  }
}

export async function createNotification(notification: Omit<Notification, "id" | "createdAt" | "read">) {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Failed to create notification:", e);
  }
}

import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function notifyAllAdmins(title: string, description: string, type: "truck" | "verified" | "reward" | "resolved" | "announcement" = "announcement") {
  try {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const snapshot = await getDocs(q);
    const adminIds = snapshot.docs.map(doc => doc.id);

    const promises = adminIds.map(adminId =>
      addDoc(collection(db, "notifications"), {
        userId: adminId,
        title,
        description,
        type,
        read: false,
        createdAt: serverTimestamp(),
      })
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error notifying admins:", error);
  }
}

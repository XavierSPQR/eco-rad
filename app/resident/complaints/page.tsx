"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

type ComplaintStatus = "In review" | "Resolved";

type Complaint = {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  location: string;
  photoUrl?: string;
  createdAt: Timestamp | { seconds: number; nanoseconds: number } | null;
  updatedAt: Timestamp | { seconds: number; nanoseconds: number } | null;
};

export default function ComplaintsPage() {
  const { user, profile } = useAuth();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState<"" | "success" | "error" | "auth-error" | "permission-denied" | "index-needed">("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "complaints"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Complaint[];
        setComplaints(docs);
      },
      (error) => {
        console.error("Error fetching complaints:", error);
        if (error.code === "permission-denied") {
          setMessage("permission-denied");
        } else if (error.message.includes("index")) {
          setMessage("index-needed");
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !submitLoading;

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleLocation = async () => {
    if (!navigator.geolocation) {
      setMessage("error");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setGeoLoading(false);
      },
      () => {
        setMessage("error");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setMessage("error");
      return;
    }

    if (!user || !profile) {
      setMessage("auth-error");
      return;
    }

    setSubmitLoading(true);
    setMessage("");

    try {
      let photoUrl = "";
      if (photoFile) {
        const storageRef = ref(storage, `complaints/${user.uid}/${Date.now()}_${photoFile.name}`);
        const uploadResult = await uploadBytes(storageRef, photoFile);
        photoUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, "complaints"), {
        userId: user.uid,
        userName: profile.fullName,
        subject,
        description,
        status: "In review",
        location: location || "Not provided",
        photoUrl: photoUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubject("");
      setDescription("");
      setPhotoFile(null);
      setLocation("");
      setMessage("success");
    } catch (error: any) {
      console.error("Error submitting complaint:", error);
      if (error.code === "permission-denied") {
        setMessage("permission-denied");
      } else {
        setMessage("error");
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const statusCounts = useMemo(
    () => ({
      inReview: complaints.filter((c) => c.status === "In review").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    }),
    [complaints]
  );

  const formatDate = (timestamp: Timestamp | { seconds: number; nanoseconds: number } | null) => {
    if (!timestamp) return "Just now";
    const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.pageRoot}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.pageOverline}>Complaint Center</p>
          <h1 className={styles.pageTitle}>Submit Complaint </h1>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <section className={styles.formCard}>
          <div className={styles.cardHeader}>
            <h2>File a complaint</h2>
          </div>

          <label className={styles.inputGroup}>
            <span>Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Subject (e.g. Missed pickup)"
              disabled={submitLoading}
            />
          </label>

          <label className={styles.inputGroup}>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue."
              disabled={submitLoading}
            />
          </label>

          <div className={styles.actionRow}>
        
            <button type="button" className={styles.locationButton} onClick={handleLocation} disabled={submitLoading}>
              {geoLoading ? "Locating…" : "Location"}
            </button>
          </div>

          <button type="button" className={styles.submitButton} onClick={handleSubmit} disabled={!canSubmit}>
            {submitLoading ? "Submitting..." : "Submit"}
          </button>


          {message === "success" && <div className={styles.messageSuccess}>Complaint submitted and is now in review.</div>}
          {message === "error" && <div className={styles.messageError}>Please fill subject and description, or allow location access.</div>}
          {message === "auth-error" && <div className={styles.messageError}>Please sign in to submit a complaint.</div>}
          {message === "permission-denied" && <div className={styles.messageError}>Permission denied. Please check your Firestore rules.</div>}
          {message === "index-needed" && <div className={styles.messageError}>Firestore index required. Please check your console logs for the link.</div>}
        </section>

        <section className={styles.listCard}>
          <div className={styles.notificationPill}>
            <span>{statusCounts.inReview} in review</span>
            <span>{statusCounts.resolved} resolved</span>
          </div>

          {complaints.length === 0 ? (
            <p className={styles.emptyState}>No complaints found.</p>
          ) : (
            complaints.map((complaint) => (
              <article key={complaint.id} className={styles.complaintItem}>
                <div className={styles.complaintMeta}>
                  <span className={styles.complaintId}>#{complaint.id.slice(0, 8)}</span>
                  <span className={
                    complaint.status === "Resolved" ? styles.statusResolved : styles.statusReview
                  }>
                    {complaint.status}
                  </span>
                </div>
                <h3>{complaint.subject}</h3>
                <p>{complaint.description}</p>
                <div className={styles.complaintFooter}>
                  <span>{complaint.location}</span>
                  <span>{complaint.photoUrl ? "Photo evidence attached" : "No photo attached"}</span>
                  <span className={styles.dateLabel}>{formatDate(complaint.createdAt)}</span>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

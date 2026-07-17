"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function ProfilePage() {
  const { user, profile: authProfile, loading } = useAuth();

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    nic: "",
    residentID: "",
    routeID: "",
    residences: "",
  });

  const [credentials, setCredentials] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  const [saved, setSaved] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!authProfile) return;

    // Keep local form state in sync with the authenticated profile.
    setProfile({
      fullName: authProfile.fullName || "",
      email: authProfile.email || "",
      phone: authProfile.phone || "",
      address: authProfile.address || "",
      nic: authProfile.nic || "",
      residentID: authProfile.residentID || "",
      routeID: authProfile.routeID || "",
      residences: String(authProfile.residences ?? ""),
    });

    setCredentials((prev) => ({
      ...prev,
      username: authProfile.email?.split("@")[0] || "",
    }));
  }, [authProfile]);

  const handleChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };


  const handleCredentialChange = (
    field: keyof typeof credentials,
    value: string
  ) => {
    setCredentials((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleCancel = () => {
    if (authProfile) {
      setProfile({
        fullName: authProfile.fullName || "",
        email: authProfile.email || "",
        phone: authProfile.phone || "",
        address: authProfile.address || "",
        nic: authProfile.nic || "",
        residentID: authProfile.residentID || "",
        routeID: authProfile.routeID || "",
        residences: String(authProfile.residences ?? ""),
      });
    }

    setCredentials({
      username: authProfile?.email?.split("@")[0] || "",
      currentPassword: "",
      newPassword: "",
    });

    setSaved(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const userRef = doc(db, "users", user.uid);

      // Residents cannot edit `residentID`.
      await updateDoc(userRef, {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        nic: profile.nic,
        // Ensure residentID cannot be changed from the client.
        residentID: authProfile?.residentID ?? profile.residentID,
        routeID: profile.routeID,
        residences: Number(profile.residences || 0),
        updatedAt: serverTimestamp(),
      });

      setSaved(true);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.root}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.root}>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Settings</p>
          <h1 className={styles.title}>
            Manage your account, preferences and privacy.
          </h1>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeading}>
          <h2>Profile</h2>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.mainSection}>
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(event) =>
                    handleChange("fullName", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Phone</span>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>NIC</span>
                <input
                  type="text"
                  value={profile.nic}
                  onChange={(event) =>
                    handleChange("nic", event.target.value)
                  }
                  placeholder="e.g. 199012345678"
                />
              </label>

              <label className={styles.field}>
                <span>Resident ID</span>
                <input
                  type="text"
                  value={profile.residentID}
                  readOnly
                  aria-readonly="true"
                  placeholder="R001"
                />
                <small className={styles.panelNote}>
                  Resident ID is managed by the admin and cannot be edited.
                </small>
              </label>


              <label className={styles.field}>
                <span>Route ID</span>
                <input
                  type="text"
                  value={profile.routeID}
                  onChange={(event) =>
                    handleChange("routeID", event.target.value)
                  }
                  placeholder="RT001"
                />
              </label>

              <label className={styles.field}>
                <span>Residences</span>
                <input
                  type="number"
                  value={profile.residences}
                  onChange={(event) =>
                    handleChange("residences", event.target.value)
                  }
                />
              </label>

              <label className={styles.fieldFull}>
                <span>Address</span>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                />
              </label>
            </div>
          </div>

          <aside className={styles.sidebarSection}>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Login details</h3>

              <label className={styles.field}>
                <span>Username</span>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(event) =>
                    handleCredentialChange("username", event.target.value)
                  }
                />
              </label>

              <label className={styles.field}>
                <span>Current password</span>
                <input
                  type="password"
                  value={credentials.currentPassword}
                  onChange={(event) =>
                    handleCredentialChange(
                      "currentPassword",
                      event.target.value
                    )
                  }
                  placeholder="••••••••"
                />
              </label>

              <label className={styles.field}>
                <span>New password</span>
                <input
                  type="password"
                  value={credentials.newPassword}
                  onChange={(event) =>
                    handleCredentialChange("newPassword", event.target.value)
                  }
                  placeholder="••••••••"
                />
              </label>

              <p className={styles.panelNote}>
                Leave password blank to keep your current password.
              </p>
            </div>
          </aside>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={updating}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={updating}
          >
            {updating ? "Saving..." : "Save changes"}
          </button>
        </div>

        {saved && (
          <div className={styles.savedMessage}>
            Your profile changes have been saved.
          </div>
        )}
      </div>
    </div>
  );
}


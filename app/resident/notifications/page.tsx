"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { subscribeToNotifications, markAllRead, Notification, NotificationType } from "./data";
import { useAuth } from "@/context/AuthContext";

function iconForType(type: NotificationType) {
  switch (type) {
    case "truck":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 3h15v13H1z" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "verified":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "reward":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    case "resolved":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
          <path d="M15 6h6v6" />
        </svg>
      );
    case "announcement":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

function formatTime(createdAt: any) {
  if (!createdAt) return "Just now";
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffInSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSecs < 60) return "Just now";
  if (diffInSecs < 3600) return `${Math.floor(diffInSecs / 60)}m ago`;
  if (diffInSecs < 86400) return `${Math.floor(diffInSecs / 3600)}h ago`;
  if (diffInSecs < 172800) return "Yesterday";
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });

    markAllRead(user.uid);

    return () => unsubscribe();
  }, [user]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Notifications</p>
          <h1 className={styles.title}>Pickup updates, rewards, and announcements.</h1>
        </div>
      </header>

      <div className={styles.notificationCard}>
        <div className={styles.notificationBody}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No notifications yet.</div>
          ) : (
            notifications.map((notification) => (
              <article
                key={notification.id}
                className={`${styles.notificationItem} ${notification.read ? styles.notificationRead : ""}`}
              >
                <div className={styles.notificationIcon}>{iconForType(notification.type)}</div>
                <div className={styles.notificationText}>
                  <strong className={styles.notificationTitle}>{notification.title}</strong>
                  <span className={styles.notificationDesc}>{notification.description}</span>
                </div>
                <span className={styles.notificationTime}>{formatTime(notification.createdAt)}</span>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

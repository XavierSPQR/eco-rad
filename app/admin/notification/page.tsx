"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToNotifications, markAllRead, Notification } from "@/lib/notifications";

const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Live Tracking", href: "/admin/live-tracking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { divider: true, componentKey: "sep-top" },
  { label: "Residents", href: "/admin/users", icon: "👥" },
  { label: "Employees", href: "/admin/employee", icon: "👨‍💼" },
  { label: "Vehicles", href: "/admin/vehicle", icon: "🚗" },
  { divider: true, componentKey: "sep-people" },
  { label: "Reward Management", href: "/admin/reward-management", icon: "🎁" },
  { label: "Reward Store Management", href: "/admin/reward-store-management", icon: "🏪" },
  { label: "Reward Redeem Management", href: "/admin/reward-redeem-management", icon: "🎟️" },
  { divider: true, componentKey: "sep-reward" },
  { label: "Complaints", href: "/admin/complaint", icon: "💬" },
  { label: "Schedules", href: "/admin/schedules", icon: "📅" },
  { divider: true, componentKey: "sep-meta" },
  { label: "Reports", href: "/admin/report", icon: "📈" },
];

function NotificationIcon({ type }: { readonly type: string }) {
  if (type === "reward") {
    return <span aria-hidden="true">🎁</span>;
  }
  if (type === "resolved") {
    return <span aria-hidden="true">✓</span>;
  }
  if (type === "announcement") {
    return <span aria-hidden="true">📢</span>;
  }
  return <span aria-hidden="true">🔔</span>;
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

export default function AdminNotificationPage() {
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (items) => {
      setNotifications(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (user) {
      await markAllRead(user.uid);
    }
  };

  return (
    <RoleGuard allowedRole="admin">
      <div className="admin-root">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon" aria-label="EcoCycle Lanka logo">
              <svg
                width="22"
                height="22"
                viewBox="0 0 64 64"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-hidden="true"
              >
                <path
                  d="M32 6c6 4 12 4 16 9 4 5 6 12 4 19-2 7-4 10-6 14-2 4-2 8-4 12-2 4-8 6-14 6s-12-2-14-6c-2-4-2-8-4-12-2-4-4-7-6-14-2-7 0-14 4-19 4-5 10-5 16-9z"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 22c3-6 9-9 16-8 7 1 12 6 13 13"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M46 22l3 6-6-1"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d="M42 42c-3 6-9 9-16 8-7-1-12-6-13-13"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M18 42l-3-6 6 1"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <path
                  d="M32 28c6 1 10 6 10 12-6 1-12-2-15-7-1-2-1-4 0-5 2-1 3-1 5 0z"
                  fill="white"
                  opacity="0.95"
                />
                <path
                  d="M32 40c-1-3-1-6 1-9 2-3 6-5 10-5-1 6-4 11-10 14z"
                  fill="white"
                  opacity="0.85"
                />
              </svg>
            </div>
            <div>
              <p>EcoCycle</p>
              <small>LANKA</small>
            </div>
          </div>

          <nav className="admin-nav">
            {sidebarItems.map((item) =>
              "divider" in item ? (
                <div key={item.componentKey} className="admin-nav-separator" />
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={pathname === item.href ? "admin-nav-item active" : "admin-nav-item"}
                >
                  <span className="admin-nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="admin-nav-label">{item.label}</span>
                </Link>
              ),
            )}
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-top">
            <div />
            <div className="admin-usercard">
              <div className="admin-avatar">
                {profile?.fullName?.substring(0, 2).toUpperCase() || "AU"}
              </div>
              <div>
                <p className="admin-user-name">{profile?.fullName || "Admin User"}</p>
                <p className="admin-user-role">System Admin</p>
              </div>
            </div>
          </div>

          <section className="admin-header-card notification-header">
            <div>
              <span className="admin-chip">SYSTEM ADMIN</span>
              <h1>
                Control Center <span className="highlight">EcoCycle Lanka</span>
              </h1>
              <p>Real-time operational health across all districts</p>
            </div>
          </section>

          <section className="notification-grid">
            <article className="notifications-card">
              <div className="card-header">
                <div>
                  <h2>Notifications</h2>
                  <p>All system-level alerts and updates.</p>
                </div>
                <button className="mark-button" onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              </div>

              <div className="notification-list">
                {loading ? (
                  <div className="empty-state">
                    <strong>Loading notifications...</strong>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="empty-state">
                    <strong>No notifications found</strong>
                    <span>Your inbox is clear!</span>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    return (
                      <div className="notification-row" key={notification.id}>
                        <span className="notification-icon">
                          <NotificationIcon type={notification.type} />
                        </span>
                        <span className="notification-content">
                          <strong>{notification.title}</strong>
                          <small>{notification.description}</small>
                        </span>
                        <span className="notification-meta">
                          <em>{formatTime(notification.createdAt)}</em>
                          {!notification.read && <i>New</i>}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          </section>
        </main>

        <style>{`
        .admin-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #ecf7ee 0%, #f9fcf8 40%, #fcfefd 100%);
          display: flex;
          gap: 24px;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
          color: #15251f;
        }

        .admin-sidebar {
          width: 260px;
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
          padding: 28px 20px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .admin-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-logo-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          background: #2e7d32;
          color: white;
          display: grid;
          place-items: center;
          font-size: 1.2rem;
        }

        .admin-logo p {
          margin: 0;
          font-weight: 700;
          font-size: 1rem;
        }

        .admin-logo small {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .admin-nav {
          display: grid;
          gap: 10px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-decoration: none;
          text-align: left;
          color: #31402c;
          padding: 14px 18px;
          border-radius: 18px;
          transition: all 0.2s ease;
          font-weight: 600;
        }

        .admin-nav-icon {
          width: 22px;
          display: inline-block;
          text-align: center;
          font-size: 1rem;
        }

        .admin-nav-label {
          flex: 1;
        }

        .admin-nav-item:hover,
        .admin-nav-item.active {
          background: #e6f4e8;
          color: #166529;
        }

        .admin-nav-separator {
          height: 1px;
          border-radius: 999px;
          background: rgba(22, 101, 31, 0.08);
          margin: 10px 0;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
          min-width: 0;
        }

        .admin-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
        }

        .admin-usercard {
          display: flex;
          align-items: center;
          gap: 14px;
          background: white;
          border-radius: 22px;
          padding: 12px 16px;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.06);
        }

        .admin-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #2e7d32;
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .admin-user-name,
        .admin-user-role {
          margin: 0;
        }

        .admin-user-name {
          font-weight: 700;
        }

        .admin-user-role {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .admin-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 28px;
          border-radius: 32px;
          background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .notification-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .notification-header p {
          margin: 0;
          color: #556b54;
        }

        .highlight {
          color: #16a34a;
        }

        .admin-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: #e6f4e8;
          color: #166529;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .notifications-card {
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
          border-radius: 32px;
          padding: 28px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #15251f;
        }

        .card-header p {
          margin: 8px 0 0;
          color: #556b54;
        }

        .mark-button {
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          background: #eef9f2;
          color: #166529;
          font-weight: 700;
          cursor: pointer;
        }

        .notification-list {
          display: grid;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #e8efe5;
        }

        .notification-row {
          display: grid;
          grid-template-columns: 44px 1fr auto;
          align-items: center;
          gap: 14px;
          width: 100%;
          min-height: 72px;
          border: 0;
          border-bottom: 1px solid #e8efe5;
          padding: 14px 16px;
          background: #ffffff;
          color: #1d3a25;
          text-align: left;
        }

        .notification-row:last-child {
          border-bottom: 0;
        }

        .notification-row:hover {
          background: #f8fbf7;
        }

        .notification-icon {
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #d6f2df;
          color: #166529;
          font-weight: 800;
          width: 38px;
          height: 38px;
        }

        .notification-content strong,
        .notification-content small,
        .notification-meta em,
        .notification-meta i {
          display: block;
        }

        .notification-content strong {
          font-size: 0.95rem;
        }

        .notification-content small {
          margin-top: 5px;
          color: #6b7280;
          font-size: 0.82rem;
        }

        .notification-meta {
          display: grid;
          justify-items: end;
          gap: 8px;
        }

        .notification-meta em {
          color: #6b7280;
          font-size: 0.75rem;
          font-style: normal;
        }

        .notification-meta i {
          padding: 4px 9px;
          border-radius: 999px;
          background: #ecf8ef;
          color: #166529;
          font-size: 0.72rem;
          font-style: normal;
          font-weight: 800;
        }

        .empty-state {
          display: grid;
          gap: 6px;
          padding: 20px;
          color: #1d3a25;
        }

        .empty-state span {
          color: #6b7280;
          font-size: 0.85rem;
        }

        @media (max-width: 820px) {
          .admin-root {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
          }

          .admin-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-nav-item {
            text-align: center;
            justify-content: center;
          }

          .admin-nav-label {
            flex: 0;
          }

          .notification-row {
            grid-template-columns: 40px 1fr;
          }

          .notification-meta {
            grid-column: 2;
            justify-items: start;
          }

          .card-header,
          .admin-header-card {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
      </div>
    </RoleGuard>
  );
}

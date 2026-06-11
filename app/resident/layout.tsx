"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { logOut } from "@/lib/auth";
import { subscribeToNotifications, markAllRead } from "./notifications/data";

const NAV = [
  {
    label: "Dashboard",
    href: "/resident",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Track Truck",
    href: "/resident/track",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    label: "Rewards",
    href: "/resident/rewards",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    label: "Collection History",
    href: "/resident/history",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Complaints",
    href: "/resident/complaints",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/resident/notifications",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/resident/profile",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

// ── Derive initials from a full name ──────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7f5",
      fontFamily: "'DM Sans', sans-serif",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        background: "#2e7d32",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 18,
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        ♻
      </div>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>Loading…</p>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth?role=resident");
      } else if (profile && profile.role !== "resident") {
        // Redirect to their correct dashboard
        if (profile.role === "collector") router.replace("/collector");
        else if (profile.role === "admin") router.replace("/admin/overview");
      }
    }
  }, [user, profile, loading, router]);

  // ── Notification count listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToNotifications(user.uid, (items) => {
      const count = items.filter(n => !n.read).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, [user]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logOut();
      router.push("/");
    } catch {
      setLoggingOut(false);
    }
  };

  const openNotifications = () => {
    if (user) {
      markAllRead(user.uid);
    }
    setUnreadCount(0);
    router.push("/resident/notifications");
  };

  // ── Guards ───────────────────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (!user) return null;

  // ── Derived display values ───────────────────────────────────────────────────
  const displayName = profile?.fullName ?? user.email ?? "Resident";
  const initials = getInitials(profile?.fullName ?? "");
  const displayRole = profile?.role
    ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1)
    : "Resident";

  return (
    <div className="rl-root">

      {/* ── Sidebar ── */}
      <aside className={`rl-sidebar ${sidebarOpen ? "rl-sidebar--open" : ""}`}>
        <div className="rl-logo">
          <span className="rl-logo-icon">♻</span>
          <span className="rl-logo-text">
            EcoCycle<br /><small>LANKA</small>
          </span>
        </div>

        <nav className="rl-nav">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const isNotifications = item.href === "/resident/notifications";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rl-nav-item ${active ? "rl-nav-item--active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="rl-nav-icon">{item.icon}</span>
                <span className="rl-nav-label">{item.label}</span>
                {isNotifications && unreadCount > 0 && (
                  <span className="rl-nav-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Sidebar footer: user info + logout ── */}
        <div className="rl-footer">
          <div className="rl-footer-user">
            <div className="rl-footer-avatar">{initials}</div>
            <div className="rl-footer-info">
              <span className="rl-footer-name">{displayName}</span>
              <span className="rl-footer-role">{displayRole}</span>
            </div>
          </div>

          <button
            type="button"
            className="rl-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
          >
            {loggingOut ? (
              <span className="rl-nav-icon" style={{ animation: "rl-spin 1s linear infinite" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </span>
            ) : (
              <span className="rl-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </span>
            )}
            <span className="rl-nav-label">{loggingOut ? "Signing out…" : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="rl-overlay"
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") setSidebarOpen(false);
          }}
        />
      )}

      {/* ── Main area ── */}
      <div className="rl-main">

        {/* Topbar */}
        <header className="rl-topbar">
          <button
            className="rl-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="rl-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search collections, complaints, trucks…" />
          </div>

          <div className="rl-user">
            {/* Notification bell */}
            <button
              type="button"
              className="rl-notification"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              onClick={openNotifications}
            >
              <span className="rl-notification-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              {unreadCount > 0 && (
                <span className="rl-notification-dot" aria-hidden="true" />
              )}
            </button>

            {/* Avatar */}
            <div className="rl-avatar" aria-hidden="true">{initials}</div>

            {/* Name + role */}
            <div className="rl-user-info">
              <span className="rl-user-name">{displayName}</span>
              <span className="rl-user-role">{displayRole}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="rl-content">{children}</main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rl-root {
          display: flex;
          min-height: 100vh;
          background: #f5f7f5;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Sidebar ── */
        .rl-sidebar {
          width: 220px;
          flex-shrink: 0;
          background: #fff;
          border-right: 1px solid #eef0ee;
          display: flex;
          flex-direction: column;
          padding: 24px 0 24px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        /* ── Logo ── */
        .rl-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 20px 28px;
        }
        .rl-logo-icon {
          width: 32px;
          height: 32px;
          background: #2e7d32;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }
        .rl-logo-text {
          font-weight: 700;
          font-size: 0.78rem;
          line-height: 1.2;
          color: #1a1a1a;
        }
        .rl-logo-text small {
          font-size: 0.58rem;
          letter-spacing: 0.1em;
          color: #9ca3af;
          font-weight: 500;
        }

        /* ── Nav ── */
        .rl-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 12px;
          flex: 1;
        }
        .rl-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          text-decoration: none;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          position: relative;
        }
        .rl-nav-item:hover {
          background: #f0faf0;
          color: #2e7d32;
        }
        .rl-nav-item--active {
          background: #2e7d32;
          color: #fff;
        }
        .rl-nav-item--active:hover {
          background: #1b5e20;
          color: #fff;
        }
        .rl-nav-icon { display: flex; align-items: center; flex-shrink: 0; }
        .rl-nav-label { white-space: nowrap; flex: 1; }

        /* Unread badge on notifications nav item */
        .rl-nav-badge {
          min-width: 18px;
          height: 18px;
          background: #ef4444;
          color: #fff;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          flex-shrink: 0;
        }
        .rl-nav-item--active .rl-nav-badge {
          background: rgba(255,255,255,0.9);
          color: #2e7d32;
        }

        /* ── Sidebar footer ── */
        .rl-footer {
          padding: 16px 12px 0;
          border-top: 1px solid #eef0ee;
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rl-footer-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #f8faf7;
        }
        .rl-footer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2e7d32;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        .rl-footer-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .rl-footer-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rl-footer-role {
          font-size: 0.65rem;
          color: #9ca3af;
          text-transform: capitalize;
        }

        .rl-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #eff6ee;
          border: 1px solid #d1e7d1;
          border-radius: 10px;
          padding: 10px 12px;
          color: #166534;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .rl-logout:hover:not(:disabled) {
          background: #e2f2df;
          transform: translateY(-1px);
        }
        .rl-logout:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @keyframes rl-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Main ── */
        .rl-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* ── Topbar ── */
        .rl-topbar {
          height: 60px;
          background: #fff;
          border-bottom: 1px solid #eef0ee;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .rl-hamburger {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: #374151;
          padding: 4px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .rl-hamburger:hover { background: #f3f4f6; }

        .rl-search {
          flex: 1;
          max-width: 420px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f5f7f5;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 12px;
          height: 38px;
        }
        .rl-search input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          color: #374151;
          outline: none;
        }
        .rl-search input::placeholder { color: #9ca3af; }

        /* ── Topbar user section ── */
        .rl-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
        }

        .rl-notification {
          display: inline-flex;
          align-items: center;
          margin-right: 4px;
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 8px;
          transition: background 0.15s;
          text-decoration: none;
          color: #374151;
        }
        .rl-notification:hover { background: #f3f4f6; }
        .rl-notification-icon { display: flex; }
        .rl-notification-dot {
          position: absolute;
          right: 2px;
          top: 2px;
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          box-shadow: 0 0 0 2px #fff;
          animation: rl-dot-pulse 2s ease-in-out infinite;
        }
        @keyframes rl-dot-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.2); }
        }

        .rl-avatar {
          width: 36px;
          height: 36px;
          background: #2e7d32;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.78rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        .rl-user-info {
          display: flex;
          flex-direction: column;
        }
        .rl-user-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.2;
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .rl-user-role {
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: capitalize;
        }

        /* ── Page content ── */
        .rl-content {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }

        /* ── Mobile overlay ── */
        .rl-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          z-index: 30;
          cursor: pointer;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .rl-sidebar {
            position: fixed;
            left: -240px;
            top: 0;
            z-index: 40;
            height: 100vh;
            width: 240px;
            transition: left 0.25s cubic-bezier(.22,1,.36,1);
            box-shadow: 4px 0 24px rgba(0,0,0,0.08);
          }
          .rl-sidebar--open { left: 0; }
          .rl-overlay { display: block; }
          .rl-hamburger { display: flex; }
          .rl-content { padding: 20px 16px; }
          .rl-user-info { display: none; }
        }
      `}</style>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Waste Management", href: "/admin/waste-management", icon: "♻" },
  { label: "Live Tracking", href: "/admin/live-traking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Employee", href: "/admin/employee", icon: "🧑‍💼" },
  { label: "Audit Log", href: "/admin/audit-log", icon: "🧾" },
  { label: "Complaint", href: "/admin/complaint", icon: "🗣️" },
  { label: "Vehicle", href: "/admin/vehicle", icon: "🚚" },
  { label: "Schedule", href: "/admin/overview", icon: "🗓️" },
  { label: "Report", href: "/admin/overview", icon: "📝" },
];

const metrics = [
  { label: "Total users", value: "12,840" },
  { label: "Active drivers", value: "184" },
  { label: "Pickups today", value: "1,206" },
  { label: "Verified complaints", value: "94" },
  { label: "Monthly waste", value: "284 t" },
];

const auditLogs = [
  { action: "Admin updated reward tier", meta: "admin@ecocycle.lk · 10:42" },
  { action: "Driver Kasun signed in", meta: "kasun.s · 06:01" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
  { action: "Complaint #C-3128 resolved", meta: "sanjeewa.f · Yesterday" },
];

export default function AdminAuditLogPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState(auditLogs[0]);
  const [downloaded, setDownloaded] = useState(false);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return auditLogs;
    }

    return auditLogs.filter((log) =>
      [log.action, log.meta].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query]);

  return (
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
              {/* Sri Lanka-inspired silhouette */}
              <path
                d="M32 6c6 4 12 4 16 9 4 5 6 12 4 19-2 7-4 10-6 14-2 4-2 8-4 12-2 4-8 6-14 6s-12-2-14-6c-2-4-2-8-4-12-2-4-4-7-6-14-2-7 0-14 4-19 4-5 10-5 16-9z"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Recycle loop */}
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
              {/* Tree leaf/brand mark */}
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
          {sidebarItems.map((item) => (
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
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div className="admin-search">
            <input placeholder="Search collections, complaints, trucks..." />
          </div>
          <div className="admin-usercard">
            <div className="admin-avatar">AU</div>
            <div>
              <p className="admin-user-name">Admin User</p>
              <p className="admin-user-role">System Admin</p>
            </div>
          </div>
        </div>

        <section className="admin-header-card audit-header">
          <div>
            <span className="admin-chip">SYSTEM ADMIN</span>
            <h1>
              Control Center <span className="highlight">EcoCycle Lanka</span>
            </h1>
            <p>Real-time operational health across all districts</p>
          </div>
        </section>

        <section className="admin-metrics">
          {metrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </section>

        <section className="audit-card">
          <div className="card-header">
            <div>
              <h2>Auditlog</h2>
              <p>Review recent admin, driver, and complaint activity.</p>
            </div>
            <button className={downloaded ? "download-button downloaded" : "download-button"} onClick={() => setDownloaded(true)}>
              {downloaded ? "Downloaded" : "Download"}
            </button>
          </div>

          <div className="audit-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search audit activity..."
              aria-label="Search audit activity"
            />
          </div>

          <div className="audit-layout">
            <div className="audit-list">
              {filteredLogs.map((log, index) => (
                <button
                  className={selectedLog.action === log.action && selectedLog.meta === log.meta ? "audit-row selected" : "audit-row"}
                  key={`${log.action}-${log.meta}-${index}`}
                  onClick={() => setSelectedLog(log)}
                  type="button"
                >
                  <span>
                    <strong>{log.action}</strong>
                    <small>{log.meta}</small>
                  </span>
                </button>
              ))}

              {filteredLogs.length === 0 && (
                <div className="empty-state">
                  <strong>No audit entries found</strong>
                  <span>Try searching another user, complaint, or action.</span>
                </div>
              )}
            </div>

            <aside className="audit-detail">
              <span className="detail-chip">Selected log</span>
              <strong>{selectedLog.action}</strong>
              <p>{selectedLog.meta}</p>
              <button className="review-button">Review entry</button>
            </aside>
          </div>
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

        .admin-search {
          flex: 1;
        }

        .admin-search input {
          width: 100%;
          border: none;
          border-radius: 999px;
          padding: 14px 20px;
          box-shadow: 0 10px 24px rgba(34, 100, 59, 0.08);
          font-size: 0.95rem;
          outline: none;
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

        .audit-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .audit-header p {
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

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .metric-card,
        .audit-card {
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .metric-card {
          border-radius: 24px;
          padding: 24px;
        }

        .metric-card span {
          display: block;
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }

        .metric-card strong {
          font-size: 1.75rem;
          color: #15251f;
        }

        .audit-card {
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

        .download-button,
        .review-button {
          border: none;
          border-radius: 999px;
          padding: 13px 20px;
          background: #1f9d55;
          color: white;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(31, 157, 85, 0.22);
        }

        .download-button::before {
          content: "↓";
          margin-right: 8px;
        }

        .download-button.downloaded {
          background: #166529;
        }

        .audit-search {
          margin-bottom: 18px;
        }

        .audit-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        .audit-layout {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .audit-list {
          display: grid;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #e8efe5;
        }

        .audit-row {
          width: 100%;
          min-height: 54px;
          border: 0;
          border-bottom: 1px solid #e8efe5;
          padding: 12px 16px;
          background: white;
          color: #1d3a25;
          text-align: left;
          cursor: pointer;
        }

        .audit-row:last-child {
          border-bottom: 0;
        }

        .audit-row:hover,
        .audit-row.selected {
          background: #f8fbf7;
        }

        .audit-row strong,
        .audit-row small {
          display: block;
        }

        .audit-row strong {
          font-size: 0.95rem;
        }

        .audit-row small {
          margin-top: 4px;
          color: #6b7280;
          font-size: 0.78rem;
        }

        .audit-detail {
          display: grid;
          gap: 14px;
          padding: 22px;
          border-radius: 22px;
          background: #f8fbf7;
        }

        .detail-chip {
          width: fit-content;
          padding: 7px 12px;
          border-radius: 999px;
          background: #ecf8ef;
          color: #166529;
          font-size: 0.8rem;
          font-weight: 800;
        }

        .audit-detail strong {
          font-size: 1.1rem;
        }

        .audit-detail p {
          margin: 0;
          color: #556b54;
        }

        .review-button {
          width: 100%;
          margin-top: 8px;
          background: #eef9f2;
          color: #166529;
          box-shadow: none;
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

        @media (max-width: 1080px) {
          .admin-metrics,
          .audit-layout {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-top {
            flex-direction: column;
            align-items: stretch;
          }
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

          .admin-metrics,
          .audit-layout {
            grid-template-columns: 1fr;
          }

          .admin-header-card,
          .card-header {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

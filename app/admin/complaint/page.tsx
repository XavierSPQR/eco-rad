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

const initialComplaints = [
  { id: "C-3101", title: "Missed pickup", priority: "High", route: "Dehiwala - Galle Road", user: "nugasewana b/46", status: "Open" },
  { id: "C-3102", title: "Rewards Points not Increased", priority: "Medium", route: "Dehiwala - Galle Road", user: "UserID:2376798v", status: "Open" },
  { id: "C-3103", title: "Rewards Points not Increased", priority: "Medium", route: "Dehiwala - Galle Road", user: "UserID:2376798v", status: "Open" },
  { id: "C-3104", title: "Overflow Bin", priority: "High", route: "Colombo- Galle Road", user: "at wellawatta B-54", status: "Open" },
  { id: "C-3105", title: "Rewards Points not Increased", priority: "Medium", route: "Dehiwala - Galle Road", user: "UserID:2376798v", status: "Open" },
  { id: "C-3106", title: "Rewards Points not Increased", priority: "Medium", route: "Dehiwala - Galle Road", user: "UserID:2376798v", status: "Open" },
  { id: "C-3107", title: "Rewards Points not Increased", priority: "Medium", route: "Dehiwala - Galle Road", user: "UserID:2376798v", status: "Open" },
];

export default function AdminComplaintPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [complaints, setComplaints] = useState(initialComplaints);
  const [selectedId, setSelectedId] = useState(initialComplaints[0].id);

  const filteredComplaints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return complaints;
    }

    return complaints.filter((complaint) =>
      [complaint.id, complaint.title, complaint.priority, complaint.route, complaint.user, complaint.status].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [complaints, query]);

  const selectedComplaint = complaints.find((complaint) => complaint.id === selectedId) ?? complaints[0];

  const resolveComplaint = (id: string) => {
    setSelectedId(id);
    setComplaints((items) =>
      items.map((complaint) =>
        complaint.id === id ? { ...complaint, status: complaint.status === "Resolved" ? "Open" : "Resolved" } : complaint,
      ),
    );
  };

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

        <section className="admin-header-card complaint-header">
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

        <section className="complaint-section">
          <article className="complaint-list-card">
            <div className="card-header">
              <div>
                <h2>Complaint Management</h2>
                <p>Review reported issues and mark actions as resolved.</p>
              </div>
            </div>

            <div className="complaint-search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search complaints..."
                aria-label="Search complaints"
              />
            </div>

            <div className="complaint-grid">
              {filteredComplaints.map((complaint) => (
                <button
                  className={selectedId === complaint.id ? "complaint-card selected" : "complaint-card"}
                  key={complaint.id}
                  onClick={() => setSelectedId(complaint.id)}
                  type="button"
                >
                  <strong>{complaint.title}</strong>
                  <span className="complaint-box">
                    <em className={complaint.priority === "High" ? "priority priority-high" : "priority priority-medium"}>
                      {complaint.priority}
                    </em>
                    <b>{complaint.route}</b>
                    <small>{complaint.user}</small>
                    <span
                      className={complaint.status === "Resolved" ? "action-chip resolved" : "action-chip"}
                      onClick={(event) => {
                        event.stopPropagation();
                        resolveComplaint(complaint.id);
                      }}
                    >
                      {complaint.status === "Resolved" ? "Resolved" : "Action"}
                    </span>
                  </span>
                </button>
              ))}

              {filteredComplaints.length === 0 && (
                <div className="empty-state">
                  <strong>No complaints found</strong>
                  <span>Try searching another route, user, or issue type.</span>
                </div>
              )}
            </div>
          </article>

          <aside className="complaint-detail">
            <div className="card-header">
              <div>
                <h2>Selected complaint</h2>
                <p>Quick action preview.</p>
              </div>
            </div>
            <div className="detail-body">
              <span className={selectedComplaint.priority === "High" ? "priority priority-high" : "priority priority-medium"}>
                {selectedComplaint.priority}
              </span>
              <strong>{selectedComplaint.title}</strong>
              <p>{selectedComplaint.route}</p>
              <small>{selectedComplaint.user}</small>
              <button onClick={() => resolveComplaint(selectedComplaint.id)}>
                {selectedComplaint.status === "Resolved" ? "Reopen complaint" : "Mark action complete"}
              </button>
            </div>
          </aside>
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

        .complaint-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .complaint-header p {
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
        .complaint-list-card,
        .complaint-detail {
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

        .complaint-section {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .complaint-list-card,
        .complaint-detail {
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

        .complaint-search {
          margin-bottom: 18px;
        }

        .complaint-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        .complaint-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(180px, 1fr));
          gap: 20px 28px;
        }

        .complaint-card {
          display: grid;
          gap: 10px;
          border: 0;
          background: transparent;
          color: #15251f;
          text-align: left;
          cursor: pointer;
        }

        .complaint-card > strong {
          font-size: 1rem;
        }

        .complaint-card.selected > strong {
          color: #166529;
        }

        .complaint-box {
          position: relative;
          display: grid;
          gap: 5px;
          min-height: 86px;
          padding: 13px 70px 13px 15px;
          border: 1px solid #d9e9d9;
          border-radius: 18px;
          background: #ffffff;
        }

        .priority {
          width: fit-content;
          padding: 5px 12px;
          border-radius: 999px;
          color: white;
          font-size: 0.7rem;
          font-style: normal;
          font-weight: 800;
        }

        .priority-high {
          background: #ef4444;
        }

        .priority-medium {
          background: #f4b63f;
        }

        .complaint-box b {
          font-size: 0.84rem;
        }

        .complaint-box small {
          color: #6b7280;
          font-size: 0.76rem;
        }

        .action-chip {
          position: absolute;
          right: 13px;
          bottom: 18px;
          padding: 6px 10px;
          border-radius: 999px;
          background: #ecf8ef;
          color: #166529;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .action-chip.resolved {
          background: #e6f4e8;
          color: #0f5f2c;
        }

        .detail-body {
          display: grid;
          gap: 14px;
          padding: 22px;
          border-radius: 22px;
          background: #f8fbf7;
        }

        .detail-body strong {
          font-size: 1.2rem;
        }

        .detail-body p,
        .detail-body small {
          margin: 0;
          color: #556b54;
        }

        .detail-body button {
          margin-top: 8px;
          border: none;
          border-radius: 999px;
          padding: 13px 18px;
          background: #1f9d55;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .empty-state {
          grid-column: 1 / -1;
          display: grid;
          gap: 6px;
          padding: 20px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .empty-state span {
          color: #6b7280;
          font-size: 0.85rem;
        }

        @media (max-width: 1180px) {
          .complaint-grid {
            grid-template-columns: repeat(2, minmax(180px, 1fr));
          }
        }

        @media (max-width: 1080px) {
          .admin-metrics,
          .complaint-section {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .complaint-list-card {
            grid-column: 1 / -1;
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
          .complaint-section,
          .complaint-grid {
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

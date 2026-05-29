"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Live Tracking", href: "/admin/live-traking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { label: "Resident", href: "/admin/users", icon: "👥" },
  { label: "Employee", href: "/admin/employee", icon: "🧑‍💼" },
  { label: "Complaint", href: "/admin/complaint", icon: "🗣️" },
  { label: "Vehicle", href: "/admin/vehicle", icon: "🚚" },
  { label: "Schedule", href: "/admin/overview", icon: "🗓️" },
  { label: "Report", href: "/admin/report", icon: "📝" },
];

type ComplaintPriority = "High" | "Medium" | "Low";
type ComplaintStatus = "In-review" | "Resolved";

type ComplaintRow = {
  id: string;
  name: string;
  nic: string;
  subject: string;
  description: string;
  location: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
};

const initialComplaints: ComplaintRow[] = [
  {
    id: "C-3101",
    name: "Nugasewana B/46",
    nic: "900000000V",
    subject: "Missed pickup",
    description: "Pickup was missed for the scheduled day.",
    location: "Dehiwala",
    priority: "High",
    status: "In-review",
  },
  {
    id: "C-3102",
    name: "UserID:2376798v",
    nic: "901234567V",
    subject: "Rewards not increased",
    description: "Points were not added after a successful collection.",
    location: "Dehiwala",
    priority: "Medium",
    status: "In-review",
  },
  {
    id: "C-3103",
    name: "UserID:2376798v",
    nic: "901234567V",
    subject: "Rewards delay",
    description: "Points update delay (expected to reflect today).",
    location: "Dehiwala",
    priority: "Low",
    status: "In-review",
  },
  {
    id: "C-3104",
    name: "At wellawatta B-54",
    nic: "902345678V",
    subject: "Overflow bin",
    description: "Bins overflowed and waste is spreading around the area.",
    location: "Colombo",
    priority: "High",
    status: "In-review",
  },
  {
    id: "C-3105",
    name: "UserID:2376798v",
    nic: "901234567V",
    subject: "Rewards not updated",
    description: "Submission marked but points not updated.",
    location: "Dehiwala",
    priority: "Medium",
    status: "In-review",
  },
];

export default function AdminComplaintPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [complaints, setComplaints] = useState<ComplaintRow[]>(initialComplaints);

  const filteredComplaints = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return complaints;

    return complaints.filter((c) =>
      [
        c.name,
        c.nic,
        c.subject,
        c.description,
        c.location,
        c.priority,
        c.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [complaints, query]);

  const handleSetStatus = (id: string, nextStatus: ComplaintStatus) => {
    setComplaints((items) => items.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
  };

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon" aria-label="EcoCycle Lanka logo">
            <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <path
                d="M32 6c6 4 12 4 16 9 4 5 6 12 4 19-2 7-4 10-6 14-2 4-2 8-4 12-2 4-8 6-14 6s-12-2-14-6c-2-4-2-8-4-12-2-4-4-7-6-14-2-7 0-14 4-19 4-5 10-5 16-9z"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M22 22c3-6 9-9 16-8 7 1 12 6 13 13" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M46 22l3 6-6-1" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M42 42c-3 6-9 9-16 8-7-1-12-6-13-13" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M18 42l-3-6 6 1" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
              <path d="M32 28c6 1 10 6 10 12-6 1-12-2-15-7-1-2-1-4 0-5 2-1 3-1 5 0z" fill="white" opacity="0.95" />
              <path d="M32 40c-1-3-1-6 1-9 2-3 6-5 10-5-1 6-4 11-10 14z" fill="white" opacity="0.85" />
            </svg>
          </div>
          <div>
            <p>EcoCycle</p>
            <small>LANKA</small>
          </div>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map((item) => (
            <Link key={item.label} href={item.href} className={pathname === item.href ? "admin-nav-item active" : "admin-nav-item"}>
              <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        {/* top admin user section right top (no search bar) */}
        <div className="admin-top">
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

        <section className="complaint-table-card">
          <div className="card-header">
            <div>
              <h2>Complaint Management</h2>
              <p>Mark complaint actions as resolved.</p>
            </div>
          </div>

          <div className="table-search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search complaints..."
              aria-label="Search complaints"
            />
          </div>

          <div className="complaints-table">
            <div className="complaints-row complaints-row--header">
              <span>Name</span>
              <span>NIC</span>
              <span>Subject</span>
              <span>Description</span>
              <span>Location</span>
              <span>Status</span>
              <span>Action</span>
            </div>

            {filteredComplaints.map((c) => (
              <div className="complaints-row" key={c.id}>
                <span className="cell-strong">{c.name}</span>
                <span>{c.nic}</span>
                <span>{c.subject}</span>
                <span>{c.description}</span>
                <span>{c.location}</span>
                <span>
                  <span className={c.priority === "High" ? "prio prio-high" : c.priority === "Medium" ? "prio prio-medium" : "prio prio-low"}>
                    {c.priority}
                  </span>
                </span>
                <span>
                  <div className="action-select">
                    <button
                      type="button"
                      className={c.status === "In-review" ? "status-btn status-btn--active" : "status-btn"}
                      onClick={() => handleSetStatus(c.id, "In-review")}
                    >
                      In-review
                    </button>
                    <button
                      type="button"
                      className={c.status === "Resolved" ? "status-btn status-btn--active status-btn--resolved" : "status-btn"}
                      onClick={() => handleSetStatus(c.id, "Resolved")}
                    >
                      Resolved
                    </button>
                  </div>
                </span>
              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="empty-state">
                <strong>No complaints found</strong>
                <span>Try searching another route, user, or issue type.</span>
              </div>
            )}
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
          justify-content: flex-end;
          align-items: center;
          gap: 18px;
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

        .complaint-table-card {
          background: white;
          border-radius: 32px;
          padding: 28px;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
          min-width: 0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 18px;
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

        .table-search {
          margin-bottom: 14px;
        }

        .table-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        .complaints-table {
          display: grid;
          gap: 10px;
          overflow-x: auto;
        }

        .complaints-row {
          display: grid;
          grid-template-columns: 1.2fr 0.9fr 1fr 1.6fr 0.9fr 0.8fr 1fr;
          gap: 12px;
          align-items: center;
          padding: 14px 14px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
          min-width: 1120px;
        }

        .complaints-row--header {
          background: transparent;
          font-size: 0.78rem;
          font-weight: 900;
          color: #4d6b53;
          padding-top: 6px;
          padding-bottom: 6px;
        }

        .cell-strong {
          font-weight: 800;
        }

        .prio {
          display: inline-flex;
          padding: 6px 10px;
          border-radius: 999px;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 900;
          width: fit-content;
        }

        .prio-high { background: #ef4444; }
        .prio-medium { background: #f4b63f; }
        .prio-low { background: #3b82f6; }

        .action-select {
          display: flex;
          gap: 10px;
        }

        .status-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 14px;
          background: #ffffff;
          color: #1f7f37;
          box-shadow: 0 10px 24px rgba(23, 63, 31, 0.08);
          cursor: pointer;
          font-weight: 900;
          font-size: 0.78rem;
          white-space: nowrap;
        }

        .status-btn--active {
          background: #eef9f2;
        }

        .status-btn--resolved {
          background: #e6f4e8;
          color: #0f5f2c;
        }

        .empty-state {
          display: grid;
          gap: 6px;
          padding: 20px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
          min-width: 1120px;
        }

        .empty-state span {
          color: #6b7280;
          font-size: 0.85rem;
        }

        @media (max-width: 1080px) {
          .complaints-row {
            min-width: 980px;
          }
          .empty-state {
            min-width: 980px;
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
        }
      `}</style>
    </div>
  );
}


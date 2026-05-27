"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { label: "Overview", href: "/admin/overview" },
  { label: "Waste Management", href: "/admin/waste-management" },
  { label: "Live Tracking", href: "/admin/live-traking" },
  { label: "Notification", href: "/admin/notification" },
  { label: "Users", href: "/admin/users" },
  { label: "Employee", href: "/admin/employee" },
  { label: "Audit Log", href: "/admin/audit-log" },
  { label: "Complaint", href: "/admin/complaint" },
  { label: "Vehicle", href: "/admin/vehicle" },
  { label: "Schedule", href: "/admin/overview" },
  { label: "Report", href: "/admin/overview" },
];

const users = [
  { name: "Anushka Jayawardena", role: "Resident", district: "Colombo", points: "4,820", status: "Active" },
  { name: "Nimal Perera", role: "Driver", district: "Kandy", points: "2,450", status: "Active" },
  { name: "Tharindu Bandara", role: "Resident", district: "Galle", points: "2,380", status: "Active" },
  { name: "Dilani Senanayake", role: "Collector", district: "Jaffna", points: "2,110", status: "Active" },
  { name: "Ruwan Madushanka", role: "Resident", district: "Matara", points: "1,990", status: "Restricted" },
];

export default function AdminUsersPage() {
  const pathname = usePathname();

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">EC</div>
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
              className={pathname === item.href && item.label === "Users" ? "admin-nav-item active" : "admin-nav-item"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div className="admin-search">
            <input placeholder="Search users, roles, districts..." />
          </div>
          <div className="admin-usercard">
            <div className="admin-avatar">AU</div>
            <div>
              <p className="admin-user-name">Admin User</p>
              <p className="admin-user-role">System Admin</p>
            </div>
          </div>
        </div>

        <section className="admin-header-card users-header">
          <div>
            <span className="admin-chip">USER CONTROL</span>
            <h1>
              Manage <span className="highlight">EcoCycle Users</span>
            </h1>
            <p>Review user roles, reward points, districts, and account status.</p>
          </div>
        </section>

        <section className="admin-metrics">
          <div className="metric-card">
            <span>Total users</span>
            <strong>12,840</strong>
          </div>
          <div className="metric-card">
            <span>Residents</span>
            <strong>10,920</strong>
          </div>
          <div className="metric-card">
            <span>Drivers</span>
            <strong>184</strong>
          </div>
          <div className="metric-card">
            <span>Collectors</span>
            <strong>316</strong>
          </div>
          <div className="metric-card">
            <span>Restricted</span>
            <strong>42</strong>
          </div>
        </section>

        <section className="users-card">
          <div className="card-header">
            <div>
              <h2>User management</h2>
              <p>Monitor active accounts and take quick administrative actions.</p>
            </div>
            <button className="add-button">+ Add User</button>
          </div>

          <div className="users-table">
            <div className="users-row users-row--header">
              <span>USER</span>
              <span>ROLE</span>
              <span>DISTRICT</span>
              <span>POINTS</span>
              <span>ACTION</span>
            </div>

            {users.map((user) => (
              <div className="users-row" key={user.name}>
                <span>
                  <strong>{user.name}</strong>
                  <small className={user.status === "Active" ? "status-text status-text--active" : "status-text status-text--restricted"}>
                    {user.status}
                  </small>
                </span>
                <span>{user.role}</span>
                <span>{user.district}</span>
                <span>{user.points}</span>
                <span className="action-buttons">
                  <button className="action-button">Edit</button>
                  <button className={user.status === "Active" ? "action-button action-button--danger" : "action-button action-button--secondary"}>
                    {user.status === "Active" ? "Restrict" : "Allow"}
                  </button>
                </span>
              </div>
            ))}
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
          font-size: 0.85rem;
          font-weight: 800;
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
          display: block;
          width: 100%;
          text-decoration: none;
          text-align: left;
          color: #31402c;
          padding: 14px 18px;
          border-radius: 18px;
          transition: all 0.2s ease;
          font-weight: 600;
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

        .users-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .users-header p {
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

        .metric-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 48px rgba(23, 63, 31, 0.08);
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

        .users-card {
          border-radius: 32px;
          padding: 28px;
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
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

        .add-button {
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          background: #eef9f2;
          color: #166529;
          font-weight: 700;
          cursor: pointer;
        }

        .users-table {
          display: grid;
          gap: 10px;
        }

        .users-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1fr 2fr;
          gap: 16px;
          align-items: center;
          padding: 18px 16px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .users-row--header {
          background: transparent;
          font-size: 0.85rem;
          font-weight: 700;
          color: #4d6b53;
        }

        .users-row strong,
        .users-row small {
          display: block;
        }

        .status-text {
          margin-top: 5px;
          font-size: 0.78rem;
          font-weight: 700;
        }

        .status-text--active {
          color: #166529;
        }

        .status-text--restricted {
          color: #b91c1c;
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .action-button {
          border: none;
          border-radius: 999px;
          padding: 10px 18px;
          background: #ffffff;
          color: #1f7f37;
          box-shadow: 0 10px 24px rgba(23, 63, 31, 0.08);
          cursor: pointer;
          font-weight: 700;
        }

        .action-button--secondary {
          background: #eef9f2;
        }

        .action-button--danger {
          background: #fdecea;
          color: #b91c1c;
        }

        @media (max-width: 1080px) {
          .admin-metrics {
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
          }

          .admin-metrics {
            grid-template-columns: 1fr;
          }

          .users-row {
            grid-template-columns: 1fr;
            text-align: left;
          }

          .action-buttons {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

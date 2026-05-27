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

const employees = [
  { vehicle: "WP 3456", status: "Active", id: "45490932V", collector: "Ramesh pathirana", contact: "0778967345" },
  { vehicle: "WP 5690", status: "Active", id: "45490932V", collector: "Nadeesh sadaruwan", contact: "0776756345" },
  { vehicle: "WP 4534", status: "Active", id: "45490932V", collector: "Nadeesh sadaruwan", contact: "0776756345" },
  { vehicle: "WP 3998", status: "Restricted", id: "45490932V", collector: "Nadeesh sadaruwan", contact: "0776756345" },
  { vehicle: "WP 8903", status: "Active", id: "45490932V", collector: "Nadeesh sadaruwan", contact: "0776756345" },
];

export default function AdminEmployeePage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [employeeRows, setEmployeeRows] = useState(employees);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return employeeRows;
    }

    return employeeRows.filter((employee) =>
      [employee.vehicle, employee.status, employee.id, employee.collector, employee.contact].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [employeeRows, query]);

  const toggleEmployeeStatus = (vehicle: string) => {
    setEmployeeRows((rows) =>
      rows.map((employee) =>
        employee.vehicle === vehicle
          ? { ...employee, status: employee.status === "Active" ? "Restricted" : "Active" }
          : employee,
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

        <section className="admin-header-card employee-header">
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

        <section className="employee-card">
          <div className="card-header">
            <div>
              <h2>Employee Management</h2>
              <p>Manage assigned vehicles, collectors, contact numbers, and access status.</p>
            </div>
            <button className="add-button">+ Add Employee</button>
          </div>

          <div className="employee-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vehicle, collector, ID, contact..."
              aria-label="Search employees"
            />
          </div>

          <div className="employee-table">
            <div className="employee-row employee-row--header">
              <span>ASSIGNED VEHICLE</span>
              <span>STATUS</span>
              <span>ID</span>
              <span>COLLECTOR</span>
              <span>CONTACT</span>
              <span>ACTION</span>
            </div>

            {filteredEmployees.map((employee) => (
              <div className="employee-row" key={employee.vehicle}>
                <span className="vehicle-code">{employee.vehicle}</span>
                <span className={employee.status === "Active" ? "status-chip status-active" : "status-chip status-restricted"}>
                  {employee.status}
                </span>
                <span>{employee.id}</span>
                <span>{employee.collector}</span>
                <span className="contact-cell">
                  {employee.contact}
                  <button aria-label={`Call ${employee.collector}`}>☎</button>
                </span>
                <span className="action-buttons">
                  <button className="action-button">Edit</button>
                  <button
                    className={employee.status === "Active" ? "action-button action-button--danger" : "action-button action-button--secondary"}
                    onClick={() => toggleEmployeeStatus(employee.vehicle)}
                  >
                    {employee.status === "Active" ? "Restrict" : "Allow"}
                  </button>
                </span>
              </div>
            ))}

            {filteredEmployees.length === 0 && (
              <div className="empty-state">
                <strong>No employees found</strong>
                <span>Try another vehicle number, ID, collector, or contact.</span>
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

        .employee-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .employee-header p {
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
        .employee-card {
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

        .employee-card {
          width: min(100%, 920px);
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

        .add-button {
          border: none;
          border-radius: 16px;
          padding: 14px 20px;
          background: #eef9f2;
          color: #166529;
          font-weight: 700;
          cursor: pointer;
        }

        .employee-search {
          margin-bottom: 16px;
        }

        .employee-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        .employee-table {
          display: grid;
          gap: 10px;
          overflow-x: auto;
        }

        .employee-row {
          display: grid;
          grid-template-columns: 1.25fr 1fr 1.15fr 1.7fr 1.35fr 1.35fr;
          gap: 16px;
          align-items: center;
          min-width: 840px;
          padding: 16px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .employee-row--header {
          background: transparent;
          font-size: 0.78rem;
          font-weight: 800;
          color: #4d6b53;
        }

        .vehicle-code {
          color: #16a34a;
          font-weight: 800;
        }

        .status-chip {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 7px 12px;
          font-weight: 700;
          font-size: 0.78rem;
        }

        .status-active {
          background: #ecf8ef;
          color: #166529;
        }

        .status-restricted {
          background: #fdecea;
          color: #b91c1c;
        }

        .contact-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .contact-cell button {
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 50%;
          background: #eef9f2;
          color: #166529;
          cursor: pointer;
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

        .empty-state {
          min-width: 840px;
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

        @media (max-width: 1080px) {
          .admin-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-top {
            flex-direction: column;
            align-items: stretch;
          }

          .employee-card {
            width: 100%;
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

          .admin-metrics {
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

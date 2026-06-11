"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";



import { usePathname } from "next/navigation";
import { useState } from "react";


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



const employees = [
  {
    id: "E001",
    name: "Ramesh Pathirana",
    nic: "900000000V",
    email: "ramesh@ecocycle.lk",
    role: "Driver",
    contact: "0778967345",
  },
  {
    id: "E002",
    name: "Nadeesh Sadaruwan",
    nic: "901234567V",
    email: "nadeesh@ecocycle.lk",
    role: "Collector",
    contact: "0776756345",
  },
  {
    id: "E003",
    name: "Jayantha Silva",
    nic: "902345678V",
    email: "jayantha@ecocycle.lk",
    role: "Driver",
    contact: "0771234567",
  },
  {
    id: "E004",
    name: "Kumari Perera",
    nic: "903456789V",
    email: "kumari@ecocycle.lk",
    role: "Collector",
    contact: "0779876543",
  },
  {
    id: "E005",
    name: "Mahesh Kumar",
    nic: "904567890V",
    email: "mahesh@ecocycle.lk",
    role: "Driver",
    contact: "0772345678",
  },
];


export default function AdminEmployeePage() {
  const pathname = usePathname();
  const [employeeRows, setEmployeeRows] = useState(employees);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // Order intent: FullName -> NIC -> Email
  const [formData, setFormData] = useState({ id: "", name: "", nic: "", email: "", role: "Driver", contact: "" });



  const handleAddClick = () => {
    setEditingIndex(null);
    setFormData({ id: "", name: "", nic: "", email: "", role: "Driver", contact: "" });
    setIsFormOpen(true);
  };


  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setFormData(employeeRows[index]);
    setIsFormOpen(true);
  };


  const handleSaveEmployee = () => {
    if (!formData.id.trim() || !formData.name.trim()) return;
    // NIC pattern validation (best-effort, UI has pattern too)
    if (formData.nic.trim().length > 0 && !/^(\d{9}[VvXx]|\d{12})$/.test(formData.nic.trim())) return;


    if (editingIndex !== null) {
      const updated = [...employeeRows];
      updated[editingIndex] = { ...formData };
      setEmployeeRows(updated);
    } else {
      setEmployeeRows([{ ...formData }, ...employeeRows]);
    }

    setIsFormOpen(false);
  };


  const handleCancel = () => {
    setIsFormOpen(false);
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

        <section className="employee-card">
          <div className="card-header">
            <div>
              <h2>Employee Management</h2>
              <p>Manage employee details, roles, and contact information.</p>
            </div>
            <button className="add-button" onClick={handleAddClick}>+ Add Employee</button>
          </div>

          {isFormOpen && (
            <div className="employee-form-card">
              <div className="form-row">
                <label>Employee ID</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="Enter employee ID"
                />
              </div>
              <div className="form-row">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>

              {/* Sri Lankan NIC structure: Old = 9 digits + V/X, New = 12 digits */}
              <div className="form-row">
                <label>NIC</label>
                <input
                  type="text"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value.toUpperCase() })}
                  placeholder="e.g. 900000000V or 123456789012"
                  pattern="^(\d{9}[VvXx]|\d{12})$"
                  title="Use Sri Lanka NIC: 9 digits + V/X (old) OR 12 digits (new)"
                />
              </div>

              {/* kept for state ordering: FullName -> NIC -> Email */}
              <div className="form-row">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@ecocycle.lk"
                />
              </div>

              <div className="form-row">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Driver">Driver</option>
                  <option value="Collector">Collector</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="form-row">
                <label>Contact</label>
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="0771234567"
                />
              </div>

              <div className="form-actions">
                <button className="action-button" onClick={handleSaveEmployee}>{editingIndex !== null ? "Save Changes" : "Add Employee"}</button>
                <button className="action-button action-button--secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}

          <div className="employee-table">
            <div className="employee-row employee-row--header">
              <span>NAME</span>
              <span>NIC</span>
              <span>ROLE</span>
              <span>CONTACT</span>
              <span>ACTION</span>
            </div>

            {employeeRows.map((employee, index) => (
              <div className="employee-row" key={`${employee.id}-${index}`}>
                <span>{employee.name}</span>
                <span>{employee.nic}</span>
                <span>{employee.role}</span>
                <span>{employee.contact}</span>
                <span className="action-buttons">
                  <button className="action-button" onClick={() => handleEditClick(index)}>Edit</button>
                </span>
              </div>
            ))}

            {employeeRows.length === 0 && (
              <div className="empty-state">
                <strong>No employees found</strong>
                <span>Add a new employee to get started.</span>
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
          justify-content: flex-end;
          gap: 18px;
          align-items: center;
        }

        /* (employee page) no search bar here */


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

        .employee-table {
          display: grid;
          gap: 10px;
          overflow-x: auto;
        }

        .employee-row {
          display: grid;
          grid-template-columns: 1.6fr 1.1fr 1fr 1.25fr 0.75fr;

          gap: 16px;
          align-items: center;
          min-width: 740px;
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
          min-width: 740px;
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

        .employee-form-card {
          border-radius: 18px;
          padding: 20px;
          background: white;
          box-shadow: 0 10px 24px rgba(23, 63, 31, 0.08);
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-row {
          display: grid;
          gap: 8px;
        }

        .form-row label {
          font-weight: 700;
          color: #315037;
          font-size: 0.9rem;
        }

        .form-row input,
        .form-row select {
          border: 1px solid #d9e9d9;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.95rem;
          color: #1b3c28;
          background: #f7fbf6;
          outline: none;
        }

        .form-row input:focus,
        .form-row select:focus {
          border-color: #16a34a;
        }

        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 12px;
        }

        .form-actions .action-button {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          cursor: pointer;
        }

        .form-actions .action-button:first-child {
          background: #16a34a;
          color: white;
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
    </RoleGuard>
  );
}

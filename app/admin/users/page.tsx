"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

const users = [
  { name: "Anushka Jayawardena", nic: "900000000V", email: "anushka@ecocycle.lk", phone: "+94-771-234567", address: "123 Green St", district: "Colombo", points: "4,820", residences: "3" },
  { name: "Nimal Perera", nic: "901234567V", email: "nimal@ecocycle.lk", phone: "+94-771-234568", address: "456 River Ave", district: "Kandy", points: "2,450", residences: "1" },
  { name: "Tharindu Bandara", nic: "902345678V", email: "tharindu@ecocycle.lk", phone: "+94-771-234569", address: "789 Beach Rd", district: "Galle", points: "2,380", residences: "2" },
  { name: "Dilani Senanayake", nic: "903456789V", email: "dilani@ecocycle.lk", phone: "+94-771-234570", address: "321 Park Lane", district: "Jaffna", points: "2,110", residences: "1" },
  { name: "Ruwan Madushanka", nic: "904567890V", email: "ruwan@ecocycle.lk", phone: "+94-771-234571", address: "654 Hill Road", district: "Matara", points: "1,990", residences: "4" },
];


export default function AdminUsersPage() {
  const pathname = usePathname();
  const [userList, setUserList] = useState(users);
  const [formData, setFormData] = useState({ name: "", nic: "", email: "", phone: "", address: "", district: "", points: "", residences: "" });


  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddClick = () => {
    setEditingIndex(null);
    setFormData({ name: "", nic: "", email: "", phone: "", address: "", district: "", points: "", residences: "" });

    setIsFormOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setFormData(userList[index]);
    setIsFormOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.name.trim()) return;

    if (editingIndex !== null) {
      const updated = [...userList];
      updated[editingIndex] = { ...formData };
      setUserList(updated);
    } else {
      setUserList([{ ...formData }, ...userList]);
    }

    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
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
              className={pathname === item.href && item.label === "Resident" ? "admin-nav-item active" : "admin-nav-item"}
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

        <section className="users-card">
          <div className="card-header">
            <div>
              <h2>Resident Management</h2>
              <p>Monitor and manage all user accounts and take administrative actions.</p>
            </div>

            <button className="add-button" onClick={handleAddClick}>+ Add User</button>
          </div>

          {isFormOpen && (
            <div className="user-form-card">
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
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94-77X-XXXXXX"
                />
              </div>
              <div className="form-row">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address"
                />
              </div>
              <div className="form-row">
                <label>District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Enter district"
                />
              </div>
              <div className="form-row">
                <label>Points</label>
                <input
                  type="text"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                  placeholder="e.g. 4,820"
                />
              </div>
              <div className="form-row">
                <label>No. of Residences</label>
                <input
                  type="text"
                  value={formData.residences}
                  onChange={(e) => setFormData({ ...formData, residences: e.target.value })}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="form-actions">
                <button className="action-button" onClick={handleSaveUser}>{editingIndex !== null ? "Save Changes" : "Add User"}</button>
                <button className="action-button action-button--secondary" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}

          <div className="users-table">
            <div className="users-row users-row--header">
              <span>FULL NAME</span>
              <span>NIC</span>
              <span>EMAIL</span>
              <span>PHONE</span>
              <span>ADDRESS</span>
              <span>NO. OF RESIDENCES</span>
              <span>POINTS</span>

              <span>ACTION</span>
            </div>


            {userList.map((user, index) => (
              <div className="users-row" key={`${user.name}-${index}`}>
                <span>
                  <strong>{user.name}</strong>
                </span>
                <span>{user.nic}</span>
                <span>{user.email}</span>

                <span>{user.phone}</span>


                <span>{user.address}</span>
                <span>{user.residences}</span>
                <span>{user.points}</span>

                <span className="action-buttons">
                  <button className="action-button" onClick={() => handleEditClick(index)}>Edit</button>
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

        .user-form-card {
          display: grid;
          gap: 16px;
          padding: 22px;
          margin-bottom: 22px;
          border-radius: 24px;
          background: #f5fbf4;
          box-shadow: 0 20px 40px rgba(23, 63, 31, 0.08);
        }

        .form-row {
          display: grid;
          gap: 8px;
        }

        .form-row label {
          font-size: 0.9rem;
          color: #42503f;
          font-weight: 700;
        }

        .form-row input,
        .form-row select {
          width: 100%;
          border: 1px solid #d6e7d5;
          border-radius: 16px;
          padding: 12px 16px;
          background: white;
          color: #1f3826;
          font-size: 0.95rem;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .users-table {
          display: grid;
          gap: 10px;
        }

        .users-row {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1.5fr 1.2fr 1.8fr 1.2fr 1fr 1.2fr;
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
            justify-content: center;
          }

          .admin-nav-label {
            flex: 0;
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

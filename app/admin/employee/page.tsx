"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  Timestamp,
  query,
  where,
} from "firebase/firestore";
import { extractPrefixedNumber, formatPrefixedNumber } from "@/lib/idFormat";

interface Employee {
  id: string;
  employeeID: string;
  name: string; // Mapped from fullName
  role: string;
  contact: string; // Mapped from phone
  createdAt?: Timestamp;
}


const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Live Tracking", href: "/admin/live-tracking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { divider: true, componentKey: "sep-top" },
  { label: "Residents", href: "/admin/users", icon: "👥" },
  { label: "Employees", href: "/admin/employee", icon: "👨‍💼" },
  { label: "Vehicles", href: "/admin/vehicle", icon: "🚗" },
  { label: "Route Management", href: "/admin/route-management", icon: "🛣️" },
  { label: "Collection Center", href: "/admin/collection-center", icon: "🏬" },
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

export default function AdminEmployeePage() {
  const pathname = usePathname();
  const [employeeRows, setEmployeeRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeID: "",
    name: "",
    role: "collector",
    contact: ""
  });


  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "users"), where("role", "in", ["admin", "collector", "driver"]));
        const querySnapshot = await getDocs(q);
        const employeesData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            employeeID: data.employeeID || "",
            name: data.fullName || "",
            role: data.role || "",
            contact: data.phone || "",
            createdAt: data.createdAt,
          };
        }) as Employee[];
        setEmployeeRows(employeesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to fetch employees. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ employeeID: "", name: "", role: "collector", contact: "" });
    setIsFormOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      employeeID: employee.employeeID,
      name: employee.name,
      role: employee.role,
      contact: employee.contact,
    });
    setIsFormOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!formData.name.trim()) return;


    try {
      const existingIds = employeeRows
        .map((employee) => extractPrefixedNumber(employee.employeeID, "E"))
        .filter((value): value is number => typeof value === "number");
      const nextEmployeeID = formData.employeeID.trim() || formatPrefixedNumber("E", (existingIds.length ? Math.max(...existingIds) : 0) + 1);
      const firestoreData = {
        employeeID: nextEmployeeID,
        fullName: formData.name ?? "",
        nic: formData.nic ?? "",
        role: formData.role ?? "collector",
        phone: formData.contact ?? "",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        const docRef = doc(db, "users", editingId);
        await setDoc(docRef, firestoreData, { merge: true });
        setEmployeeRows((prev) =>
          prev.map((emp) =>
            emp.id === editingId ? { ...emp, ...formData, employeeID: nextEmployeeID } : emp
          )
        );
      } else {
        const docRef = doc(collection(db, "users"));
        await setDoc(docRef, {
          ...firestoreData,
          createdAt: serverTimestamp(),
        });
        setEmployeeRows((prev) => [{ id: docRef.id, ...formData, employeeID: nextEmployeeID } as Employee, ...prev]);
      }
      setIsFormOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error saving employee:", err);
      setError("Failed to save employee. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setError(null);
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

            {error && (
              <div className="error-message" style={{ color: 'red', marginBottom: '1rem', padding: '10px', background: '#fee2e2', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            {isFormOpen && (
              <div className="employee-form-card">
                <div className="form-row">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-row">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={formData.employeeID}
                    onChange={(e) => setFormData({ ...formData, employeeID: e.target.value })}
                    placeholder="Auto-generates as E001"
                  />
                </div>

                <div className="form-row">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">Admin</option>
                    <option value="collector">Collector</option>
                    <option value="driver">Driver</option>
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
                  <button type="button" className="action-button" onClick={handleSaveEmployee}>{editingId !== null ? "Save Changes" : "Add Employee"}</button>
                  <button type="button" className="action-button action-button--secondary" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            )}

            <div className="employee-table">
              <div className="employee-row employee-row--header">
                <span>EID</span>
                <span>NAME</span>

                <span>ROLE</span>
                <span>CONTACT</span>
                <span>ACTION</span>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading employees...</div>
              ) : employeeRows.length === 0 ? (
                <div className="empty-state">
                  <strong>No employees found</strong>
                  <span>Add a new employee to get started.</span>
                </div>
              ) : (
                employeeRows.map((employee) => (
                  <div className="employee-row" key={employee.id}>
                    <span className="employee-cell employee-cell--strong">{employee.employeeID}</span>
                    <span className="employee-cell">
                      <strong>{employee.name}</strong>
                    </span>

                    <span className="employee-cell" style={{ textTransform: 'capitalize' }}>{employee.role}</span>
                    <span className="employee-cell">{employee.contact}</span>
                    <span className="action-buttons">
                      <button className="action-button" onClick={() => handleEditClick(employee)}>Edit</button>
                    </span>
                  </div>
                ))
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

          .employee-card {
            width: min(100%, 920px);
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

          .employee-table {
            display: grid;
            gap: 10px;
            overflow-x: auto;
          }

          .employee-row {
            display: grid;
            grid-template-columns: 0.8fr 1.8fr 1fr 1.15fr 0.8fr;
            gap: 12px;
            align-items: center;
            min-width: 100%;
            padding: 16px 18px;
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

          .employee-cell {
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
          }

          .employee-cell small {
            color: #6b7280;
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .employee-cell--strong {
            font-weight: 700;
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

          .form-actions {
            grid-column: 1 / -1;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 12px;
          }

          @media (max-width: 1080px) {
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

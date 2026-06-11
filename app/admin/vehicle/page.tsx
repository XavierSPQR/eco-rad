"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";



import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

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


const initialVehicles = [
  { type: "Compactor Truck", number: "WP 3456", status: "Active", driver: "Sumith Dissanayake", contact: "0778967345" },
  { type: "Dump Truck", number: "WP 5690", status: "Active", driver: "Nadeesh sadaruwan", contact: "0776756345" },
  { type: "Hook Lift", number: "WP 4534", status: "Active", driver: "", contact: "" },
  { type: "Front Loader", number: "WP 3998", status: "Restricted", driver: "", contact: "" },
  { type: "Rear Loader Dump Truck", number: "WP 8903", status: "Active", driver: "", contact: "" },
];

export default function AdminVehiclePage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [addedCount, setAddedCount] = useState(0);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      [vehicle.type, vehicle.number, vehicle.status, vehicle.driver, vehicle.contact].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, vehicles]);

  const toggleVehicleStatus = (number: string) => {
    setVehicles((items) =>
      items.map((vehicle) =>
        vehicle.number === number
          ? { ...vehicle, status: vehicle.status === "Active" ? "Restricted" : "Active" }
          : vehicle,
      ),
    );
  };

  const addVehicle = () => {
    const nextCount = addedCount + 1;

    setAddedCount(nextCount);
    setVehicles((items) => [
      ...items,
      {
        type: "Collection Truck",
        number: `WP 91${nextCount}0`,
        status: "Active",
        driver: "Unassigned",
        contact: "",
      },
    ]);
  };

  return (
        <RoleGuard allowedRole="admin">
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">♻</div>
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

        <section className="admin-header-card vehicle-header">
          <div>
            <span className="admin-chip">SYSTEM ADMIN</span>
            <h1>
              Control Center <span className="highlight">EcoCycle Lanka</span>
            </h1>
            <p>Real-time operational health across all districts</p>
          </div>
        </section>

        

        <section className="vehicle-card">
          <div className="card-header">
            <div>
              <h2>Vehicle Management</h2>
              <p>Manage collection vehicles, drivers, contacts, and active status.</p>
            </div>
            <button className="add-button" onClick={addVehicle}>+ Add</button>
          </div>

          <div className="vehicle-search">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search type, vehicle number, driver, contact..."
              aria-label="Search vehicles"
            />
          </div>

          

          <div className="vehicle-table">
            <div className="vehicle-row vehicle-row--header">
              <span>TYPE</span>
              <span>VEHICLE NO</span>
              <span>STATUS</span>
              <span>DRIVER</span>
              <span>CONTACT</span>
              <span>ACTION</span>
            </div>

            {filteredVehicles.map((vehicle) => (
              <div className="vehicle-row" key={vehicle.number}>
                <span>{vehicle.type}</span>
                <span className="vehicle-number">{vehicle.number}</span>
                <span className={vehicle.status === "Active" ? "status-chip status-active" : "status-chip status-restricted"}>
                  {vehicle.status}
                </span>
                <span>{vehicle.driver || "Unassigned"}</span>
                <span className="contact-cell">
                  {vehicle.contact || "N/A"}
                  {vehicle.contact && <button aria-label={`Call ${vehicle.driver}`}>☎</button>}
                </span>
                <span className="action-buttons">
                  <button className="action-button">Edit</button>
                  <button
                    className={vehicle.status === "Active" ? "action-button action-button--danger" : "action-button action-button--secondary"}
                    onClick={() => toggleVehicleStatus(vehicle.number)}
                  >
                    {vehicle.status === "Active" ? "Restrict" : "Allow"}
                  </button>
                </span>
              </div>
            ))}

            {filteredVehicles.length === 0 && (
              <div className="empty-state">
                <strong>No vehicles found</strong>
                <span>Try another vehicle type, number, driver, or contact.</span>
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

        .vehicle-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .vehicle-header p {
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


        .metric-card,
        .vehicle-card {
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .vehicle-card {
          width: min(100%, 980px);
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
          padding: 14px 22px;
          background: #f2edf7;
          color: #5c4773;
          font-weight: 800;
          cursor: pointer;
        }

        .vehicle-search {
          margin-bottom: 16px;
        }

        .vehicle-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        .vehicle-table {
          display: grid;
          gap: 10px;
          overflow-x: auto;
        }

        .vehicle-row {
          display: grid;
          grid-template-columns: 1.7fr 1.25fr 1fr 1.8fr 1.4fr 1.35fr;
          gap: 16px;
          align-items: center;
          min-width: 880px;
          padding: 16px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .vehicle-row--header {
          background: transparent;
          font-size: 0.78rem;
          font-weight: 800;
          color: #4d6b53;
        }

        .vehicle-number {
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
          min-width: 880px;
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

          .vehicle-card {
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

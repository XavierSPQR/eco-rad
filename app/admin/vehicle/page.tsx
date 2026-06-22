"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";



import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Vehicle {
  uid: string; // Document ID (Collector's UID)
  area: string;
  driver: string;
  eta: string;
  id: string; // Vehicle Number
  lat: string | number;
  lng: string | number;
  status: string;
  updatedAt?: Timestamp;
}

interface Collector {
  uid: string;
  fullName: string;
  phone: string;
}

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


export default function AdminVehiclePage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [formData, setFormData] = useState({
    collectorUid: "",
    driverName: "",
    vehicleId: "",
    area: "",
  });

  useEffect(() => {
    const unsubscribeVehicles = onSnapshot(collection(db, "activeVehicles"), (snapshot) => {
      const vehicleData = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Vehicle[];
      setVehicles(vehicleData);
      setLoading(false);
    });

    const fetchCollectors = async () => {
      const q = query(collection(db, "users"), where("role", "in", ["collector"]));
      const querySnapshot = await getDocs(q);
      const collectorData = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        fullName: doc.data().fullName || "",
        phone: doc.data().phone || "",
      })) as Collector[];
      setCollectors(collectorData);
    };

    fetchCollectors();

    return () => unsubscribeVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((vehicle) => {
      const collector = collectors.find((c) => c.uid === vehicle.uid);
      return [
        vehicle.area,
        vehicle.id,
        vehicle.status,
        vehicle.driver,
        collector?.phone || "",
      ].some((value) => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [searchQuery, vehicles, collectors]);

  const toggleVehicleStatus = async (vehicle: Vehicle) => {
    try {
      const vehicleRef = doc(db, "activeVehicles", vehicle.uid);
      const isCurrentlyRestricted = vehicle.status === "Restricted";
      await updateDoc(vehicleRef, {
        status: isCurrentlyRestricted ? "Active" : "Restricted",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating vehicle status:", error);
    }
  };

  const handleAddClick = () => {
    setEditingVehicle(null);
    setFormData({ collectorUid: "", driverName: "", vehicleId: "", area: "" });
    setIsFormOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      collectorUid: vehicle.uid,
      driverName: vehicle.driver,
      vehicleId: vehicle.id,
      area: vehicle.area,
    });
    setIsFormOpen(true);
  };

  const handleDeleteVehicle = async (uid: string) => {
    if (!confirm("Are you sure you want to remove this vehicle?")) return;
    try {
      await deleteDoc(doc(db, "activeVehicles", uid));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleSaveVehicle = async () => {
    if (!formData.collectorUid || !formData.vehicleId || !formData.area || !formData.driverName) {
      alert("Please fill all fields");
      return;
    }

    try {
      const vehicleData = {
        driver: formData.driverName,
        id: formData.vehicleId,
        area: formData.area,
        updatedAt: serverTimestamp(),
      };

      if (editingVehicle) {
        const vehicleRef = doc(db, "activeVehicles", editingVehicle.uid);
        await updateDoc(vehicleRef, vehicleData);
      } else {
        const vehicleRef = doc(db, "activeVehicles", formData.collectorUid);
        await setDoc(vehicleRef, {
          ...vehicleData,
          lat: "",
          lng: "",
          status: "Offline",
          eta: "N/A",
        });
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving vehicle:", error);
    }
  };

  const collectorsWithoutVehicle = useMemo(() => {
    return collectors.filter(
      (collector) => !vehicles.some((vehicle) => vehicle.uid === collector.uid) || (editingVehicle && editingVehicle.uid === collector.uid)
    );
  }, [collectors, vehicles, editingVehicle]);

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
            <button className="add-button" onClick={handleAddClick}>+ Add</button>
          </div>

          {isFormOpen && (
            <div className="vehicle-form-card">
              <div className="form-row">
                <label>Collector</label>
                <select
                  value={formData.collectorUid}
                  onChange={(e) => setFormData({ ...formData, collectorUid: e.target.value })}
                  disabled={!!editingVehicle}
                >
                  <option value="">Select a Collector</option>
                  {collectorsWithoutVehicle.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Driver Name</label>
                <input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  placeholder="Enter driver name"
                />
              </div>

              <div className="form-row">
                <label>Vehicle ID (No)</label>
                <input
                  type="text"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  placeholder="e.g. WP 1234"
                />
              </div>

              <div className="form-row">
                <label>Area</label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Colombo"
                />
              </div>

              <div className="form-actions">
                <button className="action-button" onClick={handleSaveVehicle}>
                  {editingVehicle ? "Save Changes" : "Add Vehicle"}
                </button>
                <button
                  className="action-button action-button--secondary"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="vehicle-search">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search area, vehicle number, driver, contact..."
              aria-label="Search vehicles"
            />
          </div>

          <div className="vehicle-table">
            <div className="vehicle-row vehicle-row--header">
              <span>AREA</span>
              <span>VEHICLE NO</span>
              <span>STATUS</span>
              <span>DRIVER</span>
              <span>CONTACT</span>
              <span>ACTION</span>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading vehicles...</div>
            ) : filteredVehicles.length === 0 ? (
              <div className="empty-state">
                <strong>No vehicles found</strong>
                <span>Try another search term or add a new vehicle.</span>
              </div>
            ) : (
              filteredVehicles.map((vehicle) => {
                const collector = collectors.find((c) => c.uid === vehicle.uid);
                return (
                  <div className="vehicle-row" key={vehicle.uid}>
                    <span>{vehicle.area}</span>
                    <span className="vehicle-number">{vehicle.id}</span>
                    <span
                      className={
                        vehicle.status === "Active" || vehicle.status === "Live"
                          ? "status-chip status-active"
                          : vehicle.status === "Restricted"
                          ? "status-chip status-restricted"
                          : "status-chip status-offline"
                      }
                    >
                      {vehicle.status}
                    </span>
                    <span>{vehicle.driver || "Unassigned"}</span>
                    <span className="contact-cell">
                      {collector?.phone || "N/A"}
                      {collector?.phone && (
                        <button aria-label={`Call ${vehicle.driver}`}>☎</button>
                      )}
                    </span>
                    <span className="action-buttons">
                      <button className="action-button" onClick={() => handleEditClick(vehicle)}>
                        Edit
                      </button>
                      <button
                        className={
                          vehicle.status !== "Restricted"
                            ? "action-button action-button--danger"
                            : "action-button action-button--secondary"
                        }
                        onClick={() => toggleVehicleStatus(vehicle)}
                      >
                        {vehicle.status !== "Restricted" ? "Restrict" : "Allow"}
                      </button>
                      <button
                        className="action-button action-button--danger"
                        onClick={() => handleDeleteVehicle(vehicle.uid)}
                      >
                        Delete
                      </button>
                    </span>
                  </div>
                );
              })
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
          background: #eef9f2;
          color: #166529;
          font-weight: 800;
          cursor: pointer;
        }

        .vehicle-form-card {
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

        .status-offline {
          background: #f3f4f6;
          color: #6b7280;
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

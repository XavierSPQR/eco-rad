"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

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

type Collector = {
  uid: string;
  fullName: string;
};

type Driver = {
  uid: string;
  fullName: string;
};

type VehicleOption = {
  id: string;
  driver: string;
};

type RouteOption = {
  id: string;
  region: string;
};

type ScheduleRow = {
  id: string;
  collectorId: string;
  collectorName: string;
  driverId: string;
  driverName: string;
  vehicleNo: string;
  region: string;
  routeId: string;
  date: string;
  description: string;
  createdAt?: Timestamp | null;
};

type ScheduleFormState = {
  collectorId: string;
  driverId: string;
  vehicleNo: string;
  region: string;
  routeId: string;
  date: string;
  description: string;
};

const createEmptyForm = (): ScheduleFormState => ({
  collectorId: "",
  driverId: "",
  vehicleNo: "",
  region: "",
  routeId: "",
  date: new Date().toISOString().slice(0, 10),
  description: "",
});

const formatDisplayDate = (value: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

export default function AdminSchedulesPage() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormState>(createEmptyForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [collectorSnapshot, driverSnapshot, vehicleSnapshot, routeSnapshot] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "collector"))),
          getDocs(query(collection(db, "users"), where("role", "==", "driver"))),
          getDocs(collection(db, "activeVehicles")),
          getDocs(collection(db, "routes")),
        ]);

        setCollectors(
          collectorSnapshot.docs.map((documentSnapshot) => ({
            uid: documentSnapshot.id,
            fullName: String(documentSnapshot.data().fullName || "Unknown Collector"),
          }))
        );

        setDrivers(
          driverSnapshot.docs.map((documentSnapshot) => ({
            uid: documentSnapshot.id,
            fullName: String(documentSnapshot.data().fullName || "Unknown Driver"),
          }))
        );

        setVehicles(
          vehicleSnapshot.docs.map((documentSnapshot) => ({
            id: String(documentSnapshot.data().id || documentSnapshot.id || ""),
            driver: String(documentSnapshot.data().driver || ""),
          })).filter((vehicle) => Boolean(vehicle.id))
        );

        setRoutes(
          routeSnapshot.docs.map((documentSnapshot) => ({
            id: String(documentSnapshot.data().routeId || documentSnapshot.id || ""),
            region: String(documentSnapshot.data().region || ""),
          })).filter((route) => Boolean(route.id))
        );
      } catch (error) {
        console.error("Error loading schedule references:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadReferenceData();

    const unsubscribe = onSnapshot(collection(db, "schedules"), (snapshot) => {
      const nextSchedules = snapshot.docs
        .map((documentSnapshot) => {
          const data = documentSnapshot.data();
          return {
            id: documentSnapshot.id,
            collectorId: String(data.collectorId || ""),
            collectorName: String(data.collectorName || ""),
            driverId: String(data.driverId || ""),
            driverName: String(data.driverName || ""),
            vehicleNo: String(data.vehicleNo || ""),
            region: String(data.region || ""),
            routeId: String(data.routeId || ""),
            date: String(data.date || ""),
            description: String(data.description || ""),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
          } as ScheduleRow;
        })
        .sort((left, right) => {
          const leftDate = left.date || "";
          const rightDate = right.date || "";
          if (leftDate !== rightDate) {
            return leftDate.localeCompare(rightDate);
          }
          const leftTime = left.createdAt instanceof Timestamp ? left.createdAt.toMillis() : 0;
          const rightTime = right.createdAt instanceof Timestamp ? right.createdAt.toMillis() : 0;
          return rightTime - leftTime;
        });

      setSchedules(nextSchedules);
    });

    return () => unsubscribe();
  }, []);

  const filteredSchedules = useMemo(() => {
    const queryValue = searchQuery.trim().toLowerCase();
    if (!queryValue) {
      return schedules;
    }

    return schedules.filter((schedule) => [schedule.collectorName, schedule.routeId].some((value) => value.toLowerCase().includes(queryValue)));
  }, [searchQuery, schedules]);

  const openAddModal = () => {
    setEditingScheduleId(null);
    setMessage({ text: "", type: "" });
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: ScheduleRow) => {
    setEditingScheduleId(schedule.id);
    setMessage({ text: "", type: "" });
    setFormData({
      collectorId: schedule.collectorId,
      driverId: schedule.driverId,
      vehicleNo: schedule.vehicleNo,
      region: schedule.region,
      routeId: schedule.routeId,
      date: schedule.date,
      description: schedule.description,
    });
    setIsModalOpen(true);
  };

  const closeModal = (keepMessage = false) => {
    setIsModalOpen(false);
    setEditingScheduleId(null);
    if (!keepMessage) {
      setMessage({ text: "", type: "" });
    }
    setFormData(createEmptyForm());
  };

  const handleFieldChange = (field: keyof ScheduleFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleRouteIdChange = (value: string) => {
    const matchedRoute = routes.find((route) => route.id === value);
    setFormData((current) => ({
      ...current,
      routeId: value,
      region: matchedRoute?.region || "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const today = new Date().toISOString().slice(0, 10);

    if (!formData.collectorId || !formData.driverId || !formData.vehicleNo || !formData.routeId || !formData.date) {
      setMessage({ text: "Please Select a collector and date before saving.", type: "error" });
      return;
    }

    if (formData.date < today) {
      setMessage({ text: "Past dates are not allowed.", type: "error" });
      return;
    }

    const matchedRoute = routes.find((route) => route.id === formData.routeId);
    if (!matchedRoute) {
      setMessage({ text: "Please choose a valid route.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const collector = collectors.find((entry) => entry.uid === formData.collectorId);
      const driver = drivers.find((entry) => entry.uid === formData.driverId);
      const payload = {
        collectorId: formData.collectorId,
        collectorName: collector?.fullName || "Unknown Collector",
        driverId: formData.driverId,
        driverName: driver?.fullName || "",
        vehicleNo: formData.vehicleNo,
        region: matchedRoute.region,
        routeId: formData.routeId,
        date: formData.date,
        description: formData.description,
        status: "pending",
        updatedAt: serverTimestamp(),
      };

      if (editingScheduleId) {
        await updateDoc(doc(db, "schedules", editingScheduleId), payload);
      } else {
        await addDoc(collection(db, "schedules"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      // Fetch residents associated with the routeID
      const residentsQuery = query(
        collection(db, "users"),
        where("role", "==", "resident"),
        where("routeID", "==", formData.routeId)
      );
      const residentsSnapshot = await getDocs(residentsQuery);
      const residents = residentsSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      const notificationPromises: Promise<any>[] = [];

      // 1. Send notification to the collector
      const collectorDesc = `You have been assigned to route ${formData.routeId} on ${formData.date}. Description: ${formData.description || "No description provided"}`;
      notificationPromises.push(
        addDoc(collection(db, "notifications"), {
          userId: formData.collectorId,
          title: "New Schedule Assigned",
          description: collectorDesc,
          type: "truck",
          read: false,
          createdAt: serverTimestamp(),
        })
      );

      // 2. Send notification to each resident associated with the route
      const residentDesc = `A pickup has been scheduled for your route ${formData.routeId} on ${formData.date}`;
      residents.forEach((resident) => {
        notificationPromises.push(
          addDoc(collection(db, "notifications"), {
            userId: resident.id,
            title: "Collection Scheduled",
            description: residentDesc,
            type: "truck",
            read: false,
            createdAt: serverTimestamp(),
          })
        );
      });

      await Promise.all(notificationPromises);

      let successMessage = editingScheduleId
        ? "Schedule updated successfully."
        : "Schedule created successfully.";
      let isWarning = false;

      if (residents.length === 0) {
        successMessage += " Warning: No residents are associated with this route ID.";
        isWarning = true;
        console.warn(`No residents found for route ID: ${formData.routeId}`);
      }

      setMessage({
        text: successMessage,
        type: isWarning ? "error" : "success",
      });

      closeModal(true);
    } catch (error) {
      const firebaseError = error as { code?: string; message?: string };
      console.error("Error saving schedule:", firebaseError?.code, firebaseError?.message, error);
      setMessage({
        text: firebaseError?.code
          ? `Failed to save schedule: ${firebaseError.code}`
          : `Failed to save schedule: ${firebaseError?.message || "Unknown error"}`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoleGuard allowedRole="admin">
      <div className="admin-root">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon" aria-label="EcoCycle Lanka logo">
              <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                <path d="M32 6c6 4 12 4 16 9 4 5 6 12 4 19-2 7-4 10-6 14-2 4-2 8-4 12-2 4-8 6-14 6s-12-2-14-6c-2-4-2-8-4-12-2-4-4-7-6-14-2-7 0-14 4-19 4-5 10-5 16-9z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
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
              )
            )}
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-top">
            <div className="admin-usercard">
              <div className="admin-avatar">{profile?.fullName?.substring(0, 2).toUpperCase() || "AU"}</div>
              <div>
                <p className="admin-user-name">{profile?.fullName || "Admin User"}</p>
                <p className="admin-user-role">System Admin</p>
              </div>
            </div>
          </div>

          <section className="admin-header-card">
            <div>
              <span className="admin-chip">SCHEDULES</span>
              <h1>Schedules</h1>
              <p>Create and manage pickup schedules for collectors and drivers.</p>
            </div>
          </section>

          <section className="route-card">
            <div className="route-top">
              <div>
                <h2>Scheduled tasks</h2>
                <p>Review and update upcoming collection assignments.</p>
              </div>
              <button className="add-button" type="button" onClick={openAddModal}>
                + Add
              </button>
            </div>

            {message.text ? <div className={`form-message ${message.type}`}>{message.text}</div> : null}

            <div className="route-search">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search route ID or collector..."
                aria-label="Search scheduled tasks"
              />
            </div>

            <div className="route-table">
              <div className="route-row route-row--header">
                <span>DATE</span>
                <span>COLLECTOR</span>
                <span>DRIVER</span>
                <span>VEHICLE</span>
                <span>ROUTE ID</span>
                <span>ACTION</span>
              </div>

              {filteredSchedules.length === 0 ? (
                <div className="empty-state">
                  <strong>No schedules found</strong>
                  <span>Try another search term or add a new schedule.</span>
                </div>
              ) : (
                filteredSchedules.map((schedule, index) => (
                  <div key={schedule.id} className={`route-row ${index % 2 === 1 ? "route-row--alt" : ""}`}>
                    <span>{formatDisplayDate(schedule.date)}</span>
                    <span>{schedule.collectorName || "—"}</span>
                    <span>{schedule.driverName || "—"}</span>
                    <span>{schedule.vehicleNo || "—"}</span>
                    <span>{schedule.routeId || "—"}</span>
                    <div className="weight-cell">
                      <button type="button" className="edit-button" onClick={() => openEditModal(schedule)}>
                        ✎ Edit
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>

        {isModalOpen ? (
          <div className="modal-backdrop" role="presentation" onClick={() => closeModal()}>
            <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-label">Schedule</p>
                  <h3>{editingScheduleId ? "Edit schedule" : "Add schedule"}</h3>
                </div>
                <button type="button" className="modal-close" onClick={() => closeModal()}>
                  ×
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <label>
                  <span>Select Collector</span>
                  <select
                    value={formData.collectorId}
                    onChange={(event) => handleFieldChange("collectorId", event.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choose a collector --</option>
                    {collectors.map((collector) => (
                      <option key={collector.uid} value={collector.uid}>
                        {collector.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Select Driver</span>
                  <select
                    value={formData.driverId}
                    onChange={(event) => handleFieldChange("driverId", event.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choose a driver --</option>
                    {drivers.map((driver) => (
                      <option key={driver.uid} value={driver.uid}>
                        {driver.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Vehicle No</span>
                  <select
                    value={formData.vehicleNo}
                    onChange={(event) => handleFieldChange("vehicleNo", event.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choose a vehicle --</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.id}
                        {vehicle.driver ? ` - ${vehicle.driver}` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="form-help">Choose from vehicles stored in the database.</span>
                </label>

                <label>
                  <span>Route ID</span>
                  <select
                    value={formData.routeId}
                    onChange={(event) => handleRouteIdChange(event.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- Choose a route --</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.id} - {route.region}
                      </option>
                    ))}
                  </select>
                  <span className="form-help">Choose from routes stored in the database. Region will auto-fill.</span>
                </label>

                <label>
                  <span>Select Region</span>
                  <input value={formData.region} readOnly placeholder="Auto-filled from route" />
                </label>

                <label>
                  <span>Select Date</span>
                  <input
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => handleFieldChange("date", event.target.value)}
                  />
                </label>

                <label>
                  <span>Description</span>
                  <textarea
                    value={formData.description}
                    onChange={(event) => handleFieldChange("description", event.target.value)}
                    rows={4}
                    placeholder="Enter pickup details or notes..."
                  />
                </label>

                <div className="modal-actions">
                  <button type="button" className="modal-secondary" onClick={() => closeModal()}>
                    Cancel
                  </button>
                  <button type="submit" className="modal-primary" disabled={isSubmitting || loading}>
                    {isSubmitting ? "Saving..." : editingScheduleId ? "Save changes" : "Schedule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

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
          .admin-logo { display: flex; align-items: center; gap: 12px; }
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
          .admin-logo p { margin: 0; font-weight: 700; font-size: 1rem; }
          .admin-logo small { color: #6b7280; font-size: 0.75rem; }
          .admin-nav { display: grid; gap: 10px; }
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
          .admin-nav-icon { width: 22px; display: inline-block; text-align: center; font-size: 1rem; }
          .admin-nav-label { flex: 1; }
          .admin-nav-item:hover, .admin-nav-item.active { background: #e6f4e8; color: #166529; }
          .admin-nav-separator { height: 1px; border-radius: 999px; background: rgba(22, 101, 31, 0.08); margin: 10px 0; }
          .admin-main { flex: 1; display: flex; flex-direction: column; gap: 24px; min-width: 0; }
          .admin-top { display: flex; justify-content: flex-end; gap: 18px; align-items: center; }
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
          .admin-user-name, .admin-user-role { margin: 0; }
          .admin-user-name { font-weight: 700; }
          .admin-user-role { color: #6b7280; font-size: 0.9rem; }
          .admin-header-card {
            padding: 28px;
            border-radius: 32px;
            background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
          }
          .admin-chip { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: #e6f4e8; color: #166529; font-weight: 700; font-size: 0.8rem; }
          .admin-header-card h1 { margin: 16px 0 8px; font-size: 2rem; }
          .admin-header-card p { margin: 0; color: #556b54; }
          .highlight { color: #16a34a; }
          .route-card {
            background: white;
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
            border-radius: 32px;
            padding: 28px;
            width: min(100%, 1100px);
          }
          .route-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 16px; }
          .route-top h2 { margin: 0 0 6px; font-size: 1.2rem; }
          .route-top p { margin: 0; color: #6b7280; }
          .route-search { margin-bottom: 14px; }
          .route-search input {
            width: 100%;
            border: 1px solid #d9e9d9;
            border-radius: 16px;
            padding: 14px 16px;
            background: #f7fbf6;
            color: #1b3c28;
            font-size: 0.95rem;
            outline: none;
          }
          .route-table { display: grid; gap: 10px; overflow-x: auto; }
          .route-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr auto;
            gap: 16px;
            align-items: center;
            min-width: 900px;
            padding: 16px;
            border-radius: 18px;
            background: #f8fbf7;
            color: #1d3a25;
          }
          .route-row--header { background: transparent; font-size: 0.78rem; font-weight: 800; color: #4d6b53; }
          .route-row--alt { background: #f3f6f3; }
          .weight-cell { display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
          .edit-button {
            border: none;
            border-radius: 999px;
            padding: 8px 12px;
            background: #eef9f2;
            color: #166529;
            font-weight: 700;
            cursor: pointer;
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
          .empty-state { min-width: 900px; display: grid; gap: 6px; padding: 20px; border-radius: 18px; background: #f8fbf7; color: #1d3a25; }
          .empty-state span { color: #6b7280; font-size: 0.85rem; }
          .form-message {
            margin-bottom: 12px;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
          }
          .form-message.success { background: #ecfdf5; color: #065f46; }
          .form-message.error { background: #fef2f2; color: #991b1b; }
          .form-help {
            display: block;
            margin-top: 6px;
            font-size: 0.8rem;
            color: #4b6b4f;
          }
          .form-help--error { color: #b42318; }
          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(17, 24, 39, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            z-index: 1000;
          }
          .modal-card {
            width: min(100%, 560px);
            background: white;
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
          }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
          }
          .modal-label {
            margin: 0 0 4px;
            color: #166529;
            font-weight: 700;
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.14em;
          }
          .modal-header h3 { margin: 0; font-size: 1.15rem; }
          .modal-close {
            border: none;
            background: #f3f7f3;
            color: #4b5563;
            width: 36px;
            height: 36px;
            border-radius: 999px;
            cursor: pointer;
            font-size: 1.2rem;
          }
          .modal-form { display: grid; gap: 12px; }
          .modal-form label { display: grid; gap: 6px; font-weight: 600; color: #254332; }
          .modal-form input, .modal-form select, .modal-form textarea {
            border: 1px solid #d9e9d9;
            border-radius: 14px;
            padding: 12px 14px;
            background: #f7fbf6;
            color: #1b3c28;
            outline: none;
            font-family: inherit;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 4px;
          }
          .modal-secondary, .modal-primary {
            border: none;
            border-radius: 14px;
            padding: 11px 16px;
            font-weight: 700;
            cursor: pointer;
          }
          .modal-secondary { background: #f3f6f3; color: #4b5563; }
          .modal-primary { background: #166529; color: white; }
          .modal-primary:disabled { background: #9ca3af; cursor: not-allowed; }
          @media (max-width: 920px) {
            .admin-root { flex-direction: column; }
            .admin-sidebar { width: 100%; }
            .route-card { width: 100%; }
            .route-top { flex-direction: column; align-items: flex-start; }
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}

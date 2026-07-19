"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { extractPrefixedNumber, formatPrefixedNumber } from "@/lib/idFormat";

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

type RouteRow = {
  id: string;
  region: string;
  points: string[];
};

type RouteFormState = {
  routeId: string;
  region: string;
  points: string[];
  newPoint: string;
};

const createEmptyForm = (): RouteFormState => ({
  routeId: "",
  region: "",
  points: [],
  newPoint: "",
});

export default function AdminRouteManagementPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RouteFormState>(createEmptyForm());

  useEffect(() => {
    const loadRoutes = async () => {
      const snap = await getDocs(collection(db, "routes"));
      if (snap.empty) return;
      setRoutes(
        snap.docs.map((routeDoc) => {
          const data = routeDoc.data();
          return {
            id: data.routeId || routeDoc.id,
            region: data.region || "",
            points: data.points || [],
          };
        })
      );
    };

    void loadRoutes();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;

    return routes.filter((route) => [route.id, route.region].some((value) => value.toLowerCase().includes(q)));
  }, [query, routes]);

  const openAddModal = () => {
    setEditingRouteId(null);
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (route: RouteRow) => {
    setEditingRouteId(route.id);
    setFormData({
      routeId: route.id,
      region: route.region,
      points: [...route.points],
      newPoint: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRouteId(null);
    setFormData(createEmptyForm());
  };

  const toggleRoute = (routeId: string) => {
    setExpandedRouteId((current) => (current === routeId ? null : routeId));
  };

  const handleFormFieldChange = (field: keyof RouteFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAddPoint = () => {
    const point = formData.newPoint.trim();
    if (!point) return;

    setFormData((current) => ({
      ...current,
      points: current.points.includes(point) ? current.points : [...current.points, point],
      newPoint: "",
    }));
  };

  const handleRemovePoint = (index: number) => {
    setFormData((current) => ({
      ...current,
      points: current.points.filter((_, pointIndex) => pointIndex !== index),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const routeId = formData.routeId.trim();
    const region = formData.region.trim();
    const points = formData.points.map((point) => point.trim()).filter(Boolean);

    if (!routeId || !region || points.length === 0) {
      return;
    }

    const existingIds = routes.map((route) => extractPrefixedNumber(route.id, "RT")).filter((value): value is number => typeof value === "number");
    const generatedId = formatPrefixedNumber("RT", (existingIds.length ? Math.max(...existingIds) : 0) + 1);
    const finalRouteId = routeId || generatedId;
    const nextRoute: RouteRow = { id: finalRouteId, region, points };
    const routeRecord = { routeId: finalRouteId, region, points, updatedAt: serverTimestamp() };

    if (editingRouteId) {
      setRoutes((current) => current.map((route) => (route.id === editingRouteId ? nextRoute : route)));
      const existingDocs = await getDocs(collection(db, "routes"));
      const existingDoc = existingDocs.docs.find((d) => (d.data().routeId || d.id) === editingRouteId);
      if (existingDoc) {
        await updateDoc(doc(db, "routes", existingDoc.id), routeRecord);
      }
    } else {
      setRoutes((current) => [nextRoute, ...current]);
      await addDoc(collection(db, "routes"), { ...routeRecord, routeId: finalRouteId, createdAt: serverTimestamp() });
    }

    closeModal();
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
              )
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

          <section className="admin-header-card">
            <div>
              <span className="admin-chip">ROUTE MANAGEMENT</span>
              <h1>
                Route Management <span className="highlight">🛣️</span>
              </h1>
              <p>Define and manage pickup routes across all districts.</p>
            </div>
          </section>

          <section className="route-card">
            <div className="route-top">
              <div>
                <h2>Routes</h2>
                <p>Search routes by region and review the pickup points under each route.</p>
              </div>
              <button className="add-button" type="button" onClick={openAddModal}>
                + Add
              </button>
            </div>

            <div className="route-search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search region, route id..."
                aria-label="Search routes"
              />
            </div>

            <div className="route-table">
              <div className="route-row route-row--header">
                <span>ROUTE ID</span>
                <span>REGION</span>
                <span>NO OF POINTS</span>
                <span />
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <strong>No routes found</strong>
                  <span>Try another search term.</span>
                </div>
              ) : (
                filtered.map((route, index) => {
                  const isExpanded = expandedRouteId === route.id;
                  return (
                    <div key={route.id} className={`route-group ${index % 2 === 1 ? "route-group--alt" : ""}`}>
                      <div className="route-row">
                        <span className="route-cell route-cell--strong">{route.id}</span>
                        <span className="route-cell">{route.region}</span>
                        <div className="route-cell route-cell--points">
                          <span>{route.points.length}</span>
                          <button type="button" className="chevron-button" onClick={() => toggleRoute(route.id)}>
                            {isExpanded ? "▾" : "▸"}
                          </button>
                        </div>
                        <button type="button" className="edit-button" onClick={() => openEditModal(route)}>
                          ✎ Edit
                        </button>
                      </div>

                      {isExpanded ? (
                        <div className="route-expanded">
                          {route.points.map((point) => (
                            <div key={`${route.id}-${point}`} className="route-point">
                              → {point}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </main>

        {isModalOpen ? (
          <div className="modal-backdrop" role="presentation" onClick={closeModal}>
            <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-label">Route details</p>
                  <h3>{editingRouteId ? "Edit route" : "Add route"}</h3>
                </div>
                <button type="button" className="modal-close" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <label>
                  <span>Route ID</span>
                  <input
                    value={formData.routeId}
                    onChange={(event) => handleFormFieldChange("routeId", event.target.value)}
                    placeholder="Enter route ID"
                  />
                </label>

                <label>
                  <span>Region</span>
                  <input
                    value={formData.region}
                    onChange={(event) => handleFormFieldChange("region", event.target.value)}
                    placeholder="Enter region"
                  />
                </label>

                <div className="point-section">
                  <div className="point-section__header">
                    <span>Point Names</span>
                    <div className="point-input-row">
                      <input
                        value={formData.newPoint}
                        onChange={(event) => handleFormFieldChange("newPoint", event.target.value)}
                        placeholder="Add a point"
                      />
                      <button type="button" className="mini-button" onClick={handleAddPoint}>
                        Add Point
                      </button>
                    </div>
                  </div>

                  <div className="point-list">
                    {formData.points.length === 0 ? (
                      <p className="point-empty">Add one or more points to build the route.</p>
                    ) : (
                      formData.points.map((point, index) => (
                        <div key={`${point}-${index}`} className="point-chip">
                          <span>{point}</span>
                          <button type="button" className="point-remove" onClick={() => handleRemovePoint(index)}>
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="add-button">
                    Save Route
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
            padding: 28px;
            border-radius: 32px;
            background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
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

          .admin-header-card h1 {
            margin: 16px 0 8px;
            font-size: 2rem;
          }

          .admin-header-card p {
            margin: 0;
            color: #556b54;
          }

          .highlight {
            color: #16a34a;
          }

          .route-card {
            background: white;
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
            border-radius: 32px;
            padding: 28px;
            width: min(100%, 980px);
          }

          .route-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 16px;
            margin-bottom: 18px;
          }

          .route-top h2 {
            margin: 0;
            font-size: 1.25rem;
          }

          .route-top p {
            margin: 6px 0 0;
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

          .route-search {
            margin-bottom: 14px;
          }

          .route-search input,
          .modal-form input {
            width: 100%;
            border: 1px solid #d9e9d9;
            border-radius: 16px;
            padding: 14px 16px;
            background: #f7fbf6;
            color: #1b3c28;
            font-size: 0.95rem;
            outline: none;
          }

          .route-table {
            display: grid;
            gap: 10px;
            overflow-x: auto;
          }

          .route-group {
            display: grid;
            gap: 8px;
          }

          .route-group--alt .route-row {
            background: #f3f7f3;
          }

          .route-row {
            display: grid;
            grid-template-columns: 1.2fr 1.2fr 1fr 0.8fr;
            gap: 16px;
            align-items: center;
            min-width: 760px;
            padding: 16px;
            border-radius: 18px;
            background: #f8fbf7;
            color: #1d3a25;
          }

          .route-row--header {
            background: transparent;
            font-size: 0.78rem;
            font-weight: 800;
            color: #4d6b53;
            min-width: 760px;
          }

          .route-cell {
            font-size: 0.95rem;
          }

          .route-cell--strong {
            font-weight: 700;
          }

          .route-cell--points {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .chevron-button,
          .edit-button,
          .mini-button,
          .modal-secondary,
          .point-remove {
            border: none;
            cursor: pointer;
          }

          .chevron-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            border-radius: 999px;
            background: #e7f5e9;
            color: #166529;
            font-weight: 700;
          }

          .edit-button {
            justify-self: end;
            border-radius: 999px;
            padding: 8px 12px;
            background: #e8f5eb;
            color: #166529;
            font-weight: 700;
          }

          .route-expanded {
            margin-left: 18px;
            padding: 12px 16px;
            border-left: 2px solid #d9e9d9;
            display: grid;
            gap: 8px;
            background: #fcfefe;
            border-radius: 0 16px 16px 0;
            color: #4b5f52;
          }

          .route-point {
            font-size: 0.95rem;
          }

          .empty-state {
            min-width: 760px;
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

          .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(11, 24, 15, 0.45);
            display: grid;
            place-items: center;
            padding: 20px;
            z-index: 50;
          }

          .modal-card {
            width: min(100%, 560px);
            background: white;
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 20px 50px rgba(15, 36, 24, 0.18);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            gap: 12px;
            margin-bottom: 18px;
          }

          .modal-label {
            margin: 0 0 6px;
            color: #166529;
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.2rem;
          }

          .modal-close {
            border: none;
            background: transparent;
            font-size: 1.3rem;
            cursor: pointer;
            color: #4b5f52;
          }

          .modal-form {
            display: grid;
            gap: 14px;
          }

          .modal-form label,
          .point-section {
            display: grid;
            gap: 8px;
          }

          .modal-form span {
            font-size: 0.9rem;
            font-weight: 700;
            color: #31402c;
          }

          .point-section__header {
            display: grid;
            gap: 8px;
          }

          .point-input-row {
            display: flex;
            gap: 8px;
          }

          .point-input-row input {
            flex: 1;
          }

          .mini-button {
            border-radius: 12px;
            padding: 10px 12px;
            background: #e9f6eb;
            color: #166529;
            font-weight: 700;
            white-space: nowrap;
          }

          .point-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .point-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 999px;
            background: #f4fbf5;
            color: #1d3a25;
          }

          .point-remove {
            background: transparent;
            color: #6b7280;
            font-size: 1rem;
          }

          .point-empty {
            margin: 0;
            color: #6b7280;
            font-size: 0.9rem;
          }

          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 4px;
          }

          .modal-secondary {
            border-radius: 16px;
            padding: 12px 16px;
            background: #f3f5f4;
            color: #31402c;
            font-weight: 700;
          }

          @media (max-width: 820px) {
            .admin-root { flex-direction: column; }
            .admin-sidebar { width: 100%; }
            .route-card { width: 100%; }
            .route-top { flex-direction: column; align-items: flex-start; }
            .point-input-row { flex-direction: column; }
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}

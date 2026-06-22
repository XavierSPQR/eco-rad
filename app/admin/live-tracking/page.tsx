"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";



import { usePathname } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
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




/**
 * OpenStreetMap embed needs lat/lng for the currently selected vehicle.
 * Admin view uses the selected vehicle to center the map (similar to resident track page).
 */

function MapEmbed({ vehicle }: { vehicle: any }) {
  if (!vehicle) return null;
  // bbox centres around selected vehicle with ~0.06 degree padding
  const pad = 0.04;
  const bbox = `${vehicle.lng - pad},${vehicle.lat - pad},${vehicle.lng + pad},${vehicle.lat + pad}`;
  const marker = `${vehicle.lat},${vehicle.lng}`;

  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;

  return (
    <iframe
      key={vehicle.id}
      src={src}
      title={`Map showing ${vehicle.id} near ${vehicle.area}`}
      className="tt-map-iframe"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

export default function AdminLiveTrackingPage() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);
  const [contacted, setContacted] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "activeVehicles"), (snapshot) => {
      const activeTrucks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(activeTrucks);
      
      // Select the first vehicle by default if none is selected and we have trucks
      setSelectedVehicle((prev: any) => {
        if (!prev && activeTrucks.length > 0) return activeTrucks[0];
        if (prev && activeTrucks.length > 0) {
          // Update selected vehicle's position if it exists in the new snapshot
          const updated = activeTrucks.find((t: any) => t.id === prev.id);
          return updated || activeTrucks[0];
        }
        return prev;
      });
    });
    return () => unsubscribe();
  }, []);

  const activeVehicles = useMemo(() => {
    return vehicles.filter(v => v.status !== "Offline");
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeVehicles;
    }

    return activeVehicles.filter((vehicle) =>
      [vehicle.id, vehicle.driver, vehicle.area, vehicle.status].some((value) =>
        String(value || "").toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [query, activeVehicles]);

  const metrics = [
    { label: "Active drivers", value: activeVehicles.length.toString() },
  ];

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

        <section className="admin-header-card live-header">
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
            <div key={metric.label} className="metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </section>

        <section className="live-grid">
          <article className="tracking-card">
            <div className="card-header">
              <div>
                <h2>Active vehicles</h2>
                <p>Select a truck to update the route preview.</p>
              </div>
            </div>

            <div className="tracking-search">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search truck, driver, district..."
                aria-label="Search live vehicles"
              />
            </div>

            <div className="vehicle-list pickme-grid">
              {filteredVehicles.map((vehicle) => (
                <button
                  className={selectedVehicle?.id === vehicle.id ? "vehicle-card pickme-card selected" : "vehicle-card pickme-card"}
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  type="button"
                >
                  <div className="pickme-content">
                    <strong>{vehicle.id}</strong>
                    <small>{vehicle.driver}</small>
                    <em>{vehicle.area}</em>
                    <span className="eta">ETA {vehicle.eta}</span>
                  </div>
                  <span
                    className="contact-driver-pickme"
                    onClick={(event) => {
                      event.stopPropagation();
                      setContacted(vehicle.id);
                    }}
                  >
                    {contacted === vehicle.id ? "✓" : "📞"}
                  </span>
                </button>
              ))}

              {filteredVehicles.length === 0 && (
                <div className="empty-state">
                  <strong>No vehicles found</strong>
                  <span>Try another truck ID, driver, or district.</span>
                </div>
              )}
            </div>
          </article>

          <article className="tracking-card tracking-card--large">
            <div className="card-header">
              <div>
                <h2>Live route tracking</h2>
                <p>Monitor active collection trucks and route progress.</p>
              </div>
              <div className={selectedVehicle?.status === "Live" ? "status-chip status-active" : "status-chip status-delayed"}>
                {selectedVehicle?.status || "Unknown"}
              </div>
            </div>

            <div className="tt-map-wrap route-map">
              {selectedVehicle ? (
                <>
                  <MapEmbed vehicle={selectedVehicle} />

                  {/* Live badge */}
                  <div className="tt-live-badge">
                    <span className="tt-live-dot" />
                    LIVE
                  </div>

                  {/* Keep existing vehicle chip overlay style */}
                  <div className="vehicle-chip">
                    <strong>{selectedVehicle.id}</strong>
                    <span>{selectedVehicle.eta || "N/A"} away</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 font-medium bg-[#e8f5e9]">
                  No active vehicles found.
                </div>
              )}
            </div>
          </article>
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

        .live-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .live-header p {
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
          grid-template-columns: repeat(1, minmax(0, 240px));
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

        .live-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 24px;
        }

        .tracking-card {
          border-radius: 32px;
          padding: 28px;
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .tracking-card--large {
          min-height: 450px;
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

        .status-chip {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 8px 14px;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .status-active {
          background: #ecf8ef;
          color: #166529;
        }

        .status-delayed {
          background: #fff7e6;
          color: #a76300;
        }

        .tracking-search {
          margin-bottom: 18px;
        }

        .tracking-search input {
          width: 100%;
          border: 1px solid #d9e9d9;
          border-radius: 16px;
          padding: 14px 16px;
          background: #f7fbf6;
          color: #1b3c28;
          font-size: 0.95rem;
          outline: none;
        }

        /* ── Map (OpenStreetMap embed) ── */
        .route-map,
        .tt-map-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          aspect-ratio: 4/3;
          background: #e8f5e9;
          min-height: 315px;
        }

        .tt-map-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .tt-live-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(6px);
          border-radius: 20px;
          padding: 5px 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #2e7d32;
          box-shadow: 0 1px 6px rgba(0,0,0,0.10);
          pointer-events: none;
        }

        .tt-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2e7d32;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }

        .vehicle-chip {
          position: absolute;
          left: 18px;
          bottom: 14px;
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          color: #19362a;
          font-size: 0.78rem;
        }

        .vehicle-chip span {
          color: #667a6d;
        }

        .vehicle-list {
          display: grid;
          gap: 12px;
        }

        .pickme-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .vehicle-card {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          width: 100%;
          min-height: 132px;
          border: 0;
          border-radius: 18px;
          padding: 16px;
          background: #f8fbf7;
          color: #1d3a25;
          text-align: left;
          cursor: pointer;
        }

        .pickme-card {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: stretch;
          min-height: 140px;
          padding: 16px;
          background: #ffffff;
          border: 2px solid #e6f0e3;
          border-radius: 16px;
          transition: all 0.2s ease;
        }

        .pickme-card:hover {
          border-color: #16a34a;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.12);
        }

        .pickme-card.selected {
          border-color: #16a34a;
          background: #f2fbf4;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }

        .pickme-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .vehicle-card.selected {
          box-shadow: inset 0 0 0 2px #c9ead0;
          background: #f2fbf4;
        }

        .vehicle-card strong,
        .vehicle-card small,
        .vehicle-card em,
        .pickme-card strong,
        .pickme-card small,
        .pickme-card em {
          display: block;
        }

        .vehicle-card small,
        .vehicle-card em,
        .pickme-card small,
        .pickme-card em {
          margin-top: 5px;
          color: #6b7280;
          font-size: 0.8rem;
          font-style: normal;
        }

        .pickme-card small {
          margin-top: 2px;
        }

        .eta {
          color: #16a34a;
          font-size: 0.78rem;
          font-weight: 800;
          margin-top: 6px;
        }

        .progress-track {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 48px;
          height: 5px;
          border-radius: 999px;
          background: #e6f0e3;
          overflow: hidden;
        }

        .progress-track i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: #16a34a;
        }

        .contact-driver {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 12px;
          display: grid;
          place-items: center;
          min-height: 28px;
          border-radius: 999px;
          background: #ffffff;
          color: #1f7f37;
          box-shadow: 0 10px 24px rgba(23, 63, 31, 0.08);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .contact-driver-pickme {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #16a34a;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          border: none;
          margin-top: auto;
          align-self: flex-end;
          transition: all 0.2s ease;
        }

        .contact-driver-pickme:hover {
          background: #0f7a36;
          transform: scale(1.1);
        }

        .empty-state {
          display: grid;
          gap: 6px;
          padding: 18px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .empty-state span {
          color: #6b7280;
          font-size: 0.85rem;
        }

        @media (max-width: 1080px) {
          .admin-metrics,
          .live-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pickme-grid {
            grid-template-columns: 1fr;
          }

          .admin-top {
            flex-direction: column;
            align-items: stretch;
          }

          .tracking-card--large {
            grid-column: 1 / -1;
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

          .admin-metrics,
          .live-grid {
            grid-template-columns: 1fr;
          }

          .admin-header-card {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
    </RoleGuard>
  );
}

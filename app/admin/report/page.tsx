"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "@/components/RoleGuard";



import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { type WasteType, WASTE_TYPE_OPTIONS } from "@/lib/wasteTypes";


type WasteCollectionRow = {
  date: string; // YYYY-MM-DD
  wasteType: WasteType;
  collectionId: string;
  weightKg: number;
};


type ScheduleRow = {
  date: string; // YYYY-MM-DD
  scheduleId: string;
  collector: string;
  driver: string;
  vehicleNumber: string;
  region: string;
  routeId: string;
  description: string;
};


const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Live Tracking", href: "/admin/live-tracking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { divider: true, componentKey: "sep-top" },
  { label: "Residents", href: "/admin/users", icon: "👥" },
  { label: "Employees", href: "/admin/employee", icon: "👨‍💼" },
  { label: "Vehicles", href: "/admin/vehicle", icon: "🚗" },
  { label: "Route Management", href: "/admin/route-management", icon: "🛣️" },
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



function toTimestamp(dateStr: string) {
  // Safe parse for YYYY-MM-DD
  const [y, m, d] = dateStr.split("-").map((x) => Number(x));
  return new Date(y, m - 1, d).getTime();
}

function isWithinRange(dateStr: string, fromDate: string, toDate: string) {
  const t = toTimestamp(dateStr);
  const fromT = fromDate ? toTimestamp(fromDate) : null;
  const toT = toDate ? toTimestamp(toDate) : null;
  if (fromT != null && t < fromT) return false;
  if (toT != null && t > toT) return false;
  return true;
}

function csvEscape(value: string | number) {
  const s = String(value);
  if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [headers.join(","), ...rows.map((r) => r.map(csvEscape).join(","))].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function AdminReportPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<"waste" | "schedule">("waste");

  const [wasteCollections, setWasteCollections] = useState<WasteCollectionRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);

  const [loading, setLoading] = useState(true);

  // Waste filters
  const [wFromDate, setWFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [wToDate, setWToDate] = useState(new Date().toISOString().split('T')[0]);
  const [wasteType, setWasteType] = useState<WasteType | "ALL">("ALL");

  // Schedule filters
  const [sFromDate, setSFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [sToDate, setSToDate] = useState(new Date().toISOString().split('T')[0]);

  const [wApplied, setWApplied] = useState(false);
  const [sApplied, setSApplied] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const wSnap = await getDocs(query(collection(db, "wasteCollections"), orderBy("collectedAt", "desc")));
        const wData = wSnap.docs.map(doc => {
          const d = doc.data();
          return {
            date: d.collectedAt?.toDate ? d.collectedAt.toDate().toISOString().split('T')[0] : "",
            wasteType: d.wasteType,
            collectionId: doc.id,
            weightKg: d.weight,
          } as WasteCollectionRow;
        });
        setWasteCollections(wData);

        const sSnap = await getDocs(query(collection(db, "schedules"), orderBy("date", "desc")));
        const sData = sSnap.docs.map((doc) => {
          const d = doc.data();
          return {
            date: String(d.date || ""),
            scheduleId: doc.id,
            collector: String(d.collectorName || ""),
            driver: String(d.driverName || ""),
            vehicleNumber: String(d.vehicleNo || ""),
            region: String(d.region || ""),
            routeId: String(d.routeId || ""),
            description: String(d.description || ""),
          } as ScheduleRow;
        });
        setSchedules(sData);
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredWaste = useMemo(() => {
    return wasteCollections.filter((row) => {
      if (!isWithinRange(row.date, wFromDate, wToDate)) return false;
      if (wasteType !== "ALL" && row.wasteType !== wasteType) return false;
      return true;
    });
  }, [wasteCollections, wFromDate, wToDate, wasteType]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((row) => isWithinRange(row.date, sFromDate, sToDate));
  }, [schedules, sFromDate, sToDate]);


  const wasteTotals = useMemo(() => {
    const total = filteredWaste.reduce((sum, r) => sum + r.weightKg, 0);
    return { totalKg: total };
  }, [filteredWaste]);

  const doExportWaste = () => {
    const headers = ["Date", "Waste Type", "Collection ID", "Weight (kg)"];
    const rows = filteredWaste.map((r) => [r.date, r.wasteType, r.collectionId, r.weightKg]);
    downloadCsv(`waste-collection-report_${wFromDate}_to_${wToDate}.csv`, headers, rows);
  };

  const doExportSchedule = () => {
    const headers = [
      "Date",
      "Schedule ID",
      "Collector",
      "Driver",
      "Region",
      "Route ID",
      "Vehicle Number",
      "Description",
    ];
    const rows = filteredSchedules.map((r) => [
      r.date,
      r.scheduleId,
      r.collector,
      r.driver,
      r.region,
      r.routeId,
      r.vehicleNumber,
      r.description,
    ]);
    downloadCsv(`schedule-report_${sFromDate}_to_${sToDate}.csv`, headers, rows);
  };


  return (
        <RoleGuard allowedRole="admin">
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon" aria-label="EcoCycle Lanka logo">
            <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
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

        <section className="admin-header-card report-header">
          <div>
            <span className="admin-chip">SYSTEM ADMIN</span>
            <h1>
              Control Center <span className="highlight">EcoCycle Lanka</span>
            </h1>
            <p>Generate operational reports using date & waste filters.</p>
          </div>
        </section>

        <section className="report-card">
          <div className="report-tabs" role="tablist" aria-label="Report types">
            <button
              type="button"
              className={activeTab === "waste" ? "tab tab--active" : "tab"}
              onClick={() => setActiveTab("waste")}
              role="tab"
              aria-selected={activeTab === "waste"}
            >
              Waste Collection
            </button>
            <button
              type="button"
              className={activeTab === "schedule" ? "tab tab--active" : "tab"}
              onClick={() => setActiveTab("schedule")}
              role="tab"
              aria-selected={activeTab === "schedule"}
            >
              Schedule Report
            </button>
          </div>

          {activeTab === "waste" && (
            <div className="report-body" role="tabpanel" aria-label="Waste collection report">
              <div className="filters">
                <label>
                  <span>Date from</span>
                  <input type="date" value={wFromDate} onChange={(e) => setWFromDate(e.target.value)} />
                </label>
                <label>
                  <span>Date to</span>
                  <input type="date" value={wToDate} onChange={(e) => setWToDate(e.target.value)} />
                </label>
                <label>
                  <span>Waste type</span>
                  <select
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value as WasteType | "ALL")}
                  >
                    <option value="ALL">All</option>
                    {WASTE_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                </label>

                <div className="filter-actions">
                  <button
                    className="primary-btn"
                    onClick={() => setWApplied(true)}
                    type="button"
                  >
                    Apply
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={doExportWaste}
                    type="button"
                    disabled={!wApplied || filteredWaste.length === 0}
                    aria-disabled={!wApplied || filteredWaste.length === 0}
                    title={!wApplied ? "Apply filters first" : "Export CSV"}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="report-summary">
                <div className="summary-pill">Rows: {wApplied ? filteredWaste.length : 0}</div>
                <div className="summary-pill">Total weight: {wApplied ? `${wasteTotals.totalKg} kg` : "0 kg"}</div>
              </div>

              <div className="table">
                <div className="table-row table-row--header">
                  <span>DATE</span>
                  <span>WASTE TYPE</span>
                  <span>COLLECTION ID</span>
                  <span className="right">WEIGHT (KG)</span>
                </div>

                {loading ? (
                   <div className="empty-state">Loading data...</div>
                ) : (wApplied ? filteredWaste : []).map((r) => (
                  <div className="table-row" key={`${r.collectionId}-${r.date}-${r.wasteType}`}>
                    <span>{r.date}</span>
                    <span>{r.wasteType}</span>
                    <span>{r.collectionId}</span>
                    <span className="right">{r.weightKg}</span>
                  </div>
                ))}

                {!loading && wApplied && filteredWaste.length === 0 && (
                  <div className="empty-state">
                    <strong>No waste collections found</strong>
                    <span>Adjust the date range or waste type.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="report-body" role="tabpanel" aria-label="Schedule report">
              <div className="filters">
                <label>
                  <span>Date from</span>
                  <input type="date" value={sFromDate} onChange={(e) => setSFromDate(e.target.value)} />
                </label>
                <label>
                  <span>Date to</span>
                  <input type="date" value={sToDate} onChange={(e) => setSToDate(e.target.value)} />
                </label>

                <div className="filter-actions">
                  <button className="primary-btn" onClick={() => setSApplied(true)} type="button">
                    Apply
                  </button>
                  <button
                    className="secondary-btn"
                    onClick={doExportSchedule}
                    type="button"
                    disabled={!sApplied || filteredSchedules.length === 0}
                    aria-disabled={!sApplied || filteredSchedules.length === 0}
                    title={!sApplied ? "Apply filters first" : "Export CSV"}
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="report-summary">
                <div className="summary-pill">Rows: {sApplied ? filteredSchedules.length : 0}</div>
                <div className="summary-pill">Date range: {sApplied ? `${sFromDate} → ${sToDate}` : "—"}</div>
              </div>

              <div className="table table--wide">
                <div className="table-row table-row--header table-row--grid">
                  <span>DATE</span>
                  <span>SCHEDULE ID</span>
                  <span>DRIVER</span>
                  <span>COLLECTOR</span>
                  <span>ROUTE ID</span>
                  <span>VEHICLE NO</span>
                </div>

                {(sApplied ? filteredSchedules : []).map((r) => (
                  <div
                    className="table-row table-row--grid"
                    key={`${r.scheduleId}-${r.date}-${r.vehicleNumber}`}
                  >
                    <span>{r.date}</span>
                    <span>{r.scheduleId}</span>
                    <span>{r.driver}</span>
                    <span>{r.collector}</span>
                    <span>{r.routeId}</span>
                    <span>{r.vehicleNumber}</span>
                  </div>
                ))}

                {sApplied && filteredSchedules.length === 0 && (
                  <div className="empty-state">
                    <strong>No schedules found</strong>
                    <span>Adjust the date range.</span>
                  </div>
                )}
              </div>
            </div>
          )}

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

        .report-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .admin-header-card p {
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

        .report-card {
          border-radius: 32px;
          padding: 28px;
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .report-tabs {
          display: flex;
          gap: 12px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e8efe5;
        }

        .tab {
          border: 1px solid #d9e9d9;
          background: #f7fbf6;
          color: #315037;
          border-radius: 999px;
          padding: 12px 18px;
          font-weight: 800;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .tab--active {
          background: #e6f4e8;
          border-color: #b9e7c0;
          color: #166529;
        }

        .filters {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr 1.3fr auto;
          gap: 14px;
          align-items: end;
        }

        .filters label {
          display: grid;
          gap: 8px;
          color: #315037;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .filters input,
        .filters select {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #d9e9d9;
          padding: 12px 14px;
          background: #f7fbf6;
          color: #1b3c28;
          outline: none;
        }

        .filter-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .primary-btn {
          border: none;
          border-radius: 999px;
          padding: 12px 18px;
          background: #1f7f37;
          color: white;
          font-weight: 900;
          cursor: pointer;
        }

        .secondary-btn {
          border: 1px solid #d9e9d9;
          border-radius: 999px;
          padding: 12px 18px;
          background: #eef9f2;
          color: #166529;
          font-weight: 900;
          cursor: pointer;
        }

        .secondary-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .report-summary {
          display: flex;
          gap: 12px;
          margin: 18px 0;
          flex-wrap: wrap;
        }

        .summary-pill {
          padding: 10px 14px;
          border-radius: 999px;
          background: #f8fbf7;
          border: 1px solid #e8efe5;
          color: #1d3a25;
          font-weight: 900;
          font-size: 0.9rem;
        }

        .table {
          border-radius: 18px;
          border: 1px solid #e8efe5;
          overflow: hidden;
        }

        .table--wide {
          overflow-x: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr 0.7fr;
          gap: 12px;
          padding: 14px 16px;
          align-items: center;
          background: white;
          border-bottom: 1px solid #e8efe5;
          color: #1d3a25;
          min-width: 760px;
        }

        .table-row--header {
          background: #f7fbf6;
          font-weight: 900;
          font-size: 0.82rem;
          color: #4d6b53;
          min-width: 760px;
        }

        .right {
          text-align: right;
          justify-self: end;
          font-weight: 900;
        }

        .table-row--grid {
          grid-template-columns: 0.9fr 1.1fr 1.6fr 1.4fr 1.4fr 1.2fr;
          min-width: 980px;
        }

        .empty-state {
          padding: 18px 16px;
          display: grid;
          gap: 6px;
          background: #f8fbf7;
        }

        .empty-state strong {
          color: #1d3a25;
        }

        .empty-state span {
          color: #6b7280;
          font-size: 0.9rem;
        }

        @media (max-width: 1080px) {
          .filters {
            grid-template-columns: 1fr 1fr 1fr;
          }

          .filter-actions {
            grid-column: 1 / -1;
            justify-content: flex-start;
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

          .table-row {
            min-width: 640px;
          }

          .table-row--header {
            min-width: 640px;
          }
        }
      `}</style>
    </div>
    </RoleGuard>
  );
}


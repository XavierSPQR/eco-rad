"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
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

export default function AdminSchedulesPage() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCollector, setSelectedCollector] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("Horana");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function fetchCollectors() {
      try {
        const q = query(collection(db, "users"), where("role", "==", "collector"));
        const snapshot = await getDocs(q);
        const collectorList = snapshot.docs.map(doc => ({
          uid: doc.id,
          fullName: doc.data().fullName || "Unknown Collector"
        }));
        setCollectors(collectorList);
      } catch (error) {
        console.error("Error fetching collectors:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCollectors();
  }, []);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollector) {
      setMessage({ text: "Please select a collector.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const collector = collectors.find(c => c.uid === selectedCollector);
      await addDoc(collection(db, "schedules"), {
        collectorId: selectedCollector,
        collectorName: collector?.fullName || "Unknown",
        region: selectedRegion,
        date: selectedDate,
        description: description,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setMessage({ text: "Schedule created successfully!", type: "success" });
      setDescription("");
    } catch (error) {
      console.error("Error creating schedule:", error);
      setMessage({ text: "Failed to create schedule. Please try again.", type: "error" });
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
              ),
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
              <p>Create and manage pickup schedules for collectors.</p>
            </div>
          </section>

          <section className="schedule-form-card">
            <form onSubmit={handleSchedule} className="schedule-form">
              <div className="form-group">
                <label htmlFor="collector">Select Collector</label>
                <select
                  id="collector"
                  value={selectedCollector}
                  onChange={(e) => setSelectedCollector(e.target.value)}
                  disabled={loading}
                >
                  <option value="">-- Choose a collector --</option>
                  {collectors.map((c) => (
                    <option key={c.uid} value={c.uid}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="region">Select Region</label>
                <select
                  id="region"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="Horana">Horana</option>
                  <option value="Colombo">Colombo</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Select Date</label>
                <input
                  type="date"
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter pickup details or notes..."
                  rows={4}
                />
              </div>

              {message.text && (
                <div className={`form-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="schedule-btn"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </button>
            </form>
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
            padding: 28px;
            border-radius: 32px;
            background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
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

          .schedule-form-card {
            background: white;
            padding: 40px;
            border-radius: 32px;
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
            max-width: 600px;
          }

          .schedule-form {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group label {
            font-weight: 700;
            font-size: 0.9rem;
            color: #4b5563;
          }

          .form-group select,
          .form-group input,
          .form-group textarea {
            padding: 14px 18px;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            font-family: inherit;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s;
          }

          .form-group select:focus,
          .form-group input:focus,
          .form-group textarea:focus {
            border-color: #2e7d32;
            background: white;
            box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
          }

          .schedule-btn {
            background: #2e7d32;
            color: white;
            padding: 16px;
            border-radius: 18px;
            border: none;
            font-weight: 700;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 8px;
          }

          .schedule-btn:hover {
            background: #1b5e20;
            transform: translateY(-2px);
          }

          .schedule-btn:disabled {
            background: #9ca3af;
            cursor: not-allowed;
            transform: none;
          }

          .form-message {
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .form-message.success {
            background: #ecfdf5;
            color: #065f46;
          }

          .form-message.error {
            background: #fef2f2;
            color: #991b1b;
          }

          @media (max-width: 920px) {
            .admin-root {
              flex-direction: column;
            }

            .admin-sidebar {
              width: 100%;
            }

            .schedule-form-card {
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    </RoleGuard>
  );
}

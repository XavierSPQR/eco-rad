"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";



import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

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

export default function AdminRewardRedeemManagementPage() {
  const pathname = usePathname();
  type RewardRedeemRecord = {
    id: string;
    createdAt: any;
    residentName: string;
    nic: string;
    rewardName: string;
    status: "pending" | "completed";
  };

  const [records, setRecords] = useState<RewardRedeemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "redemptions"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RewardRedeemRecord[];
      setRecords(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setCompleted = async (id: string) => {
    try {
      await updateDoc(doc(db, "redemptions", id), {
        status: "completed",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating redemption status:", error);
      alert("Failed to update status.");
    }
  };

  const setPending = async (id: string) => {
    try {
      await updateDoc(doc(db, "redemptions", id), {
        status: "pending",
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating redemption status:", error);
      alert("Failed to update status.");
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
            <div className="admin-avatar">AU</div>
            <div>
              <p className="admin-user-name">Admin User</p>
              <p className="admin-user-role">System Admin</p>
            </div>
          </div>
        </div>

        <section className="admin-header-card">
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <span className="admin-chip">REWARD REDEEM MANAGEMENT</span>
              <h1>Reward Redeem Management</h1>
              <p>Track redemptions made by residents, drivers and collectors.</p>
            </div>
            <div style={{ maxWidth: 420 }}>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name or NIC"
                style={{
                  width: "100%",
                  borderRadius: 14,
                  border: "1px solid #cde5d4",
                  padding: "12px 14px",
                  fontSize: 14,
                  color: "#1f3420",
                  background: "white",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            {loading ? (
              <div style={{ color: "#556b54" }}>Loading redemption records...</div>
            ) : records.length === 0 ? (
              <div style={{ color: "#556b54" }}>No redemption records yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", borderBottom: "1px solid #e6f4e8" }}>
                      <th style={{ padding: 8 }}>Date</th>
                      <th style={{ padding: 8 }}>Name</th>
                      <th style={{ padding: 8 }}>NIC</th>
                      <th style={{ padding: 8 }}>Reward</th>
                      <th style={{ padding: 8 }}>Status</th>
                      <th style={{ padding: 8 }}>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter((r) => {
                        const query = searchTerm.trim().toLowerCase();
                        if (!query) return true;
                        return (
                          r.residentName.toLowerCase().includes(query) ||
                          r.nic.toLowerCase().includes(query)
                        );
                      })
                      .map((r) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #f3f7f3" }}>
                          <td style={{ padding: 8 }}>
                            {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : "Just now"}
                          </td>
                          <td style={{ padding: 8 }}>{r.residentName}</td>
                          <td style={{ padding: 8 }}>{r.nic}</td>
                          <td style={{ padding: 8 }}>{r.rewardName}</td>
                          <td style={{ padding: 8 }}>{r.status ?? "pending"}</td>

                          <td style={{ padding: 8 }}>
                            {r.status === "completed" ? (
                              <button
                                onClick={() => {
                                  const ok = window.confirm("Mark this redemption as pending?");
                                  if (!ok) return;
                                  setPending(r.id);
                                }}
                                className="admin-primary"
                              >
                                Mark as Pending
                              </button>
                            ) : (
                              <button onClick={() => setCompleted(r.id)} className="admin-primary">Mark as Completed</button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
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

        @media (max-width: 920px) {
          .admin-root {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
          }
        }
      `}</style>
    </div>
    </RoleGuard>
  );
}

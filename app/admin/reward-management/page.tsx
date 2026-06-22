"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleGuard } from "@/components/RoleGuard";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
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

export default function AdminBadgeManagementPage() {
  const pathname = usePathname();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("points");
  const [variant, setVariant] = useState("complete");
  const [levels, setLevels] = useState([{ target: 0, note: "" }]);

  useEffect(() => {
    const q = query(collection(db, "badges"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBadges(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLevel = () => {
    setLevels([...levels, { target: 0, note: "" }]);
  };

  const removeLevel = (index: number) => {
    const newLevels = levels.filter((_, i) => i !== index);
    setLevels(newLevels);
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setLevels(newLevels);
  };

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Please provide a badge title.");
    if (levels.length === 0) return alert("Please add at least one level.");

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "badges"), {
        title,
        type,
        variant,
        levels: [...levels].sort((a, b) => a.target - b.target),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Clear form
      setTitle("");
      setType("points");
      setVariant("complete");
      setLevels([{ target: 0, note: "" }]);
    } catch (error) {
      console.error("Error adding badge:", error);
      alert("Failed to add badge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBadge = async (id: string) => {
    if (!confirm("Delete this badge?")) return;
    try {
      await deleteDoc(doc(db, "badges", id));
    } catch (error) {
      console.error("Error deleting badge:", error);
      alert("Failed to delete badge.");
    }
  };

  return (
    <RoleGuard allowedRole="admin">
      <div className="admin-root">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div className="admin-logo-icon">
              <svg width="22" height="22" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
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
                  <span className="admin-nav-icon">{item.icon}</span>
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
            <div>
              <span className="admin-chip">REWARD MANAGEMENT</span>
              <h1>Badge Management</h1>
              <p>Create and manage dynamic badges for residents.</p>
            </div>

            <div style={{ marginTop: 24 }}>
              <form onSubmit={handleAddBadge} className="badge-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Badge Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Green Champion"
                      className="reward-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Metric Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="reward-input"
                    >
                      <option value="points">Points</option>
                      <option value="pickups">Pickups</option>
                      <option value="weight">Total Weight (kg)</option>
                      <option value="plastic">Plastic Diverted (kg)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Visual Variant</label>
                    <select
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      className="reward-input"
                    >
                      <option value="complete">Default (Green)</option>
                      <option value="gold">Gold</option>
                      <option value="eco">Eco (Darker Green)</option>
                      <option value="plastic">Plastic (Blue/Brown)</option>
                    </select>
                  </div>
                </div>

                <div className="levels-section">
                  <h3>Badge Levels</h3>
                  {levels.map((level, index) => (
                    <div key={index} className="level-row">
                      <div className="form-group">
                        <label>Target Value</label>
                        <input
                          type="number"
                          value={level.target}
                          onChange={(e) => updateLevel(index, "target", Number(e.target.value))}
                          className="reward-input"
                          required
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Note (displayed to user)</label>
                        <input
                          value={level.note}
                          onChange={(e) => updateLevel(index, "note", e.target.value)}
                          placeholder="e.g. Reach 3,000 points"
                          className="reward-input"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLevel(index)}
                        className="admin-danger-small"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addLevel} className="admin-secondary">
                    + Add Level
                  </button>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button type="submit" className="admin-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Badge"}
                  </button>
                </div>
              </form>
            </div>

            <div style={{ marginTop: 40 }}>
              <h2>Existing Badges</h2>
              <div className="badge-grid">
                {loading ? (
                  <p>Loading badges...</p>
                ) : badges.length === 0 ? (
                  <p>No badges created yet.</p>
                ) : (
                  badges.map((badge) => (
                    <div key={badge.id} className="badge-mgmt-card">
                      <div className="badge-mgmt-header">
                        <div>
                          <strong>{badge.title}</strong>
                          <span className="mgmt-type-chip">{badge.type}</span>
                        </div>
                        <button onClick={() => handleDeleteBadge(badge.id)} className="admin-danger-small">
                          Delete
                        </button>
                      </div>
                      <div className="badge-mgmt-levels">
                        {badge.levels.map((l: any, i: number) => (
                          <div key={i} className="mgmt-level-item">
                            L{i + 1}: {l.target} — {l.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
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
          .admin-logo { display: flex; align-items: center; gap: 12px; }
          .admin-logo-icon {
            width: 44px; height: 44px; border-radius: 16px;
            background: #2e7d32; color: white; display: grid; place-items: center;
          }
          .admin-logo p { margin: 0; font-weight: 700; }
          .admin-logo small { color: #6b7280; font-size: 0.75rem; }
          .admin-nav { display: grid; gap: 10px; }
          .admin-nav-item {
            display: flex; align-items: center; gap: 10px; padding: 14px 18px;
            border-radius: 18px; text-decoration: none; color: #31402c; font-weight: 600;
          }
          .admin-nav-item.active { background: #e6f4e8; color: #166529; }
          .admin-nav-separator { height: 1px; background: rgba(22, 101, 31, 0.08); margin: 10px 0; }
          .admin-main { flex: 1; display: flex; flex-direction: column; gap: 24px; }
          .admin-top { display: flex; justify-content: flex-end; }
          .admin-usercard {
            display: flex; align-items: center; gap: 14px; background: white;
            border-radius: 22px; padding: 12px 16px; box-shadow: 0 20px 50px rgba(23, 63, 31, 0.06);
          }
          .admin-avatar {
            width: 48px; height: 48px; border-radius: 50%; background: #2e7d32;
            color: white; display: grid; place-items: center; font-weight: 700;
          }
          .admin-user-name { font-weight: 700; margin: 0; }
          .admin-user-role { color: #6b7280; font-size: 0.9rem; margin: 0; }

          .admin-header-card {
            padding: 28px; border-radius: 32px;
            background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
            box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
          }
          .admin-chip {
            padding: 8px 14px; border-radius: 999px; background: #e6f4e8;
            color: #166529; font-weight: 700; font-size: 0.8rem;
          }

          .badge-form { background: white; padding: 24px; border-radius: 18px; margin-top: 20px; }
          .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          .form-group { display: flex; flex-direction: column; gap: 8px; }
          .form-group label { font-size: 0.85rem; font-weight: 700; color: #17350f; }
          .reward-input { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; outline: none; }

          .levels-section { margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          .level-row { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 12px; }
          .admin-danger-small { background: #fee2e2; color: #991b1b; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
          .admin-secondary { background: white; border: 1px solid #cbd5e1; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
          .admin-primary { background: #166529; color: white; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; cursor: pointer; }

          .badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; margin-top: 16px; }
          .badge-mgmt-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .badge-mgmt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
          .mgmt-type-chip { font-size: 10px; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; margin-left: 8px; text-transform: uppercase; }
          .mgmt-level-item { font-size: 0.85rem; color: #475569; padding: 4px 0; border-bottom: 1px dashed #f1f5f9; }
        `}</style>
      </div>
    </RoleGuard>
  );
}

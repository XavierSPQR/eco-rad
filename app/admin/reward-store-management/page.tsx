"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

export default function AdminRewardStoreManagementPage() {
  const pathname = usePathname();
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const pointsRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);
  const residentsRef = useRef<HTMLInputElement | null>(null);
  const driversRef = useRef<HTMLInputElement | null>(null);
  const collectorsRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const q = query(collection(db, "rewards"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRewards(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    const title = titleRef.current?.value?.trim() ?? "";
    const category = categoryRef.current?.value?.trim() ?? "General";
    const pointsRequired = Number.parseInt(pointsRef.current?.value ?? "0", 10) || 0;
    const description = descRef.current?.value ?? "";
    const quantity = Number.parseInt(quantityRef.current?.value ?? "0", 10) || null;

    if (!title) return alert("Please provide a reward title.");

    setIsSubmitting(true);
    try {
      let imageUrl = "";
      const file = imageRef.current?.files?.[0];
      if (file) {
        const storageRef = ref(storage, `rewards/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      const audiences = [] as string[];
      if (residentsRef.current?.checked) audiences.push("residents");
      if (driversRef.current?.checked) audiences.push("drivers");
      if (collectorsRef.current?.checked) audiences.push("collectors");

      await addDoc(collection(db, "rewards"), {
        title,
        category,
        description,
        pointsRequired,
        quantity,
        image: imageUrl,
        audiences,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // clear form
      if (titleRef.current) titleRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "";
      if (pointsRef.current) pointsRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
      if (quantityRef.current) quantityRef.current.value = "";
      if (imageRef.current) imageRef.current.value = "";
      if (residentsRef.current) residentsRef.current.checked = true;
      if (driversRef.current) driversRef.current.checked = true;
      if (collectorsRef.current) collectorsRef.current.checked = true;
    } catch (error) {
      console.error("Error adding reward:", error);
      alert("Failed to add reward. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reward?")) return;
    try {
      await deleteDoc(doc(db, "rewards", id));
    } catch (error) {
      console.error("Error deleting reward:", error);
      alert("Failed to delete reward.");
    }
  };

  return (
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div>
              <span className="admin-chip">REWARD STORE MANAGEMENT</span>
              <h1>Reward Store Management</h1>
              <p>Manage rewards available in the public store.</p>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <form onSubmit={handleAdd} style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 260px" }}>
              <div style={{ display: "grid", gap: 10 }}>
                <label htmlFor="reward-title" style={{ fontWeight: 700, color: "#17350f" }}>Reward title</label>
                <input id="reward-title" ref={titleRef} placeholder="e.g. Eco Grocery Voucher" required className="reward-input" />

                <label htmlFor="reward-category" style={{ fontWeight: 700, color: "#17350f" }}>Category</label>
                <input id="reward-category" ref={categoryRef} placeholder="e.g. Shopping, Utilities" required className="reward-input" />

                <label htmlFor="reward-description" style={{ fontWeight: 700, color: "#17350f" }}>Short description</label>
                <textarea id="reward-description" ref={descRef} placeholder="One-line description" rows={3} className="reward-input" required />

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6 }}>
                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 14 }}><input ref={residentsRef} defaultChecked type="checkbox" /> Residents</label>
                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 14 }}><input ref={driversRef} defaultChecked type="checkbox" /> Drivers</label>
                  <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 14 }}><input ref={collectorsRef} defaultChecked type="checkbox" /> Collectors</label>
                </div>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="reward-points" style={{ fontWeight: 700, color: "#17350f" }}>Points amount</label>
                <input id="reward-points" ref={pointsRef} placeholder="e.g. 250" type="number" min={0} className="reward-input" required />

                <label htmlFor="reward-quantity" style={{ fontWeight: 700, color: "#17350f" }}>Quantity (optional)</label>
                <input id="reward-quantity" ref={quantityRef} placeholder="e.g. 10" type="number" min={0} className="reward-input" />

                <label htmlFor="reward-image" style={{ fontWeight: 700, color: "#17350f" }}>Image (optional)</label>
                <input id="reward-image" ref={imageRef} type="file" accept="image/*" />

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button type="submit" className="admin-primary" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Reward"}
                  </button>
                </div>
              </div>
            </form>

            <div style={{ marginTop: 20 }}>
              <h3 style={{ margin: "6px 0 12px" }}>Existing rewards</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {loading ? (
                  <div style={{ color: "#556b54" }}>Loading rewards...</div>
                ) : rewards.length === 0 ? (
                  <div style={{ color: "#556b54" }}>No rewards yet.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
                    {rewards.map((r) => (
                      <div key={r.id} className="reward-card">
                        <div className="reward-media">
                          {r.image ? <img src={r.image} alt={r.title} /> : <div className="reward-placeholder">🏷️</div>}
                        </div>
                        <div className="reward-body">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 10, color: '#666', fontWeight: 700, textTransform: 'uppercase' }}>{r.category}</span>
                              <strong style={{ fontSize: 16 }}>{r.title}</strong>
                            </div>
                            <span className="reward-points">{r.pointsRequired} pts</span>
                          </div>
                          <div style={{ color: "#556b54", marginTop: 8 }}>{r.description}</div>
                          <div style={{ marginTop: 10 }}>
                            {(r.audiences || ["residents","drivers","collectors"]).map((a: string) => (
                              <span key={a} className="audience-chip">{a}</span>
                            ))}
                          {typeof r.quantity === "number" && r.quantity !== null ? <div style={{ marginTop: 8, color: '#1f4f2f', fontWeight: 700 }}>Qty: {r.quantity}</div> : null}
                          </div>
                        </div>
                        <div className="reward-actions">
                          <button className="admin-danger" onClick={() => handleDelete(r.id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

        /* reward UI additions */
        .reward-input { padding: 10px; border-radius: 8px; border: 1px solid #e6f4e8; }
        .admin-primary { background: #166529; color: white; padding: 8px 14px; border-radius: 10px; border: none; font-weight:700; }
        .admin-secondary { background: transparent; color: #166529; padding: 8px 12px; border-radius: 10px; border: 1px solid #d7eed8; }

        .reward-card { display: flex; gap: 12px; align-items: flex-start; background: white; padding: 14px; border-radius: 12px; box-shadow: 0 12px 30px rgba(15,23,42,0.04); }
        .reward-media { width: 88px; height: 88px; border-radius: 10px; overflow: hidden; background: #f3f7f3; display: grid; place-items: center; }
        .reward-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .reward-placeholder { font-size: 28px; }
        .reward-body { flex: 1; }
        .reward-points { color: #166529; font-weight: 800; }
        .audience-chip { display:inline-block; margin-right:8px; margin-bottom:6px; padding:6px 10px; border-radius:999px; background:#eef9ef; color:#166529; font-size:12px; font-weight:700; }
        .reward-actions { display:flex; align-items:flex-start; }

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
  );
}

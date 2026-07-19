"use client";

import Link from "next/link";
import { RoleGuard } from "@/components/RoleGuard";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  calculatePointsEarnedWithRates,
  DEFAULT_WASTE_POINT_RATE_CONFIG,
  getWastePointRateConfig,
  migrateLegacyWasteTypes,
  normalizeWasteType,
  WASTE_TYPE_OPTIONS,
  type WastePointRateConfig,
  type WasteType,
} from "@/lib/wasteTypes";

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

type ResidentCollectionRow = {
  id: string;
  residentName: string;
  residentID: string;
  residentId: string;
  userId?: string;
  wasteType: WasteType;
  weight: number;
  pointsEarned: number;
  collectionDate: Timestamp | string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type ResidentCollectionFormState = {
  residentName: string;
  id: string;
  wasteType: string;
  weight: string;
  collectionDate: string;
};

type ResidentOption = {
  uid: string;
  residentID: string;
  fullName: string;
};

const emptyForm = (): ResidentCollectionFormState => ({
  residentName: "",
  id: "",
  wasteType: "Organic",
  weight: "",
  collectionDate: new Date().toISOString().slice(0, 10),
});

const getDisplayDateValue = (value: ResidentCollectionRow["collectionDate"]): string => {
  if (!value) return new Date().toISOString().slice(0, 10);
  if (value instanceof Timestamp) {
    return value.toDate().toISOString().slice(0, 10);
  }
  const parsedValue = new Date(value);
  return Number.isNaN(parsedValue.getTime()) ? new Date().toISOString().slice(0, 10) : parsedValue.toISOString().slice(0, 10);
};

const findResidentOption = (residentOptions: ResidentOption[], data: Record<string, unknown>) => {
  const residentIDValue = String(data.residentID || data.residentId || data.resident_id || "").trim();
  const userIdValue = String(data.userId || data.user_id || data.residentId || data.resident_id || "").trim();

  const residentMatch = residentIDValue
    ? residentOptions.find((option) => option.residentID.toLowerCase() === residentIDValue.toLowerCase())
    : undefined;

  if (residentMatch) {
    return residentMatch;
  }

  return userIdValue ? residentOptions.find((option) => option.uid === userIdValue) : undefined;
};

export default function AdminCollectionCenterPage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState<ResidentCollectionRow[]>([]);
  const [residentOptions, setResidentOptions] = useState<ResidentOption[]>([]);
  const [residentLookupError, setResidentLookupError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ResidentCollectionFormState>(emptyForm());
  const [wastePointRates, setWastePointRates] = useState<WastePointRateConfig>(DEFAULT_WASTE_POINT_RATE_CONFIG);

  useEffect(() => {
    const loadResidentOptions = async () => {
      const residentSnapshot = await getDocs(firestoreQuery(collection(db, "users"), where("role", "==", "resident")));
      const residents = residentSnapshot.docs
        .map((documentSnapshot) => {
          const data = documentSnapshot.data();
          const residentID = String(data.residentID || "").trim();
          const fullName = String(data.fullName || "").trim();
          return residentID ? { uid: documentSnapshot.id, residentID, fullName } : null;
        })
        .filter((entry): entry is ResidentOption => Boolean(entry));
      setResidentOptions(residents);
    };

    const backfillMissingResidentData = async () => {
      const residentSnapshot = await getDocs(firestoreQuery(collection(db, "users"), where("role", "==", "resident")));
      const residentsById = new Map<string, ResidentOption>();
      residentSnapshot.docs.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const residentID = String(data.residentID || "").trim();
        const fullName = String(data.fullName || "").trim();
        if (residentID) {
          residentsById.set(residentID.toLowerCase(), { uid: documentSnapshot.id, residentID, fullName });
        }
      });

      const collectionSnapshot = await getDocs(firestoreQuery(collection(db, "wasteCollections"), orderBy("collectionDate", "desc")));
      const batch = writeBatch(db);
      let needsCommit = false;

      collectionSnapshot.docs.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const residentIDValue = String(data.residentID || data.residentId || data.resident_id || "").trim();
        const residentNameValue = String(data.residentName || data.resident_name || "").trim();
        const userIdValue = String(data.userId || data.user_id || data.residentId || data.resident_id || "").trim();
        const residentMatch = residentIDValue
          ? residentsById.get(residentIDValue.toLowerCase())
          : userIdValue
            ? residentsById.get(userIdValue.toLowerCase())
            : undefined;
        const updates: Record<string, unknown> = {};

        if (!residentNameValue && residentMatch?.fullName) {
          updates.residentName = residentMatch.fullName;
        }

        if (!residentIDValue && residentMatch?.residentID) {
          updates.residentID = residentMatch.residentID;
        }

        if (!data.residentId && residentMatch?.uid) {
          updates.residentId = residentMatch.uid;
          updates.userId = residentMatch.uid;
        }

        if (Object.keys(updates).length > 0) {
          batch.update(doc(db, "wasteCollections", documentSnapshot.id), updates);
          needsCommit = true;
        }
      });

      if (needsCommit) {
        await batch.commit();
      }
    };

    void migrateLegacyWasteTypes();
    void loadResidentOptions();
    void backfillMissingResidentData();
    void getWastePointRateConfig().then(setWastePointRates).catch((error) => {
      console.error("Failed to load point settings:", error);
    });

    return undefined;
  }, []);

  useEffect(() => {
    const q = firestoreQuery(collection(db, "wasteCollections"), orderBy("collectionDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const snapshotRows = snapshot.docs.map((documentSnapshot) => {
        const data = documentSnapshot.data();
        console.log("[collection-center] raw row data", data);
        const residentMatch = findResidentOption(residentOptions, data);
        const resolvedResidentName = String(data.residentName || data.resident_name || residentMatch?.fullName || "").trim();
        const resolvedResidentID = String(data.residentID || data.residentId || data.resident_id || residentMatch?.residentID || "").trim();
        return {
          id: documentSnapshot.id,
          residentName: resolvedResidentName,
          residentID: resolvedResidentID,
          residentId: String(data.residentId || data.userId || data.user_id || residentMatch?.uid || data.id || "").trim(),
          userId: String(data.userId || data.user_id || residentMatch?.uid || "").trim(),
          wasteType: normalizeWasteType(String(data.wasteType ?? "")) as WasteType,
          weight: Number(data.weight ?? 0),
          pointsEarned: Number(data.pointsEarned ?? 0),
          collectionDate: data.collectionDate ?? data.collectedAt ?? null,
          createdAt: data.createdAt ?? null,
          updatedAt: data.updatedAt ?? null,
        } as ResidentCollectionRow;
      });
      setRows(snapshotRows);
    });

    return () => unsubscribe();
  }, [residentOptions]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.residentID.toLowerCase().includes(q));
  }, [searchQuery, rows]);

  const openAddModal = () => {
    setEditingRowId(null);
    setResidentLookupError("");
    setFormData(emptyForm());
    setIsModalOpen(true);
  };

  const openEditModal = (row: ResidentCollectionRow) => {
    setEditingRowId(row.id);
    setResidentLookupError("");
    setFormData({
      residentName: row.residentName,
      id: row.residentID,
      wasteType: row.wasteType,
      weight: String(row.weight),
      collectionDate: getDisplayDateValue(row.collectionDate),
    });
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: keyof ResidentCollectionFormState, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleResidentIdChange = (value: string) => {
    const trimmedValue = value.trim();
    const residentMatch = residentOptions.find((option) => option.residentID.toLowerCase() === trimmedValue.toLowerCase());

    setFormData((current) => ({
      ...current,
      id: value,
      residentName: residentMatch ? residentMatch.fullName : "",
    }));

    if (!trimmedValue) {
      setResidentLookupError("");
      return;
    }

    if (residentMatch) {
      setResidentLookupError("");
      return;
    }

    setResidentLookupError("No resident found with this ID");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const residentName = formData.residentName.trim();
    const residentId = formData.id.trim();
    const wasteType = normalizeWasteType(formData.wasteType) as WasteType;
    const weightValue = Number(formData.weight);
    const collectionDateValue = formData.collectionDate || new Date().toISOString().slice(0, 10);

    if (!residentId || !wasteType || !Number.isFinite(weightValue) || weightValue <= 0) {
      return;
    }

    if (!residentName) {
      const residentMatch = residentOptions.find((option) => option.residentID.toLowerCase() === residentId.toLowerCase());
      if (!residentMatch) {
        setResidentLookupError("No resident found with this ID");
        return;
      }
      setFormData((current) => ({ ...current, residentName: residentMatch.fullName }));
    }

    const pointsEarned = calculatePointsEarnedWithRates(weightValue, wasteType, wastePointRates);

    try {
      const residentMatches = await getDocs(firestoreQuery(collection(db, "users"), where("residentID", "==", residentId)));
      const resolvedResident = residentMatches.empty ? null : residentMatches.docs[0];
      const resolvedResidentId = resolvedResident?.id || residentId;
      const resolvedResidentName = (resolvedResident?.data().fullName as string | undefined)?.trim() || residentName || "";
      const payload = {
        residentName: resolvedResidentName,
        residentID: residentId,
        residentId: resolvedResidentId,
        userId: resolvedResidentId,
        wasteType,
        weight: weightValue,
        pointsEarned,
        collectionDate: collectionDateValue,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (editingRowId) {
        await updateDoc(doc(db, "wasteCollections", editingRowId), payload);
      } else {
        await addDoc(collection(db, "wasteCollections"), payload);
      }
    } catch (error) {
      console.error("Error saving collection record:", error);
    }

    setIsModalOpen(false);
    setEditingRowId(null);
    setFormData(emptyForm());
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRowId(null);
    setResidentLookupError("");
    setFormData(emptyForm());
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
              <div className="admin-avatar">AU</div>
              <div>
                <p className="admin-user-name">Admin User</p>
                <p className="admin-user-role">System Admin</p>
              </div>
            </div>
          </div>

          <section className="admin-header-card">
            <div>
              <span className="admin-chip">COLLECTION CENTERS</span>
              <h1>
                Collection Center <span className="highlight">🏬</span>
              </h1>
              <p>Track resident waste collections and update records in one place.</p>
            </div>
          </section>

          <section className="route-card">
            <div className="route-top">
              <div>
                <h2>Resident Collections</h2>
                <p>Search by resident ID and manage waste collection records.</p>
              </div>
              <button className="add-button" type="button" onClick={openAddModal}>
                + Add
              </button>
            </div>

            <div className="route-search">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search resident ID..."
                aria-label="Search resident collection records"
              />
            </div>

            <div className="route-table">
              <div className="route-row route-row--header">
                <span>RESIDENT NAME</span>
                <span>ID</span>
                <span>WASTE TYPE</span>
                <span>DATE</span>
                <span>WEIGHT</span>
              </div>

              {filtered.length === 0 ? (
                <div className="empty-state">
                  <strong>No resident entries found</strong>
                  <span>Try another search term.</span>
                </div>
              ) : (
                filtered.map((row, index) => (
                  <div key={row.id} className={`route-row ${index % 2 === 1 ? "route-row--alt" : ""}`}>
                    <span>{row.residentName}</span>
                    <span>{row.residentID}</span>
                    <span>{row.wasteType}</span>
                    <span>{row.collectionDate ? new Date(getDisplayDateValue(row.collectionDate)).toLocaleDateString() : "—"}</span>
                    <div className="weight-cell">
                      <span className="weight-pill">{row.weight} kg</span>
                      <button type="button" className="edit-button" onClick={() => openEditModal(row)}>
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
          <div className="modal-backdrop" role="presentation" onClick={closeModal}>
            <div className="modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <p className="modal-label">Resident collection</p>
                  <h3>{editingRowId ? "Edit resident entry" : "Add resident entry"}</h3>
                </div>
                <button type="button" className="modal-close" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <label>
                  <span>Resident Name</span>
                  <input
                    value={formData.residentName}
                    readOnly
                    placeholder="Auto-filled from resident ID"
                  />
                </label>
                <label>
                  <span>ID</span>
                  <input
                    value={formData.id}
                    onChange={(event) => handleResidentIdChange(event.target.value)}
                    onBlur={() => {
                      if (!formData.id.trim()) {
                        setResidentLookupError("");
                        return;
                      }
                      const residentMatch = residentOptions.find((option) => option.residentID.toLowerCase() === formData.id.trim().toLowerCase());
                      if (!residentMatch) {
                        setResidentLookupError("No resident found with this ID");
                      }
                    }}
                    placeholder="Enter resident ID"
                    list="resident-id-options"
                    autoComplete="off"
                    readOnly={Boolean(editingRowId)}
                  />
                  <datalist id="resident-id-options">
                    {residentOptions.map((option) => (
                      <option key={option.uid} value={option.residentID} />
                    ))}
                  </datalist>
                  {residentLookupError ? <span className="form-help form-help--error">{residentLookupError}</span> : <span className="form-help">Pick or type an existing resident ID to auto-fill the name.</span>}
                </label>
                <label>
                  <span>Waste Type</span>
                  <select
                    value={formData.wasteType}
                    onChange={(event) => handleFieldChange("wasteType", event.target.value)}
                  >
                    {WASTE_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={formData.collectionDate}
                    onChange={(event) => handleFieldChange("collectionDate", event.target.value)}
                  />
                </label>
                <label>
                  <span>Weight</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(event) => handleFieldChange("weight", event.target.value)}
                    placeholder="Enter weight"
                  />
                </label>

                <div className="modal-actions">
                  <button type="button" className="modal-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="modal-primary">
                    {editingRowId ? "Save changes" : "Add entry"}
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
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
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
            width: min(100%, 1000px);
          }
          .route-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
          .form-help {
            display: block;
            margin-top: 6px;
            font-size: 0.8rem;
            color: #4b6b4f;
          }
          .form-help--error {
            color: #b42318;
          }
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
            grid-template-columns: 1.4fr 1fr 1fr 1fr 1.4fr;
            gap: 16px;
            align-items: center;
            min-width: 760px;
            padding: 16px;
            border-radius: 18px;
            background: #f8fbf7;
            color: #1d3a25;
          }
          .route-row--header { background: transparent; font-size: 0.78rem; font-weight: 800; color: #4d6b53; }
          .route-row--alt { background: #f3f6f3; }
          .weight-cell {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .weight-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            padding: 7px 12px;
            background: #ecf8ef;
            color: #166529;
            font-weight: 700;
            font-size: 0.8rem;
          }
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
          .empty-state { min-width: 760px; display: grid; gap: 6px; padding: 20px; border-radius: 18px; background: #f8fbf7; color: #1d3a25; }
          .empty-state span { color: #6b7280; font-size: 0.85rem; }

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
            width: min(100%, 480px);
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
          .modal-form input {
            border: 1px solid #d9e9d9;
            border-radius: 14px;
            padding: 12px 14px;
            background: #f7fbf6;
            color: #1b3c28;
            outline: none;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 4px;
          }
          .modal-secondary,
          .modal-primary {
            border: none;
            border-radius: 14px;
            padding: 11px 16px;
            font-weight: 700;
            cursor: pointer;
          }
          .modal-secondary { background: #f3f6f3; color: #4b5563; }
          .modal-primary { background: #166529; color: white; }

          @media (max-width: 820px) {
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


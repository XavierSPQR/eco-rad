"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { normalizeWasteType, WASTE_TYPE_OPTIONS, type WasteType } from "@/lib/wasteTypes";
import styles from "./page.module.css";

type WasteCollection = {
  id: string;
  userId?: string;
  residentId?: string;
  residentID?: string;
  residentName?: string;
  wasteType: WasteType;
  weight: number;
  pointsEarned: number;
  collectedAt?: Timestamp | null;
  collectionDate?: Timestamp | string | null;
  collectorId?: string;
};

type PickupRequest = {
  id: string;
  userId: string;
  description: string;
  location: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  requestedDate: Timestamp | null;
  createdAt: Timestamp | null;
};

type HistoryItem = {
  id: string;
  date: Date;
  displayDate: string;
  wasteType: WasteType | "Pending";
  weight: number | "Pending";
  points: number | "Pending";
  isPending: boolean;
};

const WASTE_TYPES = [...WASTE_TYPE_OPTIONS] as const;

const matchesCurrentUser = (data: Record<string, unknown>, uid: string) => {
  const candidates = [
    String(data.userId || data.user_id || "").trim(),
    String(data.residentId || data.resident_id || "").trim(),
    String(data.residentID || "").trim(),
  ];

  return candidates.some((candidate) => candidate && candidate === uid);
};

export default function CollectionHistoryPage() {
  const { user } = useAuth();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<WasteType[]>([...WASTE_TYPES]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestLocation, setRequestLocation] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [wasteCollections, setWasteCollections] = useState<WasteCollection[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);

  useEffect(() => {
    if (!user) return;

    const wasteQuery = query(
      collection(db, "wasteCollections"),
      orderBy("collectionDate", "desc")
    );

    const unsubWaste = onSnapshot(wasteQuery, (snapshot) => {
      const mappedCollections = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          wasteType: normalizeWasteType(String(doc.data().wasteType ?? "")) as WasteType,
        } as WasteCollection))
        .filter((item) => matchesCurrentUser(item as Record<string, unknown>, user.uid));

      setWasteCollections(mappedCollections);
    }, (error) => {
      console.error("Error fetching waste collections:", error);
      if (error.message.includes("index")) {
        setErrorMessage("index-needed");
      }
    });

    const pickupQuery = query(
      collection(db, "pickupRequests"),
      orderBy("requestedDate", "desc")
    );

    const unsubPickup = onSnapshot(pickupQuery, (snapshot) => {
      setPickupRequests(
        snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as PickupRequest))
          .filter((item) => item.userId === user.uid)
      );
    }, (error) => {
      console.error("Error fetching pickup requests:", error);
      if (error.message.includes("index")) {
        setErrorMessage("index-needed");
      }
    });

    return () => {
      unsubWaste();
      unsubPickup();
    };
  }, [user]);

  const historyItems = useMemo(() => {
    const filteredWaste = wasteCollections.filter((item) => {
      const dateValue = item.collectionDate ?? item.collectedAt;
      if (!dateValue) return false;
      const date = dateValue instanceof Timestamp ? dateValue.toDate() : new Date(dateValue);
      const dateString = date.toISOString().split("T")[0];

      if (!selectedTypes.includes(item.wasteType)) return false;
      if (dateFrom && dateString < dateFrom) return false;
      if (dateTo && dateString > dateTo) return false;
      return true;
    }).map((item): HistoryItem => {
      const date = item.collectionDate instanceof Timestamp
        ? item.collectionDate.toDate()
        : item.collectionDate
          ? new Date(item.collectionDate)
          : item.collectedAt?.toDate() || new Date();
      return {
        id: item.id,
        date,
        displayDate: date.toLocaleDateString(),
        wasteType: item.wasteType,
        weight: item.weight,
        points: item.pointsEarned,
        isPending: false
      };
    });

    const pendingRequests = pickupRequests
      .filter(req => req.status === "pending")
      .map((item): HistoryItem => {
        const date = item.requestedDate?.toDate() || new Date();
        return {
          id: item.id,
          date,
          displayDate: date.toLocaleDateString(),
          wasteType: "Pending",
          weight: "Pending",
          points: "Pending",
          isPending: true
        };
      });

    return [...filteredWaste, ...pendingRequests].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [wasteCollections, pickupRequests, selectedTypes, dateFrom, dateTo]);

  const toggleType = (type: WasteType) => {
    setSelectedTypes((current) =>
      current.includes(type) ? current.filter((item) => item !== type) : [...current, type]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([...WASTE_TYPES]);
    setDateFrom("");
    setDateTo("");
  };

  const handleExport = () => {
    window.print();
  };

  const handleSubmitRequest = async () => {
    if (!requestDescription.trim() || !requestLocation.trim() || !user) return;

    try {
      await addDoc(collection(db, "pickupRequests"), {
        userId: user.uid,
        description: requestDescription,
        location: requestLocation,
        status: "pending",
        requestedDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      setRequestSubmitted(true);
    } catch (error) {
      console.error("Error submitting pickup request:", error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setRequestSubmitted(false);
    setRequestDescription("");
    setRequestLocation("");
  };

  return (
    <div className={styles.pageRoot}>
      <div className={styles.headerRow}>
        <div className={styles.pageTitleGroup}>
          <h1 className={styles.pageTitle}>Collections</h1>
          <p className={styles.pageSubtitle}>All your verified and pending waste submissions.</p>
        </div>

        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.filterButton}
            onClick={() => setFilterOpen((open) => !open)}
          >
            Filter
          </button>
          <button type="button" className={styles.exportButton} onClick={handleExport}>
            Export
          </button>
          {/*<button type="button" className={styles.primaryButton} onClick={() => setModalOpen(true)}>
            + New request
          </button>*/}
        </div>
      </div>

      {errorMessage === "index-needed" && (
        <div style={{ color: "red", padding: "10px", background: "#fee2e2", borderRadius: "8px" }}>
          Firestore index required. Please check the browser console for the setup link.
        </div>
      )}

      {filterOpen && (
        <div className={styles.filterPanel}>
          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Waste Type</div>
            <div className={styles.checkboxGrid}>
              {WASTE_TYPES.map((type) => (
                <label key={type} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <div className={styles.filterLabel}>Collection Date</div>
            <div className={styles.dateGrid}>
              <label className={styles.dateField}>
                From
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                />
              </label>
              <label className={styles.dateField}>
                To
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                />
              </label>
            </div>
          </div>

          <div className={styles.filterActions}>
            <button type="button" className={styles.clearButton} onClick={clearFilters}>
              Clear filters
            </button>
            <span>{historyItems.length} records shown</span>
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span className={styles.tableLabel}>Date</span>
          <span className={styles.tableLabel}>Waste Type</span>
          <span className={styles.tableLabel}>Weight (kg)</span>
          <span className={styles.tableLabel}>Points Earned</span>
        </div>

        <div className={styles.tableBody}>
          {historyItems.map((item) => (
            <div key={item.id} className={styles.tableRow}>
              <span className={styles.cellDate}>{item.displayDate}</span>
              <span className={styles.cellType}>{item.wasteType}</span>
              <span className={styles.cellValue}>
                {typeof item.weight === "number" ? item.weight.toFixed(1) : item.weight}
              </span>
              <span className={styles.cellPoints}>
                {typeof item.points === "number" ? `+${item.points}` : item.points}
              </span>
            </div>
          ))}
          {historyItems.length === 0 && (
            <div className={styles.emptyState}>No collections match the selected filters.</div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="request-title">
            <div className={styles.modalHeader}>
              <h2 id="request-title">Request Special Pickup</h2>
              <button type="button" className={styles.modalClose} onClick={closeModal}>
                ×
              </button>
            </div>

            {requestSubmitted ? (
              <div className={styles.requestSuccess}>
                <p>Your pickup request has been submitted.</p>
                <button type="button" className={styles.primaryButton} onClick={closeModal}>
                  Close
                </button>
              </div>
            ) : (
              <div className={styles.modalContent}>
                <label className={styles.fieldLabel}>
                  Description
                  <textarea
                    value={requestDescription}
                    onChange={(event) => setRequestDescription(event.target.value)}
                    placeholder="Describe the event or special pickup need"
                  />
                </label>

                <label className={styles.fieldLabel}>
                  Location
                  <input
                    type="text"
                    value={requestLocation}
                    onChange={(event) => setRequestLocation(event.target.value)}
                    placeholder="Enter pickup location"
                  />
                </label>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className={styles.primaryButton} onClick={handleSubmitRequest}>
                    Submit request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

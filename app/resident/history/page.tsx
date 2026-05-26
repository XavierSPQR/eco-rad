"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type CollectionItem = {
  date: string;
  wasteType: "Recyclable" | "Organic" | "E-Waste";
  weight: number;
  points: number;
};

const COLLECTIONS: CollectionItem[] = [
  { date: "2026-05-10", wasteType: "Recyclable", weight: 4.5, points: 90 },
  { date: "2026-05-11", wasteType: "Organic", weight: 2.0, points: 20 },
  { date: "2026-05-12", wasteType: "E-Waste", weight: 1.2, points: 60 },
  { date: "2026-05-12", wasteType: "Recyclable", weight: 6.8, points: 136 },
  { date: "2026-05-13", wasteType: "Organic", weight: 3.4, points: 34 },
  { date: "2026-05-13", wasteType: "E-Waste", weight: 0.8, points: 40 },
];

const WASTE_TYPES = ["Recyclable", "Organic", "E-Waste"] as const;

type WasteType = (typeof WASTE_TYPES)[number];

export default function CollectionHistoryPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<WasteType[]>([...WASTE_TYPES]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [requestDescription, setRequestDescription] = useState("");
  const [requestLocation, setRequestLocation] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const filteredCollections = useMemo(() => {
    return COLLECTIONS.filter((item) => {
      if (!selectedTypes.includes(item.wasteType)) return false;
      if (dateFrom && item.date < dateFrom) return false;
      if (dateTo && item.date > dateTo) return false;
      return true;
    });
  }, [selectedTypes, dateFrom, dateTo]);

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

  const handleSubmitRequest = () => {
    if (!requestDescription.trim() || !requestLocation.trim()) return;
    setRequestSubmitted(true);
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
          <button type="button" className={styles.primaryButton} onClick={() => setModalOpen(true)}>
            + New request
          </button>
        </div>
      </div>

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
            <span>{filteredCollections.length} records shown</span>
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
          {filteredCollections.map((item, index) => (
            <div key={`${item.date}-${index}`} className={styles.tableRow}>
              <span className={styles.cellDate}>{item.date}</span>
              <span className={styles.cellType}>{item.wasteType}</span>
              <span className={styles.cellValue}>{item.weight.toFixed(1)}</span>
              <span className={styles.cellPoints}>+{item.points}</span>
            </div>
          ))}
          {filteredCollections.length === 0 && (
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

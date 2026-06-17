"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Truck = {
  id: string;
  driver: string;
  location?: string;
  area?: string;
  zone?: string;
  eta: string | number; // minutes or string
  lat: number;
  lng: number;
  phone?: string;
};

// ── Mock truck data (Colombo zone) ────────────────────────────────────────────



// ── ETA colour helper ─────────────────────────────────────────────────────────

function etaColor(eta: number | string) {
  const numEta = typeof eta === "string" ? parseInt(eta) || 0 : eta;
  if (numEta <= 15) return "#2e7d32";
  if (numEta <= 30) return "#f59e0b";
  return "#ef4444";
}

// ── Truck card ────────────────────────────────────────────────────────────────

function TruckCard({
  truck,
  active,
  onClick,
}: {
  truck: Truck;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`tt-card ${active ? "tt-card--active" : ""}`}
      onClick={onClick}
    >
      <div className="tt-card-top">
        {/* Truck icon */}
        <span className="tt-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 3h15v13H1z" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </span>

        <div className="tt-card-info">
          <span className="tt-truck-id">{truck.id}</span>
          <span className="tt-driver">{truck.driver}</span>
        </div>
      </div>

      <div className="tt-card-meta">
        <span className="tt-meta-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          {truck.location || truck.area || truck.zone || "Colombo"}
        </span>
        <span className="tt-meta-row" style={{ color: etaColor(truck.eta) }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          ETA {truck.eta} min
        </span>
      </div>

      <a href={truck.phone} className="tt-contact-btn" onClick={(e) => e.stopPropagation()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.19a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
        </svg>
        Contact driver
      </a>
    </div>
  );
}

// ── Map embed (OpenStreetMap centred on Colombo) ───────────────────────────────

function MapEmbed({ truck }: { truck: Truck | null }) {
  if (!truck) return null;
  // bbox centres around the selected truck with ~0.06 degree padding
  const pad = 0.04;
  const bbox = `${truck.lng - pad},${truck.lat - pad},${truck.lng + pad},${truck.lat + pad}`;
  const marker = `${truck.lat},${truck.lng}`;

  const src =
    `https://www.openstreetmap.org/export/embed.html` +
    `?bbox=${bbox}&layer=mapnik&marker=${marker}`;

  return (
    <iframe
      key={truck.id}           // re-mount on truck change
      src={src}
      title={`Map showing ${truck.id}`}
      className="tt-map-iframe"
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TrackTruckPage() {
  const { profile } = useAuth();
  const [activeTruck, setActiveTruck] = useState<Truck | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  useEffect(() => {
    const trucksRef = collection(db, "activeVehicles");

    const unsubscribe = onSnapshot(trucksRef, (snapshot) => {
      const liveTrucks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Truck[];

      setTrucks(liveTrucks);

      setActiveTruck((prev) => {
        if (!prev && liveTrucks.length > 0) return liveTrucks[0];
        if (prev && liveTrucks.length > 0) {
          const updated = liveTrucks.find((t) => t.id === prev.id);
          return updated || liveTrucks[0];
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="tt-root">
      {/* ── Header ── */}
      <div className="tt-header">
        <h1 className="tt-title">Track Truck</h1>
        <p className="tt-subtitle">
          Live position of trucks operating in your zone.
        </p>
      </div>

      {/* ── Body ── */}
      <div className="tt-body">

        {/* Map */}
        <div className="tt-map-wrap">
          {activeTruck ? (
            <>
              <MapEmbed truck={activeTruck} />

              {/* Live badge */}
              <div className="tt-live-badge">
                <span className="tt-live-dot" />
                LIVE
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 font-medium">
              No active trucks in your zone.
            </div>
          )}
        </div>

        {/* Truck list */}
        <div className="tt-list">
          {trucks.map((t) => (
            <TruckCard
              key={t.id}
              truck={t}
              active={activeTruck ? t.id === activeTruck.id : false}
              onClick={() => setActiveTruck(t)}
            />
          ))}
          {trucks.length === 0 && (
            <div className="text-gray-500 text-sm mt-4">
              Currently no live tracking available for your location.
            </div>
          )}
        </div>
      </div>

      <style>{`
        
        .tt-root {
          display: flex;
          flex-direction: column;
          gap: 20px;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Header ── */
        .tt-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.75rem;
          color: #1a1a1a;
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .tt-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* ── Body ── */
        .tt-body {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          align-items: start;
        }

        /* ── Map ── */
        .tt-map-wrap {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          aspect-ratio: 4/3;
          background: #e8f5e9;
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

        /* ── Truck list ── */
        .tt-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Truck card ── */
        .tt-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px 18px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          cursor: pointer;
          border: 2px solid transparent;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .tt-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(46,125,50,0.10);
        }
        .tt-card--active {
          border-color: #2e7d32;
          box-shadow: 0 4px 20px rgba(46,125,50,0.15);
        }

        .tt-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tt-icon {
          width: 40px;
          height: 40px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tt-card-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .tt-truck-id {
          font-weight: 700;
          font-size: 0.95rem;
          color: #1a1a1a;
          letter-spacing: 0.02em;
        }
        .tt-driver {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .tt-card-meta {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .tt-meta-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.78rem;
          color: #6b7280;
          font-weight: 500;
        }

        .tt-contact-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 10px;
          background: #f5f7f5;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .tt-contact-btn:hover {
          background: #e8f5e9;
          border-color: #a5d6a7;
          color: #2e7d32;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .tt-body {
            grid-template-columns: 1fr;
          }
          .tt-map-wrap {
            aspect-ratio: 16/9;
          }
        }
        @media (max-width: 520px) {
          .tt-title { font-size: 1.4rem; }
          .tt-map-wrap { aspect-ratio: 4/3; }
        }
      `}</style>
    </div>
  );
}

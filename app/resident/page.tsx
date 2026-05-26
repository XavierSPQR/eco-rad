"use client";

import { useEffect, useRef } from "react";

// ── Chart data ────────────────────────────────────────────────────────────────

const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const CHART_DATA = {
  recyclable: [14, 15, 16, 18, 22, 30],
  organic:    [12, 13, 14, 15, 17, 20],
  eWaste:     [1,  2,  2,  3,  3,  4 ],
};

// ── Stat cards ────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total Waste",
    value: "184.2 kg",
    color: "#2e7d32",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
      </svg>
    ),
  },
  {
    label: "Organic",
    value: "62.4 kg",
    color: "#388e3c",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 7 4 2 6c0 5 3 9 10 6M12 12c0-5 5-8 10-6-1 5-4 8-10 6" />
      </svg>
    ),
  },
  {
    label: "Recyclable",
    value: "98.6 kg",
    color: "#43a047",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" /><polyline points="23 20 23 14 17 14" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
    ),
  },
  {
    label: "E-Waste",
    value: "23.2 kg",
    color: "#66bb6a",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    label: "Monthly Points",
    value: "+1,240",
    color: "#2e7d32",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

// ── SVG Line Chart ────────────────────────────────────────────────────────────

function WasteChart() {
  const W = 620, H = 200, PAD = { top: 16, right: 16, bottom: 32, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const allVals = [...CHART_DATA.recyclable, ...CHART_DATA.organic, ...CHART_DATA.eWaste];
  const maxVal = Math.ceil(Math.max(...allVals) / 8) * 8;
  const yTicks = [0, 8, 16, 24, 32].filter((v) => v <= maxVal);

  const xPos = (i: number) => PAD.left + (i / (MONTHS.length - 1)) * innerW;
  const yPos = (v: number) => PAD.top + innerH - (v / maxVal) * innerH;

  function makePath(data: number[]) {
    return data.map((v, i) => `${i === 0 ? "M" : "L"}${xPos(i)},${yPos(v)}`).join(" ");
  }

  function makeArea(data: number[]) {
    const line = makePath(data);
    const base = `L${xPos(data.length - 1)},${yPos(0)} L${xPos(0)},${yPos(0)} Z`;
    return line + " " + base;
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a5d6a7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a5d6a7" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="go" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66bb6a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#66bb6a" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#795548" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#795548" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Y-axis grid + labels */}
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} y1={yPos(t)} x2={W - PAD.right} y2={yPos(t)}
            stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />
          <text x={PAD.left - 6} y={yPos(t) + 4} textAnchor="end"
            fontSize="10" fill="#9ca3af">{t}</text>
        </g>
      ))}

      {/* X-axis labels */}
      {MONTHS.map((m, i) => (
        <text key={m} x={xPos(i)} y={H - 6} textAnchor="middle"
          fontSize="10" fill="#9ca3af">{m}</text>
      ))}

      {/* Areas */}
      <path d={makeArea(CHART_DATA.recyclable)} fill="url(#gr)" />
      <path d={makeArea(CHART_DATA.organic)}    fill="url(#go)" />
      <path d={makeArea(CHART_DATA.eWaste)}     fill="url(#ge)" />

      {/* Lines */}
      <path d={makePath(CHART_DATA.recyclable)} fill="none" stroke="#2e7d32" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={makePath(CHART_DATA.organic)}    fill="none" stroke="#66bb6a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={makePath(CHART_DATA.eWaste)}     fill="none" stroke="#795548" strokeWidth="2"   strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Progress ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" stroke="#fff" strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
      <text x="70" y="62" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700" fontFamily="DM Serif Display, serif">
        {pct}%
      </text>
      <text x="70" y="80" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10" fontFamily="DM Sans, sans-serif">
        To next badge
      </text>
      <text x="70" y="95" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="DM Sans, sans-serif">
        Green Champion
      </text>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResidentDashboard() {
  return (
    <div className="rd-root">

      {/* ── Welcome banner ── */}
      <div className="rd-banner">
        <div className="rd-banner-blob rd-banner-blob--1" />
        <div className="rd-banner-blob rd-banner-blob--2" />

        <div className="rd-banner-left">
          <p className="rd-banner-meta">CONTRIBUTOR · NUGEGODA</p>
          <h1 className="rd-banner-heading">
            Welcome back, <span className="rd-banner-name">Nimal!</span>
          </h1>
          <p className="rd-banner-sub">
            You&apos;re 78% of the way to your next badge. Keep recycling — every kilogram
            counts toward a cleaner Sri Lanka.
          </p>
          <div className="rd-banner-pills">
            <span className="rd-pill rd-pill--badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Next Badge: <strong>Green Champion</strong>
            </span>
            <span className="rd-pill rd-pill--pts">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 2l1.5 4.5H16l-3.75 2.75 1.5 4.5L10 11l-3.75 2.75 1.5-4.5L4 6.5h4.5z" />
              </svg>
              2,450 <small>pts</small>
            </span>
          </div>
        </div>

        <div className="rd-banner-ring">
          <ProgressRing pct={78} />
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="rd-stats">
        {STATS.map((s, i) => (
          <div className="rd-stat-card" key={s.label} style={{ animationDelay: `${i * 0.07}s` }}>
            <div className="rd-stat-top">
              <span className="rd-stat-icon" style={{ color: s.color }}>{s.icon}</span>
              <svg className="rd-stat-trend" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#66bb6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span className="rd-stat-val">{s.value}</span>
            <span className="rd-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Bottom row ── */}
      <div className="rd-bottom">

        {/* Chart panel */}
        <div className="rd-chart-panel">
          <div className="rd-chart-header">
            <div>
              <h3 className="rd-panel-title">Waste submission trends</h3>
              <p className="rd-panel-sub">Last 6 months · kg</p>
            </div>
            <div className="rd-legend">
              <span className="rd-legend-item"><span style={{ background: "#2e7d32" }} />Recyclable</span>
              <span className="rd-legend-item"><span style={{ background: "#66bb6a" }} />Organic</span>
              <span className="rd-legend-item"><span style={{ background: "#795548" }} />E-Waste</span>
            </div>
          </div>
          <WasteChart />
        </div>

        {/* Community impact */}
        <div className="rd-impact-panel">
          <h3 className="rd-panel-title">Community Impact</h3>
          <p className="rd-panel-sub">Your contribution this year</p>

          <div className="rd-impact-rows">
            <div className="rd-impact-row">
              <span className="rd-impact-label">CO₂ saved</span>
              <span className="rd-impact-val">284 kg</span>
            </div>
            <div className="rd-impact-divider" />
            <div className="rd-impact-row">
              <span className="rd-impact-label">Trees equivalent</span>
              <span className="rd-impact-val">12</span>
            </div>
            <div className="rd-impact-divider" />
            <div className="rd-impact-row">
              <span className="rd-impact-label">Plastic diverted</span>
              <span className="rd-impact-val">47 kg</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        
        .rd-root {
          display: flex;
          flex-direction: column;
          gap: 24px;
          font-family: 'DM Sans', sans-serif;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Banner ── */
        .rd-banner {
          background: linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #43a047 100%);
          border-radius: 20px;
          padding: 32px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 180px;
        }
        .rd-banner-blob {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .rd-banner-blob--1 { width: 260px; height: 260px; top: -80px; right: 180px; }
        .rd-banner-blob--2 { width: 180px; height: 180px; bottom: -60px; right: 100px; }

        .rd-banner-left {
          position: relative;
          z-index: 1;
          max-width: 560px;
        }
        .rd-banner-meta {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.65);
          margin-bottom: 6px;
        }
        .rd-banner-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: #fff;
          line-height: 1.15;
          margin-bottom: 10px;
        }
        .rd-banner-name { color: #a5d6a7; }
        .rd-banner-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.78);
          line-height: 1.6;
          margin-bottom: 16px;
          max-width: 420px;
        }
        .rd-banner-pills {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .rd-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 500;
        }
        .rd-pill--badge {
          background: rgba(255,255,255,0.18);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .rd-pill--pts {
          background: rgba(255,255,255,0.95);
          color: #2e7d32;
          font-weight: 700;
        }
        .rd-pill--pts small { font-weight: 400; opacity: 0.7; }

        .rd-banner-ring {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          filter: drop-shadow(0 4px 16px rgba(0,0,0,0.15));
        }

        /* ── Stat cards ── */
        .rd-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        .rd-stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px 18px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          gap: 6px;
          animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .rd-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(46,125,50,0.10);
        }
        .rd-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .rd-stat-icon { display: flex; align-items: center; }
        .rd-stat-trend { opacity: 0.8; }
        .rd-stat-val {
          font-family: 'DM Serif Display', serif;
          font-size: 1.35rem;
          color: #1a1a1a;
          line-height: 1;
        }
        .rd-stat-label {
          font-size: 0.72rem;
          color: #9ca3af;
          font-weight: 500;
        }

        /* ── Bottom row ── */
        .rd-bottom {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: start;
        }

        /* Chart panel */
        .rd-chart-panel {
          background: #fff;
          border-radius: 18px;
          padding: 24px 24px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .rd-chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .rd-panel-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1rem;
          color: #1a1a1a;
          margin-bottom: 2px;
        }
        .rd-panel-sub {
          font-size: 0.72rem;
          color: #9ca3af;
        }
        .rd-legend {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        .rd-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #6b7280;
        }
        .rd-legend-item span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* Impact panel */
        .rd-impact-panel {
          background: linear-gradient(160deg, #f0faf0 0%, #e8f5e9 100%);
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .rd-impact-rows {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .rd-impact-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
        }
        .rd-impact-divider {
          height: 1px;
          background: rgba(46,125,50,0.12);
        }
        .rd-impact-label {
          font-size: 0.82rem;
          color: #4b5563;
        }
        .rd-impact-val {
          font-family: 'DM Serif Display', serif;
          font-size: 1.05rem;
          color: #2e7d32;
          font-weight: 700;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .rd-stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .rd-bottom { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .rd-banner { flex-direction: column; gap: 24px; padding: 24px 20px; }
          .rd-banner-ring { align-self: center; }
          .rd-banner-heading { font-size: 1.5rem; }
          .rd-stats { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

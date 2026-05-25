import Link from "next/link";

export default function Home() {
  return (
    <div className="eco-root">
      {/* Floating leaf decorations */}
      {[
        { top: "8%", left: "38%", size: 18, rot: 20 },
        { top: "14%", left: "68%", size: 14, rot: -15 },
        { top: "28%", left: "82%", size: 16, rot: 30 },
        { top: "45%", left: "91%", size: 12, rot: -25 },
        { top: "62%", left: "85%", size: 18, rot: 10 },
        { top: "72%", left: "72%", size: 14, rot: -40 },
        { top: "80%", left: "48%", size: 16, rot: 25 },
        { top: "88%", left: "34%", size: 12, rot: -10 },
        { top: "55%", left: "36%", size: 14, rot: 35 },
        { top: "35%", left: "44%", size: 10, rot: -20 },
      ].map((leaf, i) => (
        <span
          key={i}
          className="leaf-dot"
          style={{
            top: leaf.top,
            left: leaf.left,
            fontSize: leaf.size,
            transform: `rotate(${leaf.rot}deg)`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          🌿
        </span>
      ))}

      <main className="eco-layout">
        {/* ── Left card ── */}
        <div className="eco-card">
          {/* Illustration placeholder – swap for a real <img> or Next Image */}
          <div className="eco-illustration">
            <svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              {/* Sky */}
              <rect width="320" height="200" fill="#e8f5e9" rx="16" />
              {/* Buildings */}
              <rect x="170" y="60" width="40" height="120" fill="#c8e6c9" rx="2" />
              <rect x="215" y="80" width="30" height="100" fill="#a5d6a7" rx="2" />
              <rect x="248" y="70" width="45" height="110" fill="#c8e6c9" rx="2" />
              {/* Windows */}
              {[180, 195, 210].map((x) =>
                [70, 85, 100, 115].map((y) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="7" height="7" fill="#fff" rx="1" />
                ))
              )}
              {/* Trees */}
              <ellipse cx="60" cy="130" rx="28" ry="28" fill="#66bb6a" />
              <rect x="57" y="145" width="6" height="30" fill="#8d6e63" />
              <ellipse cx="130" cy="140" rx="22" ry="22" fill="#4caf50" />
              <rect x="127" y="152" width="6" height="25" fill="#8d6e63" />
              <ellipse cx="290" cy="125" rx="26" ry="26" fill="#81c784" />
              <rect x="287" y="138" width="6" height="28" fill="#8d6e63" />
              {/* Road */}
              <rect x="0" y="165" width="320" height="35" fill="#bdbdbd" />
              <rect x="0" y="178" width="320" height="4" fill="#e0e0e0" />
              {/* Truck body */}
              <rect x="20" y="135" width="110" height="45" fill="#388e3c" rx="5" />
              {/* Truck cab */}
              <rect x="100" y="148" width="45" height="32" fill="#2e7d32" rx="4" />
              {/* Windshield */}
              <rect x="107" y="153" width="30" height="18" fill="#b2dfdb" rx="2" />
              {/* Wheels */}
              <circle cx="50" cy="182" r="12" fill="#212121" />
              <circle cx="50" cy="182" r="5" fill="#616161" />
              <circle cx="120" cy="182" r="12" fill="#212121" />
              <circle cx="120" cy="182" r="5" fill="#616161" />
              {/* Recycle symbol on truck */}
              <text x="52" y="162" fontSize="22" fill="#a5d6a7" textAnchor="middle">♻</text>
            </svg>
          </div>

          <div className="eco-card-body">
            <h2 className="eco-card-title">
              Building a Cleaner Together{" "}
              <span className="eco-highlight">Sri Lanka</span>
            </h2>
            <p className="eco-card-desc">
              Smart waste collection, real-time truck tracking, and rewards for
              every recyclable kilogram.
            </p>
          </div>

          <div className="eco-stats">
            <div className="eco-stat">
              <span className="eco-stat-num">10,000+</span>
              <span className="eco-stat-label">Waste Collections</span>
            </div>
            <div className="eco-stat-divider" />
            <div className="eco-stat">
              <span className="eco-stat-num">5,000+</span>
              <span className="eco-stat-label">Active Contributors</span>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="eco-right">
          <div className="eco-welcome">
            <h1 className="eco-title">
              Welcome To Eco Cycle Lanka{" "}
              <span role="img" aria-label="seedling">🌱</span>
            </h1>
            <p className="eco-subtitle">Choose Your Role</p>
          </div>

          <div className="eco-roles">
            <Link href="/auth?role=resident" className="eco-role-btn">
              <span className="eco-role-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </span>
              Resident
            </Link>

            <Link href="/auth?role=collector" className="eco-role-btn">
              <span className="eco-role-icon">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </span>
              Collector
            </Link>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

        .eco-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 40%, #e0f2e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .leaf-dot {
          position: absolute;
          pointer-events: none;
          opacity: 0.35;
          animation: leafFloat 6s ease-in-out infinite alternate;
          filter: saturate(0.7);
        }

        @keyframes leafFloat {
          0%   { transform: translateY(0px) rotate(var(--r, 0deg)); opacity: 0.3; }
          100% { transform: translateY(-10px) rotate(calc(var(--r, 0deg) + 8deg)); opacity: 0.5; }
        }

        .eco-layout {
          display: flex;
          align-items: center;
          gap: 64px;
          max-width: 900px;
          width: 100%;
          padding: 40px 32px;
          position: relative;
          z-index: 1;
        }

        /* ── Card ── */
        .eco-card {
          flex: 0 0 300px;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(56,142,60,0.10), 0 2px 8px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          animation: cardIn 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .eco-illustration {
          background: #e8f5e9;
          padding: 0;
        }
        .eco-illustration svg {
          width: 100%;
          display: block;
        }

        .eco-card-body {
          padding: 20px 20px 8px;
        }

        .eco-card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.25rem;
          line-height: 1.35;
          color: #1a1a1a;
          margin: 0 0 8px;
        }

        .eco-highlight {
          color: #2e7d32;
        }

        .eco-card-desc {
          font-size: 0.8rem;
          color: #6b7280;
          line-height: 1.55;
          margin: 0;
        }

        .eco-stats {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 16px 20px 20px;
          border-top: 1px solid #f3f4f6;
          margin-top: 12px;
        }

        .eco-stat {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .eco-stat-num {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.5px;
        }

        .eco-stat-label {
          font-size: 0.72rem;
          color: #9ca3af;
          margin-top: 2px;
        }

        .eco-stat-divider {
          width: 1px;
          height: 36px;
          background: #e5e7eb;
          margin: 0 16px;
        }

        /* ── Right panel ── */
        .eco-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
          animation: rightIn 0.7s 0.15s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes rightIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .eco-welcome {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .eco-title {
          font-family: 'DM Serif Display', serif;
          font-size: 2rem;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.2;
        }

        .eco-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          margin: 0;
        }

        .eco-roles {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .eco-role-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #2e7d32;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          padding: 16px 24px;
          border-radius: 14px;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(46,125,50,0.25);
          transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
          letter-spacing: 0.01em;
        }

        .eco-role-btn:hover {
          background: #1b5e20;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(46,125,50,0.30);
        }

        .eco-role-btn:active {
          transform: translateY(0);
        }

        .eco-role-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.18);
          border-radius: 8px;
          flex-shrink: 0;
        }

        @media (max-width: 680px) {
          .eco-layout {
            flex-direction: column;
            gap: 32px;
            padding: 24px 16px;
          }
          .eco-card { flex: none; width: 100%; }
          .eco-title { font-size: 1.6rem; }
        }
      `}</style>
    </div>
  );
}

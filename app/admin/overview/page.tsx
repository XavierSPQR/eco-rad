"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { label: "Overview", href: "/admin/overview", icon: "📊" },
  { label: "Waste Management", href: "/admin/waste-management", icon: "♻" },
  { label: "Live Tracking", href: "/admin/live-traking", icon: "📍" },
  { label: "Notification", href: "/admin/notification", icon: "🔔" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Employee", href: "/admin/employee", icon: "🧑‍💼" },
  { label: "Audit Log", href: "/admin/audit-log", icon: "🧾" },
  { label: "Complaint", href: "/admin/complaint", icon: "🗣️" },
  { label: "Vehicle", href: "/admin/vehicle", icon: "🚚" },
  { label: "Schedule", href: "/admin/overview", icon: "🗓️" },
  { label: "Report", href: "/admin/overview", icon: "📝" },
];

const metrics = [
  { label: "Total users", value: "12,840" },
  { label: "Active drivers", value: "184" },
  { label: "Pickups today", value: "1,206" },
  { label: "Verified complaints", value: "94" },
  { label: "Monthly waste", value: "284 t" },
];

const weeklyCollections = [
  { label: "Mon", value: 240 },
  { label: "Tue", value: 305 },
  { label: "Wed", value: 280 },
  { label: "Thu", value: 360 },
  { label: "Fri", value: 415 },
  { label: "Sat", value: 385 },
  { label: "Sun", value: 220 },
];

const contributors = [
  { name: "Anushka Jayawardena", score: "4820" },
  { name: "Nimal Perera", score: "2450" },
  { name: "Tharindu Bandara", score: "2380" },
  { name: "Dilani Senanayake", score: "2110" },
  { name: "Ruwan Madushanka", score: "1990" },
];

export default function AdminOverviewPage() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const [sendTo, setSendTo] = useState("all");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    setModalOpen(false);
    setMessage("");
    setRecipient("");
    setSendTo("all");
  };

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon" aria-label="EcoCycle Lanka logo">
            <svg
              width="22"
              height="22"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              {/* Sri Lanka-inspired silhouette */}
              <path
                d="M32 6c6 4 12 4 16 9 4 5 6 12 4 19-2 7-4 10-6 14-2 4-2 8-4 12-2 4-8 6-14 6s-12-2-14-6c-2-4-2-8-4-12-2-4-4-7-6-14-2-7 0-14 4-19 4-5 10-5 16-9z"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              {/* Recycle loop */}
              <path
                d="M22 22c3-6 9-9 16-8 7 1 12 6 13 13"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M46 22l3 6-6-1"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d="M42 42c-3 6-9 9-16 8-7-1-12-6-13-13"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M18 42l-3-6 6 1"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* Tree leaf/brand mark */}
              <path
                d="M32 28c6 1 10 6 10 12-6 1-12-2-15-7-1-2-1-4 0-5 2-1 3-1 5 0z"
                fill="white"
                opacity="0.95"
              />
              <path
                d="M32 40c-1-3-1-6 1-9 2-3 6-5 10-5-1 6-4 11-10 14z"
                fill="white"
                opacity="0.85"
              />
            </svg>
          </div>
          <div>
            <p>EcoCycle</p>
            <small>LANKA</small>
          </div>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={pathname === item.href && item.label === "Overview" ? "admin-nav-item active" : "admin-nav-item"}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <div className="admin-search">
            <input placeholder="Search collections, complaints, trucks..." />
          </div>
          <div className="admin-usercard">
            <div className="admin-avatar">AU</div>
            <div>
              <p className="admin-user-name">Admin User</p>
              <p className="admin-user-role">System Admin</p>
            </div>
          </div>
        </div>

        <section className="admin-header-card overview-header">
          <div>
            <span className="admin-chip">SYSTEM ADMIN</span>
            <h1>
              Control Center <span className="highlight">EcoCycle Lanka</span>
            </h1>
            <p>Real-time operational health across all districts</p>
          </div>
          <button className="admin-message-btn" onClick={() => setModalOpen(true)}>
            Message
          </button>
        </section>

        <section className="admin-metrics">
          {metrics.map((metric) => (
            <div className="metric-card" key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          ))}
        </section>

        <section className="overview-grid">
          <article className="overview-card overview-card--large">
            <div className="card-header">
              <div>
                <h2>Collection weight - this week</h2>
                <p>Daily recyclable waste collected across active districts.</p>
              </div>
            </div>

            <div className="bar-chart">
              {weeklyCollections.map((bar) => (
                <div className="bar-item" key={bar.label}>
                  <div className="bar-track">
                    <span style={{ height: `${bar.value / 5}px` }} />
                  </div>
                  <small>{bar.label}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="overview-card contributors-card">
            <div className="card-header">
              <div>
                <h2>Top contributors</h2>
                <p>Highest point earners this month.</p>
              </div>
            </div>

            <ol className="contributors-list">
              {contributors.map((contributor, index) => (
                <li key={contributor.name}>
                  <span className="rank">{index + 1}</span>
                  <span>{contributor.name}</span>
                  <strong>{contributor.score}</strong>
                </li>
              ))}
            </ol>
          </article>

          <article className="overview-card">
            <div className="card-header">
              <div>
                <h2>High-waste districts</h2>
                <p>District share by reported weight.</p>
              </div>
            </div>

            <div className="district-card-body">
              <div className="district-rings" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <div className="district-list">
                <span><i className="dot dot-green" />Colombo</span>
                <span><i className="dot dot-yellow" />Kandy</span>
                <span><i className="dot dot-brown" />Galle</span>
                <span><i className="dot dot-light" />Jaffna</span>
              </div>
            </div>
          </article>

          <article className="overview-card">
            <div className="card-header">
              <div>
                <h2>AI waste prediction</h2>
                <p>Forecast vs actual - last 6 months.</p>
              </div>
            </div>

            <div className="line-chart" aria-hidden="true">
              <svg viewBox="0 0 420 180">
                <path className="grid-line" d="M20 30H400M20 70H400M20 110H400M20 150H400" />
                <path className="line line-main" d="M25 125 C90 112 118 105 175 91 C230 76 265 55 330 38 C360 30 382 25 398 20" />
                <path className="line line-soft" d="M25 145 C94 135 124 133 180 122 C230 112 257 98 304 112 C348 122 369 91 398 78" />
                <path className="line line-dash" d="M25 160 C104 147 154 143 220 136 C282 130 334 127 398 112" />
              </svg>
              <div className="line-labels">
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          </article>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Send message</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)} aria-label="Close message dialog">
                x
              </button>
            </div>
            <div className="modal-body">
              <label>
                <span>Send to</span>
                <select value={sendTo} onChange={(event) => setSendTo(event.target.value)}>
                  <option value="all">All users</option>
                  <option value="drivers">Drivers</option>
                  <option value="collectors">Collectors</option>
                  <option value="specific">Specific user</option>
                </select>
              </label>

              {sendTo === "specific" && (
                <label>
                  <span>User email</span>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(event) => setRecipient(event.target.value)}
                    placeholder="Enter user email or name"
                  />
                </label>
              )}

              <label>
                <span>Message</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your message here"
                />
              </label>
            </div>
            <div className="modal-actions">
              <button className="modal-button modal-button--secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="modal-button modal-button--primary" onClick={handleSend}>
                Send message
              </button>
            </div>
          </div>
        </div>
      )}

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
          font-size: 0.85rem;
          font-weight: 800;
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

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .admin-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
        }

        .admin-search {
          flex: 1;
        }

        .admin-search input {
          width: 100%;
          border: none;
          border-radius: 999px;
          padding: 14px 20px;
          box-shadow: 0 10px 24px rgba(34, 100, 59, 0.08);
          font-size: 0.95rem;
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
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 28px;
          border-radius: 32px;
          background: linear-gradient(90deg, rgba(241, 253, 244, 0.95), rgba(227, 247, 232, 0.95));
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .overview-header h1 {
          margin: 14px 0 8px;
          font-size: 2.4rem;
          line-height: 1.05;
        }

        .overview-header p {
          margin: 0;
          color: #556b54;
        }

        .highlight {
          color: #16a34a;
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

        .admin-message-btn {
          border: none;
          border-radius: 18px;
          padding: 14px 24px;
          background: #1f7f37;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .admin-message-btn:hover {
          transform: translateY(-1px);
        }

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .metric-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 48px rgba(23, 63, 31, 0.08);
        }

        .metric-card span {
          display: block;
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 10px;
        }

        .metric-card strong {
          font-size: 1.75rem;
          color: #15251f;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        .overview-card {
          border-radius: 32px;
          padding: 28px;
          background: white;
          box-shadow: 0 20px 50px rgba(23, 63, 31, 0.08);
        }

        .overview-card--large {
          min-height: 315px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #15251f;
        }

        .card-header p {
          margin: 8px 0 0;
          color: #556b54;
        }

        .bar-chart {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          align-items: end;
          gap: 16px;
          min-height: 210px;
          padding: 16px;
          border-radius: 24px;
          background: linear-gradient(#f8fbf7 1px, transparent 1px), linear-gradient(90deg, #f8fbf7 1px, transparent 1px);
          background-size: 100% 52px, 64px 100%;
        }

        .bar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          height: 100%;
        }

        .bar-track {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          width: 100%;
          height: 170px;
        }

        .bar-track span {
          display: block;
          width: min(48px, 80%);
          border-radius: 10px 10px 0 0;
          background: linear-gradient(180deg, #16a34a, #0f7a36);
        }

        .bar-item small {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .contributors-list {
          display: grid;
          gap: 12px;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .contributors-list li {
          display: grid;
          grid-template-columns: 30px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 18px;
          background: #f8fbf7;
          color: #1d3a25;
        }

        .rank {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e6f4e8;
          color: #166529;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .contributors-list strong {
          color: #16a34a;
        }

        .district-card-body {
          display: grid;
          grid-template-columns: 180px 1fr;
          align-items: center;
          gap: 18px;
        }

        .district-rings {
          position: relative;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: #eef4eb;
        }

        .district-rings::after {
          position: absolute;
          inset: 58px;
          content: "";
          border-radius: 50%;
          background: white;
        }

        .district-rings span {
          position: absolute;
          border-radius: 50%;
          border-style: solid;
          border-color: transparent;
        }

        .district-rings span:nth-child(1) {
          inset: 12px;
          border-width: 14px;
          border-top-color: #f59e0b;
          border-right-color: #f59e0b;
          border-bottom-color: #f59e0b;
          transform: rotate(-20deg);
        }

        .district-rings span:nth-child(2) {
          inset: 36px;
          border-width: 13px;
          border-left-color: #9b6b43;
          border-bottom-color: #9b6b43;
          border-top-color: #9b6b43;
          transform: rotate(28deg);
        }

        .district-rings span:nth-child(3) {
          inset: 60px;
          border-width: 12px;
          border-top-color: #16a34a;
          border-right-color: #16a34a;
          border-bottom-color: #16a34a;
          transform: rotate(-30deg);
        }

        .district-list {
          display: grid;
          gap: 10px;
          color: #1d3a25;
          font-weight: 600;
        }

        .dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-right: 8px;
          border-radius: 50%;
        }

        .dot-green { background: #16a34a; }
        .dot-yellow { background: #f59e0b; }
        .dot-brown { background: #9b6b43; }
        .dot-light { background: #63c174; }

        .line-chart {
          padding: 12px;
          border-radius: 24px;
          background: #f8fbf7;
        }

        .line-chart svg {
          display: block;
          width: 100%;
          height: 180px;
        }

        .grid-line {
          fill: none;
          stroke: #dfe9db;
          stroke-width: 1;
        }

        .line {
          fill: none;
          stroke-width: 4;
          stroke-linecap: round;
        }

        .line-main { stroke: #0f8a3c; }
        .line-soft { stroke: #63c174; }
        .line-dash {
          stroke: #9b6b43;
          stroke-width: 3;
          stroke-dasharray: 7 7;
        }

        .line-labels {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          font-size: 0.78rem;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(22, 38, 20, 0.44);
          display: grid;
          place-items: center;
          padding: 24px;
          z-index: 50;
        }

        .modal-card {
          width: min(520px, 100%);
          background: #ffffff;
          border-radius: 24px;
          padding: 26px;
          box-shadow: 0 24px 60px rgba(22, 38, 20, 0.18);
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.3rem;
        }

        .modal-close {
          border: none;
          background: transparent;
          font-size: 1.2rem;
          cursor: pointer;
          color: #6b7d6a;
        }

        .modal-body {
          display: grid;
          gap: 16px;
          margin-top: 22px;
        }

        .modal-body label {
          display: grid;
          gap: 10px;
          color: #315037;
          font-weight: 600;
        }

        .modal-body select,
        .modal-body input,
        .modal-body textarea {
          width: 100%;
          border-radius: 16px;
          border: 1px solid #d9e9d9;
          padding: 14px 16px;
          font-size: 0.95rem;
          color: #1b3c28;
          background: #f7fbf6;
          outline: none;
        }

        .modal-body textarea {
          min-height: 120px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 20px;
        }

        .modal-button {
          border: none;
          border-radius: 999px;
          padding: 12px 22px;
          cursor: pointer;
          font-weight: 700;
        }

        .modal-button--secondary {
          background: #f3f6f1;
          color: #4b6450;
        }

        .modal-button--primary {
          background: #2e7d32;
          color: white;
        }

        @media (max-width: 1080px) {
          .admin-metrics,
          .overview-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-top {
            flex-direction: column;
            align-items: stretch;
          }

          .overview-card--large {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 820px) {
          .admin-root {
            flex-direction: column;
          }

          .admin-sidebar {
            width: 100%;
          }

          .admin-nav {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-nav-item {
            text-align: center;
            justify-content: center;
          }

          .admin-nav-label {
            flex: 0;
          }

          .admin-metrics,
          .overview-grid {
            grid-template-columns: 1fr;
          }

          .admin-header-card {
            align-items: stretch;
            flex-direction: column;
          }

          .district-card-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

"use client";

import { useState } from "react";

const sidebarItems = [
  "Overview",
  "Waste Management",
  "Live Tracking",
  "Notification",
  "Users",
  "Employee",
  "Audit Log",
  "Complaint",
  "Vehicle",
  "Schedule",
  "Report",
];

export default function AdminDashboardPage() {
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
          <div className="admin-logo-icon">♻</div>
          <div>
            <p>EcoCycle</p>
            <small>LANKA</small>
          </div>
        </div>

        <nav className="admin-nav">
          {sidebarItems.map((item, index) => (
            <button key={item} className={index === 0 ? "admin-nav-item active" : "admin-nav-item"}>
              {item}
            </button>
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

        <section className="admin-header-card">
          <div>
            <span className="admin-chip">SYSTEM ADMIN</span>
            <h1>Control Center EcoCycle Lanka</h1>
            <p>Real-time operational health across all districts</p>
          </div>
          <button className="admin-message-btn" onClick={() => setModalOpen(true)}>
            Message
          </button>
        </section>

        <section className="admin-metrics">
          <div className="metric-card">
            <span>Total users</span>
            <strong>12,840</strong>
          </div>
          <div className="metric-card">
            <span>Active drivers</span>
            <strong>184</strong>
          </div>
          <div className="metric-card">
            <span>Pickups today</span>
            <strong>1,206</strong>
          </div>
          <div className="metric-card">
            <span>Monthly waste</span>
            <strong>284 t</strong>
          </div>
        </section>

        <section className="admin-grid">
          <article className="big-card">
            <div className="card-title">Collection weight · this week</div>
            <div className="chart-bars">
              {[
                { label: "Mon", value: 200 },
                { label: "Tue", value: 300 },
                { label: "Wed", value: 260 },
                { label: "Thu", value: 340 },
                { label: "Fri", value: 420 },
                { label: "Sat", value: 380 },
                { label: "Sun", value: 220 },
              ].map((bar) => (
                <div key={bar.label} className="chart-bar">
                  <div className="chart-fill" style={{ height: `${bar.value / 5}px` }} />
                  <span>{bar.label}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="right-card top-contributors">
            <div className="card-title">Top contributors</div>
            <ol>
              <li><span>Anushka Jayawardena</span><strong>4820</strong></li>
              <li><span>Nimal Perera</span><strong>2450</strong></li>
              <li><span>Tharindu Bandara</span><strong>2380</strong></li>
              <li><span>Dilani Senanayake</span><strong>2110</strong></li>
              <li><span>Ruwan Madushanka</span><strong>1990</strong></li>
            </ol>
          </article>

          <article className="small-card">
            <div className="card-title">High-waste districts</div>
            <div className="donut-chart">
              <div className="donut-ring" />
              <div className="donut-center">Colombo</div>
            </div>
          </article>

          <article className="small-card">
            <div className="card-title">AI waste prediction</div>
            <div className="line-chart">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span>
            </div>
          </article>
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Send message</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>×</button>
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

        .admin-root {
          min-height: 100vh;
          background: linear-gradient(180deg, #ecf7ee 0%, #f6fbf9 40%, #f8faf7 100%);
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
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          color: #31402c;
          padding: 14px 18px;
          border-radius: 18px;
          font-size: 0.95rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .admin-nav-item:hover,
        .admin-nav-item.active {
          background: #e5f3e8;
          color: #1f472d;
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
        }

        .admin-search {
          flex: 1;
          background: #ffffff;
          border-radius: 20px;
          padding: 14px 18px;
          box-shadow: 0 6px 18px rgba(64, 123, 61, 0.08);
        }

        .admin-search input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 0.95rem;
          color: #12311d;
          background: transparent;
        }

        .admin-usercard {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: #ffffff;
          border-radius: 22px;
          padding: 14px 18px;
          box-shadow: 0 10px 24px rgba(69, 142, 80, 0.08);
        }

        .admin-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #2e7d32;
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
        }

        .admin-user-name {
          margin: 0;
          font-weight: 700;
          color: #163623;
        }

        .admin-user-role {
          margin: 0;
          color: #4c6350;
          font-size: 0.82rem;
        }

        .admin-header-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          background: #eaf8ef;
          border-radius: 28px;
          padding: 26px 30px;
          box-shadow: 0 16px 40px rgba(38, 104, 51, 0.08);
        }

        .admin-chip {
          display: inline-flex;
          color: #1b6c30;
          background: rgba(46, 125, 50, 0.12);
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .admin-header-card h1 {
          margin: 12px 0 8px;
          font-size: clamp(2rem, 2.2vw, 2.6rem);
          line-height: 1.05;
          color: #14331e;
        }

        .admin-header-card p {
          margin: 0;
          color: #4f6f52;
          font-size: 1rem;
        }

        .admin-message-btn {
          border: none;
          border-radius: 999px;
          padding: 14px 24px;
          color: white;
          background: linear-gradient(135deg, #2e7d32, #1b5e20);
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 12px 26px rgba(46, 125, 50, 0.22);
          transition: transform 0.2s ease;
        }

        .admin-message-btn:hover {
          transform: translateY(-1px);
        }

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .metric-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 24px 22px;
          box-shadow: 0 10px 24px rgba(63, 124, 60, 0.08);
        }

        .metric-card span {
          display: block;
          color: #6b7d6a;
          margin-bottom: 10px;
          font-size: 0.87rem;
        }

        .metric-card strong {
          font-size: 1.7rem;
          color: #162f22;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 2.1fr 0.9fr;
          gap: 18px;
        }

        .big-card,
        .right-card,
        .small-card {
          background: #ffffff;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 10px 26px rgba(60, 120, 53, 0.08);
        }

        .card-title {
          margin: 0 0 20px;
          font-weight: 700;
          color: #1d3d25;
        }

        .chart-bars {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          padding: 10px 0 2px;
        }

        .chart-bar {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .chart-fill {
          width: 100%;
          background: linear-gradient(180deg, #39a14f 0%, #1f652b 100%);
          border-radius: 14px 14px 0 0;
        }

        .chart-bar span {
          font-size: 0.78rem;
          color: #6b7d6a;
        }

        .top-contributors ol {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 14px;
        }

        .top-contributors li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          border-radius: 18px;
          background: #f4fbf4;
        }

        .top-contributors span {
          color: #305031;
          font-weight: 600;
        }

        .top-contributors strong {
          color: #1f472d;
        }

        .donut-chart {
          display: grid;
          place-items: center;
          height: 220px;
          position: relative;
        }

        .donut-ring {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: conic-gradient(#2e7d32 0 40%, #4caf50 40% 72%, #fbbf24 72% 92%, #d1d5db 92% 100%);
        }

        .donut-center {
          position: absolute;
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: #ffffff;
          display: grid;
          place-items: center;
          font-weight: 700;
          color: #1f472d;
        }

        .line-chart {
          display: grid;
          gap: 10px;
          color: #4b6b52;
          font-size: 0.85rem;
        }

        .line-chart span {
          display: inline-flex;
          justify-content: space-between;
          gap: 16px;
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
          font-size: 1.6rem;
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
          .admin-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .admin-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .admin-root {
            flex-direction: column;
            padding: 16px;
          }

          .admin-sidebar {
            width: 100%;
            padding: 20px;
          }

          .admin-top {
            flex-direction: column;
          }

          .admin-header-card {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

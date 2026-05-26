"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ── Icons ────────────────────────────────────────────────────────────────────

const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);

const IconPhone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.19a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
  </svg>
);

const IconEye = ({ open }: { open: boolean }) =>
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const IconFacebook = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ── Logo ─────────────────────────────────────────────────────────────────────

const Logo = () => (
  <Link href="/" className="auth-logo">
    <span className="auth-logo-icon">♻</span>
    <span className="auth-logo-text">
      EcoCycle<br /><small>LANKA</small>
    </span>
  </Link>
);

// ── Reusable input field ──────────────────────────────────────────────────────

function Field({
  icon,
  placeholder,
  type = "text",
  showToggle = false,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="auth-field">
      <span className="auth-field-icon">{icon}</span>
      <input
        className="auth-input"
        type={inputType}
        placeholder={placeholder}
        autoComplete="off"
      />
      {showToggle && (
        <button
          type="button"
          className="auth-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <IconEye open={visible} />
        </button>
      )}
    </div>
  );
}

// ── Floating leaves ───────────────────────────────────────────────────────────

const LEAVES = [
  { top: "6%",  left: "72%", size: 18, rot: 20,  delay: 0    },
  { top: "12%", left: "88%", size: 13, rot: -15, delay: 0.5  },
  { top: "30%", left: "94%", size: 15, rot: 35,  delay: 1.1  },
  { top: "55%", left: "90%", size: 11, rot: -30, delay: 0.3  },
  { top: "75%", left: "80%", size: 16, rot: 15,  delay: 0.8  },
  { top: "88%", left: "60%", size: 13, rot: -20, delay: 1.4  },
  { top: "80%", left: "10%", size: 15, rot: 25,  delay: 0.6  },
  { top: "55%", left: "4%",  size: 11, rot: -10, delay: 1.2  },
  { top: "30%", left: "8%",  size: 14, rot: 40,  delay: 0.2  },
  { top: "10%", left: "18%", size: 12, rot: -25, delay: 0.9  },
];

// ── Page component ────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role"); // "resident" | "collector" | null

  function handleSignIn() {
    // Replace with real auth logic — role-aware redirect after login
    if (role === "collector") {
      router.push("/collector");
    } else if (role === "admin") {
      router.push("/admin");
    } else {
      router.push("/resident");
    }
  }

  const loginHeading = role === "admin"
    ? "Admin sign in"
    : role === "collector"
    ? "Collector sign in"
    : "Welcome back";

  return (
    <div className="auth-root">

      {/* Floating leaf decorations */}
      {LEAVES.map((l, i) => (
        <span
          key={i}
          className="auth-leaf"
          style={{
            top: l.top,
            left: l.left,
            fontSize: l.size,
            animationDelay: `${l.delay}s`,
            transform: `rotate(${l.rot}deg)`,
          }}
        >
          🌿
        </span>
      ))}

      <Logo />

      {/* ── Auth card ── */}
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-heading">
            {loginHeading} <span role="img" aria-label="seedling">🌱</span>
          </h1>
          <p className="auth-subheading">Sign in to continue your eco journey.</p>
        </div>

        {/* ── Tab switcher — always visible ── */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === "login" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === "signup" ? "auth-tab--active" : ""}`}
            onClick={() => setTab("signup")}
          >
            Signup
          </button>
        </div>

        {tab === "login" ? (

          /* ── Login form ── */
          <div className="auth-form">
            <Field icon={<IconMail />} placeholder="Email address" type="email" />
            <Field icon={<IconLock />} placeholder="Password" showToggle />

            <div className="auth-remember-row">
              <label className="auth-remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button type="button" className="auth-forgot">Forgot password?</button>
            </div>

            <button className="auth-btn auth-btn--primary" onClick={handleSignIn}>
              Sign In
            </button>
            <button
              className="auth-btn auth-btn--outline"
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>

            <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

            <div className="auth-social">
              <button className="auth-social-btn"><IconGoogle /> Google</button>
              <button className="auth-social-btn"><IconFacebook /> Facebook</button>
            </div>
          </div>

        ) : (

          /* ── Signup form ── */
          <div className="auth-form">
            <Field icon={<IconUser />}   placeholder="Name" />
            <Field icon={<IconMapPin />} placeholder="Address" />
            <Field icon={<IconPhone />}  placeholder="Contact Num" />
            <Field icon={<IconMail />}   placeholder="Email address" type="email" />
            <Field icon={<IconLock />}   placeholder="Password"         showToggle />
            <Field icon={<IconLock />}   placeholder="Confirm Password" showToggle />

            <button className="auth-btn auth-btn--primary" style={{ marginTop: 6 }}>
              Create Account
            </button>
          </div>

        )}
      </div>

      {/* Footer */}
      <footer className="auth-footer">
        <span>© 2024 EcoCycle Lanka</span>
        <span className="auth-footer-links">
          <button type="button">Privacy</button>
          <button type="button">Support</button>
        </span>
      </footer>

      <style>{`
        
        .auth-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 50%, #e0f2e9 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
          padding: 80px 16px 40px;
        }

        .auth-leaf {
          position: absolute;
          pointer-events: none;
          opacity: 0.30;
          filter: saturate(0.65);
          animation: leafDrift 7s ease-in-out infinite alternate;
        }
        @keyframes leafDrift {
          from { transform: translateY(0px)  rotate(0deg); opacity: 0.25; }
          to   { transform: translateY(-9px) rotate(7deg); opacity: 0.42; }
        }

        .auth-logo {
          position: absolute;
          top: 20px;
          left: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #1a1a1a;
          z-index: 10;
        }
        .auth-logo-icon {
          width: 34px;
          height: 34px;
          background: #2e7d32;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .auth-logo-text {
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          line-height: 1.2;
          color: #1a1a1a;
        }
        .auth-logo-text small {
          font-size: 0.6rem;
          letter-spacing: 0.12em;
          color: #6b7280;
          font-weight: 500;
        }

        .auth-card {
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.85);
          border-radius: 24px;
          padding: 32px 28px 28px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 40px rgba(56,142,60,0.10), 0 2px 8px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
          animation: cardIn 0.55s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        .auth-card-header { margin-bottom: 20px; }
        .auth-heading {
          font-family: 'DM Serif Display', serif;
          font-size: 1.7rem;
          color: #1a1a1a;
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .auth-subheading {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        /* ── Tabs — always shown, active class driven by state ── */
        .auth-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 20px;
          gap: 3px;
        }
        .auth-tab {
          flex: 1;
          padding: 9px 0;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          background: transparent;
          color: #6b7280;
          transition: background 0.18s, color 0.18s, box-shadow 0.18s;
        }
        .auth-tab--active {
          background: #2e7d32;
          color: #fff;
          box-shadow: 0 2px 8px rgba(46,125,50,0.25);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .auth-field {
          display: flex;
          align-items: center;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 12px;
          height: 44px;
          gap: 10px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .auth-field:focus-within {
          border-color: #66bb6a;
          box-shadow: 0 0 0 3px rgba(102,187,106,0.15);
          background: #fff;
        }
        .auth-field-icon {
          color: #9ca3af;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .auth-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #1a1a1a;
          outline: none;
          min-width: 0;
        }
        .auth-input::placeholder { color: #b0b7c3; }
        .auth-eye {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .auth-eye:hover { color: #2e7d32; }

        .auth-remember-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2px 0;
        }
        .auth-remember {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.78rem;
          color: #6b7280;
          cursor: pointer;
        }
        .auth-remember input[type="checkbox"] {
          accent-color: #2e7d32;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
        .auth-forgot {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          color: #2e7d32;
          cursor: pointer;
          padding: 0;
          font-weight: 500;
        }
        .auth-forgot:hover { text-decoration: underline; }

        .auth-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.18s, transform 0.14s, box-shadow 0.18s;
          letter-spacing: 0.01em;
        }
        .auth-btn--primary {
          background: #2e7d32;
          color: #fff;
          box-shadow: 0 4px 14px rgba(46,125,50,0.28);
        }
        .auth-btn--primary:hover {
          background: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(46,125,50,0.32);
        }
        .auth-btn--outline {
          background: transparent;
          color: #2e7d32;
          border: 1.5px solid #2e7d32;
        }
        .auth-btn--outline:hover {
          background: #f0faf0;
          transform: translateY(-1px);
        }
        .auth-btn:active { transform: translateY(0); }

        .auth-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 2px 0;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }
        .auth-divider span {
          font-size: 0.68rem;
          color: #9ca3af;
          font-weight: 500;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .auth-social { display: flex; gap: 10px; }
        .auth-social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 12px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.14s;
        }
        .auth-social-btn:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }

        .auth-footer {
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 400px;
          font-size: 0.72rem;
          color: #9ca3af;
          z-index: 1;
        }
        .auth-footer-links { display: flex; gap: 12px; }
        .auth-footer-links button {
          background: none;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
        }
        .auth-footer-links button:hover { color: #2e7d32; }

        @media (max-width: 480px) {
          .auth-card { padding: 24px 18px 20px; }
          .auth-heading { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}

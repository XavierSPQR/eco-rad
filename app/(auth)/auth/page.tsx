"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUpResident, sendPasswordReset } from "@/lib/auth";

// ── Icons ─────────────────────────────────────────────────────────────────────

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

const IconSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ── Password field with show/hide toggle ───────────────────────────────────────

function PasswordField({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <span className="auth-field-icon"><IconLock /></span>
      <input
        className="auth-input"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      <button
        type="button"
        className="auth-eye"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        <IconEye open={visible} />
      </button>
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

// ── Firebase / Firestore error codes → friendly user-facing strings ────────────
// Updated to cover Auth errors, Firestore permission errors, config errors,
// and the custom "firestore/write-failed" code thrown by lib/auth.ts.

function friendlyError(code: string, rawMessage?: string): string {
  const map: Record<string, string> = {
    // ── Firebase Auth errors ──────────────────────────────────────────────────
    "auth/email-already-in-use":
      "An account with this email already exists. Try signing in instead.",
    "auth/invalid-email":
      "Please enter a valid email address.",
    "auth/weak-password":
      "Password must be at least 6 characters.",
    "auth/user-not-found":
      "No account found with this email. Please check and try again.",
    "auth/wrong-password":
      "Incorrect password. Please try again.",
    "auth/invalid-credential":
      "Incorrect email or password. Please check and try again.",
    "auth/too-many-requests":
      "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
    "auth/user-disabled":
      "This account has been disabled. Please contact support.",
    "auth/operation-not-allowed":
      "Email/password sign-up is not enabled. Please contact support.",
    "auth/invalid-api-key":
      "Firebase configuration error. Please contact support.",
    "auth/app-not-authorized":
      "This app is not authorised to use Firebase Authentication.",
    "auth/missing-email":
      "Missing email address.",

    // ── Firestore errors ──────────────────────────────────────────────────────
    "permission-denied":
      "Database permission denied. Your account was created but the profile could not be saved — please contact support.",
    "firestore/write-failed":
      "Your account was created but we could not save your profile. Please contact support.",
    "unavailable":
      "The database is temporarily unavailable. Please try again in a moment.",
    "deadline-exceeded":
      "The request timed out. Please check your connection and try again.",
    "not-found":
      "The requested document was not found in the database.",
    "already-exists":
      "A profile for this account already exists.",
    "resource-exhausted":
      "Too many requests to the database. Please try again later.",
    "unauthenticated":
      "You are not authenticated. Please sign in again.",
    "internal":
      "An internal database error occurred. Please try again.",
  };

  const friendly = map[code];
  if (friendly) return friendly;

  // Fall back to the raw Firebase message if we have it (better than nothing),
  // otherwise a generic message.
  if (rawMessage) {
    // Strip the "Firebase: " prefix Firebase sometimes adds
    const cleaned = rawMessage.replace(/^Firebase:\s*/i, "").trim();
    if (cleaned.length > 0) return cleaned;
  }

  return "Something went wrong. Please try again.";
}

import { Suspense } from "react";

// ── Page component ────────────────────────────────────────────────────────────

function AuthPageContent() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get("role");
  const isStaff = role === "admin" || role === "collector";

  // Force login tab if staff
  useEffect(() => {
    if (isStaff && tab === "signup") {
      setTab("login");
    }
  }, [isStaff, tab]);

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // ── Signup state ──
  const [signupName, setSignupName] = useState("");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  // ── Shared UI state ──
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Forgot Password state ──
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const loginHeading =
    role === "admin"
      ? "Admin sign in"
      : role === "collector"
      ? "Collector sign in"
      : "Welcome back";

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSignIn() {
    if (!loginEmail.trim() || !loginPassword) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { profile } = await signIn(loginEmail.trim(), loginPassword);
      if (!profile) {
        setError("Account profile not found. Please contact support.");
        return;
      }
      if (profile.role === "collector") router.push("/collector");
      else if (profile.role === "admin") router.push("/admin/overview");
      else if (profile.role === "resident") router.push("/resident");
      else {
        setError("Invalid account role. Please contact support.");
      }
    } catch (e: any) {
      // Log the full error object so the raw code is visible in DevTools
      console.error("[handleSignIn] error:", e.code, e.message, e);
      setError(friendlyError(e.code ?? "", e.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    // ── Client-side validation ─────────────────────────────────────────────
    if (!signupName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!signupEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!signupPassword) {
      setError("Please enter a password.");
      return;
    }
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (signupPassword !== signupConfirm) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signUpResident(signupEmail.trim(), signupPassword, {
        fullName: signupName.trim(),
        phone: signupPhone.trim(),
        address: signupAddress.trim(),
        district: "",
        nic: "",
        email: signupEmail.trim(),
      });
      router.push("/resident");
    } catch (e: any) {
      // Log the full error so the exact Firebase error code is visible in DevTools
      console.error("[handleSignUp] error:", e.code, e.message, e);
      setError(friendlyError(e.code ?? "", e.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', msg: "Please enter your email address." });
      return;
    }
    setForgotStatus(null);
    setForgotLoading(true);
    try {
      await sendPasswordReset(forgotEmail.trim());
      setForgotStatus({ type: 'success', msg: "Password reset link sent! Please check your inbox." });
    } catch (e: any) {
      console.error("[handleResetPassword] error:", e.code, e.message, e);
      setForgotStatus({ type: 'error', msg: friendlyError(e.code ?? "", e.message) });
    } finally {
      setForgotLoading(false);
    }
  }

  // Allow Enter key to submit
  function handleKeyDown(e: React.KeyboardEvent, action: () => void) {
    if (e.key === "Enter") action();
  }

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

      {/* Logo */}
      <Link href="/" className="auth-logo">
        <span className="auth-logo-icon">♻</span>
        <span className="auth-logo-text">
          EcoCycle<br /><small>LANKA</small>
        </span>
      </Link>

      {/* ── Auth card ── */}
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-heading">
            {tab === "login" ? loginHeading : "Create account"}{" "}
            <span role="img" aria-label="seedling">🌱</span>
          </h1>
          <p className="auth-subheading">
            {tab === "login"
              ? "Sign in to continue your eco journey."
              : "Join EcoCycle Lanka and start earning rewards."}
          </p>
        </div>

        {/* Tab switcher */}
        {!isStaff && (
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === "login" ? "auth-tab--active" : ""}`}
              onClick={() => { setTab("login"); setError(""); }}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab ${tab === "signup" ? "auth-tab--active" : ""}`}
              onClick={() => { setTab("signup"); setError(""); }}
              type="button"
            >
              Sign Up
            </button>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="auth-error" role="alert">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {tab === "login" ? (

          /* ── Login form ── */
          <div className="auth-form">
            {/* Email */}
            <div className="auth-field">
              <span className="auth-field-icon"><IconMail /></span>
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleSignIn)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <PasswordField
              placeholder="Password"
              value={loginPassword}
              onChange={setLoginPassword}
            />

            {/* Remember + Forgot */}
            <div className="auth-remember-row">
              <label className="auth-remember" htmlFor="remember-me">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              {role !== "admin" && (
                <button
                  type="button"
                  className="auth-forgot"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setForgotStatus(null);
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <button
              type="button"
              className="auth-btn auth-btn--primary"
              onClick={handleSignIn}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="auth-btn-loading">
                  <IconSpinner /> Signing in…
                </span>
              ) : "Sign In"}
            </button>

            {!isStaff && (
              <button
                type="button"
                className="auth-btn auth-btn--outline"
                onClick={() => { setTab("signup"); setError(""); }}
                disabled={loading}
              >
                Create an account
              </button>
            )}

            <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

            <div className="auth-social">
              <button type="button" className="auth-social-btn" disabled={loading}>
                <IconGoogle /> Google
              </button>
            </div>
          </div>

        ) : (

          /* ── Signup form ── */
          <div className="auth-form">
            {/* Full name */}
            <div className="auth-field">
              <span className="auth-field-icon"><IconUser /></span>
              <input
                className="auth-input"
                type="text"
                placeholder="Full name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div className="auth-field">
              <span className="auth-field-icon"><IconMapPin /></span>
              <input
                className="auth-input"
                type="text"
                placeholder="Address"
                value={signupAddress}
                onChange={(e) => setSignupAddress(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="auth-field">
              <span className="auth-field-icon"><IconPhone /></span>
              <input
                className="auth-input"
                type="tel"
                placeholder="Contact number (+94-77X-XXXXXX)"
                value={signupPhone}
                onChange={(e) => setSignupPhone(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div className="auth-field">
              <span className="auth-field-icon"><IconMail /></span>
              <input
                className="auth-input"
                type="email"
                placeholder="Email address"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <PasswordField
              placeholder="Password (min. 6 characters)"
              value={signupPassword}
              onChange={setSignupPassword}
            />

            {/* Confirm password */}
            <PasswordField
              placeholder="Confirm password"
              value={signupConfirm}
              onChange={setSignupConfirm}
            />

            <button
              type="button"
              className="auth-btn auth-btn--primary"
              onClick={handleSignUp}
              disabled={loading}
              aria-busy={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? (
                <span className="auth-btn-loading">
                  <IconSpinner /> Creating account…
                </span>
              ) : "Create Account"}
            </button>

            <button
              type="button"
              className="auth-btn auth-btn--outline"
              onClick={() => { setTab("login"); setError(""); }}
              disabled={loading}
            >
              Already have an account? Sign in
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

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="auth-modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2 className="auth-modal-title">Reset Password</h2>
              <button className="auth-modal-close" onClick={() => setShowForgotModal(false)}>×</button>
            </div>
            <p className="auth-modal-desc">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="auth-form" style={{ marginTop: 16 }}>
              <div className="auth-field">
                <span className="auth-field-icon"><IconMail /></span>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  autoComplete="email"
                  disabled={forgotLoading}
                />
              </div>

              {forgotStatus && (
                <div className={`auth-status auth-status--${forgotStatus.type}`}>
                  {forgotStatus.msg}
                </div>
              )}

              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={handleResetPassword}
                disabled={forgotLoading}
                style={{ marginTop: 8 }}
              >
                {forgotLoading ? (
                  <span className="auth-btn-loading">
                    <IconSpinner /> Sending link…
                  </span>
                ) : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');

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

        /* ── Logo ── */
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

        /* ── Card ── */
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
          to   { opacity: 1; transform: translateY(0) scale(1); }
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

        /* ── Tabs ── */
        .auth-tabs {
          display: flex;
          background: #f3f4f6;
          border-radius: 10px;
          padding: 3px;
          margin-bottom: 16px;
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

        /* ── Error banner ── */
        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 0.82rem;
          font-weight: 500;
          margin-bottom: 12px;
          line-height: 1.45;
          animation: shakeIn 0.3s ease;
        }
        @keyframes shakeIn {
          0%   { transform: translateX(-4px); }
          25%  { transform: translateX(4px); }
          50%  { transform: translateX(-3px); }
          75%  { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }

        /* ── Form ── */
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
        .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }

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

        /* ── Remember / Forgot ── */
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

        /* ── Buttons ── */
        .auth-btn {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.18s, transform 0.14s, box-shadow 0.18s, opacity 0.18s;
          letter-spacing: 0.01em;
        }
        .auth-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none !important;
        }
        .auth-btn--primary {
          background: #2e7d32;
          color: #fff;
          box-shadow: 0 4px 14px rgba(46,125,50,0.28);
        }
        .auth-btn--primary:hover:not(:disabled) {
          background: #1b5e20;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(46,125,50,0.32);
        }
        .auth-btn--outline {
          background: transparent;
          color: #2e7d32;
          border: 1.5px solid #2e7d32;
        }
        .auth-btn--outline:hover:not(:disabled) {
          background: #f0faf0;
          transform: translateY(-1px);
        }
        .auth-btn:active:not(:disabled) { transform: translateY(0); }

        .auth-btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .auth-btn-loading svg {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Divider ── */
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

        /* ── Social buttons ── */
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
        .auth-social-btn:hover:not(:disabled) {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .auth-social-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Modal ── */
        .auth-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(21, 37, 31, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .auth-modal {
          background: white;
          width: 100%;
          max-width: 400px;
          border-radius: 24px;
          padding: 28px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          animation: modalScale 0.3s cubic-bezier(.22,1,.36,1) both;
        }
        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .auth-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .auth-modal-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.4rem;
          margin: 0;
        }
        .auth-modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #9ca3af;
          padding: 0;
          line-height: 1;
        }
        .auth-modal-close:hover { color: #1a1a1a; }
        .auth-modal-desc {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
          line-height: 1.5;
        }

        .auth-status {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 500;
          line-height: 1.45;
        }
        .auth-status--success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
        }
        .auth-status--error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        /* ── Footer ── */
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

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}

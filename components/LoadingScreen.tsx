"use client";

import React from "react";

export function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f7f5",
      fontFamily: "'DM Sans', sans-serif",
      flexDirection: "column",
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        background: "#2e7d32",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 18,
        animation: "pulse 1.5s ease-in-out infinite",
      }}>
        ♻
      </div>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>Loading…</p>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.12); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}

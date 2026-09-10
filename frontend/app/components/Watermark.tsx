import React from "react";

export default function Watermark() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        backgroundColor: "rgba(30, 58, 138, 0.85)", // Deep blue slate, matching theme
        color: "rgba(255, 255, 255, 0.7)",
        borderRadius: "8px",
        backdropFilter: "blur(4px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 9999,
        pointerEvents: "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontSize: "24px",
          fontWeight: 800,
          color: "rgba(255, 255, 255, 0.9)",
          letterSpacing: "-0.5px"
        }}
      >
        Z.A
      </div>
      
      <div
        style={{
          width: "1px",
          height: "36px",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
        }}
      />
      
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "1.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            marginBottom: "2px",
          }}
        >
          Develop By
        </span>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.95)",
            marginBottom: "1px",
          }}
        >
          Zakaria Arrozi & Muhamad Adnan
        </span>
        <span style={{ fontSize: "10px", fontWeight: 500 }}>
          2026.
        </span>
      </div>
    </div>
  );
}

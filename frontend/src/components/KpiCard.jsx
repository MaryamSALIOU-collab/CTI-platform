import React from "react";
export default function KpiCard({ label, value, color = "#1F6FEB" }) {
  return (
    <div className="kpi-card" style={{ borderColor: color }}>
      <div className="kpi-value" style={{ color }}>{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}

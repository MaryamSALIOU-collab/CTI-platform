import React from "react";
const COLORS = { Critique: "#E5484D", Haute: "#F5A623", Moyenne: "#1F6FEB", Faible: "#12B5A6" };
export default function CriticalityBadge({ level }) {
  return <span className="badge" style={{ backgroundColor: COLORS[level] || "#6B7280" }}>{level}</span>;
}

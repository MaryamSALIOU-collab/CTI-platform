import React, { useEffect, useState } from "react";
import api from "../api.js";
import CriticalityBadge from "../components/CriticalityBadge.jsx";

export default function ThreatFeeds() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feeds").then(({ data }) => { setItems(data.items); setMode(data.mode); setLoading(false); });
  }, []);

  return (
    <div className="page">
      <header className="page-header"><h1>Flux de menaces</h1><p>Agrégation continue des indicateurs et campagnes rapportés par la communauté CTI.</p></header>
      <div className="filters-bar">
        <select><option>Toutes les catégories</option></select>
        <select><option>Toutes les sévérités</option></select>
        <button className="btn-ghost">Actualiser</button>
        {mode && <span className={"mode-tag " + mode}>{mode === "live" ? "flux en direct" : "données de démonstration"}</span>}
      </div>
      {loading ? <div className="page-loading">Chargement des flux…</div> : (
        <div className="feed-list">
          {items.map((item) => (
            <a key={item.id} href={item.link} className="feed-item">
              <CriticalityBadge level={item.severity} />
              <div className="feed-item-body">
                <div className="feed-item-title">{item.title}</div>
                <div className="feed-item-meta">{item.source} · {item.category} · {new Date(item.publishedAt).toLocaleString("fr-FR")}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

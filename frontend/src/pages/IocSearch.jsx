import React, { useState } from "react";
import api from "../api.js";

const VERDICT_COLORS = { Critique: "#E5484D", Suspect: "#F5A623", "À surveiller": "#1F6FEB", Inoffensif: "#12B5A6" };

export default function IocSearch() {
  const [value, setValue] = useState("8.8.8.8");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const { data } = await api.get("/ioc/search", { params: { value } });
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Recherche d'indicateurs de compromission</h1>
        <p>Vérifiez une adresse IP, un nom de domaine ou une empreinte de fichier (MD5, SHA-1, SHA-256) auprès de VirusTotal, AbuseIPDB et AlienVault OTX.</p>
      </header>
      <form className="search-bar" onSubmit={handleSearch}>
        <input type="text" placeholder="Ex. 8.8.8.8, example.com…" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Analyse…" : "Analyser"}</button>
      </form>
      {result && (
        <div className="card ioc-result">
          <div className="ioc-summary">
            <div><div className="ioc-value">{result.indicator}</div><div className="ioc-type">Type détecté : {result.type}</div></div>
            <div className="verdict-pill" style={{ backgroundColor: VERDICT_COLORS[result.verdict] }}>{result.verdict} · score {result.globalScore}/100</div>
          </div>
          <div className="source-grid">
            {result.sources.map((s) => (
              <div key={s.source} className="source-card">
                <div className="source-header"><strong>{s.source}</strong><span className={"mode-tag " + s.mode}>{s.mode === "live" ? "temps réel" : "démo"}</span></div>
                <div className="source-score">{s.score}/100</div>
                <ul className="source-details">
                  {Object.entries(s.details).map(([k, v]) => (
                    <li key={k}><span>{k}</span><span>{Array.isArray(v) ? v.join(", ") : String(v)}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

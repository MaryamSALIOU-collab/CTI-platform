import React, { useEffect, useState } from "react";
import api from "../api.js";
import CriticalityBadge from "../components/CriticalityBadge.jsx";

const CRITICALITIES = ["Critique", "Haute", "Moyenne", "Faible"];
const STATUSES = ["Nouvelle", "En cours", "Résolue"];

export default function Alerts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get("/alerts").then(({ data }) => { setItems(data.items); setSelected(data.items[1]); setLoading(false); });
  }, []);

  return (
    <div className="page">
      <header className="page-header alerts-header">
        <div><h1>Gestion des alertes</h1><p>Classez, triez et documentez les menaces détectées.</p></div>
        <button className="btn-primary">+ Nouvelle alerte</button>
      </header>
      <div className="alerts-layout">
        <div className="card alerts-list">
          {loading ? <div className="page-loading">Chargement…</div> : (
            <table className="data-table">
              <thead><tr><th>Titre</th><th>Criticité</th><th>Statut</th><th>Date</th><th></th></tr></thead>
              <tbody>
                {items.map((a) => (
                  <tr key={a.id} className={selected?.id === a.id ? "row-selected" : ""} onClick={() => setSelected(a)}>
                    <td>{a.title}</td><td><CriticalityBadge level={a.criticality} /></td><td>{a.status}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td><td><button className="btn-icon">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card alert-detail">
          {!selected ? <p className="empty-hint">Sélectionnez une alerte.</p> : (
            <>
              <h3>{selected.title}</h3>
              <p className="alert-meta">{selected.type} · source : {selected.source}</p>
              <div className="field-row"><label>Criticité</label><select defaultValue={selected.criticality}>{CRITICALITIES.map((c) => <option key={c}>{c}</option>)}</select></div>
              <div className="field-row"><label>Statut</label><select defaultValue={selected.status}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <h4>Notes d'analyse</h4>
              <div className="notes-list">
                {selected.notes?.length ? selected.notes.map((n) => (
                  <div key={n.id} className="note-item">
                    <div className="note-meta"><strong>{n.author}</strong><span>{new Date(n.date).toLocaleString("fr-FR")}</span></div>
                    <p>{n.content}</p>
                  </div>
                )) : <p className="empty-hint">Aucune note pour le moment.</p>}
              </div>
              <form className="note-form"><textarea placeholder="Ajouter une note d'analyse…" rows={3} /><button className="btn-primary" type="submit">Ajouter la note</button></form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

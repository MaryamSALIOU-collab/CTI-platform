import React, { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await api.get("/users");
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRole(u) {
    const role = u.role === "administrateur" ? "analyste" : "administrateur";
    await api.patch(`/users/${u.id}/role`, { role });
    load();
  }

  async function removeUser(u) {
    if (!confirm(`Supprimer le compte de ${u.name} ?`)) return;
    await api.delete(`/users/${u.id}`);
    load();
  }

  return (
    <div className="page">
      <header className="page-header"><h1>Gestion des utilisateurs</h1><p>Gérez les rôles et les accès à la plateforme (réservé aux administrateurs).</p></header>
      <div className="card">
        {loading ? <div className="page-loading">Chargement…</div> : (
          <table className="data-table">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Créé le</th><th></th></tr></thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td>
                  <td><span className={"role-tag " + u.role}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="row-actions">
                    <button className="btn-ghost" onClick={() => toggleRole(u)}>Basculer le rôle</button>
                    {u.id !== currentUser.id && <button className="btn-icon" onClick={() => removeUser(u)} title="Supprimer">✕</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

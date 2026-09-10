import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import api from "../api.js";
import KpiCard from "../components/KpiCard.jsx";
import CriticalityBadge from "../components/CriticalityBadge.jsx";

const TYPE_COLORS = ["#1F6FEB", "#12B5A6", "#F5A623", "#E5484D", "#8B5CF6", "#6B7280"];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data)).finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="page-loading">Chargement du tableau de bord…</div>;
  const { kpis, threatsByType, threatsOverTime, topCountries, recentAlerts } = stats;

  return (
    <div className="page">
      <header className="page-header"><h1>Tableau de bord</h1><p>Vue d'ensemble des menaces actives et de l'activité de la plateforme.</p></header>
      <section className="kpi-grid">
        <KpiCard label="Menaces actives" value={kpis.activeThreats} color="#E5484D" />
        <KpiCard label="IoC analysés (24h)" value={kpis.iocAnalyzed24h} color="#1F6FEB" />
        <KpiCard label="Alertes critiques" value={kpis.criticalAlerts} color="#F5A623" />
        <KpiCard label="Flux connectés" value={kpis.feedsConnected} color="#12B5A6" />
      </section>
      <section className="charts-grid">
        <div className="card">
          <h3>Répartition des menaces par type</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={threatsByType} dataKey="count" nameKey="type" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {threatsByType.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
              </Pie>
              <Legend verticalAlign="bottom" height={36} /><Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Évolution des menaces (30 jours)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={threatsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} interval={4} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1F6FEB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>Top pays sources d'attaques</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topCountries} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis dataKey="country" type="category" tick={{ fontSize: 12 }} width={40} /><Tooltip />
              <Bar dataKey="count" fill="#E5484D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card">
        <h3>Alertes récentes</h3>
        <table className="data-table">
          <thead><tr><th>Date</th><th>Titre</th><th>Type</th><th>Criticité</th><th>Statut</th><th>Source</th></tr></thead>
          <tbody>
            {recentAlerts.map((a) => (
              <tr key={a.id}>
                <td>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                <td>{a.title}</td><td>{a.type}</td>
                <td><CriticalityBadge level={a.criticality} /></td>
                <td>{a.status}</td><td>{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

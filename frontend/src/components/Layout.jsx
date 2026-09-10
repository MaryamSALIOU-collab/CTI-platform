import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Tableau de bord", icon: "◧", end: true },
  { to: "/ioc", label: "Recherche IoC", icon: "⌕" },
  { to: "/feeds", label: "Flux de menaces", icon: "≋" },
  { to: "/alerts", label: "Alertes", icon: "▲" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">CTI</span>
          <span className="brand-name">Threat&nbsp;Platform</span>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </NavLink>
          ))}
          {user?.role === "administrateur" && (
            <NavLink to="/users" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <span className="nav-icon">☺</span>Utilisateurs
            </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <div><div className="user-name">{user?.name}</div><div className="user-role">{user?.role}</div></div>
          </div>
          <button className="btn-ghost" onClick={logout}>Déconnexion</button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
    </div>
  );
}

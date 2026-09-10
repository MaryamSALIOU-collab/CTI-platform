import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cti-platform.local");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">CTI</span><span className="brand-name">Threat Platform</span></div>
        <h1>Connexion</h1>
        <p className="auth-subtitle">Accédez au tableau de bord de veille sur les cybermenaces.</p>
        <form onSubmit={handleSubmit}>
          <label>Email professionnel<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus /></label>
          <label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Connexion…" : "Se connecter"}</button>
        </form>
        <p className="auth-footer">Pas encore de compte ? <Link to="/register">Créer un compte analyste</Link></p>
        <p className="auth-hint">Démo : <code>admin@cti-platform.local</code> / <code>Admin123!</code></p>
      </div>
    </div>
  );
}

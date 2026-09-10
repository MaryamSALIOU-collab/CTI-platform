import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) navigate("/");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><span className="brand-mark">CTI</span><span className="brand-name">Threat Platform</span></div>
        <h1>Créer un compte</h1>
        <p className="auth-subtitle">Le premier compte créé sur une instance devient automatiquement administrateur.</p>
        <form onSubmit={handleSubmit}>
          <label>Nom complet<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label>
          <label>Email professionnel<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Mot de passe<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required /></label>
          {error && <div className="form-error">{error}</div>}
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Création…" : "Créer mon compte"}</button>
        </form>
        <p className="auth-footer">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}

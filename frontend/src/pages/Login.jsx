import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, verifyTwoFactor, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@cti-platform.local");
  const [password, setPassword] = useState("");
  const [pendingToken, setPendingToken] = useState(null);
  const [code, setCode] = useState("");

  async function handleSubmitPassword(e) {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else if (result.requiresTwoFactor) {
      setPendingToken(result.pendingToken);
    }
  }

  async function handleSubmitCode(e) {
    e.preventDefault();
    const ok = await verifyTwoFactor(pendingToken, code);
    if (ok) navigate("/");
  }

  function backToPasswordStep() {
    setPendingToken(null);
    setCode("");
    setError(null);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark">CTI</span>
          <span className="brand-name">Threat Platform</span>
        </div>

        {!pendingToken ? (
          <>
            <h1>Connexion</h1>
            <p className="auth-subtitle">
              Accédez au tableau de bord de veille sur les cybermenaces.
            </p>
            <form onSubmit={handleSubmitPassword}>
              <label>
                Email professionnel
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </label>
              <label>
                Mot de passe
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
            <p className="auth-footer">
              Pas encore de compte ? <Link to="/register">Créer un compte analyste</Link>
            </p>
            <p className="auth-hint">
              Démo : <code>admin@cti-platform.local</code> / <code>Admin123!</code>
            </p>
          </>
        ) : (
          <>
            <h1>Vérification en deux étapes</h1>
            <p className="auth-subtitle">
              Saisissez le code à 6 chiffres généré par votre application d'authentification
              (Google Authenticator, Microsoft Authenticator…).
            </p>
            <form onSubmit={handleSubmitCode}>
              <label>
                Code de vérification
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  required
                  autoFocus
                  style={{ fontFamily: "monospace", fontSize: "20px", letterSpacing: "4px", textAlign: "center" }}
                />
              </label>
              {error && <div className="form-error">{error}</div>}
              <button className="btn-primary" type="submit" disabled={loading || code.length !== 6}>
                {loading ? "Vérification…" : "Valider"}
              </button>
            </form>
            <p className="auth-footer">
              <a href="#" onClick={(e) => { e.preventDefault(); backToPasswordStep(); }}>
                ← Revenir à la connexion
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

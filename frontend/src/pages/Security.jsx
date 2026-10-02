
import React, { useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Security() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState("idle");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [manualEntryKey, setManualEntryKey] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function startSetup() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { data } = await api.post("/auth/2fa/setup");
      setQrCodeDataUrl(data.qrCodeDataUrl);
      setManualEntryKey(data.manualEntryKey);
      setStep("setup");
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de démarrer la configuration.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmEnable(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/2fa/enable", { code });
      setSuccess("Double authentification activée avec succès.");
      setStep("idle");
      setCode("");
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || "Code incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDisable(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/2fa/disable", { code });
      setSuccess("Double authentification désactivée.");
      setStep("idle");
      setCode("");
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.error || "Code incorrect.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Sécurité du compte</h1>
        <p>Protégez votre compte avec une double authentification (TOTP).</p>
      </header>

      <div className="card" style={{ maxWidth: 520 }}>
        <h3>Double authentification (2FA)</h3>

        {success && (
          <div className="form-error" style={{ background: "#d7f5ef", color: "#0a7d6e" }}>
            {success}
          </div>
        )}
        {error && <div className="form-error">{error}</div>}

        {step === "idle" && (
          <>
            <p style={{ color: "#6B7280", fontSize: 14, marginBottom: 16 }}>
              Statut actuel :{" "}
              <strong style={{ color: user?.twoFactorEnabled ? "#12B5A6" : "#E5484D" }}>
                {user?.twoFactorEnabled ? "Activée" : "Désactivée"}
              </strong>
            </p>

            {!user?.twoFactorEnabled ? (
              <button className="btn-primary" onClick={startSetup} disabled={loading}>
                Activer la double authentification
              </button>
            ) : (
              <form onSubmit={confirmDisable}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0B1F3A" }}>
                    Pour désactiver, saisissez un code actuel de votre application :
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                    style={{ padding: "10px 12px", border: "1.5px solid #E2E6EE", borderRadius: 8, fontFamily: "monospace", letterSpacing: 2 }}
                  />
                </label>
                <button className="btn-ghost" type="submit" disabled={loading || code.length !== 6}>
                  Désactiver la double authentification
                </button>
              </form>
            )}
          </>
        )}

        {step === "setup" && (
          <div>
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              1. Scannez ce QR code avec Google Authenticator, Microsoft Authenticator ou une
              application équivalente :
            </p>
            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="QR code de configuration 2FA"
                style={{ display: "block", margin: "0 auto 16px", width: 200, height: 200 }}
              />
            )}
            <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 16, textAlign: "center" }}>
              Ou saisissez manuellement cette clé :<br />
              <code style={{ background: "#EEF1F6", padding: "2px 6px", borderRadius: 4 }}>{manualEntryKey}</code>
            </p>

            <form onSubmit={confirmEnable}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0B1F3A" }}>
                  2. Entrez le code à 6 chiffres affiché par l'application :
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  required
                  autoFocus
                  style={{ padding: "10px 12px", border: "1.5px solid #E2E6EE", borderRadius: 8, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", fontSize: 18 }}
                />
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" type="submit" disabled={loading || code.length !== 6}>
                  Confirmer l'activation
                </button>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => { setStep("idle"); setCode(""); setError(null); }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

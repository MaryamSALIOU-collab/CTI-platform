import React, { createContext, useContext, useState, useCallback } from "react";
import api from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("cti_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const persist = (token, user) => {
    localStorage.setItem("cti_token", token);
    localStorage.setItem("cti_user", JSON.stringify(user));
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.requiresTwoFactor) {
        setLoading(false);
        return { requiresTwoFactor: true, pendingToken: data.pendingToken };
      }
      persist(data.token, data.user);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la connexion.");
      setLoading(false);
      return { success: false };
    }
  }, []);

  const verifyTwoFactor = useCallback(async (pendingToken, code) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/2fa/verify-login", { pendingToken, code });
      persist(data.token, data.user);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Code invalide.");
      setLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      persist(data.token, data.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || "Échec de l'inscription.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cti_token");
    localStorage.removeItem("cti_user");
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("cti_user", JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      /* ignoré */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, verifyTwoFactor, register, logout, refreshUser, loading, error, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

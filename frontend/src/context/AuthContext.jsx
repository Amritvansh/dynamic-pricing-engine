import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../api/authApi';
import { TOKEN_KEY } from '../api/axiosInstance';

// ── Context & hook ────────────────────────────────────────
const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

// ── Provider ──────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // ── Restore session on mount ─────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await getMe();
        setUser(res.data.data);
      } catch {
        // Token is invalid or expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ── Login ────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    const { token, user: userData } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  }, []);

  // ── Register ─────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const res = await registerUser(name, email, password);
    const { token, user: userData } = res.data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    return userData;
  }, []);

  // ── Logout ───────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore — server-side logout is a courtesy call
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

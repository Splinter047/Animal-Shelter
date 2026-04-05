import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const STORAGE_KEY = 'shelter_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  const refreshMe = useCallback(async (t) => {
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = await api('/auth/me', { token: t });
      setUser(me);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe(token);
  }, [token, refreshMe]);

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: payload,
    });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshMe: () => refreshMe(token),
    }),
    [token, user, loading, login, register, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

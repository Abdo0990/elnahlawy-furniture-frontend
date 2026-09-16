import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api, {
  AUTH_TOKEN_KEY,
  UNAUTHORIZED_EVENT,
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAdmin(null);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, data } = response.data;

    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAdmin(data);

    return data;
  }, []);

  const refreshAdmin = useCallback(async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      setAdmin(null);
      setIsAuthLoading(false);
      return null;
    }

    try {
      const response = await api.get('/auth/me');
      setAdmin(response.data.data);
      return response.data.data;
    } catch {
      logout();
      return null;
    } finally {
      setIsAuthLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  const value = useMemo(
    () => ({
      admin,
      isAuthenticated: Boolean(admin),
      isAuthLoading,
      login,
      logout,
      refreshAdmin,
    }),
    [admin, isAuthLoading, login, logout, refreshAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('يجب استخدام useAuth داخل AuthProvider');
  }

  return context;
}

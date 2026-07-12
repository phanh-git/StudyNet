import { createContext, useContext, useEffect, useState } from 'react';
import { clearAuthSession, fetchCurrentUser, getAuthToken, logoutRequest, setAuthToken } from '../services/api';

const AUTH_STORAGE_KEY = 'studynet-auth-user';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = getAuthToken();

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (!storedToken) {
      setIsAuthLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      })
      .catch(() => {
        setUser(null);
        clearAuthSession();
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  const login = (nextUser, authToken) => {
    setAuthToken(authToken);
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      clearAuthSession();
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

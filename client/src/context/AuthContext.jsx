import { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    storage.setToken(userToken);
    storage.setUser(userData);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    storage.setUser(userData);
    setUser(userData);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

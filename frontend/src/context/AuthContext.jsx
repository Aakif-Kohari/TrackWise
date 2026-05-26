import { createContext, useContext, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('trackwise_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      const stored = localStorage.getItem('trackwise_user');
      if (stored) setUser(JSON.parse(stored));
    }
  }, [token]);

  const login = async (credentials) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', credentials);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('trackwise_token', res.data.token);
      localStorage.setItem('trackwise_user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', payload);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('trackwise_token', res.data.token);
      localStorage.setItem('trackwise_user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('trackwise_token');
    localStorage.removeItem('trackwise_user');
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios.js';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const r = await api.get('/auth/me');
      setUser(r.data.user);
      return r.data.user;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    refresh().finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }

  async function register(payload) {
    const r = await api.post('/auth/register', payload);
    localStorage.setItem('token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
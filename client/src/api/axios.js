import axios from 'axios';

// In browser dev, VITE_API_URL is unset → uses '/api/v1' (Vite proxy handles it)
// In Electron production, .env.production supplies the absolute URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token');
      // Works under both http:// and file:// (HashRouter handles the route)
      if (!window.location.hash.includes('/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
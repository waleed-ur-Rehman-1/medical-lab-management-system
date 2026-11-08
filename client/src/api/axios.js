import axios from 'axios';

// 1. Reliably detect if we are inside the Electron Desktop App
const isElectron = window.location.protocol === 'file:';

function normalizeBaseUrl() {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // Kill anything after whitespace (catches "url $$ url2" accidents)
  if (url.includes(' ') || url.includes('$$') || url.includes('\n')) {
    console.warn('[axios] VITE_API_URL contains whitespace or "$$" — sanitizing:', url);
    url = url.split(/[\s$]+/).filter(Boolean)[0] || '';
  }

  // 🖥️ DESKTOP APP (Electron)
  // If we are in Electron, relative paths (like /api/v1) will fail.
  // We MUST use the absolute Render URL.
  if (isElectron) {
    // If the .env wasn't loaded during the Electron build, force the live URL as a fail-safe
    if (!url || !url.startsWith('http')) {
      return 'https://medical-lab-management-system.onrender.com/api/v1';
    }
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  // 💻 LOCAL DEVELOPMENT (Vite Proxy)
  // If no URL is provided, return relative path. Vite forwards /api to localhost:5000.
  if (!url) return '/api/v1';

  // 🌐 WEB PRODUCTION (Vercel)
  // Ensure the URL has /api/v1 at the end
  if (url.startsWith('http') && !url.includes('/api/v1')) {
    url = url.replace(/\/$/, '') + '/api/v1';
  }

  return url;
}

const BASE_URL = normalizeBaseUrl();
console.log(`[axios] Environment: ${isElectron ? '🖥️ Desktop App' : '🌐 Web App'}`);
console.log('[axios] BASE_URL =', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLogin) {
      localStorage.removeItem('token');
      
      if (isElectron) {
        // 🖥️ Desktop App uses HashRouter (URLs look like index.html#/login)
        if (!window.location.hash.includes('/login')) {
          window.location.hash = '#/login';
        }
      } else {
        // 🌐 Web App uses BrowserRouter (URLs look like /login)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const TOKEN_KEY = 'dpe_auth_token';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '').trim() || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// ── Request interceptor — attach JWT from localStorage ───
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — unwrap envelope & handle 401 ─
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // On 401 (token expired/invalid), clear token and force re-login
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      // Only redirect if not already on the login page to avoid loops
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export { TOKEN_KEY };
export default api;

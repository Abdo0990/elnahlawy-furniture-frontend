import axios from 'axios';

export const AUTH_TOKEN_KEY = 'elnahlawy_admin_token';
export const UNAUTHORIZED_EVENT = 'elnahlawy:unauthorized';

const api = axios.create({
  baseURL:
    /*import.meta.env.VITE_API_BASE_URL || */ 'http://localhost:3000/api/v1',
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hadAuthenticatedSession = Boolean(
      localStorage.getItem(AUTH_TOKEN_KEY),
    );

    if (status === 401 && hadAuthenticatedSession) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    const normalizedError = {
      message:
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED'
          ? 'استغرق الاتصال بالخادم وقتًا أطول من المتوقع'
          : 'تعذر الاتصال بالخادم، حاول مرة أخرى'),
      status,
      errors: error.response?.data?.errors || null,
      originalError: error,
    };

    return Promise.reject(normalizedError);
  },
);

export default api;

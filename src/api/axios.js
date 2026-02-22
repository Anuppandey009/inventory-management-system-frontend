import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-five-zeta-60.vercel.app/api';

const API = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;

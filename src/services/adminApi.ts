import axios, { InternalAxiosRequestConfig } from 'axios';

const adminApi = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000') + '/api',
});

adminApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('@EventSpace:admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;

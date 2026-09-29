import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('dss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function saveSession(data: { token: string; user: any }) {
  localStorage.setItem('dss_token', data.token);
  localStorage.setItem('dss_user', JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem('dss_token');
  localStorage.removeItem('dss_user');
  window.location.href = '/login';
}

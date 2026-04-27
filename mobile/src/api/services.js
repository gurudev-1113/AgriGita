import axios from 'axios';
// Note: In React Native, use AsyncStorage instead of localStorage
// import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.156.220:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor to attach Auth Token
api.interceptors.request.use(async (config) => {
  // In a real app: const token = await AsyncStorage.getItem('access_token');
  const token = null; // Placeholder
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  getProfile: () => api.get('/auth/profile'),
};

export const valveAPI = {
  getAll: () => api.get('/valves/'),
  toggle: (id) => api.post(`/valves/${id}/toggle`),
};

export const wellAPI = {
  getAll: () => api.get('/wells/'),
};

export const alertAPI = {
  getUnreadCount: () => api.get('/alerts/unread'),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const aiAPI = {
  getSuggestions: () => api.get('/ai/suggestions'),
};

export default api;

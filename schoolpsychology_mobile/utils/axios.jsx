import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

// Dynamic baseURL based on platform
const baseURL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8080'
    : 'http://localhost:8080'; // Change to LAN IP (e.g., 192.168.x.x) for physical devices

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi lấy token từ AsyncStorage:', error.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error('Network or CORS error:', error.message);
      return Promise.reject(new Error('Network or server error'));
    }

    const { status, config: originalRequest } = error.response;
    const excludedPaths = ['/api/v1/auth/login', '/api/v1/auth/forgot-password'];

    // Example token refresh mechanism placeholder
    if (
      status === 401 &&
      !originalRequest._retry &&
      !excludedPaths.some((path) => originalRequest.url.includes(path))
    ) {
      originalRequest._retry = true;
      // Optional: refresh token logic here
      // For now, just reject
      console.warn('Unauthorized, token may be expired');
      return Promise.reject(error);
    }

    if (status === 403) {
      console.warn('Access forbidden: insufficient permissions');
      return Promise.reject(new Error('Access forbidden'));
    }

    return Promise.reject(error);
  }
);

export default api;

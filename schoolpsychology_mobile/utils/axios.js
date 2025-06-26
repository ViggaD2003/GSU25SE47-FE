import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import { getAccessToken, isTokenExpired } from "./tokenManager";
import { AUTH_CONFIG, AUTH_ERRORS, APP_CONFIG } from "../constants";
import { refreshAccessToken, logout } from "./authActions";

// Dynamic baseURL based on platform
const baseURL =
  Platform.OS === "android"
    ? APP_CONFIG.ANDROID_API_URL
    : APP_CONFIG.API_BASE_URL;

const api = axios.create({
  baseURL,
  timeout: AUTH_CONFIG.REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global logout callback
let logoutCallback = null;

// Set logout callback function
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();
      if (token && !isTokenExpired(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token from tokenManager:", error.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error("Network or CORS error:", error.message);
      return Promise.reject(new Error(AUTH_ERRORS.NETWORK_ERROR));
    }

    const { status } = error.response;

    // Check if request is to excluded paths
    const isExcludedPath = AUTH_CONFIG.EXCLUDED_PATHS.some((path) =>
      originalRequest.url.includes(path)
    );

    // Handle 401 Unauthorized - try to refresh token
    if (status === 401 && !originalRequest._retry && !isExcludedPath) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed, logout user
        await logout();
        // Call logout callback if available
        if (logoutCallback) {
          logoutCallback();
        }
        return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
      }
    }

    // Handle 403 Forbidden - logout user
    if (status === 403) {
      console.warn("Access forbidden: insufficient permissions");
      await logout();
      if (logoutCallback) {
        logoutCallback();
      }
      return Promise.reject(new Error(AUTH_ERRORS.FORBIDDEN));
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;

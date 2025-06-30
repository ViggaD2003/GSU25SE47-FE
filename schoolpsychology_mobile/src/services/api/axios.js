import axios from "axios";
import { Platform } from "react-native";
import {
  getAccessToken,
  isTokenExpired,
  performLogout,
  isLogoutInProgress,
} from "../auth/tokenManager";
import { AUTH_CONFIG, AUTH_ERRORS, APP_CONFIG } from "../../constants";
import { refreshAccessToken, logout, forceLogout } from "../auth/authActions";

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
let isLogoutCallbackTriggered = false;

// Set logout callback function
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
  isLogoutCallbackTriggered = false; // Reset flag when setting new callback
};

// Safe logout callback trigger
const triggerLogoutCallback = () => {
  if (logoutCallback && !isLogoutCallbackTriggered) {
    isLogoutCallbackTriggered = true;
    try {
      console.log("Triggering logout callback");
      logoutCallback();
    } catch (callbackError) {
      console.error("Logout callback error:", callbackError);
    }
  }
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if logout is in progress
      if (isLogoutInProgress()) {
        console.log("Logout in progress, skipping request");
        return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
      }

      const token = await getAccessToken();
      // console.log("token", token);

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
        // Check if logout is already in progress
        if (isLogoutInProgress()) {
          console.log("Logout in progress, skipping token refresh");
          return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
        }

        console.log("Attempting to refresh token due to 401 error");
        // Try to refresh the token
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log("Token refresh successful, retrying original request");
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Refresh failed, ensure tokens are cleared and logout user
        try {
          console.log("Clearing tokens and logging out due to refresh failure");

          // Use force logout to ensure cleanup
          await forceLogout();
        } catch (logoutError) {
          console.error("Logout error during refresh failure:", logoutError);
          // Try one more time with basic logout
          try {
            await performLogout(true);
          } catch (finalError) {
            console.error("Final logout attempt failed:", finalError);
          }
        }

        // Call logout callback if available
        triggerLogoutCallback();

        return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
      }
    }

    // Handle 403 Forbidden - logout user
    if (status === 403) {
      console.warn("Access forbidden: insufficient permissions");
      try {
        await forceLogout();
      } catch (logoutError) {
        console.error("Logout error during 403:", logoutError);
        // Try basic logout as fallback
        try {
          await performLogout(true);
        } catch (finalError) {
          console.error("Final logout attempt failed:", finalError);
        }
      }

      // Call logout callback if available
      triggerLogoutCallback();

      return Promise.reject(new Error(AUTH_ERRORS.FORBIDDEN));
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;

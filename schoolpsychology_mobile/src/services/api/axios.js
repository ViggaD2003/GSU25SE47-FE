import axios from "axios";
import { Platform } from "react-native";
import {
  getAccessToken,
  isLogoutInProgress,
  clearTokens,
  isTokenActuallyExpired,
} from "../auth/tokenManager";
import { AUTH_CONFIG, AUTH_ERRORS, APP_CONFIG } from "../../constants";
import { refreshAccessToken } from "../auth/authActions";

// Utility function to handle server errors for mobile
const handleServerError = (error, showNotification = true) => {
  const { status } = error.response || {};

  switch (status) {
    case 502:
      console.warn("❌ Response: 502 Bad Gateway error detected");
      return new Error("Server temporarily unavailable");

    case 503:
      console.warn("❌ Response: 503 Service Unavailable error detected");
      return new Error("Service temporarily unavailable");

    case 504:
      console.warn("❌ Response: 504 Gateway Timeout error detected");
      return new Error("Gateway timeout");

    default:
      return error;
  }
};
let controller = new AbortController();

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
  signal: controller.signal,
});

export const refreshApi = axios.create({
  baseURL,
  timeout: AUTH_CONFIG.REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    signal: controller.signal,
    // Note: refreshApi intentionally doesn't include Authorization header
    // as it's used for token refresh without requiring authentication
  },
});

// Global logout callback
let logoutCallback = null;
let isLogoutCallbackTriggered = false;

// Global toast callback for showing messages
let toastCallback = null;

// Set logout callback function
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
  isLogoutCallbackTriggered = false; // Reset flag when setting new callback
};

// Set toast callback function
export const setToastCallback = (callback) => {
  toastCallback = callback;
};

// Safe logout callback trigger
const triggerLogoutCallback = () => {
  if (logoutCallback && !isLogoutCallbackTriggered) {
    isLogoutCallbackTriggered = true;
    try {
      console.log("🚀 Triggering immediate navigation to login");
      // Use setTimeout to ensure this runs in the next tick and doesn't block
      setTimeout(() => {
        logoutCallback();
      }, 0);
    } catch (callbackError) {
      console.warn("Logout callback error:", callbackError);
      // Reset flag if callback fails so it can be retried
      isLogoutCallbackTriggered = false;
    }
  } else if (!logoutCallback) {
    console.warn(
      "⚠️ No logout callback set. User may not be redirected to login."
    );
  } else {
    console.log(
      "🔄 Logout callback already triggered, skipping duplicate call"
    );
  }
};

// Safe toast callback trigger
const triggerToastCallback = (message, type = "error") => {
  if (toastCallback) {
    try {
      console.log(`📱 Showing toast immediately: ${message}`);
      // Use setTimeout to ensure this runs in the next tick and doesn't block
      setTimeout(() => {
        toastCallback(message, type);
      }, 0);
    } catch (callbackError) {
      console.warn("Toast callback error:", callbackError);
    }
  } else {
    console.warn(
      "⚠️ No toast callback set. Toast message may not be displayed."
    );
  }
};

// Check if path should skip token validation
const shouldSkipTokenValidation = (url) => {
  return AUTH_CONFIG.EXCLUDED_PATHS.some((path) => url.includes(path));
};

// Check if path is refresh endpoint
const isRefreshEndpoint = (url) => {
  return url.includes("/refresh");
};

// Request interceptor to attach JWT token and handle token expiry
api.interceptors.request.use(
  async (config) => {
    try {
      // Check if logout is in progress
      if (isLogoutInProgress()) {
        console.log("Logout in progress, skipping request");
        return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
      }

      // Skip token validation for excluded paths and refresh endpoints
      if (
        shouldSkipTokenValidation(config.url) ||
        isRefreshEndpoint(config.url)
      ) {
        console.log(`Skipping token validation for: ${config.url}`);
        return config;
      }

      const token = await getAccessToken();

      if (!token) {
        console.log("No token found, navigating to login immediately");
        // Show toast message
        triggerToastCallback("Your session has expired", "warning");
        // Navigate to login immediately
        triggerLogoutCallback();
        return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
      }

      controller = new AbortController();
      config.signal = controller.signal;

      // Check if token is actually expired (no buffer time)
      if (isTokenActuallyExpired(token)) {
        console.log(
          "Token actually expired, attempting refresh before request"
        );

        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            console.log("Token refresh successful, proceeding with request");
            config.headers.Authorization = `Bearer ${newToken}`;
            return config;
          } else {
            console.log(
              "Token refresh failed, clearing local tokens and navigating to login"
            );
            controller.abort();
            // Clear local tokens only, no API call
            await clearTokens();
            // Show toast message
            triggerToastCallback(
              "Your session has expired. Please login again.",
              "warning"
            );
            // Navigate to login immediately
            triggerLogoutCallback();
            return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
          }
        } catch (refreshError) {
          console.warn("Token refresh failed during request:", refreshError);
          // Clear local tokens only, no API call
          await clearTokens();
          // Show toast message
          triggerToastCallback(
            "Your session has expired. Please login again.",
            "warning"
          );
          // Navigate to login immediately
          triggerLogoutCallback();
          return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
        }
      } else {
        // Token is still valid, attach it to request
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          `✅ Token attached to request: ${config.url} (valid until expiry)`
        );
      }
    } catch (error) {
      console.warn("Error in request interceptor:", error.message);
      return Promise.reject(error);
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
      console.warn("Network or CORS error:", error.message);
      return Promise.reject(new Error(AUTH_ERRORS.NETWORK_ERROR));
    }

    const { status } = error.response;

    // Check if request is to excluded paths or refresh endpoint
    const isExcludedPath = shouldSkipTokenValidation(originalRequest.url);
    const isRefreshPath = isRefreshEndpoint(originalRequest.url);

    // Handle server errors (502, 503, 504)
    if (status >= 502 && status <= 504) {
      const serverError = handleServerError(error, true);
      return Promise.reject(serverError);
    }

    // Handle 500 Internal Server Error
    if (status === 500 && originalRequest.url.includes("/auth/login")) {
      const serverError = handleServerError(error, true);
      // Show toast message
      triggerToastCallback(
        "Your account has been disabled. Please contact support.",
        "warning"
      );
      // Navigate to login immediately
      triggerLogoutCallback();
      return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
    }

    // Handle 401 Unauthorized - try to refresh token
    if (
      status === 401 &&
      !originalRequest._retry &&
      !isExcludedPath &&
      !isRefreshPath
    ) {
      originalRequest._retry = true;

      controller.abort();
      await clearTokens();
      // Show toast message
      triggerToastCallback(
        "Your session has expired. Please login again.",
        "warning"
      );
      // Navigate to login immediately
      triggerLogoutCallback();

      return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
    }

    // Handle 403 Forbidden - try to refresh token, then logout if failed
    if (
      status === 403 &&
      !originalRequest._retry403 &&
      !isExcludedPath &&
      !isRefreshPath
    ) {
      originalRequest._retry403 = true;

      try {
        // Check if logout is already in progress
        if (isLogoutInProgress()) {
          console.log("Logout in progress, skipping token refresh for 403");
          return Promise.reject(new Error(AUTH_ERRORS.FORBIDDEN));
        }

        console.log("403 detected. Attempting token refresh...");
        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log(
            "Token refresh successful after 403, retrying original request"
          );
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          throw new Error("No token received after refresh");
        }
      } catch (refreshError) {
        console.warn("Token refresh failed after 403 error:", refreshError);
        console.log(
          "Clearing local tokens and navigating to login due to refresh failure after 403"
        );

        try {
          // Clear local tokens only (no API call)
          controller.abort();
          await clearTokens();
          // Show toast message
          triggerToastCallback(
            "Your session has expired. Please login again.",
            "warning"
          );
          // Navigate to login immediately
          triggerLogoutCallback();
        } catch (clearError) {
          console.warn(
            "Error clearing tokens after 403 refresh failure:",
            clearError
          );
          // Even if clearing fails, still try to navigate
          triggerLogoutCallback();
        }

        return Promise.reject(new Error(AUTH_ERRORS.FORBIDDEN));
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";
import { Platform, Alert } from "react-native";
import {
  getAccessToken,
  performLogout,
  isLogoutInProgress,
} from "../auth/tokenManager";
import { AUTH_CONFIG, AUTH_ERRORS, APP_CONFIG } from "../../constants";
import { refreshAccessToken, logout, forceLogout } from "../auth/authActions";

// Utility function to handle server errors for mobile
const handleServerError = (error, showNotification = true) => {
  const { status } = error.response || {};

  switch (status) {
    case 502:
      console.error("❌ Response: 502 Bad Gateway error detected");
      return new Error("Server temporarily unavailable");

    case 503:
      console.error("❌ Response: 503 Service Unavailable error detected");
      return new Error("Service temporarily unavailable");

    case 504:
      console.error("❌ Response: 504 Gateway Timeout error detected");
      return new Error("Gateway timeout");

    default:
      return error;
  }
};

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

      // Always attach token if present; do not check expiry here
      if (token) {
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

    // Handle server errors (502, 503, 504)
    if (status >= 502 && status <= 504) {
      const serverError = handleServerError(error, true);
      return Promise.reject(serverError);
    }

    // Handle 401 Unauthorized - try to refresh token
    // if (status === 401 && !originalRequest._retry && !isExcludedPath) {
    //   originalRequest._retry = true;

    //   try {
    //     // Check if logout is already in progress
    //     if (isLogoutInProgress()) {
    //       console.log("Logout in progress, skipping token refresh");
    //       return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
    //     }

    //     console.log("Attempting to refresh token due to 401 error");
    //     // Try to refresh the token
    //     const newToken = await refreshAccessToken();
    //     if (newToken) {
    //       console.log("Token refresh successful, retrying original request");
    //       // Retry the original request with new token
    //       originalRequest.headers.Authorization = `Bearer ${newToken}`;
    //       return api(originalRequest);
    //     }
    //   } catch (refreshError) {
    //     console.error("Token refresh failed:", refreshError);

    //     // Refresh failed, ensure tokens are cleared and logout user
    //     try {
    //       console.log("Clearing tokens and logging out due to refresh failure");

    //       // Use force logout to ensure cleanup
    //       await forceLogout();
    //     } catch (logoutError) {
    //       console.error("Logout error during refresh failure:", logoutError);
    //       // Try one more time with basic logout
    //       try {
    //         await performLogout(true);
    //       } catch (finalError) {
    //         console.error("Final logout attempt failed:", finalError);
    //       }
    //     }

    //     // Call logout callback if available
    //     triggerLogoutCallback();

    //     return Promise.reject(new Error(AUTH_ERRORS.UNAUTHORIZED));
    //   }
    // }

    // Handle 403 Forbidden - try to refresh once, otherwise logout
    if (status === 403 && !originalRequest._retry403 && !isExcludedPath) {
      originalRequest._retry403 = true;
      try {
        console.log("403 detected. Attempting token refresh...");
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        throw new Error("No token after refresh");
      } catch (refreshError) {
        console.error(
          "Refresh on 403 failed. Logging out locally...",
          refreshError
        );
        // Only notify if refresh endpoint itself returned 403
        if (refreshError?.response?.status === 403) {
          try {
            Alert.alert(
              "Phiên đăng nhập đã kết thúc",
              "Tài khoản vừa được đăng nhập ở nơi khác. Bạn đã bị đăng xuất khỏi phiên hiện tại.",
              [{ text: "OK" }],
              { cancelable: true }
            );
          } catch (_) {}
        }

        // Perform local logout ONLY (do not call logout service)
        try {
          await forceLogout();
        } catch (logoutError) {
          console.error("Force logout error during 403:", logoutError);
          try {
            await performLogout(true);
          } catch (finalError) {
            console.error("Final local logout attempt failed:", finalError);
          }
        }

        triggerLogoutCallback();
        return Promise.reject(new Error(AUTH_ERRORS.FORBIDDEN));
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default api;

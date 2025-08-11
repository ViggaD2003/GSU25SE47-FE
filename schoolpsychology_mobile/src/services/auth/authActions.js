import api, { refreshApi } from "../api/axios";
import { AUTH_CONFIG, AUTH_ERRORS } from "../../constants";
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isTokenValidForRefresh,
  handleRefreshTokenFailure,
  performLogout,
  isLogoutInProgress,
  validateToken,
} from "./tokenManager";
import { Alert } from "react-native";

// State management for refresh token process
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Enhanced refresh token logic with better error handling
export const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Check if logout is already in progress
    if (isLogoutInProgress()) {
      console.log("Logout in progress, skipping token refresh");
      throw new Error(AUTH_ERRORS.REFRESH_FAILED);
    }

    // Check if token is valid for refresh
    const isValidForRefresh = await isTokenValidForRefresh();
    if (!isValidForRefresh) {
      console.log("Token is not valid for refresh");
      await handleRefreshTokenFailure();
      throw new Error(AUTH_ERRORS.REFRESH_FAILED);
    }

    // Lấy accessToken hiện tại để refresh (không còn refreshToken riêng)
    const refreshToken = await getAccessToken();
    if (
      !refreshToken ||
      typeof refreshToken !== "string" ||
      refreshToken.trim() === ""
    ) {
      await handleRefreshTokenFailure();
      throw new Error(AUTH_ERRORS.REFRESH_FAILED);
    }

    console.log("refreshToken", refreshToken);

    // Validate the current token before attempting refresh
    const tokenValidation = await validateToken(refreshToken);
    if (!tokenValidation.isValid) {
      console.log("Current token is invalid:", tokenValidation.error);
      await handleRefreshTokenFailure();
      throw new Error(tokenValidation.error);
    }

    const response = await refreshApi.post(AUTH_CONFIG.ENDPOINTS.REFRESH, {
      token: refreshToken,
    });

    const { token: accessToken } = response.data.data;

    // Validate that we received valid tokens
    if (
      !accessToken ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      await handleRefreshTokenFailure();
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }

    // Validate the new token
    const newTokenValidation = await validateToken(accessToken);
    if (!newTokenValidation.isValid) {
      console.log("New token is invalid:", newTokenValidation.error);
      await handleRefreshTokenFailure();
      throw new Error(newTokenValidation.error);
    }

    await setTokens(accessToken);
    processQueue(null, accessToken);

    return accessToken;
  } catch (error) {
    console.error("Refresh token failed:", error);

    // Clear tokens on refresh failure
    await handleRefreshTokenFailure();

    processQueue(error, null);

    // If refresh endpoint returns 403, it means the token is completely invalid
    if (error?.response?.status === 403) {
      throw new Error(AUTH_ERRORS.FORBIDDEN);
    }

    throw new Error(AUTH_ERRORS.REFRESH_FAILED);
  } finally {
    isRefreshing = false;
  }
};

// Enhanced logout function with protection against multiple calls
export const logout = async (callLogoutAPI = false) => {
  try {
    // Check if logout is already in progress
    if (isLogoutInProgress()) {
      console.log("Logout already in progress, waiting...");
      return await performLogout();
    }

    // Use the enhanced logout function first
    const logoutResult = await performLogout();

    // Only call logout API if explicitly requested
    if (callLogoutAPI) {
      try {
        const token = await getAccessToken();
        if (token) {
          // Use a simple fetch instead of axios to avoid interceptor loops
          const response = await fetch(`${AUTH_CONFIG.ENDPOINTS.LOGOUT}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            console.warn("Logout API call failed:", response.status);
          }
        }
      } catch (error) {
        console.warn("Logout API call failed:", error);
        // Continue with local logout even if API call fails
      }
    }

    return logoutResult;
  } catch (error) {
    console.error("Logout error:", error);
    // Force logout even if there's an error
    return await performLogout(true);
  }
};

// Force logout function for emergency situations
export const forceLogout = async () => {
  try {
    console.log("Force logout initiated - local cleanup only");
    // Clear tokens from storage
    await clearTokens();
    // Perform local logout without API call
    return await performLogout(true);
  } catch (error) {
    console.error("Force logout error:", error);
    // Even if there's an error, try to clear tokens
    try {
      await clearTokens();
    } catch (clearError) {
      console.error("Error clearing tokens during force logout:", clearError);
    }
    return false;
  }
};

// Utility function for consistent logout handling
export const handleLogout = async (
  reason = "user_request",
  showAlert = true
) => {
  try {
    console.log(`Logout initiated due to: ${reason}`);

    // Show alert if requested
    if (showAlert) {
      try {
        Alert.alert(
          "Phiên đăng nhập đã kết thúc",
          "Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.",
          [{ text: "OK" }],
          { cancelable: true }
        );
      } catch (alertError) {
        console.error("Error showing logout alert:", alertError);
      }
    }

    // Perform local logout only (no API call)
    const result = await forceLogout();

    return result;
  } catch (error) {
    console.error("Error in handleLogout:", error);
    return false;
  }
};

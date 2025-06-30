import api from "../api/axios";
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

    // Validate the current token before attempting refresh
    const tokenValidation = await validateToken(refreshToken);
    if (!tokenValidation.isValid) {
      console.log("Current token is invalid:", tokenValidation.error);
      await handleRefreshTokenFailure();
      throw new Error(tokenValidation.error);
    }

    const response = await api.post(AUTH_CONFIG.ENDPOINTS.REFRESH, {
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
    throw new Error(AUTH_ERRORS.REFRESH_FAILED);
  } finally {
    isRefreshing = false;
  }
};

// Enhanced logout function with protection against multiple calls
export const logout = async () => {
  try {
    // Check if logout is already in progress
    if (isLogoutInProgress()) {
      console.log("Logout already in progress, waiting...");
      return await performLogout();
    }

    // Use the enhanced logout function first
    const logoutResult = await performLogout();

    // Try to call logout endpoint after local logout (non-blocking)
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
    console.log("Force logout initiated");
    await clearTokens();
    return await performLogout(true);
  } catch (error) {
    console.error("Force logout error:", error);
    return false;
  }
};

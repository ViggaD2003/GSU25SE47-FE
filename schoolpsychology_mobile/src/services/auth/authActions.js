import api from "../api/axios";
import { AUTH_CONFIG, AUTH_ERRORS } from "../../constants";
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isTokenValidForRefresh,
  handleRefreshTokenFailure,
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

// Refresh token logic
export const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
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

// Logout function
export const logout = async () => {
  try {
    // Call logout endpoint if needed
    const token = await getAccessToken();
    if (token) {
      try {
        await api.post(AUTH_CONFIG.ENDPOINTS.LOGOUT);
      } catch (error) {
        console.warn("Logout API call failed:", error);
      }
    }

    await clearTokens();
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear tokens even if API call fails
    await clearTokens();
  }
};

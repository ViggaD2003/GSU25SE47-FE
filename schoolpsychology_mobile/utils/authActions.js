import api from "./axios";
import { AUTH_CONFIG, AUTH_ERRORS } from "../constants";
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
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
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      throw new Error(AUTH_ERRORS.REFRESH_FAILED);
    }

    const response = await api.post(AUTH_CONFIG.ENDPOINTS.REFRESH, {
      refreshToken: refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    await setTokens(accessToken, newRefreshToken);
    processQueue(null, accessToken);

    return accessToken;
  } catch (error) {
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

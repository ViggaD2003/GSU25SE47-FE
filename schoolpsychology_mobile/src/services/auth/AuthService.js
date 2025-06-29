import api from "../api/axios";
import { AUTH_CONFIG, AUTH_ERRORS } from "../../constants";
import {
  setTokens,
  getAccessToken,
  clearTokens,
  isTokenExpired,
  shouldRefreshToken,
  validateUserRole,
  handleRefreshTokenFailure,
  isTokenValidForRefresh,
} from "./tokenManager";
import { refreshAccessToken, logout } from "./authActions";

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await api.post(AUTH_CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });
    console.log(response);

    const { token: accessToken } = response.data.data;

    // Validate that we received valid tokens
    if (
      !accessToken ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }

    const decoded = validateUserRole(accessToken);
    await setTokens(accessToken);

    return {
      accessToken,
      user: {
        ...decoded,
        token: accessToken,
        userId: decoded["user-id"],
        role: decoded.role,
        email: decoded.sub,
        fullName: decoded.fullname,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const isAuthenticated = async () => {
  try {
    const token = await getAccessToken();
    if (!token) return false;

    return !isTokenExpired(token);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const token = await getAccessToken();
    if (!token || isTokenExpired(token)) {
      return null;
    }

    const decoded = validateUserRole(token);
    return {
      ...decoded,
      token,
      role: decoded.role,
      userId: decoded["user-id"],
      email: decoded.sub,
      fullName: decoded.fullname,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Check and handle refresh token failures
export const checkAndHandleRefreshTokenFailure = async () => {
  try {
    const token = await getAccessToken();
    if (!token) {
      return false; // No token to check
    }

    // Check if token is valid for refresh
    const isValidForRefresh = await isTokenValidForRefresh();
    if (!isValidForRefresh) {
      console.log("Token is not valid for refresh, handling failure");
      await handleRefreshTokenFailure();
      return true; // Failure was handled
    }

    return false; // No failure detected
  } catch (error) {
    console.error("Error checking refresh token failure:", error);
    await handleRefreshTokenFailure();
    return true; // Failure was handled
  }
};

// Re-export token management functions for backward compatibility
export {
  setTokens,
  getAccessToken,
  clearTokens,
  isTokenExpired,
  shouldRefreshToken,
  validateUserRole,
  refreshAccessToken,
  logout,
  handleRefreshTokenFailure,
  isTokenValidForRefresh,
};

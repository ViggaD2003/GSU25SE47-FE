import api from "./axios";
import { AUTH_CONFIG, AUTH_ERRORS } from "../constants";
import {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isTokenExpired,
  shouldRefreshToken,
  validateUserRole,
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
    await setTokens(accessToken, accessToken);

    return {
      accessToken,
      refreshToken: accessToken,
      user: {
        token: accessToken,
        role: decoded.role,
        ...decoded,
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
      token,
      role: decoded.role,
      ...decoded,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Re-export token management functions for backward compatibility
export {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  isTokenExpired,
  shouldRefreshToken,
  validateUserRole,
  refreshAccessToken,
  logout,
};

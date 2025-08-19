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
  validateToken,
  performLogout,
  isLogoutInProgress,
} from "./tokenManager";
import { refreshAccessToken, logout, forceLogout } from "./authActions";

// Authentication functions
export const login = async (email, password) => {
  try {
    const response = await api.post(AUTH_CONFIG.ENDPOINTS.LOGIN, {
      email,
      password,
    });
    console.log(response.data);

    const { token: accessToken } = response.data.data;

    // Validate that we received valid tokens
    if (
      !accessToken ||
      typeof accessToken !== "string" ||
      accessToken.trim() === ""
    ) {
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }

    // Validate the token before saving
    const tokenValidation = await validateToken(accessToken);
    console.log("is valid", tokenValidation.isValid);

    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.error);
    }

    const decoded = validateUserRole(accessToken);
    await setTokens(accessToken);

    return {
      accessToken,
      user: {
        ...decoded,
        accessToken,
        token: accessToken,
        userId: decoded["user-id"] || decoded.id,
        id: decoded["user-id"],
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
    // Check if logout is in progress
    if (isLogoutInProgress()) {
      return false;
    }

    const token = await getAccessToken();
    if (!token) return false;

    // Use enhanced token validation
    const tokenValidation = await validateToken(token);
    return tokenValidation.isValid;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    // Check if logout is in progress
    if (isLogoutInProgress()) {
      return null;
    }

    const token = await getAccessToken();
    if (!token) {
      return null;
    }

    // Use enhanced token validation
    const tokenValidation = await validateToken(token);
    if (!tokenValidation.isValid) {
      console.log("Token validation failed:", tokenValidation.error);
      return null;
    }

    const response = await api.get(AUTH_CONFIG.ENDPOINTS.ACCOUNT);
    const user = response.data;

    const decoded = validateUserRole(token);
    if (!decoded) return null;

    return {
      ...decoded,
      ...user,
      token,
      accessToken: token,
      role: user.roleName || decoded.role,
      userId: user.id || user.userId || decoded["user-id"],
      id: user.id || user.userId || decoded["user-id"],
      email: user.email || decoded.sub,
      fullName: user.fullName || decoded.fullname,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Enhanced check and handle refresh token failures
export const checkAndHandleRefreshTokenFailure = async () => {
  try {
    // Check if logout is in progress
    if (isLogoutInProgress()) {
      return false;
    }

    const token = await getAccessToken();
    if (!token) {
      return false; // No token to check
    }

    // Use enhanced token validation
    const tokenValidation = await validateToken(token);
    if (!tokenValidation.isValid) {
      console.log(
        "Token validation failed, handling failure:",
        tokenValidation.error
      );
      await handleRefreshTokenFailure();
      return true; // Failure was handled
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

// Enhanced logout function
export const authLogout = async () => {
  try {
    // Check if logout is already in progress
    if (isLogoutInProgress()) {
      console.log("Logout already in progress, waiting...");
      return await performLogout();
    }

    // Call logout endpoint if needed
    const token = await getAccessToken();
    if (token) {
      try {
        await api.post(AUTH_CONFIG.ENDPOINTS.LOGOUT);
      } catch (error) {
        console.warn("Logout API call failed:", error);
        // Continue with local logout even if API call fails
      }
    }

    // Use the enhanced logout function
    return await performLogout();
  } catch (error) {
    console.error("Auth logout error:", error);
    // Force logout even if there's an error
    return await performLogout(true);
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
  forceLogout,
  handleRefreshTokenFailure,
  isTokenValidForRefresh,
  validateToken,
  performLogout,
  isLogoutInProgress,
};

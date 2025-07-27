import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AUTH_CONFIG, AUTH_ERRORS } from "../../constants";

// Global state to prevent multiple simultaneous operations
let isLoggingOut = false;
let logoutPromise = null;

// Token management functions
export const setTokens = async (token) => {
  try {
    // Validate access token
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }
    await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
  } catch (error) {
    console.error("Error saving tokens:", error);
    throw error;
  }
};

export const getAccessToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
};

// getRefreshToken sẽ trả về accessToken (vì chỉ lưu 1 biến token)
export const getRefreshToken = async () => {
  return getAccessToken();
};

export const clearTokens = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};

// Token validation functions
export const isTokenExpired = (token) => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return true;
  }
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const bufferTime = AUTH_CONFIG.TOKEN_EXPIRATION_BUFFER;
    return decoded.exp < currentTime + bufferTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// shouldRefreshToken sẽ kiểm tra accessToken
export const shouldRefreshToken = async () => {
  try {
    const token = await getAccessToken();
    if (!token || typeof token !== "string" || token.trim() === "") {
      return false;
    }
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const bufferTime = AUTH_CONFIG.TOKEN_EXPIRATION_BUFFER;
    return decoded.exp < currentTime + bufferTime;
  } catch (error) {
    console.error("Error checking token refresh:", error);
    return true;
  }
};

// User validation functions
export const validateUserRole = (token) => {
  try {
    if (!token || typeof token !== "string" || token.trim() === "") {
      throw new Error(AUTH_ERRORS.INVALID_TOKEN);
    }
    const decoded = jwtDecode(token);
    if (!AUTH_CONFIG.ALLOWED_ROLES.includes(decoded.role)) {
      throw new Error(AUTH_ERRORS.INVALID_ROLE);
    }
    return decoded;
  } catch (error) {
    console.error("Error validating user role:", error);
    throw error;
  }
};

// Enhanced token validation with comprehensive error handling
export const validateToken = async (token) => {
  try {
    if (!token || typeof token !== "string" || token.trim() === "") {
      return { isValid: false, error: AUTH_ERRORS.TOKEN_MISSING };
    }

    const decoded = jwtDecode(token);
    // const currentTime = Date.now() / 1000;

    // Check if token is expired
    // console.log("decoded.exp < currentTime", decoded.exp < currentTime);
    // if (decoded.exp < currentTime) {
    //   return { isValid: false, error: AUTH_ERRORS.TOKEN_EXPIRED };
    // }

    // Check if token is too old to be refreshed
    // const maxRefreshAge = 7 * 24 * 60 * 60; // 7 days in seconds
    // if (decoded.iat && currentTime - decoded.iat > maxRefreshAge) {
    //   return { isValid: false, error: AUTH_ERRORS.REFRESH_FAILED };
    // }

    // Check if user role is valid
    if (!AUTH_CONFIG.ALLOWED_ROLES.includes(decoded.role)) {
      return { isValid: false, error: AUTH_ERRORS.INVALID_ROLE };
    }

    return { isValid: true, decoded };
  } catch (error) {
    console.error("Error validating token:", error);
    return { isValid: false, error: AUTH_ERRORS.INVALID_TOKEN };
  }
};

// Check if refresh token has failed and handle cleanup
export const handleRefreshTokenFailure = async () => {
  try {
    console.log("Handling refresh token failure - clearing tokens");
    await clearTokens();
    return true;
  } catch (error) {
    console.error("Error handling refresh token failure:", error);
    return false;
  }
};

// Check if token is valid for refresh
export const isTokenValidForRefresh = async () => {
  try {
    const token = await getAccessToken();
    if (!token || typeof token !== "string" || token.trim() === "") {
      return false;
    }

    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    // Check if token is not too old to be refreshed (e.g., within 7 days)
    const maxRefreshAge = 7 * 24 * 60 * 60; // 7 days in seconds
    return decoded.iat && currentTime - decoded.iat < maxRefreshAge;
  } catch (error) {
    console.error("Error checking token validity for refresh:", error);
    return false;
  }
};

// Enhanced logout function with protection against multiple calls
export const performLogout = async (force = false) => {
  // Prevent multiple simultaneous logout operations
  if (isLoggingOut && !force) {
    console.log("Logout already in progress, waiting...");
    return logoutPromise;
  }

  if (isLoggingOut && force) {
    console.log("Force logout requested, clearing state");
    isLoggingOut = false;
    logoutPromise = null;
  }

  isLoggingOut = true;
  logoutPromise = (async () => {
    try {
      console.log("Starting logout process...");

      // Clear tokens first
      await clearTokens();

      // Reset global state
      isLoggingOut = false;
      logoutPromise = null;

      console.log("Logout process completed successfully");
      return true;
    } catch (error) {
      console.error("Error during logout process:", error);

      // Reset global state even on error
      isLoggingOut = false;
      logoutPromise = null;

      // Still try to clear tokens
      try {
        await clearTokens();
      } catch (clearError) {
        console.error("Error clearing tokens during logout:", clearError);
      }

      return false;
    }
  })();

  return logoutPromise;
};

// Check if logout is in progress
export const isLogoutInProgress = () => {
  return isLoggingOut;
};

// Reset logout state (useful for testing or error recovery)
export const resetLogoutState = () => {
  isLoggingOut = false;
  logoutPromise = null;
};

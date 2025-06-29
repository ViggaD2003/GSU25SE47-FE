import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AUTH_CONFIG, AUTH_ERRORS } from "../../constants";

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

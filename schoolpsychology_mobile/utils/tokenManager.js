import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { AUTH_CONFIG, AUTH_ERRORS } from "../constants";

// Token management functions
export const setTokens = async (accessToken, refreshToken = null) => {
  try {
    await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_KEY, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    }
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

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Error getting refresh token:", error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_CONFIG.TOKEN_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_KEY,
    ]);
  } catch (error) {
    console.error("Error clearing tokens:", error);
  }
};

// Token validation functions
export const isTokenExpired = (token) => {
  if (!token) return true;

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

export const shouldRefreshToken = async () => {
  try {
    const token = await getAccessToken();
    if (!token) return false;

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

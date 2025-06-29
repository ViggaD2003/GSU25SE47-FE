// Global styles
export const GlobalStyles = {
  colors: {
    primary: "#20734C",
    primary50: "#e4d9fd",
    primary100: "#c6affc",
    primary200: "#a281f0",
    primary400: "#5721d4",
    primary500: "#3e04c3",
    primary700: "#2d0689",
    primary800: "#200364",
    accent500: "#f7bc0c",
    error50: "#fcc4e4",
    error500: "#9b095c",
    gray500: "#39324a",
    gray700: "#221c30",
  },
};

// Authentication configuration
export const AUTH_CONFIG = {
  // Token settings
  TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",

  // API endpoints
  ENDPOINTS: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
    VERIFY_EMAIL: "/api/v1/auth/verify-email",
  },

  // Excluded paths from token refresh
  EXCLUDED_PATHS: [
    "/api/v1/auth/login",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/refresh",
    "/api/v1/auth/register",
  ],

  // Allowed user roles
  ALLOWED_ROLES: ["STUDENT", "PARENTS"],

  // Token expiration buffer (in seconds) - refresh token before it expires
  TOKEN_EXPIRATION_BUFFER: 300, // 5 minutes

  // Request timeout
  REQUEST_TIMEOUT: 10000,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Error messages
export const AUTH_ERRORS = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "Session expired. Please login again.",
  FORBIDDEN: "Access forbidden. Please login again.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SERVER_ERROR: "Server error. Please try again later.",
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
  REFRESH_FAILED: "Failed to refresh session. Please login again.",
  INVALID_ROLE: "Only Student or Parent can log in.",
  INVALID_TOKEN: "Invalid token format. Please login again.",
  TOKEN_MISSING: "Authentication token is missing. Please login again.",
};

// Success messages
export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  TOKEN_REFRESHED: "Session refreshed successfully.",
};

// App constants
export const APP_CONFIG = {
  NAME: "School Psychology",
  VERSION: "1.0.0",
  API_BASE_URL: "http://100.113.96.41:8080",
  ANDROID_API_URL: "http://10.0.2.2:8080",
};

// Main constants
export * from "./index";

// Survey constants
export * from "./survey";

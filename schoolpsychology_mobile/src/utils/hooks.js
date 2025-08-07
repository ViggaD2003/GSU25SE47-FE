import { useState, useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import {
  isLogoutInProgress,
  performLogout,
} from "../services/auth/tokenManager";
import { AUTH_ERRORS } from "../constants";
import { useRealTime } from "../contexts/RealTimeContext";
import { useAuth } from "../contexts/AuthContext";
import NotificationAPI from "../services/api/NotificationService";

/**
 * Custom hook for handling authentication errors
 */
export const useAuthError = () => {
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleError = useCallback((err) => {
    let message = "An error occurred";
    let fieldErrors = {};

    if (err.response?.data) {
      const data = err.response.data;

      if (typeof data === "string") {
        message = data;
      } else if (typeof data === "object") {
        // Handle field-specific errors
        if (data.errors || data.fieldErrors) {
          fieldErrors = data.errors || data.fieldErrors;
        }
        message = data.message || data.error || message;
      }
    } else if (err.message) {
      message = err.message;
    }

    setError(message);
    setFieldErrors(fieldErrors);

    // Show alert for critical errors
    if (err.response?.status >= 500) {
      Alert.alert("Server Error", "Please try again later.");
    }

    return { message, fieldErrors };
  }, []);

  const clearError = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  return {
    error,
    fieldErrors,
    handleError,
    clearError,
    setError,
    setFieldErrors,
  };
};

/**
 * Custom hook for handling loading states
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
  };
};

/**
 * Custom hook for handling form data
 */
export const useForm = (initialData = {}) => {
  const [formData, setFormData] = useState(initialData);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateForm = useCallback((newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, [initialData]);

  return {
    formData,
    setFormData,
    updateField,
    updateForm,
    resetForm,
  };
};

// Hook để xử lý token errors và logout tự động
export const useTokenErrorHandler = (logoutFunction) => {
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const isHandlingErrorRef = useRef(false);

  const handleTokenError = useCallback(
    async (error, forceLogout = false) => {
      try {
        // Prevent multiple simultaneous error handling
        if (isHandlingErrorRef.current && !forceLogout) {
          console.log("Token error handling already in progress");
          return;
        }

        isHandlingErrorRef.current = true;

        // Check if logout is already in progress
        if (isLogoutInProgress()) {
          console.log("Logout already in progress, skipping error handling");
          return;
        }

        const currentTime = Date.now();
        const timeSinceLastError = currentTime - lastErrorTimeRef.current;

        // Reset error count if more than 5 minutes have passed
        if (timeSinceLastError > 5 * 60 * 1000) {
          errorCountRef.current = 0;
        }

        errorCountRef.current++;
        lastErrorTimeRef.current = currentTime;

        console.log(
          `Token error detected (count: ${errorCountRef.current}):`,
          error
        );

        // Check if this is a token-related error
        const isTokenError =
          error?.message?.includes("401") ||
          error?.message?.includes("403") ||
          error?.message?.includes("Unauthorized") ||
          error?.message?.includes("Forbidden") ||
          error?.message?.includes("TOKEN_EXPIRED") ||
          error?.message?.includes("REFRESH_FAILED") ||
          error?.message?.includes("INVALID_TOKEN") ||
          error?.response?.status === 401 ||
          error?.response?.status === 403;

        if (isTokenError || forceLogout) {
          console.log("Token error confirmed, initiating logout");

          // If too many errors in short time, force logout
          if (errorCountRef.current >= 3 || forceLogout) {
            console.log("Multiple token errors detected, forcing logout");

            // Use performLogout directly to avoid context loops
            await performLogout(true);

            // Reset error count
            errorCountRef.current = 0;
          } else {
            // Try normal logout first
            if (logoutFunction) {
              await logoutFunction();
            } else {
              await performLogout(true);
            }
          }
        }
      } catch (handleError) {
        console.error("Error in token error handler:", handleError);

        // Force logout as last resort
        try {
          await performLogout(true);
        } catch (finalError) {
          console.error("Final logout attempt failed:", finalError);
        }
      } finally {
        isHandlingErrorRef.current = false;
      }
    },
    [logoutFunction]
  );

  // Reset error count when component unmounts or user changes
  const resetErrorCount = useCallback(() => {
    errorCountRef.current = 0;
    lastErrorTimeRef.current = 0;
    isHandlingErrorRef.current = false;
  }, []);

  return {
    handleTokenError,
    resetErrorCount,
    errorCount: errorCountRef.current,
  };
};

// Hook để theo dõi trạng thái authentication
export const useAuthStatus = (user, loading, isAuthenticated) => {
  const prevAuthStatusRef = useRef(null);

  useEffect(() => {
    const currentAuthStatus = isAuthenticated;

    if (
      prevAuthStatusRef.current !== null &&
      prevAuthStatusRef.current !== currentAuthStatus
    ) {
      console.log(
        `Auth status changed: ${prevAuthStatusRef.current} -> ${currentAuthStatus}`
      );
    }

    prevAuthStatusRef.current = currentAuthStatus;
  }, [isAuthenticated]);

  return {
    isAuthenticated,
    user,
    loading,
    hasUser: !!user,
  };
};

// Hook để xử lý API calls với token error handling
export const useApiCall = (handleTokenError) => {
  const makeApiCall = useCallback(
    async (apiFunction, ...args) => {
      try {
        return await apiFunction(...args);
      } catch (error) {
        console.error("API call error:", error);

        // Handle token errors automatically
        if (handleTokenError) {
          await handleTokenError(error);
        }

        // Re-throw the error for component handling
        throw error;
      }
    },
    [handleTokenError]
  );

  return { makeApiCall };
};

/**
 * Custom hook for handling notifications
 */
export const useNotifications = () => {
  const { user } = useAuth();
  const { notificationCount, clearNotificationCount } = useRealTime();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await NotificationAPI.getAllNotifications(user.id);

      if (data && Array.isArray(data)) {
        setNotifications(data);
        setTotalCount(data.length);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        // Update local state immediately for better UX
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // TODO: Add API call to mark as read on server
        // await NotificationAPI.markAsRead(notificationId);
      } catch (err) {
        console.error("Error marking notification as read:", err);
        // Revert local state on error
        fetchNotifications();
      }
    },
    [fetchNotifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      clearNotificationCount();

      // TODO: Add API call to mark all as read on server
      // await NotificationAPI.markAllAsRead();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      fetchNotifications();
    }
  }, [clearNotificationCount, fetchNotifications]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  // Auto-fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  // Update unread count when notificationCount changes from RealTimeContext
  useEffect(() => {
    if (notificationCount > 0) {
      setUnreadCount((prev) => prev + notificationCount);
    }
  }, [notificationCount]);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    totalCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};

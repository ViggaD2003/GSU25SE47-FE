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

        // Special handling for 403 errors
        if (error?.response?.status === 403) {
          console.log(
            "403 Forbidden error detected, attempting token refresh..."
          );

          try {
            // Import refreshAccessToken dynamically to avoid circular dependencies
            const { refreshAccessToken } = await import(
              "../services/auth/authActions"
            );
            const newToken = await refreshAccessToken();

            if (newToken) {
              console.log("Token refresh successful after 403, error handled");
              // Reset error count since refresh was successful
              errorCountRef.current = 0;
              return;
            } else {
              throw new Error("No token received after refresh");
            }
          } catch (refreshError) {
            console.warn("Token refresh failed after 403:", refreshError);
            console.log("Performing logout due to refresh failure after 403");

            // Force logout after refresh failure
            if (logoutFunction) {
              await logoutFunction();
            } else {
              const { performLogout } = await import(
                "../services/auth/tokenManager"
              );
              await performLogout(true);
            }

            // Reset error count
            errorCountRef.current = 0;
            return;
          }
        }

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
        console.warn("Error in token error handler:", handleError);

        // Force logout as last resort
        try {
          await performLogout(true);
        } catch (finalError) {
          console.warn("Final logout attempt failed:", finalError);
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
        console.warn("API call error:", error);

        // Handle 403 errors with refresh token logic
        if (error?.response?.status === 403) {
          console.log(
            "403 error detected in useApiCall, attempting token refresh..."
          );

          try {
            // Import refreshAccessToken dynamically to avoid circular dependencies
            const { refreshAccessToken } = await import(
              "../services/auth/authActions"
            );
            const newToken = await refreshAccessToken();

            if (newToken) {
              console.log(
                "Token refresh successful in useApiCall, retrying API call..."
              );
              // Retry the API call with new token
              return await apiFunction(...args);
            } else {
              throw new Error("No token received after refresh");
            }
          } catch (refreshError) {
            console.warn("Token refresh failed in useApiCall:", refreshError);
            console.log(
              "Performing logout due to refresh failure in useApiCall"
            );

            // Force logout after refresh failure
            try {
              const { performLogout } = await import(
                "../services/auth/tokenManager"
              );
              await performLogout(true);
            } catch (logoutError) {
              console.warn("Logout failed in useApiCall:", logoutError);
            }

            // Re-throw the error for component handling
            throw error;
          }
        }

        // Handle other token errors automatically
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
  // const { notificationCount, clearNotificationCount } = useRealTime();

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
      console.warn("Error fetching notifications:", err);
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        const res = await NotificationAPI.readNotification(notificationId);
        console.log(res);

        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // TODO: Add API call to mark as read on server
        // await NotificationAPI.markAsRead(notificationId);
      } catch (err) {
        console.warn("Error marking notification as read:", err);
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
      // clearNotificationCount();

      // TODO: Add API call to mark all as read on server
      // await NotificationAPI.markAllAsRead();
    } catch (err) {
      console.warn("Error marking all notifications as read:", err);
      fetchNotifications();
    }
  }, [fetchNotifications]);

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
  // useEffect(() => {
  //   if (notificationCount > 0) {
  //     setUnreadCount((prev) => prev + notificationCount);
  //   }
  // }, [notificationCount]);

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

// Hook để xử lý lỗi server
export const useServerErrorHandler = () => {
  const [serverError, setServerError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  const handleServerError = useCallback(
    async (error, showNotification = true) => {
      const { status } = error.response || {};

      let errorMessage = "Đã xảy ra lỗi không xác định";
      let errorTitle = "Lỗi";
      let toastType = "error";

      // Special handling for 403 Forbidden errors
      if (status === 403) {
        console.log("403 Forbidden error detected in server error handler");

        try {
          // Import refreshAccessToken dynamically to avoid circular dependencies
          const { refreshAccessToken } = await import(
            "../services/auth/authActions"
          );
          const newToken = await refreshAccessToken();

          if (newToken) {
            console.log(
              "Token refresh successful after 403, retrying operation"
            );
            // Return success to indicate retry should be attempted
            return {
              title: "Token Refreshed",
              message: "Token has been refreshed, please retry the operation",
              shouldRetry: true,
              status: 403,
            };
          } else {
            throw new Error("No token received after refresh");
          }
        } catch (refreshError) {
          console.warn("Token refresh failed after 403:", refreshError);
          console.log("Performing logout due to refresh failure after 403");

          // Force logout after refresh failure
          try {
            const { performLogout } = await import(
              "../services/auth/tokenManager"
            );
            await performLogout(true);
          } catch (logoutError) {
            console.warn(
              "Logout failed after 403 refresh failure:",
              logoutError
            );
          }

          errorTitle = "Phiên đăng nhập hết hạn";
          errorMessage = "Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.";
          toastType = "auth-error";
        }
      } else {
        switch (status) {
          case 502:
            errorTitle = "Lỗi kết nối server";
            errorMessage =
              "Server hiện tại không khả dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
            toastType = "server-error";
            break;
          case 503:
            errorTitle = "Dịch vụ tạm thời không khả dụng";
            errorMessage = "Server đang bảo trì. Vui lòng thử lại sau.";
            toastType = "server-error";
            break;
          case 504:
            errorTitle = "Lỗi timeout";
            errorMessage = "Server phản hồi quá chậm. Vui lòng thử lại sau.";
            toastType = "server-error";
            break;
          default:
            if (error.message) {
              errorMessage = error.message;
            }
        }
      }

      setServerError({ title: errorTitle, message: errorMessage });

      if (showNotification) {
        // Sử dụng Toast thay vì Alert
        setToastMessage(errorMessage);
        setToastType(toastType);
        setShowToast(true);
      }

      return { title: errorTitle, message: errorMessage, status };
    },
    []
  );

  const clearServerError = useCallback(() => {
    setServerError(null);
  }, []);

  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    serverError,
    handleServerError,
    clearServerError,
    // Toast props
    showToast,
    toastMessage,
    toastType,
    hideToast,
  };
};

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRealTime } from "../contexts/RealTimeContext";
import NotificationAPI from "../services/api/NotificationService";

// Notification types enum
export const NOTIFICATION_TYPES = {
  APPOINTMENT: "APPOINTMENT",
  SURVEY: "SURVEY",
  PROGRAM: "PROGRAM",
  CASE: "CASE",
  MESSAGE: "MESSAGE",
  SYSTEM: "SYSTEM",
};

export const useNotifications = () => {
  const { user } = useAuth();
  const {
    isWebSocketConnected,
    sendMessage,
    registerMessageHandler,
    registerNotificationHandler,
    scheduleNotification,
    clearNotificationCount,
  } = useRealTime();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  const registeredHandlersRef = useRef(new Set());

  // Memoized notification data with computed properties
  const notificationData = useMemo(() => {
    return notifications.map((notification) => ({
      ...notification,
      timeAgo: getTimeAgo(notification.createdAt),
      isNew: !notification.isRead,
      typeIcon: getNotificationIcon(notification.notificationType),
      typeColor: getNotificationColor(notification.notificationType),
      // Add notification_type based on notificationType
      notification_type: getNotificationType(notification.notificationType),
    }));
  }, [notifications]);

  // Get time ago string using native JavaScript
  const getTimeAgo = useCallback((dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    // Format date using native JavaScript
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Get notification icon
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "CASE":
        return "folder";
      case "APPOINTMENT":
        return "event";
      case "SURVEY":
        return "assignment";
      case "PROGRAM":
        return "school";
      case "MESSAGE":
        return "message";
      default:
        return "notifications";
    }
  }, []);

  // Get notification color
  const getNotificationColor = useCallback((type) => {
    switch (type) {
      case "CASE":
        return "#007AFF";
      case "APPOINTMENT":
        return "#28a745";
      case "SURVEY":
        return "#ffc107";
      case "PROGRAM":
        return "#6f42c1";
      case "MESSAGE":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  }, []);

  // Get notification_type from notificationType
  const getNotificationType = useCallback((notificationType) => {
    switch (notificationType) {
      case "APPOINTMENT":
        return NOTIFICATION_TYPES.APPOINTMENT;
      case "SURVEY":
        return NOTIFICATION_TYPES.SURVEY;
      case "PROGRAM":
        return NOTIFICATION_TYPES.PROGRAM;
      case "CASE":
        return NOTIFICATION_TYPES.CASE;
      case "MESSAGE":
        return NOTIFICATION_TYPES.MESSAGE;
      default:
        return NOTIFICATION_TYPES.SYSTEM;
    }
  }, []);

  // Send message with automatic retry (from useRealTimeFeatures)
  const sendMessageWithRetry = useCallback(
    async (messageOptions, maxRetries = 3) => {
      let retries = 0;

      const attemptSend = async () => {
        try {
          if (isWebSocketConnected) {
            return sendMessage(messageOptions);
          } else {
            throw new Error("WebSocket not connected");
          }
        } catch (error) {
          retries++;
          if (retries < maxRetries) {
            console.log(
              `useNotifications: Retrying message send (${retries}/${maxRetries})`
            );
            await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
            return attemptSend();
          } else {
            console.error(
              "useNotifications: Failed to send message after retries:",
              error
            );
            throw error;
          }
        }
      };

      return attemptSend();
    },
    [isWebSocketConnected, sendMessage]
  );

  // Register message handler with cleanup (from useRealTimeFeatures)
  const registerMessageHandlerWithCleanup = useCallback(
    (type, handler) => {
      const unsubscribe = registerMessageHandler(type, handler);
      registeredHandlersRef.current.add(unsubscribe);
      return unsubscribe;
    },
    [registerMessageHandler]
  );

  // Register notification handler with cleanup (from useRealTimeFeatures)
  const registerNotificationHandlerWithCleanup = useCallback(
    (handler) => {
      const unsubscribe = registerNotificationHandler(handler);
      registeredHandlersRef.current.add(unsubscribe);
      return unsubscribe;
    },
    [registerNotificationHandler]
  );

  // Schedule notification with error handling (from useRealTimeFeatures)
  const scheduleNotificationWithErrorHandling = useCallback(
    async (options) => {
      try {
        return await scheduleNotification(options);
      } catch (error) {
        console.error(
          "useNotifications: Error scheduling notification:",
          error
        );
        throw error;
      }
    },
    [scheduleNotification]
  );

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (!user?.id) return;

        setLoading(true);
        const response = await NotificationAPI.getAllNotifications(
          user.id,
          pageNum
        );
        const newNotifications = response.data || response || [];

        if (isRefresh) {
          setNotifications(newNotifications);
          setPage(1);
        } else {
          setNotifications((prev) =>
            pageNum === 1 ? newNotifications : [...prev, ...newNotifications]
          );
        }

        setHasMore(newNotifications.length > 0);
        setUnreadCount(newNotifications.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  // Refresh notifications
  const refresh = useCallback(() => {
    setRefreshing(true);
    return fetchNotifications(1, true);
  }, [fetchNotifications]);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      return fetchNotifications(nextPage);
    }
  }, [loading, hasMore, refreshing, page, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Send to server via WebSocket
        if (isWebSocketConnected) {
          sendMessageWithRetry({
            type: "notification_read",
            payload: { notificationId },
            destination: "/app/notification/read",
            title: "Notification Read",
            content: "Notification marked as read",
            username: user?.fullName || "System",
          });
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
      }
    },
    [isWebSocketConnected, sendMessageWithRetry, user?.fullName]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      setUnreadCount(0);

      // Send to server via WebSocket
      if (isWebSocketConnected) {
        sendMessageWithRetry({
          type: "notifications_all_read",
          payload: { userId: user?.id },
          destination: "/app/notifications/read-all",
          title: "All Notifications Read",
          content: "All notifications marked as read",
          username: user?.fullName || "System",
        });
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }, [isWebSocketConnected, sendMessageWithRetry, user?.id, user?.fullName]);

  // Handle new notification from WebSocket
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Business logic methods (from useRealTimeFeatures)
  const sendAppointmentUpdate = useCallback(
    (appointmentId, status, message) => {
      return sendMessageWithRetry({
        type: "appointment_update",
        payload: {
          appointmentId,
          status,
          message,
          timestamp: new Date().toISOString(),
        },
        destination: "/app/appointment",
        title: "Appointment Update",
        content:
          message || `Your appointment status has been updated to ${status}`,
        username: user?.fullName || "System",
      });
    },
    [sendMessageWithRetry, user?.fullName]
  );

  const sendSurveyCompletion = useCallback(
    (surveyId, score, answers) => {
      return sendMessageWithRetry({
        type: "survey_completed",
        payload: {
          surveyId,
          score,
          answers,
          timestamp: new Date().toISOString(),
        },
        destination: "/app/survey",
        title: "Survey Completed",
        content: `Survey completed with score: ${score}`,
        username: user?.fullName || "System",
      });
    },
    [sendMessageWithRetry, user?.fullName]
  );

  const sendProgramUpdate = useCallback(
    (programId, status, message) => {
      return sendMessageWithRetry({
        type: "program_update",
        payload: {
          programId,
          status,
          message,
          timestamp: new Date().toISOString(),
        },
        destination: "/app/program",
        title: "Program Update",
        content: message || `Your program status has been updated to ${status}`,
        username: user?.fullName || "System",
      });
    },
    [sendMessageWithRetry, user?.fullName]
  );

  const sendUserActivity = useCallback(
    (activity, data = {}) => {
      return sendMessageWithRetry({
        type: "user_activity",
        payload: {
          activity,
          data,
          timestamp: new Date().toISOString(),
        },
        destination: "/app/activity",
        title: "User Activity",
        content: `User performed: ${activity}`,
        username: user?.fullName || "System",
      });
    },
    [sendMessageWithRetry, user?.fullName]
  );

  const testWebSocketConnection = useCallback(() => {
    return sendMessageWithRetry({
      type: "ping",
      payload: { timestamp: Date.now() },
      destination: "/app/ping",
      title: "Connection Test",
      content: "Testing WebSocket connection",
      username: "System",
    });
  }, [sendMessageWithRetry]);

  // Cleanup all registered handlers (from useRealTimeFeatures)
  const cleanup = useCallback(() => {
    registeredHandlersRef.current.forEach((unsubscribe) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error("useNotifications: Error during cleanup:", error);
      }
    });
    registeredHandlersRef.current.clear();
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (isWebSocketConnected && user?.id) {
      const unsubscribe = registerMessageHandlerWithCleanup(
        "new_notification",
        handleNewNotification
      );

      // Subscribe to notifications
      sendMessageWithRetry({
        type: "subscribe_notifications",
        payload: { userId: user.id },
        destination: "/app/notifications/subscribe",
        title: "Subscribe to Notifications",
        content: "Subscribing to real-time notifications",
        username: user.fullName || "System",
      });

      return unsubscribe;
    }
  }, [
    isWebSocketConnected,
    user?.id,
    user?.fullName,
    registerMessageHandlerWithCleanup,
    sendMessageWithRetry,
    handleNewNotification,
  ]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // Data
    notifications: notificationData,
    unreadCount,

    // Loading states
    loading,
    refreshing,
    hasMore,

    // Actions
    fetchNotifications,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,

    // Utilities
    getTimeAgo,
    getNotificationIcon,
    getNotificationColor,
    getNotificationType,

    // Real-time features (merged from useRealTimeFeatures)
    sendMessageWithRetry,
    registerMessageHandlerWithCleanup,
    registerNotificationHandlerWithCleanup,
    scheduleNotificationWithErrorHandling,

    // Business logic methods
    sendAppointmentUpdate,
    sendSurveyCompletion,
    sendProgramUpdate,
    sendUserActivity,
    testWebSocketConnection,

    // Cleanup
    cleanup,

    // Constants
    NOTIFICATION_TYPES,
  };
};

export default useNotifications;

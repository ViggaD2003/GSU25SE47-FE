import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import webSocketService from "../services/websocket/WebSocketService";
import notificationService from "../services/notifications/NotificationService";
import { getAccessToken } from "../services/auth/tokenManager";

const RealTimeContext = createContext();

export const RealTimeProvider = ({ children }) => {
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isNotificationInitialized, setIsNotificationInitialized] =
    useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const messageHandlersRef = useRef(new Map());
  const notificationHandlersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const navigationRef = useRef(null);

  // Set navigation ref (called from App.js)
  const setNavigationRef = useCallback((ref) => {
    navigationRef.current = ref;
  }, []);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.log(
          "RealTimeContext: No token available for WebSocket connection"
        );
        return;
      }

      await webSocketService.connect(token);
    } catch (error) {
      console.error("RealTimeContext: Error initializing WebSocket:", error);
    }
  }, []);

  // Initialize notifications
  const initializeNotifications = useCallback(async () => {
    try {
      const success = await notificationService.initialize();
      setIsNotificationInitialized(success);

      if (success) {
        notificationService.setNotificationCallbacks(
          handleNotificationReceived,
          handleNotificationResponse
        );
      }
    } catch (error) {
      console.error(
        "RealTimeContext: Error initializing notifications:",
        error
      );
    }
  }, []);

  // Handle WebSocket connection status changes
  const handleWebSocketConnectionChange = useCallback(
    (status, error) => {
      console.log("RealTimeContext: WebSocket status changed:", status);
      setConnectionStatus(status);
      setIsWebSocketConnected(status === "connected");

      if (status === "connected") {
        console.log(
          "RealTimeContext: WebSocket connected, notification count will be managed by initial fetch"
        );
        // Don't reset notification count here - let the initial fetch handle it
        // setNotificationCount(0);

        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      } else if (status === "disconnected" && !reconnectTimeoutRef.current) {
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("RealTimeContext: Attempting to reconnect...");
          initializeWebSocket();
        }, 5000);
      }
    },
    [initializeWebSocket]
  );

  // Unified message handler
  const handleWebSocketMessage = useCallback((type, payload) => {
    console.log("RealTimeContext: WebSocket message received:", {
      type,
      payload,
    });
    setLastMessage({ type, payload, timestamp: Date.now() });

    // Handle specific message types
    switch (type) {
      case "notification":
        handleNotificationMessage(payload);
        break;
      case "appointment_update":
        handleAppointmentUpdate(payload);
        break;
      case "survey_reminder":
        handleSurveyReminder(payload);
        break;
      case "case_update":
        handleCaseUpdate(payload);
        break;
      case "pong":
        // Heartbeat response - no action needed
        break;
      default:
        // Call registered message handlers
        if (messageHandlersRef.current.has(type)) {
          messageHandlersRef.current.get(type)(payload);
        }
    }
  }, []);

  // Handle notification messages from WebSocket
  const handleNotificationMessage = useCallback((payload) => {
    const { title, body, data, type } = payload;

    console.log("RealTimeContext: Received notification via WebSocket:", {
      title,
      body,
      type,
    });

    // Don't increment count here - let useNotifications handle it
    // setNotificationCount((prev) => prev + 1);

    notificationService.scheduleLocalNotification({
      title,
      body,
      data: { ...data, source: "websocket", type },
      trigger: null,
    });
  }, []);

  // Handle appointment updates
  const handleAppointmentUpdate = useCallback((payload) => {
    const { appointmentId, status, message } = payload;

    notificationService.scheduleLocalNotification({
      title: "Appointment Update",
      body: message || `Your appointment status has been updated to ${status}`,
      data: {
        screen: "AppointmentDetails",
        params: { appointmentId },
        source: "websocket",
        type: "appointment_update",
      },
    });

    // Don't increment count here - let useNotifications handle it
    // setNotificationCount((prev) => prev + 1);
  }, []);

  // Handle survey reminders
  const handleSurveyReminder = useCallback((payload) => {
    const { surveyId, title, message } = payload;

    notificationService.scheduleLocalNotification({
      title: "Survey Reminder",
      body: message || "You have a pending survey to complete",
      data: {
        screen: "SurveyTaking",
        params: { surveyId },
        source: "websocket",
        type: "survey_reminder",
      },
    });

    // Don't increment count here - let useNotifications handle it
    // setNotificationCount((prev) => prev + 1);
  }, []);

  // Handle case updates
  const handleCaseUpdate = useCallback((payload) => {
    const { caseId, title, message } = payload;

    notificationService.scheduleLocalNotification({
      title: "Case Update",
      body: message || "You have a new case update",
      data: {
        screen: "CaseDetails",
        params: { caseId },
        source: "websocket",
        type: "case_update",
      },
    });

    // Don't increment count here - let useNotifications handle it
    // setNotificationCount((prev) => prev + 1);
  }, []);

  // Handle notification received (from expo-notifications)
  const handleNotificationReceived = useCallback((notification) => {
    const { title, body, data } = notification.request.content;
    console.log("RealTimeContext: Notification received:", {
      title,
      body,
      data,
    });

    notificationHandlersRef.current.forEach((handler) => {
      try {
        handler(notification);
      } catch (error) {
        console.error("RealTimeContext: Error in notification handler:", error);
      }
    });
  }, []);

  // Handle notification response (user tap)
  const handleNotificationResponse = useCallback((response) => {
    const { data } = response.notification.request.content;

    if (data?.screen && navigationRef.current) {
      try {
        navigationRef.current.navigate(data.screen, data.params);
      } catch (error) {
        console.error("RealTimeContext: Navigation error:", error);
      }
    }

    setNotificationCount(0);
  }, []);

  // Send WebSocket message with structured parameters
  const sendMessage = useCallback(
    ({
      type = "message",
      payload = {},
      destination = "/app/send",
      title = "Notification",
      content = "You have a new message",
      username = "system",
      timestamp = new Date().toISOString(),
    }) => {
      try {
        return webSocketService.sendMessage({
          type,
          payload,
          destination,
          title,
          content,
          username,
          timestamp,
        });
      } catch (error) {
        console.error("RealTimeContext: Error sending message:", error);
        throw error;
      }
    },
    []
  );

  // Register message handler
  const registerMessageHandler = useCallback((type, handler) => {
    messageHandlersRef.current.set(type, handler);
    webSocketService.onMessage(type, handler);

    return () => {
      messageHandlersRef.current.delete(type);
    };
  }, []);

  // Register notification handler
  const registerNotificationHandler = useCallback((handler) => {
    const id = Date.now() + Math.random();
    notificationHandlersRef.current.set(id, handler);

    return () => {
      notificationHandlersRef.current.delete(id);
    };
  }, []);

  // Schedule local notification
  const scheduleNotification = useCallback(async (options) => {
    try {
      return await notificationService.scheduleLocalNotification(options);
    } catch (error) {
      console.error("RealTimeContext: Error scheduling notification:", error);
      throw error;
    }
  }, []);

  // Get WebSocket connection status
  const getWebSocketStatus = useCallback(() => {
    return webSocketService.getConnectionStatus();
  }, []);

  // Get push token
  const getPushToken = useCallback(() => {
    return notificationService.getPushToken();
  }, []);

  // Clear notification count
  const clearNotificationCount = useCallback(() => {
    setNotificationCount(0);
  }, []);

  // Reset notification count on app start
  const resetNotificationCount = useCallback(() => {
    console.log("RealTimeContext: Resetting notification count on app start");
    setNotificationCount(0);
  }, []);

  // Initialize services on mount
  useEffect(() => {
    const initializeServices = async () => {
      // Reset notification count on app start
      resetNotificationCount();

      await initializeNotifications();
      await initializeWebSocket();
    };

    initializeServices();

    // Set up WebSocket connection listener
    const connectionUnsubscribe = webSocketService.onConnectionChange(
      handleWebSocketConnectionChange
    );

    // Set up WebSocket message handlers
    const messageUnsubscribes = [
      webSocketService.onMessage("notification", (payload) =>
        handleWebSocketMessage("notification", payload)
      ),
      webSocketService.onMessage("appointment_update", (payload) =>
        handleWebSocketMessage("appointment_update", payload)
      ),
      webSocketService.onMessage("survey_reminder", (payload) =>
        handleWebSocketMessage("survey_reminder", payload)
      ),
      webSocketService.onMessage("case_update", (payload) =>
        handleWebSocketMessage("case_update", payload)
      ),
    ];

    // Cleanup on unmount
    return () => {
      connectionUnsubscribe();
      messageUnsubscribes.forEach((unsubscribe) => unsubscribe());

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      webSocketService.disconnect();
      notificationService.cleanup();
    };
  }, [
    initializeWebSocket,
    initializeNotifications,
    handleWebSocketConnectionChange,
    handleWebSocketMessage,
    resetNotificationCount,
  ]);

  const value = {
    // WebSocket
    isWebSocketConnected,
    connectionStatus,
    sendMessage,
    registerMessageHandler,
    getWebSocketStatus,

    // Notifications
    isNotificationInitialized,
    notificationCount,
    setNotificationCount, // Add this to allow external updates
    scheduleNotification,
    registerNotificationHandler,
    getPushToken,
    clearNotificationCount,
    resetNotificationCount,

    // Navigation
    setNavigationRef,

    // General
    lastMessage,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};

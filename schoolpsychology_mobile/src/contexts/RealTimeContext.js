import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { APP_CONFIG } from "../constants";
import { Client } from "@stomp/stompjs";

const RealTimeContext = createContext(null);

export const RealTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.token;

  console.log("🔧 RealTimeProvider render - Token:", !!token, "User:", !!user);

  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Refs for stable references
  const clientRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const mountedRef = useRef(true);
  const tokenRef = useRef(token);
  const stateUpdateScheduled = useRef(false);

  // Device info - computed once
  const deviceInfo = useMemo(
    () => ({
      isRealDevice: Device.isDevice,
      isExpoGo: Constants?.appOwnership === "expo",
    }),
    []
  );

  // Token ref update
  useEffect(() => {
    console.log("🔄 Token changed:", !!token, "Previous:", !!tokenRef.current);
    tokenRef.current = token;
  }, [token]);

  // Component mount/unmount tracking
  useEffect(() => {
    console.log("🚀 RealTimeProvider mounted");
    mountedRef.current = true;
    return () => {
      console.log("💀 RealTimeProvider unmounting");
      mountedRef.current = false;
      // Cleanup on unmount
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {}
        clientRef.current = null;
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
    };
  }, []);

  // Batched state updates to prevent excessive re-renders
  const batchedSetState = useCallback((updates) => {
    if (!mountedRef.current || stateUpdateScheduled.current) return;

    stateUpdateScheduled.current = true;

    // Use React's automatic batching
    Promise.resolve().then(() => {
      if (mountedRef.current) {
        if (updates.isConnected !== undefined)
          setIsConnected(updates.isConnected);
        if (updates.isConnecting !== undefined)
          setIsConnecting(updates.isConnecting);
        if (updates.error !== undefined) setError(updates.error);
        if (updates.lastMessage !== undefined)
          setLastMessage(updates.lastMessage);
        if (updates.notificationCount !== undefined)
          setNotificationCount(updates.notificationCount);
        if (updates.notifications !== undefined)
          setNotifications(updates.notifications);
      }
      stateUpdateScheduled.current = false;
    });
  }, []);

  // Utility functions - memoized
  const isConnectionReady = useCallback(() => {
    const ready = isConnected && clientRef.current?.connected;
    console.log(
      "🔍 Connection ready check:",
      ready,
      "isConnected:",
      isConnected,
      "clientConnected:",
      clientRef.current?.connected
    );
    return ready;
  }, [isConnected]);

  const resetNotificationCount = useCallback(async () => {
    if (!mountedRef.current) return;

    console.log("🔄 Resetting notification count");
    setNotificationCount(0);

    try {
      if (!deviceInfo.isExpoGo && deviceInfo.isRealDevice) {
        await Notifications.setBadgeCountAsync(0);
      }
    } catch (err) {
      // Silent fail
    }
  }, [deviceInfo.isExpoGo, deviceInfo.isRealDevice]);

  const showLocalNotification = useCallback(
    async (title, content) => {
      if (
        !deviceInfo.isRealDevice ||
        deviceInfo.isExpoGo ||
        !title ||
        !content
      ) {
        return;
      }

      console.log("📱 Showing local notification:", { title, content });

      try {
        await Notifications.scheduleNotificationAsync({
          content: { title, body: content, sound: true },
          trigger: null,
        });
      } catch (err) {
        console.error("❌ Failed to show local notification:", err);
      }
    },
    [deviceInfo.isRealDevice, deviceInfo.isExpoGo]
  );

  const addMessageHandler = useCallback((type, callback) => {
    if (!type || typeof callback !== "function") {
      return null;
    }

    console.log("➕ Adding message handler for type:", type);
    // Don't check connection ready here to avoid circular dependency
    messageHandlersRef.current.set(type, callback);

    return () => {
      if (messageHandlersRef.current.has(type)) {
        console.log("➖ Removing message handler for type:", type);
        messageHandlersRef.current.delete(type);
      }
    };
  }, []);

  // Message handler - optimized
  const handleNotificationMessage = useCallback(
    (message) => {
      if (!message?.body || !mountedRef.current) return;

      console.log("📨 Received notification message:", message);

      try {
        const body = JSON.parse(message.body);
        const timestamp = Date.now();
        const currentTime = new Date(timestamp);

        const notification = {
          ...body,
          createdAt: currentTime.toISOString(),
          updatedAt: currentTime.toISOString(),
        };

        console.log("📝 Processed notification:", notification);

        // Batch state updates
        setNotifications((prev) => [notification, ...prev]);
        setLastMessage({
          topic: "/user/queue/notifications",
          data: body,
          timestamp,
        });
        setNotificationCount((count) => count + 1);

        // Show local notification
        if (body?.title && body?.content) {
          showLocalNotification(body.title, body.content);
        }
      } catch (err) {
        console.error("❌ Error parsing notification message:", err);
      }
    },
    [showLocalNotification]
  );

  // Connection management - stable
  const connectToServer = useCallback(() => {
    const currentToken = tokenRef.current;

    if (!currentToken || !mountedRef.current) {
      console.log("❌ Cannot connect: no token or not mounted");
      return;
    }

    // Prevent multiple concurrent connections
    if (isConnecting || isConnected) {
      console.log(
        "⚠️ Already connecting or connected, skipping connection attempt"
      );
      return;
    }

    console.log("🔌 Attempting to connect to STOMP server...");
    setIsConnecting(true);

    try {
      // Cleanup existing client
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {}
        clientRef.current = null;
      }

      const client = new Client({
        brokerURL: APP_CONFIG.WEBSOCKET_URL,
        connectHeaders: {
          Authorization: `Bearer ${currentToken}`,
        },
        debug: () => {}, // Silent debug
        reconnectDelay: 0, // Manual reconnection control
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: (frame) => {
          if (!mountedRef.current) return;

          console.log("✅ STOMP connected successfully:", frame);
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);

          // Subscribe to notifications
          try {
            client.subscribe(
              "/user/queue/notifications",
              handleNotificationMessage
            );
            console.log("📡 Subscribed to notifications queue");
          } catch (subscribeError) {
            console.warn(
              "❌ Failed to subscribe to notifications:",
              subscribeError
            );
          }
        },

        onStompError: (frame) => {
          if (!mountedRef.current) return;

          const errorMessage =
            frame.headers?.message || "STOMP connection error";
          console.error("❌ STOMP error:", frame);
          setError(new Error(errorMessage));
          setIsConnecting(false);
          setIsConnected(false);
        },

        onWebSocketError: (event) => {
          if (!mountedRef.current) return;

          console.error("❌ WebSocket error:", event);
          setError(new Error("WebSocket connection error"));
          setIsConnecting(false);
          setIsConnected(false);
        },

        onWebSocketClose: (event) => {
          if (!mountedRef.current) return;

          console.log("🔌 WebSocket closed:", event.code, event.reason);
          setIsConnected(false);
          setIsConnecting(false);

          // Auto reconnect for unexpected closures
          if (event.code !== 1000 && tokenRef.current && mountedRef.current) {
            console.log("🔄 Scheduling auto-reconnect in 5 seconds...");
            reconnectTimeout.current = setTimeout(() => {
              if (mountedRef.current && tokenRef.current) {
                console.log("🔄 Auto-reconnecting...");
                connectToServer();
              }
            }, 5000);
          }
        },

        onDisconnect: () => {
          if (!mountedRef.current) return;

          console.log("🔌 STOMP disconnected");
          setIsConnected(false);
          setIsConnecting(false);
        },
      });

      clientRef.current = client;
      console.log("🚀 Activating STOMP client...");
      client.activate();
    } catch (err) {
      console.error("❌ Error creating STOMP client:", err);
      if (mountedRef.current) {
        setError(err);
        setIsConnecting(false);
        setIsConnected(false);
      }
    }
  }, []); // No dependencies to avoid re-creation

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting from server...");

    // Clear reconnect timeout
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    // Clear message handlers
    messageHandlersRef.current.clear();

    // Deactivate client
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (e) {}
      clientRef.current = null;
    }

    // Update state if mounted
    if (mountedRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  const sendMessage = useCallback(
    async (messageData) => {
      if (!isConnectionReady() || !messageData) {
        console.log("❌ Cannot send message: not connected or invalid data");
        throw new Error("Not connected or invalid message data");
      }

      console.log("📤 Sending message:", messageData);

      try {
        const { destination = "/app/send", ...data } = messageData;

        clientRef.current.publish({
          destination,
          body: JSON.stringify(data),
          headers: {},
        });

        console.log("✅ Message sent successfully to:", destination);
        return Promise.resolve();
      } catch (err) {
        console.error("❌ Failed to send message:", err);
        throw new Error(`Failed to send message: ${err.message}`);
      }
    },
    [isConnectionReady]
  );

  const sendAuth = useCallback(() => {
    // With STOMP, auth is handled via headers during connection
    const ready = isConnectionReady();
    console.log("🔐 Auth check:", ready);
    return ready;
  }, [isConnectionReady]);

  const forceReconnect = useCallback(async () => {
    console.log("🔄 Force reconnecting...");

    // Disconnect first
    if (clientRef.current) {
      try {
        clientRef.current.deactivate();
      } catch (e) {}
      clientRef.current = null;
    }

    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    if (mountedRef.current) {
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }

    // Wait before reconnecting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Reconnect if still mounted and has token
    if (mountedRef.current && tokenRef.current) {
      connectToServer();
    }
  }, [connectToServer]);

  // Connection effect - simplified
  useEffect(() => {
    console.log(
      "🔌 Connection effect triggered - Token:",
      !!token,
      "Mounted:",
      mountedRef.current
    );

    if (token && mountedRef.current) {
      connectToServer();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token]); // Only depend on token

  // Log state changes
  useEffect(() => {
    console.log("📊 State updated:", {
      isConnected,
      isConnecting,
      error: error?.message,
      notificationCount,
      notificationsCount: notifications.length,
    });
  }, [
    isConnected,
    isConnecting,
    error,
    notificationCount,
    notifications.length,
  ]);

  // Stable context value
  const contextValue = useMemo(
    () => ({
      // State values
      isWebSocketConnected: isConnected,
      isConnecting,
      lastMessage,
      error,
      notificationCount,
      notifications,
      isRealDevice: deviceInfo.isRealDevice,

      // Functions
      isConnectionReady,
      connect: connectToServer,
      disconnect,
      forceReconnect,
      sendMessage,
      sendAuth,
      addMessageHandler,
      resetNotificationCount,
      setNotificationCount,
    }),
    [
      isConnected,
      isConnecting,
      lastMessage,
      error,
      notificationCount,
      notifications,
      deviceInfo.isRealDevice,
      isConnectionReady,
      connectToServer,
      disconnect,
      forceReconnect,
      sendMessage,
      sendAuth,
      addMessageHandler,
      resetNotificationCount,
    ]
  );

  return (
    <RealTimeContext.Provider value={contextValue}>
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

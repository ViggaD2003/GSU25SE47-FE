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
import * as Device from "expo-device";
import { APP_CONFIG } from "../constants";

const RealTimeContext = createContext(null);

export const RealTimeProvider = ({ children }) => {
  const { user } = useAuth();
  const token = user?.accessToken || user?.token;
  const tokenRef = useRef(token);

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const isRealDevice = Device.isDevice;

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const resetNotificationCount = useCallback(async () => {
    setNotificationCount(0);
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (err) {
      console.warn("Failed to reset badge count", err);
    }
  }, []);

  const showLocalNotification = useCallback(async (title, content) => {
    if (!isRealDevice || !title || !content) return;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: content,
          sound: true,
        },
        trigger: null,
      });
    } catch (err) {
      console.warn("Failed to show notification", err);
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    // Trong WebSocket thuần, không cần subscribe kiểu STOMP,
    // chỉ cần xử lý `onmessage`
    // Hàm này giữ lại để không phá API cũ
  }, []);

  const connect = useCallback(() => {
    if (isConnecting || isConnected || !tokenRef.current) return;

    try {
      setIsConnecting(true);
      const ws = new WebSocket(
        `${APP_CONFIG.WEBSOCKET_URL}?token=${tokenRef.current}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        // console.log("✅ WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);
        subscribeToNotifications();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Message received:", data);

          setLastMessage({
            topic: "/user/queue/notifications",
            data,
            timestamp: Date.now(),
          });

          setNotificationCount((count) => count + 1);
          showLocalNotification(data.title, data.content);
        } catch (err) {
          console.error("Error parsing message:", err);
        }
      };

      ws.onerror = (e) => {
        // console.error("❌ WebSocket error:", e.message);
        setError(e);
        setIsConnected(false);
        setIsConnecting(false);
      };

      ws.onclose = (e) => {
        // console.warn("🔌 WebSocket closed", e.code, e.reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Auto reconnect
        reconnectTimeout.current = setTimeout(() => {
          // console.log("🔁 Reconnecting WebSocket...");
          connect();
        }, 5000);
      };
    } catch (err) {
      console.error("Connection error:", err);
      setError(err);
      setIsConnecting(false);
    }
    // }, [isConnecting, isConnected, subscribeToNotifications]);
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 Disconnecting...");
    try {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    } catch (err) {
      console.warn("Error disconnecting", err);
    }
    wsRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback(async (messageData, retries = 2) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
          throw new Error("Not connected");
        }

        const { destination = "/app/send", ...data } = messageData;
        ws.send(JSON.stringify({ destination, ...data }));
        console.log(`✅ Message sent to ${destination || "default"}`);
        return;
      } catch (err) {
        console.error(`❌ Attempt ${attempt} failed`, err);
        if (attempt === retries) throw err;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      }
    }
  }, []);

  const forceReconnect = useCallback(async () => {
    // console.log("🔌 Force reconnecting...");
    disconnect();
    await new Promise((res) => setTimeout(res, 1000));
    connect();
    // console.log("🔁 Reconnected");
    // }, [connect, disconnect]);
  }, []);

  // useEffect(() => {
  //   resetNotificationCount();

  //   if (token) {
  //     connect();
  //   }

  //   return () => disconnect();
  // // }, [token]);
  // }, []);

  const value = useMemo(
    () => ({
      isWebSocketConnected: isConnected,
      isConnecting,
      lastMessage,
      error,
      notificationCount,
      isRealDevice,

      connect,
      disconnect,
      sendMessage,
      forceReconnect,
      resetNotificationCount,
      setNotificationCount,
    }),
    [
      isConnected,
      isConnecting,
      lastMessage,
      error,
      notificationCount,
      connect,
      disconnect,
      sendMessage,
      forceReconnect,
      resetNotificationCount,
    ]
  );

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

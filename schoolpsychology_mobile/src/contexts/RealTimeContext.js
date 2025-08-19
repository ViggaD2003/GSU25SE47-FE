import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";
import Toast from "../components/common/Toast"; // ✅ import default Toast

// Polyfill cho RN
import { TextEncoder, TextDecoder } from "text-encoding";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const WebSocketContext = createContext(null);
export const useRealTime = () => useContext(WebSocketContext);

const RealTimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const token = user?.accessToken || user?.token;

  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const tokenRef = useRef(token);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // Giữ token & trạng thái mới nhất
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);
  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

  const connectWebSocket = useCallback(() => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      console.log("[WebSocket] ❌ No JWT token");
      return;
    }
    if (isConnectedRef.current || isConnectingRef.current) return;

    if (isConnected) {
      return;
    }

    const client = new Client({
      webSocketFactory: () =>
        new WebSocket(
          `ws://spmss-api.ocgi.space/ws?token=${encodeURIComponent(
            currentToken
          )}`
        ),
      connectHeaders: { token: currentToken },
      forceBinaryWSFrames: true,
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("[WebSocket] ✅ Connected");
        setIsConnected(true);
        setIsConnecting(false);

        subscriptionRef.current = client.subscribe(
          `/user/queue/notifications`,
          (message) => {
            try {
              const payload = (() => {
                try {
                  return JSON.parse(message.body);
                } catch {
                  return null;
                }
              })();

              const content =
                payload?.title ||
                payload?.message ||
                payload?.body ||
                payload?.content ||
                (typeof message.body === "string"
                  ? message.body
                  : "Bạn có thông báo mới");

              const rawType = (payload?.type || payload?.level || "info")
                .toString()
                .toLowerCase();
              const mappedType = rawType.includes("success")
                ? "success"
                : rawType.includes("error") || rawType.includes("fail")
                ? "error"
                : rawType.includes("warn")
                ? "warning"
                : rawType.includes("server")
                ? "server-error"
                : "info";

              if (payload) {
                setNotifications((prev) => [
                  {
                    id: payload.id || Date.now(),
                    title: payload.title || "Thông báo",
                    body:
                      payload.body ||
                      payload.message ||
                      payload.content ||
                      content,
                    type: mappedType,
                    createdAt: payload.createdAt || new Date().toISOString(),
                    isRead: false,
                  },
                  ...prev,
                ]);
              }
              // Hiển thị toast
              setToastMessage(content);
              setToastType(mappedType);
              setToastVisible(true);
            } catch (err) {
              // console.log("[WebSocket] 🔔 Notification parse error", err);
              setToastMessage("Bạn có thông báo mới");
              setToastType("info");
              setToastVisible(true);
            }
          }
        );
      },
      onDisconnect: () => {
        console.log("[WebSocket] 🔌 Disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("[WebSocket] 🚨 STOMP error:", frame.headers["message"]);
        setIsConnected(false);
        setIsConnecting(false);
        setTimeout(() => connectWebSocket(), 5000);
      },
      onWebSocketClose: () => {
        // console.log("[WebSocket] 🔌 Socket closed, try reconnect...");
        setIsConnected(false);
        setIsConnecting(false);
        setTimeout(() => connectWebSocket(), 3000);
      },
    });

    stompClientRef.current = client;
    client.activate();
  }, []);

  const sendMessage = useCallback(
    (msg) => {
      if (!stompClientRef.current || !isConnected) {
        console.error("[WebSocket] Not connected");
        return;
      }
      stompClientRef.current.publish({
        destination: "/app/send",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(msg),
      });
    },
    [isConnected]
  );

  const disconnectWebSocket = useCallback(() => {
    console.log("[WebSocket] 🔌 Disconnect");

    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch {}
      subscriptionRef.current = null;
    }
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch {}
      stompClientRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectWebSocket();
      return;
    }
    connectWebSocket();
    return () => disconnectWebSocket();
  }, [isAuthenticated, token]);

  const value = useMemo(
    () => ({
      isConnected,
      sendMessage,
      notifications,
      setNotifications,
    }),
    [isConnected, sendMessage, notifications]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </WebSocketContext.Provider>
  );
};

export { RealTimeProvider };
export default RealTimeProvider;

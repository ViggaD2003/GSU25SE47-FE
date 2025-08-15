import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo
} from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";

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

  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const tokenRef = useRef(token);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);

  // Giữ token mới nhất
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
  useEffect(() => { isConnectingRef.current = isConnecting; }, [isConnecting]);

  const connectWebSocket = useCallback(() => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      console.error("[WebSocket] ❌ No JWT token");
      return;
    }
    if (isConnectedRef.current || isConnectingRef.current) return;

    setIsConnecting(true);

    const client = new Client({
      webSocketFactory: () =>
        new WebSocket(`ws://spmss-api.ocgi.space/ws?token=${encodeURIComponent(currentToken)}`),
      connectHeaders: {
        token: currentToken, // gửi kèm trong CONNECT frame
      },
      forceBinaryWSFrames: true, // giúp RN gửi chuẩn STOMP
      appendMissingNULLonIncoming: true,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (msg) => console.log("[STOMP DEBUG]", msg),

      onConnect: () => {
        console.log("[WebSocket] ✅ Connected");
        setIsConnected(true);
        setIsConnecting(false);

        // Sub vào topic thông báo
          subscriptionRef.current = client.subscribe(
            `/user/queue/notifications`,
            (message) => {
             console.log("UYEN GUI " + message.body)
            }
          );
      },
      onDisconnect: () => {
        console.log("[WebSocket] 🔌 Disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("[WebSocket] 🚨 STOMP error:", frame.headers["message"]);
      },
      onWebSocketClose: () => {
        console.log("[WebSocket] 🔌 Socket closed");
        setIsConnected(false);
      },
      onWebSocketError: (event) => {
        console.error("[WebSocket] 🚨 Socket error", event?.message || event);
      }
    });

    stompClientRef.current = client;
    client.activate();
  }, []);

  const sendMessage = useCallback((msg) => {
    if (!stompClientRef.current || !isConnected) {
      console.error("[WebSocket] Not connected");
      return;
    }
    stompClientRef.current.publish({
      destination: "/app/send",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(msg)
    });
  }, [isConnected]);

  const disconnectWebSocket = useCallback(() => {
    if (subscriptionRef.current) {
      try { subscriptionRef.current.unsubscribe(); } catch {}
      subscriptionRef.current = null;
    }
    if (stompClientRef.current) {
      try { stompClientRef.current.deactivate(); } catch {}
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

  const value = useMemo(() => ({
    isConnected,
    sendMessage,
    notifications,
    setNotifications
  }), [isConnected, sendMessage, notifications]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { RealTimeProvider };
export default RealTimeProvider;
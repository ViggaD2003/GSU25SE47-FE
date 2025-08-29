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
  const [roomChatId, setRoomChatId] = useState(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);

  const stompClientRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const notiSubscriptionRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
  const addUserSubscriptionRef = useRef(null);
  const tokenRef = useRef(token);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

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

  const isConnectionReady = useCallback(() => {
    return stompClientRef?.current && isConnected;
  }, [stompClientRef.current, isConnected]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      console.log("[WebSocket] Start heartbeat");
      if (isConnectionReady()) {
        try {
          sendMessage({
            title: "Heartbeat",
            content: "Heartbeat",
            username: "",
            notificationType: "PING",
            relatedEntityId: "0",
          });
          console.log("[WebSocket] Heartbeat PING sent");
        } catch (error) {
          console.warn("[WebSocket] Heartbeat failed:", error);
          disconnectWebSocket();
        }
      } else {
        console.warn("[WebSocket] Connection not ready for heartbeat");
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
    }, 30000); // gửi mỗi 30 giây

    console.log("[WebSocket] Heartbeat started");
  }, [isConnectionReady]);

  const subscribeToTopic = useCallback((client, topic, callback) => {
    console.log("[WebSocket] 🔔 Subscribing to topic", topic);

    try {
      const subscription = client.subscribe(topic, (message) => {
        try {
          // console.log("[WebSocket] 🔔 Message", message);
          const payload = (() => {
            try {
              return JSON.parse(message.body);
            } catch {
              return null;
            }
          })();
          callback(payload);
        } catch (error) {
          console.warn("[WebSocket] Error parsing message:", error);
        }
      });

      // ✅ Return the subscription object directly, not a cleanup function
      return subscription;
    } catch (error) {
      console.warn("[WebSocket] Error subscribing to topic:", error);
      return null;
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    if (notiSubscriptionRef.current) {
      console.log("[WebSocket] 🔔 Unsubscribing from notifications topic");
      try {
        notiSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn(
          "[WebSocket] Error unsubscribing from notifications:",
          error
        );
      }
      notiSubscriptionRef.current = null;
    }

    notiSubscriptionRef.current = subscribeToTopic(
      stompClientRef.current,
      `/user/queue/notifications`,
      (payload) => {
        try {
          console.log("[WebSocket] 🔔 Notification payload", payload);

          if (payload.type === "PING") {
            console.log("[WebSocket] 🔔 Heartbeat PING received");
            return;
          }

          const content =
            payload?.title ||
            payload?.message ||
            payload?.body ||
            payload?.content ||
            "Bạn có thông báo mới";

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
                  payload.body || payload.message || payload.content || content,
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
          console.warn("[WebSocket] 🔔 Notification parse error", err);
        }
      }
    );
  }, [subscribeToTopic]);

  const connectWebSocket = useCallback(() => {
    const currentToken = tokenRef.current;
    if (!currentToken) {
      console.log("[WebSocket] ❌ No JWT token");
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
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,

      onConnect: () => {
        console.log("[WebSocket] ✅ Connected");
        setIsConnected(true);
        setIsConnecting(false);

        // Start heartbeat
        startHeartbeat();
      },
      onDisconnect: () => {
        console.log("[WebSocket] 🔌 Disconnected");
        setIsConnected(false);
        // if (isAuthenticated && !isConnected) {
        //   setTimeout(() => connectWebSocket(), 3000);
        // }
      },
      onStompError: (frame) => {
        console.warn("[WebSocket] 🚨 STOMP error:", frame.headers["message"]);
        setIsConnected(false);
        setIsConnecting(false);
        // setTimeout(() => connectWebSocket(), 5000);
      },
      onWebSocketClose: () => {
        // console.log("[WebSocket] 🔌 Socket closed, try reconnect...");
        setIsConnected(false);
        setIsConnecting(false);
        // if (isAuthenticated && !isConnected) {
        //   setTimeout(() => connectWebSocket(), 3000);
        // }
      },
    });

    stompClientRef.current = client;
    client.activate();
  }, []);

  const subscribeToChat = useCallback(() => {
    if (!roomChatId) {
      console.warn(
        "[WebSocket] Cannot subscribe to chat: missing requirements"
      );
      return;
    }

    if (chatSubscriptionRef.current) {
      console.log("[WebSocket] 🔔 Unsubscribing from chat topic");
      try {
        chatSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn("[WebSocket] Error unsubscribing from chat:", error);
      }
      chatSubscriptionRef.current = null;
    }

    console.log("[WebSocket] 🔔 Subscribing to chat room:", roomChatId);

    chatSubscriptionRef.current = subscribeToTopic(
      stompClientRef.current,
      `/topic/chat/${roomChatId}`,
      (message) => {
        if (!roomChatId) return;
        console.log("[WebSocket] 🔔 Chat message", message);

        if (message.sender === user.email) return;
        setChatMessages((prev) => [
          ...prev,
          { ...message, timestamp: new Date() },
        ]);
      }
    );
  }, [stompClientRef.current, user?.email, roomChatId, subscribeToTopic]);

  const subscribeToAddUser = useCallback(() => {
    if (addUserSubscriptionRef.current) {
      console.log("[WebSocket] 🔔 Unsubscribing from addUser topic");
      try {
        addUserSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn("[WebSocket] Error unsubscribing from addUser:", error);
      }
      addUserSubscriptionRef.current = null;
    }

    console.log("[WebSocket] 🔔 Subscribing to addUser topic");

    addUserSubscriptionRef.current = subscribeToTopic(
      stompClientRef.current,
      `/topic/onlineUsers`,
      (user) => {
        console.log("[WebSocket] 🔔 Add user", user);
        setOnlineUsers(user || []);
      }
    );
  }, [subscribeToTopic]);

  const sendMessage = useCallback(
    (msg) => {
      if (!isConnectionReady()) {
        console.warn("[WebSocket] Not connected");
        return;
      }
      try {
        stompClientRef.current.publish({
          destination: "/app/send",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(msg),
        });
      } catch (error) {
        console.warn("[WebSocket_sendMessage] Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
    [isConnectionReady]
  );

  const sendMessageToCounselor = useCallback(
    (type = "ADD_USER", roomId, msg) => {
      if (!isConnectionReady()) {
        console.warn("[WebSocket] Cannot send message: missing requirements");
        return;
      }

      try {
        let destination;

        if (type === "ADD_USER") {
          destination = `/app/chat.addUser`;
          stompClientRef.current.publish({
            destination: destination,
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ username: user?.email }),
          });
          return;
        } else if (type === "CHAT" && roomId) {
          destination = `/app/chat/${roomId}`;
        } else if (msg && roomChatId) {
          destination = `/app/chat/${roomChatId}`;
        }

        if (!destination) {
          console.warn("[WebSocket] No destination for message type:", type);
          return;
        }

        const bodyData = {
          sender: msg?.sender || user.email,
          message: msg?.message || "",
          timestamp: msg?.timestamp || new Date(),
          messageType: msg?.messageType || "CHAT",
        };

        if (type !== "ADD_USER") {
          setChatMessages((prev) => [...prev, bodyData]);
        }

        stompClientRef.current.publish({
          destination: destination,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(bodyData),
        });
      } catch (error) {
        console.warn(
          "[WebSocket_sendMessageToCounselor] Error sending message:",
          error
        );
        throw new Error("Failed to send message");
      }
    },
    [isConnectionReady, roomChatId]
  );

  // Send message to counselor
  useEffect(() => {
    if (isConnectionReady()) {
      sendMessageToCounselor("ADD_USER");
    }
  }, [isConnectionReady, sendMessageToCounselor]);

  // Add user
  useEffect(() => {
    if (isConnectionReady()) {
      subscribeToAddUser();
    }
  }, [isConnectionReady, subscribeToAddUser]);

  // Notifications
  useEffect(() => {
    if (isConnectionReady()) {
      subscribeToNotifications();
    }
  }, [isConnectionReady, subscribeToNotifications]);

  // Chat
  useEffect(() => {
    if (isConnectionReady() && roomChatId) {
      subscribeToChat();
    }
  }, [isConnectionReady, subscribeToChat]);

  const disconnectWebSocket = useCallback(async () => {
    console.log("[WebSocket] 🔌 Disconnect");

    // Unsubscribe from notifications
    if (notiSubscriptionRef.current) {
      try {
        notiSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn(
          "[WebSocket] Error unsubscribing from notifications:",
          error
        );
      }
      notiSubscriptionRef.current = null;
    }

    // Unsubscribe from chat
    if (chatSubscriptionRef.current) {
      try {
        chatSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn("[WebSocket] Error unsubscribing from chat:", error);
      }
      chatSubscriptionRef.current = null;
    }

    // Unsubscribe from addUser/onlineUsers
    if (addUserSubscriptionRef.current) {
      try {
        addUserSubscriptionRef.current.unsubscribe();
      } catch (error) {
        console.warn("[WebSocket] Error unsubscribing from addUser:", error);
      }
      addUserSubscriptionRef.current = null;
    }

    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Deactivate STOMP client
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
      } catch (error) {
        console.warn("[WebSocket] Error deactivating STOMP client:", error);
      }
      stompClientRef.current = null;
    }

    // Clear state
    setIsConnected(false);
    setIsConnecting(false);
    setChatMessages([]);
    setOnlineUsers([]);
    setRoomChatId(null);

    console.log("[WebSocket] ✅ Disconnected and cleaned up");
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectWebSocket();
    }

    return () => disconnectWebSocket();
  }, [isAuthenticated, token]); // Removed circular dependencies

  const value = useMemo(
    () => ({
      isConnected,
      sendMessage,
      notifications,
      setNotifications,
      sendMessageToCounselor,
      chatMessages,
      setChatMessages,
      subscribeToChat,
      setRoomChatId,
      roomChatId,
      onlineUsers,
      isConnectionReady,
    }),
    [
      isConnected,
      sendMessage,
      notifications,
      sendMessageToCounselor,
      chatMessages,
      setChatMessages,
      subscribeToChat,
      setRoomChatId,
      roomChatId,
      onlineUsers,
      isConnectionReady,
    ]
  );

  return (
    <WebSocketContext.Provider value={value}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
      {children}
    </WebSocketContext.Provider>
  );
};

export { RealTimeProvider };
export default RealTimeProvider;

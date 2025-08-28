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

  const subscribeToTopic = useCallback((client, topic, callback) => {
    if (!client) {
      console.warn("[WebSocket] Cannot subscribe: client not available");
      return null;
    }

    if (!client.connected) {
      console.warn("[WebSocket] Cannot subscribe: STOMP client not connected");
      return null;
    }

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
          console.error("[WebSocket] Error parsing message:", error);
        }
      });
      return subscription;
    } catch (error) {
      console.error("[WebSocket] Error subscribing to topic:", error);
      return null;
    }
  }, []);

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
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        console.log("[WebSocket] ✅ Connected");
        setIsConnected(true);
        setIsConnecting(false);

        notiSubscriptionRef.current = subscribeToTopic(
          client,
          `/user/queue/notifications`,
          (payload) => {
            try {
              console.log("[WebSocket] 🔔 Notification payload", payload);

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
        // if (isAuthenticated && !isConnected) {
        //   setTimeout(() => connectWebSocket(), 3000);
        // }
      },
      onStompError: (frame) => {
        console.error("[WebSocket] 🚨 STOMP error:", frame.headers["message"]);
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
    if (!stompClientRef?.current || !user?.email || !roomChatId) {
      console.warn(
        "[WebSocket] Cannot subscribe to chat: missing requirements"
      );
      return;
    }

    if (!stompClientRef.current.connected) {
      console.warn("[WebSocket] Cannot subscribe to chat: not connected");
      return;
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
    if (!stompClientRef?.current || !user?.email) {
      console.warn(
        "[WebSocket] Cannot subscribe to addUser: missing requirements"
      );
      return;
    }

    if (!stompClientRef.current.connected) {
      console.warn("[WebSocket] Cannot subscribe to addUser: not connected");
      return;
    }

    console.log("[WebSocket] 🔔 Subscribing to addUser topic");

    addUserSubscriptionRef.current = subscribeToTopic(
      stompClientRef.current,
      `/topic/onlineUsers`,
      (user) => {
        console.log("[WebSocket] 🔔 Add user user", user);
        setOnlineUsers(user || []);
      }
    );
  }, [stompClientRef.current, user?.email, subscribeToTopic]);

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

  const sendMessageToCounselor = useCallback(
    (type = "ADD_USER", roomId, msg) => {
      if (!stompClientRef.current || !user?.email) {
        console.warn("[WebSocket] Cannot send message: missing requirements");
        return;
      }

      if (!stompClientRef.current.connected) {
        console.warn("[WebSocket] Cannot send message: not connected");
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
        console.error("[WebSocket] Error sending message:", error);
        throw new Error("Failed to send message");
      }
    },
    [stompClientRef.current, user?.email, roomChatId]
  );

  useEffect(() => {
    if (stompClientRef.current && user?.email && isConnected) {
      sendMessageToCounselor("ADD_USER");
    }
  }, [
    stompClientRef.current,
    user?.email,
    isConnected,
    sendMessageToCounselor,
  ]);

  useEffect(() => {
    if (stompClientRef.current && user?.email && isConnected) {
      subscribeToAddUser();
    }
  }, [stompClientRef.current, user?.email, isConnected, subscribeToAddUser]);

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
    if (roomChatId && isConnected) {
      subscribeToChat();
    }
  }, [roomChatId, isConnected, subscribeToChat]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      console.log(
        "[WebSocket] 🔌 Authentication failed or token missing - disconnecting"
      );
      disconnectWebSocket();
      return;
    }

    if (isConnected || isConnecting) {
      console.log("[WebSocket] Already connected or connecting - skipping");
      return;
    }

    console.log("[WebSocket] 🔌 Attempting to connect WebSocket");
    setIsConnecting(true);
    if (!stompClientRef.current && isAuthenticated && token) {
      connectWebSocket();
    }
    // return () => disconnectWebSocket();
  }, [
    isAuthenticated,
    token,
    connectWebSocket,
    disconnectWebSocket,
    isConnected,
    isConnecting,
  ]);

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
      setRoomChatId,
      onlineUsers,
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
      setRoomChatId,
      onlineUsers,
    ]
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

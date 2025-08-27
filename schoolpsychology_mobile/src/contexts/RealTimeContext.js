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
  const [activeChat, setActiveChat] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);

  const stompClientRef = useRef(null);
  const notiSubscriptionRef = useRef(null);
  const chatSubscriptionRef = useRef(null);
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

  const subscribeToTopic = useCallback((client, topic, callback) => {
    if (!client) {
      console.warn("[WebSocket] Cannot subscribe: connection not ready");
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

  const subscribeToChat = useCallback(
    (roomId) => {
      if (!stompClientRef?.current || !user?.email) {
        return;
      }

      chatSubscriptionRef.current = subscribeToTopic(
        stompClientRef.current,
        `/topic/chat/${roomId}`,
        (message) => {
          if (!roomId) return;
          console.log("[WebSocket] 🔔 Chat message", message);

          if (message.sender === user.email) {
            return;
          }

          if (message.type === "JOIN") {
            setActiveChat(true);
            return;
          } else if (message.type === "LEAVE") {
            setActiveChat(false);
            return;
          } else if (message.type === "CHAT") {
            setChatMessages((prev) => [...prev, message]);
            return;
          }
        }
      );
    },
    [stompClientRef.current]
  );

  // const sendActiveChat = useCallback(
  //   (roomId) => {
  //     if (!stompClientRef.current || !isConnected) {
  //       console.error("[WebSocket] Not connected");
  //       return;
  //     }

  //     if (!roomId) {
  //       console.error("[WebSocket] No room chat id");
  //       return;
  //     }

  //     stompClientRef.current.publish({
  //       destination: `/app/chat.addUser/${roomId}`,
  //       headers: { "content-type": "application/json" },
  //       body: JSON.stringify(bodyData),
  //     });
  //   },
  //   [stompClientRef, isConnected, user?.email]
  // );

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
    (msg, roomId) => {
      if (!stompClientRef.current || !roomId || !user?.email) {
        return;
      }

      const bodyData = {
        sender: msg.sender,
        message: msg.message || "",
        timestamp: msg.timestamp,
        type: msg.messageType || "CHAT",
      };

      let destination;
      if (["JOIN", "LEAVE"].includes(msg.messageType)) {
        destination = `/app/chat.addUser/${roomId}`;
      } else if (msg.messageType === "CHAT") {
        destination = `/app/chat/${roomId}`;
        setChatMessages((prev) => [...prev, bodyData]);
      }

      console.log(
        "[WebSocket_sendMessageToCounselor] 🔔 Destination",
        destination
      );

      stompClientRef.current.publish({
        destination: destination,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      console.log(
        "[WebSocket_sendMessageToCounselor] 🔔 Send message to counselor",
        bodyData
      );
    },
    [stompClientRef.current, user?.email]
  );

  const disconnectWebSocket = useCallback(async () => {
    console.log("[WebSocket] 🔌 Disconnect");

    if (notiSubscriptionRef.current) {
      try {
        notiSubscriptionRef.current.unsubscribe();
      } catch {}
      notiSubscriptionRef.current = null;
    }
    if (chatSubscriptionRef.current) {
      try {
        await Promise.all([
          sendMessageToCounselor(
            {
              sender: user.email,
              timestamp: new Date(),
              messageType: "LEAVE",
            },
            roomChatId
          ),
        ]);
        chatSubscriptionRef.current.unsubscribe();
      } catch {}
      chatSubscriptionRef.current = null;
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
    if (isConnected || isConnecting) {
      return;
    }

    setIsConnecting(true);
    if (!stompClientRef.current && isAuthenticated && token) {
      connectWebSocket();
    }
    // return () => disconnectWebSocket();
  }, [isAuthenticated, token, stompClientRef]);

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
      activeChat,
      setActiveChat,
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
      activeChat,
      setActiveChat,
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

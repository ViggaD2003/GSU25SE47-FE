import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback
} from 'react';
import { useAuth } from './AuthContext';
import Stomp from 'stompjs';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const jwtToken = localStorage.getItem('token'); 
  

  const stompClientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = useCallback(() => {
    const socket = new WebSocket('ws://localhost:8080/ws'); // WebSocket thuần
    const stompClient = Stomp.over(socket);

    // Optional: tắt debug nếu không muốn log
    stompClient.debug = null;

    stompClient.connect(
      {
          Authorization: `Bearer ${jwtToken}`
      },
      (frame) => {
        stompClientRef.current = stompClient;
        setIsConnected(true);
      },
      (error) => {
        console.error('[WebSocket] Connection error:', error);
        setIsConnected(false);
      }
    );
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.disconnect(() => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user, connectWebSocket, disconnectWebSocket]);

  const sendMessage = (destination, body) => {
    if (stompClientRef.current && isConnected) {
      stompClientRef.current.send(destination, {}, JSON.stringify(body));
    }
  };

  const subscribeToTopic = (topic, callback) => {
  if (stompClientRef.current && isConnected) {
    const subscription = stompClientRef.current.subscribe(topic, (message) => {
      const body = JSON.parse(message.body);
      callback(body);
    });
    return subscription;
  }
  return null;
};

  return (
    <WebSocketContext.Provider value={{ stompClient: stompClientRef.current, isConnected, sendMessage, subscribeToTopic }}>
      {children}
    </WebSocketContext.Provider>
  );
};

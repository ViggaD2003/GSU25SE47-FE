import { Platform } from "react-native";
import { APP_CONFIG } from "../../constants";

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = APP_CONFIG.WEBSOCKET_MAX_RECONNECT_ATTEMPTS;
    this.reconnectDelay = 1000; // 1 second
    this.isConnecting = false;
    this.isConnected = false;
    this.messageHandlers = new Map();
    this.connectionHandlers = new Map();
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.heartbeatIntervalMs = APP_CONFIG.WEBSOCKET_HEARTBEAT_INTERVAL;
    this.heartbeatTimeoutMs = 5000; // 5 seconds
  }

  // Get WebSocket URL based on platform
  getWebSocketUrl() {
    // Use the dedicated WebSocket URL from constants
    return APP_CONFIG.WEBSOCKET_URL;
  }

  // Connect to WebSocket
  async connect(token) {
    if (this.isConnecting || this.isConnected) {
      console.log("WebSocket: Already connecting or connected");
      return;
    }

    try {
      this.isConnecting = true;
      const wsUrl = this.getWebSocketUrl();
      const urlWithToken = `${wsUrl}?token=${encodeURIComponent(token)}`;

      console.log("WebSocket: Connecting to", wsUrl);

      this.ws = new WebSocket(urlWithToken);

      this.ws.onopen = () => {
        console.log("WebSocket: Connected successfully");
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifyConnectionHandlers("connected");
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("WebSocket: Error parsing message:", error);
        }
      };

      this.ws.onclose = (event) => {
        console.log("WebSocket: Connection closed", event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.stopHeartbeat();
        this.notifyConnectionHandlers("disconnected");

        // Attempt to reconnect if not a normal closure
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket: Connection error:", error);
        this.isConnecting = false;
        this.notifyConnectionHandlers("error", error);
      };
    } catch (error) {
      console.error("WebSocket: Error creating connection:", error);
      this.isConnecting = false;
      this.notifyConnectionHandlers("error", error);
    }
  }

  // Disconnect from WebSocket
  disconnect() {
    if (this.ws) {
      console.log("WebSocket: Disconnecting");
      this.stopHeartbeat();
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers("disconnected");
    }
  }

  // Send message with structured parameters
  sendMessage = ({
    type = "message",
    payload = {},
    destination = "/app/send",
    title = "Notification",
    content = "You have a new message",
    username = "system",
    timestamp = new Date().toISOString(),
  }) => {
    if (!this.isConnected || !this.ws) {
      console.error("WebSocket: Not connected");
      return false;
    }

    try {
      const message = {
        type,
        payload,
        destination,
        title,
        content,
        username,
        timestamp,
      };

      this.ws.send(JSON.stringify(message));
      console.log("WebSocket: Sent message:", message);

      return true;
    } catch (error) {
      console.error("WebSocket: Error sending message:", error);
      return false;
    }
  };

  // Legacy send method for backward compatibility
  send(message) {
    if (typeof message === "object" && message.type) {
      return this.sendMessage(message);
    }

    // Handle simple string or object messages
    if (this.isConnected && this.ws) {
      try {
        const messageStr =
          typeof message === "string" ? message : JSON.stringify(message);
        this.ws.send(messageStr);
        console.log("WebSocket: Sent message:", message);
        return true;
      } catch (error) {
        console.error("WebSocket: Error sending message:", error);
        return false;
      }
    }
    return false;
  }

  // Register message handler
  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
    return () => this.messageHandlers.delete(type);
  }

  // Register connection change handler
  onConnectionChange(handler) {
    const id = Date.now() + Math.random();
    this.connectionHandlers.set(id, handler);
    return () => this.connectionHandlers.delete(id);
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;
    console.log("WebSocket: Received message:", { type, payload });

    // Call registered message handlers
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type)(payload);
    }
  }

  // Notify connection change handlers
  notifyConnectionHandlers(status, error = null) {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(status, error);
      } catch (error) {
        console.error("WebSocket: Error in connection handler:", error);
      }
    });
  }

  // Schedule reconnection with exponential backoff
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("WebSocket: Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `WebSocket: Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect();
      }
    }, delay);
  }

  // Start heartbeat
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({
          type: "ping",
          payload: { timestamp: Date.now() },
          destination: "/app/ping",
          title: "Heartbeat",
          content: "Ping from client",
        });
      }
    }, this.heartbeatIntervalMs);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRealTime } from "../../contexts/RealTimeContext";
import { useAuth } from "../../contexts/AuthContext";

const WebSocketDebug = () => {
  const { user } = useAuth();

  const {
    isWebSocketConnected,
    isConnecting,
    lastMessage,
    error,
    isRealDevice,
    forceReconnect,
    sendMessage,
  } = useRealTime();

  const [lastUpdate, setLastUpdate] = useState(null);
  const [testResults, setTestResults] = useState({});

  const updateStatus = () => {
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleForceReconnect = async () => {
    await forceReconnect();
    updateStatus();
  };

  const handleSendMessage = () => {
    sendMessage({
      title: "Hello, WebSocket!",
      content: "This is a test message from WebSocketDebug",
      username: "student@school.com",
      notificationType: "DEBUG_TEST",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "error":
        return "#dc3545";
      case "testing":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "success":
        return "✅ Success";
      case "failed":
        return "❌ Failed";
      case "error":
        return "❌ Error";
      case "testing":
        return "⏳ Testing...";
      default:
        return "⚪ Not tested";
    }
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 WebSocket Debug Panel</Text>

      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Status</Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>WebSocket:</Text>
          <View style={styles.statusValue}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isWebSocketConnected ? "#28a745" : "#dc3545",
                },
              ]}
            />
            <Text
              style={[
                styles.status,
                { color: isWebSocketConnected ? "#28a745" : "#dc3545" },
              ]}
            >
              {isWebSocketConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Connecting:</Text>
          <Text style={styles.value}>{isConnecting ? "⏳ Yes" : "No"}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Device:</Text>
          <Text style={styles.value}>
            {isRealDevice ? "📱 Real Device" : "💻 Simulator"}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Last Update:</Text>
          <Text style={styles.value}>{lastUpdate || "Never"}</Text>
        </View>
      </View>

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Results</Text>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Connection Test:</Text>
          <Text
            style={[
              styles.value,
              { color: getStatusColor(testResults.connection) },
            ]}
          >
            {getStatusText(testResults.connection)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>URL Test:</Text>
          <Text
            style={[styles.value, { color: getStatusColor(testResults.url) }]}
          >
            {getStatusText(testResults.url)}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Reconnect Test:</Text>
          <Text
            style={[
              styles.value,
              { color: getStatusColor(testResults.reconnect) },
            ]}
          >
            {getStatusText(testResults.reconnect)}
          </Text>
        </View>
      </View>

      {/* Last Message */}
      {lastMessage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Message</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.messageTopic}>{lastMessage.topic}</Text>
            <Text style={styles.messageTime}>
              {new Date(lastMessage.timestamp).toLocaleTimeString()}
            </Text>
            <Text style={styles.messageData}>
              {JSON.stringify(lastMessage.data, null, 2)}
            </Text>
          </View>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error.message || JSON.stringify(error)}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleForceReconnect}
          >
            <Text style={styles.buttonText}>Force Reconnect</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={handleSendMessage}
          >
            <Text style={styles.buttonText}>Send Test Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={updateStatus}
          >
            <Text style={styles.buttonText}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.darkButton]}
            onPress={() => {
              console.log("[WebSocketDebug] Connection Status:", {
                isWebSocketConnected,
                isConnecting,
                hasUser: !!user,
                hasToken: !!(user?.accessToken || user?.token),
                tokenLength: (user?.accessToken || user?.token)?.length,
              });
              Alert.alert(
                "Debug Info",
                "Check console for detailed connection status"
              );
            }}
          >
            <Text style={styles.buttonText}>Debug Info</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#495057",
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#495057",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontWeight: "500",
    flex: 1,
    color: "#6c757d",
  },
  value: {
    flex: 1,
    textAlign: "right",
    color: "#495057",
  },
  statusValue: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  status: {
    fontWeight: "bold",
  },
  messageContainer: {
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  messageTopic: {
    fontSize: 12,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 10,
    color: "#6c757d",
    marginBottom: 4,
  },
  messageData: {
    fontSize: 10,
    color: "#495057",
    fontFamily: "monospace",
  },
  errorContainer: {
    backgroundColor: "#f8d7da",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f5c6cb",
  },
  errorText: {
    fontSize: 12,
    color: "#721c24",
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 4,
    minWidth: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  successButton: {
    backgroundColor: "#28a745",
  },
  warningButton: {
    backgroundColor: "#ffc107",
  },
  infoButton: {
    backgroundColor: "#17a2b8",
  },
  darkButton: {
    backgroundColor: "#343a40",
  },
});

export default WebSocketDebug;

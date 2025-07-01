import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Toast = ({
  visible,
  message,
  type = "info",
  duration = 3000,
  onHide,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  const hideToast = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide && onHide();
    });
  }, [fadeAnim, onHide]);

  useEffect(() => {
    if (visible) {
      // Reset animation value first
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Hide immediately when not visible
      fadeAnim.setValue(0);
    }
  }, [visible, duration, fadeAnim, hideToast]);

  const getToastStyle = () => {
    switch (type) {
      case "success":
        return { backgroundColor: "#10B981", icon: "checkmark-circle" };
      case "error":
        return { backgroundColor: "#EF4444", icon: "close-circle" };
      case "warning":
        return { backgroundColor: "#F59E0B", icon: "warning" };
      default:
        return { backgroundColor: "#3B82F6", icon: "information-circle" };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim },
        { backgroundColor: toastStyle.backgroundColor },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={toastStyle.icon} size={20} color="#fff" />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;

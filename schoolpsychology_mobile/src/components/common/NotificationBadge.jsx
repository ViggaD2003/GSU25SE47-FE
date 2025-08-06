import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRealTime } from "../../contexts/RealTimeContext";
import { Badge } from "react-native-paper";

const NotificationBadge = ({
  iconName = "notifications",
  size = 24,
  iconColor = "#000",
  showCount = true,
  style,
  onPress,
}) => {
  const { notificationCount } = useRealTime();

  // Add logging to track notification count changes
  React.useEffect(() => {
    console.log(
      "NotificationBadge: Notification count updated:",
      notificationCount
    );
  }, [notificationCount]);

  if (notificationCount === 0) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onPress}
        disabled={!onPress}
      >
        <Ionicons name={iconName} size={size} color={iconColor} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Ionicons name={iconName} size={size} color={iconColor} />
      {showCount && (
        <Badge style={styles.badge} size={18}>
          <Text
            style={[styles.badgeText, { fontSize: size * 0.4, color: "#fff" }]}
          >
            {notificationCount > 99 ? "99+" : notificationCount}
          </Text>
        </Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#F93246FF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationBadge;

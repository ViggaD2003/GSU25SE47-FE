import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRealTime } from "../../contexts/RealTimeContext";
import { Ionicons } from "@expo/vector-icons";

const NotificationBadge = ({
  onPress,
  size = 24,
  showCount = true,
  style = {},
  iconName = "notifications",
  iconColor = "#007AFF",
}) => {
  const { notificationCount } = useRealTime();

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
        <View style={[styles.badge, { minWidth: size * 0.8 }]}>
          <Text style={[styles.badgeText, { fontSize: size * 0.4 }]}>
            {notificationCount > 99 ? "99+" : notificationCount}
          </Text>
        </View>
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
    backgroundColor: "#dc3545",
    borderRadius: 12,
    minHeight: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default NotificationBadge;

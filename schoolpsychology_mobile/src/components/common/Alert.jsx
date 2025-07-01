import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Alert = ({
  type = "info",
  title,
  description,
  onPress,
  showCloseButton = false,
  onClose,
  style,
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "#F0FDF4",
          borderColor: "#BBF7D0",
          iconColor: "#16A34A",
          iconName: "checkmark-circle",
          titleColor: "#166534",
          descriptionColor: "#15803D",
        };
      case "warning":
        return {
          backgroundColor: "#FFFBEB",
          borderColor: "#FED7AA",
          iconColor: "#D97706",
          iconName: "warning",
          titleColor: "#92400E",
          descriptionColor: "#A16207",
        };
      case "error":
        return {
          backgroundColor: "#FEF2F2",
          borderColor: "#FECACA",
          iconColor: "#DC2626",
          iconName: "close-circle",
          titleColor: "#991B1B",
          descriptionColor: "#B91C1C",
        };
      case "info":
        return {
          backgroundColor: "#EFF6FF",
          borderColor: "#BFDBFE",
          iconColor: "#2563EB",
          iconName: "information-circle",
          titleColor: "#1E40AF",
          descriptionColor: "#1D4ED8",
        };
    }
  };

  const config = getAlertConfig();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={config.iconName} size={24} color={config.iconColor} />
        </View>

        <View style={styles.textContainer}>
          {title && (
            <Text style={[styles.title, { color: config.titleColor }]}>
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={[styles.description, { color: config.descriptionColor }]}
            >
              {description}
            </Text>
          )}
        </View>

        {showCloseButton && (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={18} color={config.descriptionColor} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },
  closeButton: {
    padding: 4,
    marginTop: 2,
  },
});

export default Alert;

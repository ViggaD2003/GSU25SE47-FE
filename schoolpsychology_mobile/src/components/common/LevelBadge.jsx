import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLevelConfig } from "../../constants/levelConfig";

const LevelBadge = ({ level, size = "medium" }) => {
  const config = getLevelConfig(level);

  const sizeStyles = {
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 12,
      iconSize: 14,
    },
    medium: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      fontSize: 14,
      iconSize: 16,
    },
    large: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      fontSize: 16,
      iconSize: 18,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: config.backgroundColor,
          borderWidth: 1,
          borderColor: config.borderColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
          borderRadius: currentSize.borderRadius,
          gap: 6,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={currentSize.iconSize}
        color={config.color}
      />
      <Text
        style={[
          {
            fontSize: currentSize.fontSize,
            fontWeight: "600",
            color: config.color,
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

export default LevelBadge;

import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLevelConfig } from "../../constants/levelConfig";

const LevelCard = ({ level, score, showDescription = true, style = {} }) => {
  const config = getLevelConfig(level);

  return (
    <View
      style={[
        {
          backgroundColor: config.backgroundColor,
          borderWidth: 2,
          borderColor: config.borderColor,
          borderRadius: 16,
          padding: 20,
          marginVertical: 8,
        },
        style,
      ]}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <Ionicons
          name={config.icon}
          size={32}
          color={config.color}
          style={{ marginRight: 12 }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              {
                fontSize: 20,
                fontWeight: "700",
                color: config.color,
                marginBottom: 4,
              },
            ]}
          >
            {config.label}
          </Text>
          {score !== undefined && (
            <Text
              style={[
                {
                  fontSize: 16,
                  fontWeight: "600",
                  color: config.color,
                  opacity: 0.8,
                },
              ]}
            >
              Điểm: {score}
            </Text>
          )}
        </View>
      </View>

      {showDescription && (
        <Text
          style={[
            {
              fontSize: 14,
              color: config.color,
              opacity: 0.9,
              lineHeight: 20,
            },
          ]}
        >
          {config.description}
        </Text>
      )}
    </View>
  );
};

export default LevelCard;

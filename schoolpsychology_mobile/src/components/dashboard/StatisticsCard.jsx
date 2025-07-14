import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";

const { width } = Dimensions.get("window");

const StatisticsCard = ({
  title,
  value,
  change,
  changeType,
  icon,
  color,
  subtitle,
}) => {
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.changeContainer}>
          {change ? (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor: isPositive
                    ? "#10B981" + "20"
                    : isNegative
                    ? "#EF4444" + "20"
                    : "#6B7280" + "20",
                },
              ]}
            >
              <Ionicons
                name={
                  isPositive
                    ? "trending-up"
                    : isNegative
                    ? "trending-down"
                    : "remove"
                }
                size={12}
                color={
                  isPositive ? "#10B981" : isNegative ? "#EF4444" : "#6B7280"
                }
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color: isPositive
                      ? "#10B981"
                      : isNegative
                      ? "#EF4444"
                      : "#6B7280",
                  },
                ]}
              >
                {change}
              </Text>
            </View>
          ) : (
            <View style={styles.changePlaceholder} />
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle || " "}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
    // Fixed dimensions for uniform cards
    minHeight: 160,
    width: (width - 75) / 2, // 2 cards per row with margins
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    height: 48, // Fixed height for header
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  changeContainer: {
    alignItems: "flex-end",
    height: 24, // Fixed height for change container
    justifyContent: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    minHeight: 24,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  changePlaceholder: {
    width: 40,
    height: 24,
  },
  content: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 32,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    lineHeight: 18,
  },
  subtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 16,
  },
});

export default StatisticsCard;

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../../utils/helpers";

const RecordCard = ({
  type,
  title,
  subtitle,
  date,
  status,
  score,
  onPress,
  icon,
  color = "#3B82F6",
}) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "done":
        return "#10B981";
      case "pending":
      case "scheduled":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "Hoàn thành";
      case "done":
        return "Đã hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "scheduled":
        return "Đã lên lịch";
      case "cancelled":
        return "Đã hủy";
      default:
        return status || "Không xác định";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || " "}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) + "20" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(status) }]}
            >
              {getStatusText(status)}
            </Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>

        <View style={styles.scoreContainer}>
          {score ? (
            <>
              <Text style={styles.scoreLabel}>Điểm:</Text>
              <Text style={styles.scoreValue}>{score}</Text>
            </>
          ) : (
            <Text style={styles.scorePlaceholder}> </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
    height: 120,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    height: 48,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
    height: 40,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
  },
  statusContainer: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 24,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minHeight: 16,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  scoreValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  scorePlaceholder: {
    fontSize: 12,
    color: "transparent",
  },
  arrowContainer: {},
});

export default RecordCard;

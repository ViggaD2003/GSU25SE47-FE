import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";

const EventCard = ({ event, onPress }) => {
  // Get source icon and color
  const getSourceInfo = (source) => {
    switch (source) {
      case "Appointment":
        return {
          icon: "calendar",
          color: "#007AFF",
          label: "Lịch hẹn",
        };
      case "Survey":
        return {
          icon: "clipboard",
          color: "#FF9500",
          label: "Khảo sát",
        };
      case "Program":
        return {
          icon: "school",
          color: "#34C759",
          label: "Chương trình",
        };
      default:
        return {
          icon: "ellipse",
          color: "#8E8E93",
          label: "Sự kiện",
        };
    }
  };

  // Get status info
  const getStatusInfo = (status) => {
    switch (status) {
      case "upcoming":
        return {
          label: "Sắp tới",
          color: "#007AFF",
        };
      case "completed":
        return {
          label: "Hoàn thành",
          color: "#34C759",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          color: "#FF3B30",
        };
      default:
        return {
          label: "Không xác định",
          color: "#8E8E93",
        };
    }
  };

  const sourceInfo = getSourceInfo(event.source);
  const statusInfo = getStatusInfo(event.status);

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(event)}>
      <View style={styles.header}>
        <View style={styles.sourceContainer}>
          <View
            style={[
              styles.sourceIcon,
              { backgroundColor: `${sourceInfo.color}20` },
            ]}
          >
            <Ionicons
              name={sourceInfo.icon}
              size={16}
              color={sourceInfo.color}
            />
          </View>
          <Text style={styles.sourceLabel}>{sourceInfo.label}</Text>
          {event.from_case && (
            <View style={styles.caseBadge}>
              <Text style={styles.caseText}>Case</Text>
            </View>
          )}
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${statusInfo.color}20` },
          ]}
        >
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.detailText}>{event.time}</Text>
        </View>

        {event.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location}
            </Text>
          </View>
        )}
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  sourceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  caseBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  caseText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
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
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 12,
    lineHeight: 22,
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 6,
    flex: 1,
  },
});

export default EventCard;

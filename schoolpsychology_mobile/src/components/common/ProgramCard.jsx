import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProgramCard = ({ program, onPress }) => {
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "#34C759";
      case "INACTIVE":
        return "#FF3B30";
      case "PENDING":
        return "#FF9500";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "INACTIVE":
        return "Không hoạt động";
      case "PENDING":
        return "Chờ xác nhận";
      default:
        return "Không xác định";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(program)}>
      {/* Program Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri:
              program.thumbnail ||
              "https://via.placeholder.com/400x200?text=No+Image",
          }}
          style={styles.programImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(program.status || "INACTIVE") },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(program.status || "INACTIVE")}
            </Text>
          </View>
        </View>
      </View>

      {/* Program Info */}
      <View style={styles.content}>
        {/* Title and Category */}
        <View style={styles.header}>
          <Text style={styles.programTitle} numberOfLines={2}>
            {program.name || "Untitled Program"}
          </Text>
          <View style={styles.categoryContainer}>
            <Ionicons name="pricetag" size={14} color="#007AFF" />
            <Text style={styles.categoryText}>
              {program.category?.name || "General"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {program.description || "No description available"}
        </Text>

        {/* Time and Location */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#007AFF" />
            <Text style={styles.infoText}>
              {program.startTime ? formatDateTime(program.startTime) : "TBD"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#34C759" />
            <Text style={styles.infoText} numberOfLines={1}>
              {program.location || "TBD"}
            </Text>
          </View>
        </View>

        {/* Host and Participants */}
        <View style={styles.footer}>
          <View style={styles.hostInfo}>
            <Ionicons name="person" size={14} color="#6B7280" />
            <Text style={styles.hostText} numberOfLines={1}>
              {program.hostedBy?.fullName || "Unknown Host"}
            </Text>
          </View>

          <View style={styles.participantsInfo}>
            <Ionicons name="people" size={14} color="#6B7280" />
            <Text style={styles.participantsText}>
              {program.participants || 0}/{program.maxParticipants || 0}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: "relative",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: "hidden",
  },
  programImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#181A3D",
    marginBottom: 4,
    lineHeight: 24,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 12,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 6,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  hostText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
    flex: 1,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
    fontWeight: "500",
  },
});

export default ProgramCard;

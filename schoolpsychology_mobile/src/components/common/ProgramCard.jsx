import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const ProgramCard = ({ program, onPress, numberOfLines = 2 }) => {
  const { t } = useTranslation();
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
      case "P_COMPLETED":
        return "#34C759";
      case "COMPLETED":
        return "#8E8E93";
      case "ON_GOING":
        return "#007AFF";
      case "ENROLLED":
        return "#FF9500";
      case "ABSENT":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return t("program.detail.status.active");
      case "ON_GOING":
        return t("program.detail.status.onGoing");
      case "COMPLETED":
        return t("program.detail.status.completed");
      case "P_COMPLETED":
        return t("program.detail.status.pCompleted");
      case "ENROLLED":
        return t("program.detail.status.enrolled");
      case "ABSENT":
        return t("program.detail.status.absent");
      case "IN_PROGRESS":
        return t("program.detail.status.inProgress");
      default:
        return t("program.detail.status.unknown");
    }
  };

  const getSecureUrl = (url) => {
    if (!url) return "https://via.placeholder.com/400x200?text=No+Image";
    return url.startsWith("http://") ? url.replace("http://", "https://") : url;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(program)}>
      {/* Program Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getSecureUrl(program?.thumbnail?.url) }}
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
            <Ionicons name="easel" size={14} color={"#FFFFFF"} />
            <Text style={styles.statusText}>
              {getStatusText(program.status || "INACTIVE")}
            </Text>
          </View>
          {program.registrationStatus && (
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(
                    program.registrationStatus === "COMPLETED"
                      ? "P_COMPLETED"
                      : program.registrationStatus || "INACTIVE"
                  ),
                },
              ]}
            >
              <Ionicons name="person" size={14} color={"#FFFFFF"} />
              <Text style={styles.statusText}>
                {getStatusText(
                  program.registrationStatus === "COMPLETED"
                    ? "P_COMPLETED"
                    : program.registrationStatus || "INACTIVE"
                )}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Program Info */}
      <View style={styles.content}>
        {/* Title and Category */}
        <View style={styles.header}>
          <Text style={styles.programTitle} numberOfLines={numberOfLines}>
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
        <Text style={styles.description} numberOfLines={numberOfLines}>
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
    flexDirection: "column",
    gap: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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

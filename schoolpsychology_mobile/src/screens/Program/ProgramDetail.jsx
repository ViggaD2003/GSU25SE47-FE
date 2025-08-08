import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Container } from "../../components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import {
  fetchProgramDetails,
  joinProgram,
  leaveProgram,
} from "../../services/api/ProgramService";
import { Loading } from "../../components/common";

const { width } = Dimensions.get("window");

export default function ProgramDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { programId } = route.params;

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    fetchProgramData();
  }, [programId]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const data = await fetchProgramDetails(programId);
      setProgram(data);
      // Check if user is already joined (you might need to adjust this based on your API)
      setIsJoined(data.isJoined || false);
    } catch (error) {
      console.error("Error fetching program details:", error);
      Alert.alert("Error", "Failed to load program details");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProgram = async () => {
    try {
      setJoining(true);
      await joinProgram(programId);
      setIsJoined(true);
      Alert.alert("Success", "You have successfully joined the program!");
      fetchProgramData(); // Refresh data
    } catch (error) {
      console.error("Error joining program:", error);
      Alert.alert("Error", "Failed to join program. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveProgram = async () => {
    Alert.alert(
      "Leave Program",
      "Are you sure you want to leave this program?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setJoining(true);
              await leaveProgram(programId);
              setIsJoined(false);
              Alert.alert("Success", "You have left the program");
              fetchProgramData(); // Refresh data
            } catch (error) {
              console.error("Error leaving program:", error);
              Alert.alert(
                "Error",
                "Failed to leave program. Please try again."
              );
            } finally {
              setJoining(false);
            }
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("vi-VN", {
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

  if (loading) {
    return (
      <Container>
        <HeaderWithoutTab
          title="Program Details"
          onBackPress={handleBackPress}
        />
        <Loading />
      </Container>
    );
  }

  if (!program) {
    return (
      <Container>
        <HeaderWithoutTab
          title="Program Details"
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Program not found</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab title="Program Details" onBackPress={handleBackPress} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
                {
                  backgroundColor: getStatusColor(program.status || "INACTIVE"),
                },
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
          <View style={styles.headerSection}>
            <Text style={styles.programTitle}>
              {program.name || "Untitled Program"}
            </Text>
            <View style={styles.categoryContainer}>
              <Ionicons name="pricetag" size={16} color="#007AFF" />
              <Text style={styles.categoryText}>
                {program.category?.name || "General"}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {program.description || "No description available"}
            </Text>
          </View>

          {/* Time and Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule & Location</Text>

            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Start Time</Text>
                <Text style={styles.infoValue}>
                  {program.startTime
                    ? formatDateTime(program.startTime)
                    : "TBD"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color="#FF9500" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>End Time</Text>
                <Text style={styles.infoValue}>
                  {program.endTime ? formatDateTime(program.endTime) : "TBD"}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color="#34C759" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>
                  {program.location || "TBD"}
                </Text>
              </View>
            </View>
          </View>

          {/* Host Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hosted By</Text>
            <View style={styles.hostCard}>
              <View style={styles.hostAvatar}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>
                  {program.hostedBy?.fullName || "Unknown Host"}
                </Text>
                <Text style={styles.hostRole}>
                  {program.hostedBy?.roleName || "Counselor"}
                </Text>
                <Text style={styles.hostCode}>
                  Code: {program.hostedBy?.counselorCode || "N/A"}
                </Text>
                {program.hostedBy?.linkMeet && (
                  <TouchableOpacity style={styles.meetLink}>
                    <Ionicons name="videocam" size={16} color="#007AFF" />
                    <Text style={styles.meetLinkText}>Join Meeting</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Program Survey */}
          {program.programSurvey && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Program Survey</Text>
              <View style={styles.surveyCard}>
                <Text style={styles.surveyTitle}>
                  {program.programSurvey?.title || "Survey"}
                </Text>
                <Text style={styles.surveyDescription}>
                  {program.programSurvey?.description ||
                    "No description available"}
                </Text>
                <View style={styles.surveyDetails}>
                  <View style={styles.surveyDetail}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#34C759"
                    />
                    <Text style={styles.surveyDetailText}>
                      {program.programSurvey?.isRequired
                        ? "Required"
                        : "Optional"}
                    </Text>
                  </View>
                  <View style={styles.surveyDetail}>
                    <Ionicons name="repeat" size={16} color="#007AFF" />
                    <Text style={styles.surveyDetailText}>
                      {program.programSurvey?.isRecurring
                        ? "Recurring"
                        : "One-time"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Participants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <View style={styles.participantsInfo}>
              <View style={styles.participantCount}>
                <Ionicons name="people" size={20} color="#007AFF" />
                <Text style={styles.participantText}>
                  {program.participants || 0} / {program.maxParticipants || 0}{" "}
                  participants
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${
                        ((program.participants || 0) /
                          (program.maxParticipants || 1)) *
                        100
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isJoined ? styles.leaveButton : styles.joinButton,
            joining && styles.disabledButton,
          ]}
          onPress={isJoined ? handleLeaveProgram : handleJoinProgram}
          disabled={joining}
        >
          {joining ? (
            <Text style={styles.actionButtonText}>Loading...</Text>
          ) : (
            <>
              <Ionicons
                name={isJoined ? "exit" : "add"}
                size={20}
                color={isJoined ? "#FF3B30" : "#FFFFFF"}
              />
              <Text style={styles.actionButtonText}>
                {isJoined ? "Leave Program" : "Join Program"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  programImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  programTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#181A3D",
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 4,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#181A3D",
    fontWeight: "500",
  },
  hostCard: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  hostInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 2,
  },
  hostRole: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  hostCode: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 8,
  },
  meetLink: {
    flexDirection: "row",
    alignItems: "center",
  },
  meetLinkText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 4,
    textDecorationLine: "underline",
  },
  surveyCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 4,
  },
  surveyDescription: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  surveyDetails: {
    flexDirection: "row",
    gap: 16,
  },
  surveyDetail: {
    flexDirection: "row",
    alignItems: "center",
  },
  surveyDetailText: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
  participantsInfo: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  participantCount: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  participantText: {
    fontSize: 16,
    color: "#181A3D",
    marginLeft: 8,
    fontWeight: "500",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  actionContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButton: {
    backgroundColor: "#007AFF",
  },
  leaveButton: {
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 16,
    textAlign: "center",
  },
});

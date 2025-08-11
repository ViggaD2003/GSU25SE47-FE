import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { Container } from "../../components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import {
  fetchProgramDetails,
  joinProgram,
  leaveProgram,
} from "../../services/api/ProgramService";
import { Loading } from "../../components/common";
import { useAuth } from "@/contexts";

const { width } = Dimensions.get("window");

export default function ProgramDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { programId } = route.params;
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return null;
  }

  useEffect(() => {
    fetchProgramData();
  }, [programId]);

  useEffect(() => {
    if (program) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [program]);

  const fetchProgramData = async () => {
    try {
      setLoading(true);
      const data = await fetchProgramDetails(programId, user.id);
      setProgram(data);
      setIsJoined(data.student ? true : false);
    } catch (error) {
      console.error("Error fetching program details:", error);
      Alert.alert(t("common.errorTitle"), t("common.errors.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProgramData();
    setRefreshing(false);
  }, []);

  const handleJoinProgram = async () => {
    try {
      setJoining(true);
      await joinProgram(programId);
      setIsJoined(true);
      Alert.alert(t("common.success"), t("program.detail.joinSuccess"));
      fetchProgramData();
    } catch (error) {
      console.error("Error joining program:", error);
      Alert.alert(t("common.errorTitle"), t("program.detail.joinError"));
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveProgram = async () => {
    Alert.alert(
      t("program.detail.leaveConfirmTitle"),
      t("program.detail.leaveConfirmMessage"),
      [
        { text: t("program.detail.cancel"), style: "cancel" },
        {
          text: t("program.detail.leave"),
          style: "destructive",
          onPress: async () => {
            try {
              setJoining(true);
              await leaveProgram(programId);
              setIsJoined(false);
              Alert.alert(
                t("common.success"),
                t("program.detail.leaveSuccess")
              );
              fetchProgramData();
            } catch (error) {
              console.error("Error leaving program:", error);
              Alert.alert(
                t("common.errorTitle"),
                t("program.detail.leaveError")
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
      case "ON_GOING":
        return "#007AFF";
      case "COMPLETED":
        return "#FF9500";
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
      default:
        return status || "Unknown";
    }
  };

  const getStudentStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "#34C759";
      case "COMPLETED":
        return "#FF9500";
      case "ENROLLED":
        return "#007AFF";
      case "ABSENT":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStudentStatusText = (status) => {
    switch (status) {
      case "ACTIVE":
        return t("program.detail.studentStatus.active");
      case "COMPLETED":
        return t("program.detail.studentStatus.completed");
      case "ENROLLED":
        return t("program.detail.studentStatus.enrolled");
      case "ABSENT":
        return t("program.detail.studentStatus.absent");
      default:
        return status || "Unknown";
    }
  };

  const getSurveyIdentityText = (identity) => {
    switch (identity) {
      case "ENTRY":
        return t("program.detail.surveyIdentity.entry");
      case "EXIT":
        return t("program.detail.surveyIdentity.exit");
      default:
        return identity || "Unknown";
    }
  };

  const getSurveyIdentityColor = (identity) => {
    switch (identity) {
      case "ENTRY":
        return "#34C759";
      case "EXIT":
        return "#FF9500";
      default:
        return "#8E8E93";
    }
  };

  const renderSurveyProgress = () => {
    if (
      !program.student?.surveyRecord ||
      program.student.surveyRecord.length === 0
    ) {
      return null;
    }

    const entrySurvey = program.student.surveyRecord.find(
      (s) => s.identify === "ENTRY"
    );
    const exitSurvey = program.student.surveyRecord.find(
      (s) => s.identify === "EXIT"
    );

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("program.detail.surveyProgress.title")}
        </Text>

        <View style={styles.surveyProgressContainer}>
          {/* Entry Survey */}
          <View style={styles.surveyCard}>
            <View style={styles.surveyHeader}>
              <View
                style={[
                  styles.surveyBadge,
                  { backgroundColor: getSurveyIdentityColor("ENTRY") },
                ]}
              >
                <Text style={styles.surveyBadgeText}>
                  {t("program.detail.surveyProgress.entrySurvey")}
                </Text>
              </View>
              {entrySurvey ? (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: entrySurvey.isSkipped
                        ? "#FF3B30"
                        : "#34C759",
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {entrySurvey.isSkipped
                      ? t("program.detail.surveyProgress.surveySkipped")
                      : t("program.detail.surveyProgress.surveyCompleted")}
                  </Text>
                </View>
              ) : (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#007AFF" }]}
                >
                  <Text style={styles.statusBadgeText}>
                    {t("program.detail.surveyProgress.takeSurvey")}
                  </Text>
                </View>
              )}
            </View>

            {entrySurvey && !entrySurvey.isSkipped && (
              <View style={styles.surveyResults}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {t("program.detail.surveyProgress.totalScore")}:
                  </Text>
                  <Text style={styles.resultValue}>
                    {entrySurvey.totalScore}
                  </Text>
                </View>
                {entrySurvey.level && (
                  <>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>
                        {t("program.detail.surveyProgress.level")}:
                      </Text>
                      <Text style={styles.resultValue}>
                        {entrySurvey.level.label}
                      </Text>
                    </View>
                    <Text style={styles.resultDescription}>
                      {entrySurvey.level.description}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Exit Survey */}
          <View style={styles.surveyCard}>
            <View style={styles.surveyHeader}>
              <View
                style={[
                  styles.surveyBadge,
                  { backgroundColor: getSurveyIdentityColor("EXIT") },
                ]}
              >
                <Text style={styles.surveyBadgeText}>
                  {t("program.detail.surveyProgress.exitSurvey")}
                </Text>
              </View>
              {exitSurvey ? (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: exitSurvey.isSkipped
                        ? "#FF3B30"
                        : "#34C759",
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {exitSurvey.isSkipped
                      ? t("program.detail.surveyProgress.surveySkipped")
                      : t("program.detail.surveyProgress.surveyCompleted")}
                  </Text>
                </View>
              ) : (
                <View
                  style={[styles.statusBadge, { backgroundColor: "#007AFF" }]}
                >
                  <Text style={styles.statusBadgeText}>
                    {t("program.detail.surveyProgress.takeSurvey")}
                  </Text>
                </View>
              )}
            </View>

            {exitSurvey && !exitSurvey.isSkipped && (
              <View style={styles.surveyResults}>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>
                    {t("program.detail.surveyProgress.totalScore")}:
                  </Text>
                  <Text style={styles.resultValue}>
                    {exitSurvey.totalScore}
                  </Text>
                </View>
                {exitSurvey.level && (
                  <>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>
                        {t("program.detail.surveyProgress.level")}:
                      </Text>
                      <Text style={styles.resultValue}>
                        {exitSurvey.level.label}
                      </Text>
                    </View>
                    <Text style={styles.resultDescription}>
                      {exitSurvey.level.description}
                    </Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Final Score */}
        {program.student?.finalScore !== undefined && (
          <View style={styles.finalScoreCard}>
            <Text style={styles.finalScoreTitle}>
              {t("program.detail.surveyProgress.finalScore")}
            </Text>
            <Text style={styles.finalScoreValue}>
              {program.student.finalScore}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <Container>
        <HeaderWithoutTab
          title={t("program.detail.title")}
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
          title={t("program.detail.title")}
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>
            {t("program.detail.programNotFound")}
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title={t("program.detail.title")}
        onBackPress={handleBackPress}
        showRefreshButton={true}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
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
                  { backgroundColor: getStatusColor(program.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusText(program.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Program Info */}
          <View style={styles.content}>
            {/* Title and Category */}
            <View style={styles.headerSection}>
              <Text style={styles.programTitle}>
                {program.name || t("program.list.empty.title")}
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
              <Text style={styles.sectionTitle}>
                {t("program.detail.description")}
              </Text>
              <Text style={styles.descriptionText}>
                {program.description || t("common.notAvailable")}
              </Text>
            </View>

            {/* Time and Location */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("program.detail.scheduleLocation")}
              </Text>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("program.detail.startTime")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {program.startTime
                      ? formatDateTime(program.startTime)
                      : t("common.notAvailable")}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#FF9500" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("program.detail.endTime")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {program.endTime
                      ? formatDateTime(program.endTime)
                      : t("common.notAvailable")}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color="#34C759" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>
                    {t("program.detail.location")}
                  </Text>
                  <Text style={styles.infoValue}>
                    {program.location || t("common.notAvailable")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Host Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("program.detail.hostedBy")}
              </Text>
              <View style={styles.hostCard}>
                <View style={styles.hostAvatar}>
                  <Ionicons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.hostInfo}>
                  <Text style={styles.hostName}>
                    {program.hostedBy?.fullName || t("common.notAvailable")}
                  </Text>
                  <Text style={styles.hostRole}>
                    {program.hostedBy?.roleName || "Counselor"}
                  </Text>
                  <Text style={styles.hostEmail}>
                    {program.hostedBy?.email || t("common.notAvailable")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Program Survey */}
            {program.surveyId && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("program.detail.survey")}
                </Text>
                <View style={styles.surveyCard}>
                  <Text style={styles.surveyTitle}>
                    {t("program.detail.survey")}
                  </Text>
                  <Text style={styles.surveyDescription}>
                    {t("program.detail.survey")}
                  </Text>
                  <View style={styles.surveyDetails}>
                    <View style={styles.surveyDetail}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color="#34C759"
                      />
                      <Text style={styles.surveyDetailText}>
                        {t("program.detail.required")}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Survey Progress */}
            {renderSurveyProgress()}

            {/* Participants */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("program.detail.participants")}
              </Text>
              <View style={styles.participantsInfo}>
                <View style={styles.participantCount}>
                  <Ionicons name="people" size={20} color="#007AFF" />
                  <Text style={styles.participantText}>
                    {program.participants || 0} / {program.maxParticipants || 0}{" "}
                    {t("program.detail.participants").toLowerCase()}
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

            {/* Student Status */}
            {program.student && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Status</Text>
                <View style={styles.studentStatusCard}>
                  <View
                    style={[
                      styles.studentStatusBadge,
                      {
                        backgroundColor: getStudentStatusColor(
                          program.student.status
                        ),
                      },
                    ]}
                  >
                    <Text style={styles.studentStatusText}>
                      {getStudentStatusText(program.student.status)}
                    </Text>
                  </View>
                  {program.student.joinAt && (
                    <Text style={styles.joinDate}>
                      Joined: {formatDateTime(program.student.joinAt)}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </Animated.View>
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
            <Text style={styles.actionButtonText}>
              {t("program.detail.loading")}
            </Text>
          ) : (
            <>
              <Ionicons
                name={isJoined ? "exit" : "add"}
                size={20}
                color={isJoined ? "#FF3B30" : "#FFFFFF"}
              />
              <Text style={styles.actionButtonText}>
                {isJoined
                  ? t("program.detail.leaveProgram")
                  : t("program.detail.joinProgram")}
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
  statusBadgeText: {
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
  hostEmail: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 2,
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
    marginBottom: 16,
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
  surveyProgressContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  surveyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  surveyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  surveyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  surveyResults: {
    marginTop: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#181A3D",
  },
  resultDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },
  finalScoreCard: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginTop: 24,
  },
  finalScoreTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 8,
  },
  finalScoreValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#34C759",
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
  studentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 24,
  },
  studentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  studentStatusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  joinDate: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 12,
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

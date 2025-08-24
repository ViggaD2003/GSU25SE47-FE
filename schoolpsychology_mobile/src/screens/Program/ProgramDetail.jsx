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
import { useAuth, useChildren } from "@/contexts";

const { width } = Dimensions.get("window");

export default function ProgramDetail() {
  const navigation = useNavigation();
  const route = useRoute();
  const { programId } = route.params;
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { selectedChild } = useChildren();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return (
      <Container>
        <Loading />
      </Container>
    );
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
      if (!user?.id) {
        setProgram(null);
        return;
      }

      const userId =
        user?.role === "PARENTS" ? selectedChild?.id : user?.id || user?.userId;

      setLoading(true);
      const data = await fetchProgramDetails(programId, userId);

      // console.log("detail data", data);

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
    // Check if program status is ACTIVE
    if (!canJoinOrLeave()) {
      Alert.alert(
        t("common.errorTitle"),
        t("program.detail.cannotJoinInactive")
      );
      return;
    }

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
    // Check if program status is ACTIVE
    if (!canJoinOrLeave()) {
      Alert.alert(
        t("common.errorTitle"),
        t("program.detail.cannotLeaveInactive")
      );
      return;
    }

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
              await leaveProgram(programId, user.id);
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
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";
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
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";
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
        return "#007AFF";
      case "ENROLLED":
        return "#FF9500";
      case "ABSENT":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStudentStatusText = (status) => {
    switch (status) {
      case "FIRST_SURVEY":
        return t("program.detail.studentStatus.firstSurvey");
      case "SECOND_SURVEY":
        return t("program.detail.studentStatus.secondSurvey");
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

  const getSurveyIdentityColor = (identity) => {
    switch (identity) {
      case "ENTRY":
        return "#007AFF";
      case "EXIT":
        return "#007AFF";
      default:
        return "#8E8E93";
    }
  };

  const canJoinOrLeave = () => {
    // console.log("program", program);
    return (
      program &&
      program.status === "ACTIVE" &&
      (!program?.student || program?.student?.surveyRecord?.length === 0)
    );
  };

  const renderSurveyProgress = () => {
    if (!program.student || !program.student.surveyRecord) {
      return null;
    }

    const entrySurvey = program.student?.surveyRecord?.find(
      (s) => s.identify === "ENTRY"
    );

    // console.log("entrySurvey", entrySurvey);

    const exitSurvey = program.student?.surveyRecord?.find(
      (s) => s.identify === "EXIT"
    );

    // console.log("exitSurvey", exitSurvey);

    const isActiveSurvey = program.isActiveSurvey;
    const finalScore = exitSurvey?.totalScore - entrySurvey?.totalScore;
    const finalScoreColor = finalScore > 0 ? "#34C759" : "#FF3B30";

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>
            {t("program.detail.surveyProgress.title")}
          </Text>
        </View>

        <View style={styles.surveyProgressContainer}>
          <TouchableOpacity
            style={styles.surveyCard}
            onPress={() => {
              navigation.navigate("Survey", {
                screen: "SurveyResult",
                params: {
                  result: entrySurvey,
                  type: "view",
                  showRecordsButton: false,
                  programId,
                },
              });
            }}
            disabled={!entrySurvey}
          >
            <View style={styles.surveyHeader}>
              <View
                style={[
                  styles.surveyBadge,
                  { backgroundColor: getSurveyIdentityColor("ENTRY") },
                ]}
              >
                <Ionicons name="enter-outline" size={16} color="#FFFFFF" />
                <Text style={styles.surveyBadgeText}>
                  {t("program.detail.surveyProgress.entrySurvey")}
                </Text>
              </View>
              {entrySurvey ? (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isActiveSurvey ? "#34C759" : "#007AFF",
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {t("program.detail.surveyProgress.surveyCompleted")}
                  </Text>
                </View>
              ) : (
                user.role === "STUDENT" && (
                  <TouchableOpacity
                    style={[styles.statusBadge, { backgroundColor: "#007AFF" }]}
                    onPress={() => {
                      // console.log(user.token);

                      navigation.navigate("Survey", {
                        screen: "SurveyInfo",
                        params: { surveyId: program.surveyId, programId },
                      });
                    }}
                    disabled={!isActiveSurvey || entrySurvey}
                  >
                    <Text style={styles.statusBadgeText}>
                      {t("program.detail.surveyProgress.takeSurvey")}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {entrySurvey && (
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
          </TouchableOpacity>

          {/* Exit Survey */}
          {entrySurvey && (
            <TouchableOpacity
              style={styles.surveyCard}
              onPress={() => {
                navigation.navigate("Survey", {
                  screen: "SurveyResult",
                  params: {
                    result: exitSurvey,
                    type: "view",
                    showRecordsButton: false,
                    programId,
                  },
                });
              }}
              disabled={!exitSurvey}
            >
              <View style={styles.surveyHeader}>
                <View
                  style={[
                    styles.surveyBadge,
                    { backgroundColor: getSurveyIdentityColor("EXIT") },
                  ]}
                >
                  <Ionicons name="exit-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.surveyBadgeText}>
                    {t("program.detail.surveyProgress.exitSurvey")}
                  </Text>
                </View>
                {exitSurvey ? (
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isActiveSurvey ? "#34C759" : "#007AFF",
                      },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {t("program.detail.surveyProgress.surveyCompleted")}
                    </Text>
                  </View>
                ) : (
                  user.role === "STUDENT" && (
                    <TouchableOpacity
                      style={[
                        styles.statusBadge,
                        { backgroundColor: "#007AFF" },
                      ]}
                      onPress={() => {
                        navigation.navigate("Survey", {
                          screen: "SurveyInfo",
                          params: { surveyId: program.surveyId, programId },
                        });
                      }}
                      disabled={!isActiveSurvey || exitSurvey}
                    >
                      <Text style={styles.statusBadgeText}>
                        {t("program.detail.surveyProgress.takeSurvey")}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              {exitSurvey && (
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
            </TouchableOpacity>
          )}
        </View>

        {/* Final Score */}
        {entrySurvey && exitSurvey && (
          <View style={styles.finalScoreCard}>
            <View style={styles.finalScoreHeader}>
              <Ionicons
                name={
                  finalScore > 0
                    ? "trending-up"
                    : finalScore < 0
                    ? "trending-down"
                    : "remove"
                }
                size={24}
                color={finalScoreColor}
              />
              <Text style={styles.finalScoreTitle}>
                {t("program.detail.surveyProgress.finalScore")}
              </Text>
            </View>

            {/* Score Display */}
            <View style={styles.scoreDisplay}>
              <Text
                style={[styles.finalScoreValue, { color: finalScoreColor }]}
              >
                {finalScore > 0 ? `+${finalScore}` : finalScore}
              </Text>

              {/* Trend Indicator */}
              <View
                style={[
                  styles.trendBadge,
                  { backgroundColor: finalScoreColor },
                ]}
              >
                <Ionicons
                  name={
                    finalScore > 0
                      ? "arrow-up"
                      : finalScore < 0
                      ? "arrow-down"
                      : "remove"
                  }
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.trendText}>
                  {finalScore > 0
                    ? t("program.detail.surveyProgress.improvement")
                    : finalScore < 0
                    ? t("program.detail.surveyProgress.decline")
                    : t("program.detail.surveyProgress.noChange")}
                </Text>
              </View>
            </View>

            {/* Score Breakdown */}
            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>
                  {t("program.detail.surveyProgress.entryScore")}:
                </Text>
                <Text style={styles.scoreValue}>{entrySurvey.totalScore}</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>
                  {t("program.detail.surveyProgress.exitScore")}:
                </Text>
                <Text style={styles.scoreValue}>{exitSurvey.totalScore}</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  const StudentStatusCard = ({ styleBadge, statusText, time, timeLabel }) => {
    return (
      <View style={styles.studentStatusCard}>
        <View style={[styles.studentStatusBadge, styleBadge]}>
          <Text style={styles.studentStatusText}>{statusText}</Text>
        </View>
        {time && (
          <Text style={styles.joinDate}>
            {timeLabel} {formatDateTime(time)}
          </Text>
        )}
      </View>
    );
  };

  const renderStudentStatus = () => {
    if (!program.student) return null;

    const entrySurvey =
      program.student.surveyRecord &&
      program.student.surveyRecord.find((s) => s.identify === "ENTRY");

    const exitSurvey =
      program.student.surveyRecord &&
      program.student.surveyRecord.find((s) => s.identify === "EXIT");

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>
            {t("program.detail.yourStatus")}
          </Text>
        </View>
        <View style={styles.studentStatusContainer}>
          <StudentStatusCard
            styleBadge={{
              backgroundColor: getStudentStatusColor("ENROLLED"),
            }}
            statusText={getStudentStatusText("ENROLLED")}
            time={program.student.joinAt}
            timeLabel={t("program.detail.joinedAt")}
          />

          {/* First Survey */}
          {entrySurvey && (
            <StudentStatusCard
              styleBadge={{
                backgroundColor: getStudentStatusColor("ACTIVE"),
              }}
              statusText={getStudentStatusText("ACTIVE")}
              time={entrySurvey.completedAt}
              timeLabel={t("program.detail.activeAt")}
            />
          )}

          {/* Exit Survey && Student Status is COMPLETED */}
          {exitSurvey && (
            <StudentStatusCard
              styleBadge={{
                backgroundColor: getStudentStatusColor("COMPLETED"),
              }}
              statusText={getStudentStatusText("COMPLETED")}
              time={exitSurvey.completedAt}
              timeLabel={t("program.detail.completedAt")}
            />
          )}

          {/* Absent */}
          {!entrySurvey && program.student.status === "ABSENT" && (
            <StudentStatusCard
              styleBadge={{
                backgroundColor: getStudentStatusColor("ABSENT"),
              }}
              statusText={getStudentStatusText("ABSENT")}
              // time={program.student.joinAt}
              // timeLabel={t("program.detail.completedAt")}
            />
          )}
        </View>
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
          {/* Hero Section with Image and Status */}
          <View style={styles.heroSection}>
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
                      backgroundColor: getStatusColor(
                        program.status || "UNKNOWN"
                      ),
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      program.status === "ACTIVE"
                        ? "play-circle"
                        : program.status === "ON_GOING"
                        ? "time"
                        : "checkmark-circle"
                    }
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {getStatusText(program.status || "UNKNOWN")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Program Header Info */}
            <View style={styles.programHeader}>
              <View style={styles.titleSection}>
                <Text style={styles.programTitle}>
                  {program.name || t("program.list.empty.title")}
                </Text>
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryBadge}>
                    <Ionicons name="pricetag" size={16} color="#007AFF" />
                    <Text style={styles.categoryText}>
                      {program.category?.name || "General"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={20} color="#007AFF" />
                  <Text style={styles.statValue}>
                    {program.participants || 0}
                  </Text>
                  <Text style={styles.statLabel}>
                    {t("program.detail.participants")}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="time" size={20} color="#FF9500" />
                  <Text style={styles.statValue}>
                    {program.startTime ? formatTime(program.startTime) : "--"}
                  </Text>
                  <Text style={styles.statLabel}>
                    {t("program.detail.startTime")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Participants Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={24} color="#007AFF" />
                <Text style={styles.sectionTitle}>
                  {t("program.detail.participants")}
                </Text>
              </View>
              <View style={styles.participantsCard}>
                <View style={styles.participantsHeader}>
                  <View style={styles.participantCount}>
                    <Text style={styles.participantNumber}>
                      {program.participants || 0}
                    </Text>
                    <Text style={styles.participantText}>
                      / {program.maxParticipants || 0}
                    </Text>
                  </View>
                  <Text style={styles.participantLabel}>
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

            {/* Description Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.sectionTitle}>
                  {t("program.detail.description")}
                </Text>
              </View>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>
                  {program.description || t("common.notAvailable")}
                </Text>
              </View>
            </View>

            {/* Schedule & Location Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="calendar-outline" size={24} color="#007AFF" />
                <Text style={styles.sectionTitle}>
                  {t("program.detail.scheduleLocation")}
                </Text>
              </View>

              <View style={styles.scheduleCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Ionicons name="calendar" size={20} color="#007AFF" />
                  </View>
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
                  <View style={styles.infoIcon}>
                    <Ionicons name="time" size={20} color="#FF9500" />
                  </View>
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
                  <View style={styles.infoIcon}>
                    <Ionicons name="location" size={20} color="#34C759" />
                  </View>
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
            </View>

            {/* Host Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-outline" size={24} color="#007AFF" />
                <Text style={styles.sectionTitle}>
                  {t("program.detail.hostedBy")}
                </Text>
              </View>
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
                <View style={styles.sectionHeader}>
                  <Ionicons
                    name="clipboard-outline"
                    size={24}
                    color="#007AFF"
                  />
                  <Text style={styles.sectionTitle}>
                    {t("program.detail.survey")}
                  </Text>
                </View>
                <View style={styles.surveyCard}>
                  <View style={styles.surveyInfo}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#34C759"
                    />
                    <Text style={styles.surveyRequired}>
                      {t("program.detail.required")}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Survey Progress */}
            <View style={styles.section}>
              {program?.student && renderSurveyProgress()}
            </View>

            {/* Student Status */}
            {renderStudentStatus()}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Action Button */}
      {user?.role === "STUDENT" && (
        <View
          style={[
            styles.actionContainer,
            !canJoinOrLeave() && {
              padding: 0,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              isJoined ? styles.leaveButton : styles.joinButton,
              (joining || !canJoinOrLeave()) && styles.disabledButton,
            ]}
            onPress={isJoined ? handleLeaveProgram : handleJoinProgram}
            disabled={joining || !canJoinOrLeave()}
          >
            {joining ? (
              <Text style={styles.actionButtonText}>
                {t("program.detail.loading")}
              </Text>
            ) : !canJoinOrLeave() ? (
              <></>
            ) : (
              <>
                <Ionicons
                  name={isJoined ? "exit" : "add"}
                  size={20}
                  color={isJoined ? "#FF3B30" : "#FFFFFF"}
                />
                <Text
                  style={
                    isJoined ? styles.leaveButtonText : styles.joinButtonText
                  }
                >
                  {isJoined
                    ? t("program.detail.leaveProgram")
                    : t("program.detail.joinProgram")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  heroSection: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    height: 220,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  programHeader: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#181A3D",
    marginBottom: 12,
    lineHeight: 34,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0F2FE",
  },
  categoryText: {
    fontSize: 14,
    color: "#007AFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E2E8F0",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#181A3D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  mainContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#181A3D",
  },
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  scheduleCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#181A3D",
    fontWeight: "600",
    lineHeight: 22,
  },
  hostCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
    justifyContent: "center",
  },
  hostName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 4,
  },
  hostRole: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
    fontWeight: "500",
  },
  hostEmail: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  surveyCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  surveyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  surveyRequired: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  surveyProgressContainer: {
    gap: 16,
  },
  surveyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
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
    marginBottom: 16,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  surveyResults: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  resultValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181A3D",
  },
  resultDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    lineHeight: 20,
    fontStyle: "italic",
  },
  finalScoreCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  finalScoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  finalScoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181A3D",
  },
  finalScoreValue: {
    fontSize: 48,
    fontWeight: "700",
    color: "#34C759",
  },
  scoreDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  trendText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scoreBreakdown: {
    width: "100%",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#181A3D",
  },
  participantsCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  participantsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  participantCount: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  participantNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
  },
  participantText: {
    fontSize: 18,
    color: "#6B7280",
    marginLeft: 4,
  },
  participantLabel: {
    fontSize: 14,
    color: "#6B7280",
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
    borderRadius: 4,
  },
  studentStatusContainer: {
    gap: 5,
  },
  studentStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    flexWrap: "nowrap",
  },
  studentStatusBadge: {
    width: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  studentStatusText: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  joinDate: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 16,
    fontWeight: "500",
  },
  actionContainer: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: -2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 4,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
  },
  joinButton: {
    backgroundColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  leaveButton: {
    backgroundColor: "#FFE5E5",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  disabledButton: {
    display: "none",
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  leaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
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

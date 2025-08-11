import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { GlobalStyles } from "../../constants";
import {
  StatisticsCard,
  RecordCard,
  SectionHeader,
  Chart,
  ChildSelector,
} from "../../components";
import { AssessmentScoreChart } from "../../components/charts";
import { 
  getChildSurveyRecords, 
  getChildAppointmentRecords, 
  getChildSupportProgramRecords 
} from "../../services";
import { useTranslation } from "react-i18next";
import { useChildren } from "../../contexts";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function ParentHome({
  user,
  navigation,
  setShowToast,
  setToastMessage,
  setToastType,
}) {
  const { t } = useTranslation();
  const { selectedChild, children } = useChildren();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    statistics: {},
    surveyRecords: [],
    appointmentRecords: [],
    supportProgramRecords: [],
    assessmentScores: [],
  });

  // Memoized child selection
  const availableChildren = useMemo(() => {
    return children || [];
  }, [children]);

  // Load dashboard data when selected child changes
  useEffect(() => {
    if (selectedChild) {
      loadDashboardData();
    }
  }, [selectedChild]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (selectedChild) {
        loadDashboardData();
      }
    }, [selectedChild])
  );

  // Safety check for user data
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GlobalStyles.colors.primary} />
        <Text style={styles.loadingText}>{t("parentHome.loadingUser")}</Text>
      </View>
    );
  }

  const loadDashboardData = async () => {
    if (!selectedChild?.userId) return;

    try {
      setLoading(true);
      setError(null);

      const [surveyRecords, appointmentRecords, supportProgramRecords] =
        await Promise.all([
          getChildSurveyRecords(selectedChild.userId),
          getChildAppointmentRecords(
            selectedChild.userId
          ),
          getChildSupportProgramRecords(
            selectedChild.userId
          ),
        ]);

      // Calculate statistics
      const statistics = calculateStatistics(
        surveyRecords,
        appointmentRecords,
        supportProgramRecords
      );

      // Process assessment scores from survey records
      const assessmentScores = processAssessmentScores(surveyRecords);

      setDashboardData({
        surveyRecords: surveyRecords || [],
        appointmentRecords: appointmentRecords?.data || [],
        supportProgramRecords: supportProgramRecords?.data || [],
        statistics,
        assessmentScores,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError(t("common.errorLoadData"));
      setShowToast(true);
      setToastMessage(t("common.errorLoadData"));
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (
    surveyRecords,
    appointmentRecords,
    supportProgramRecords
  ) => {
    const completedSurveys = surveyRecords?.length || 0;
    const activeAppointments = appointmentRecords?.length || 0;
    const activePrograms = supportProgramRecords?.length || 0;

    // Calculate average score from completed surveys
    const averageScore =
      surveyRecords?.length > 0
        ? Math.round(
            surveyRecords.reduce(
              (sum, record) => sum + (record.totalScore || 0),
              0
            ) / surveyRecords.length
          )
        : 0;

    return {
      completedSurveys,
      averageScore,
      activeAppointments,
      activePrograms,
    };
  };

  const processAssessmentScores = (surveyRecords) => {
    if (!surveyRecords || surveyRecords.length === 0) return [];

    // Get the most recent survey record with assessment scores
    const latestRecord = surveyRecords
      .filter(
        (record) =>
          record.assessmentScores && record.assessmentScores.length > 0
      )
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0];

    return latestRecord?.assessmentScores || [];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleChildSelect = (child) => {
    // Child selection is now handled by context
    console.log("Child selected:", child);
  };

  const handleViewAllSurveys = () => {
    navigation.navigate("Survey", { screen: "SurveyRecord" });
  };

  const handleViewAllAppointments = () => {
    navigation.navigate("Appointment", { screen: "AppointmentRecord" });
  };

  const handleViewAllSupportPrograms = () => {
    navigation.navigate("Program", { screen: "ProgramRecord" });
  };

  const handleBooking = () => {
    if (!selectedChild) {
      Alert.alert("Lỗi", "Vui lòng chọn con trước khi đặt lịch tư vấn", [
        { text: "OK" },
      ]);
      return;
    }

    // Save selectedChild to global variable
    global.selectedChildForAppointment = selectedChild;

    // Navigate to Appointment stack
    navigation.navigate("Appointment", {
      screen: "AppointmentMain",
    });
  };

  const handleViewSurveyDetail = (record) => {
    navigation.navigate("Survey", {
      screen: "SurveyResult",
      params: {
        survey: {
          surveyCode: record.surveyCode,
          name: record.surveyName,
          id: record.surveyId,
        },
        result: record,
        screen: "ParentHome",
        showRecordsButton: false,
      },
    });
  };

  const handleViewAppointmentDetail = (record) => {
    navigation.navigate("Appointment", {
      screen: "AppointmentRecordDetail",
      params: { appointment: record },
    });
  };

  const handleViewProgramDetail = (record) => {
    navigation.navigate("Program", {
      screen: "ProgramRecordDetail",
      params: { program: record },
    });
  };

  // Memoized chart data
  const chartData = useMemo(() => {
    const last7Days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString("vi-VN", { weekday: "short" });

      // Mock data - replace with real data from API
      last7Days.push({
        label: dayName,
        value: Math.floor(Math.random() * 10) + 1,
      });
    }

    return last7Days;
  }, []);

  const renderChildSelection = () => {
    if (availableChildren.length <= 1) return null;

    return (
      <View style={styles.childSelectionContainer}>
        <Text style={styles.childSelectionTitle}>
          {t("parentHome.childSelection.title") || "Chọn con"}
        </Text>
        <ChildSelector
          onChildSelect={handleChildSelect}
          style={styles.childSelector}
        />
      </View>
    );
  };

  const renderSelectedChildInfo = () => {
    if (!selectedChild) return null;

    return (
      <View style={styles.selectedChildContainer}>
        <View style={styles.selectedChildHeader}>
          <View style={styles.selectedChildAvatar}>
            <Text style={styles.selectedChildAvatarText}>
              {selectedChild.fullName?.charAt(0)?.toUpperCase() || "C"}
            </Text>
          </View>
          <View style={styles.selectedChildInfo}>
            <Text style={styles.selectedChildName}>
              {selectedChild.fullName}
            </Text>
            <Text style={styles.selectedChildStatus}>
              {selectedChild.isEnable ? (
                <Text style={styles.selectedChildStatusActive}>
                  {t("parentHome.child.status.active")}
                </Text>
              ) : (
                <Text style={styles.selectedChildStatusInactive}>
                  {t("parentHome.child.status.inactive")}
                </Text>
              )}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.childSettingsButton}
            onPress={() => {
              // Navigate to child settings with proper data structure
              navigation.navigate("Profile", {
                screen: "MyChildren",
                params: {
                  data: { student: user?.children || [] },
                  onRefresh: () => {
                    // Refresh parent data if needed
                    console.log("Refreshing parent data");
                  },
                },
              });
            }}
          >
            <Ionicons name="settings-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBookingSection = () => {
    if (!selectedChild) return null;

    return (
      <View style={styles.bookingSection}>
        <TouchableOpacity
          style={styles.bookingButton}
          onPress={handleBooking}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={["#4CAF50", "#45a049"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookingGradient}
          >
            <View style={styles.bookingButtonContent}>
              <View style={styles.bookingIconContainer}>
                <Ionicons name="calendar" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.bookingTextContainer}>
                <Text style={styles.bookingTitle}>
                  {t("parentHome.booking.title")}
                </Text>
                <View style={{ gap: 4 }}>
                  <Text style={styles.bookingSubtitle}>
                    {t("parentHome.booking.subtitle")}
                  </Text>
                  <Text style={styles.bookingChildName}>
                    {selectedChild.fullName}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingArrowContainer}>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStatistics = () => {
    const { statistics } = dashboardData;

    return (
      <>
        <SectionHeader
          title={t("parentHome.stats.title")}
          subtitle={t("parentHome.stats.subtitle")}
          showViewAll={false}
        />

        <View style={styles.statisticsGrid}>
          <StatisticsCard
            title={t("parentHome.stats.completedSurveys.title")}
            value={statistics.completedSurveys || 0}
            change={statistics.completedSurveys > 0 ? "+12%" : "0%"}
            changeType={
              statistics.completedSurveys > 0 ? "positive" : "neutral"
            }
            icon="document-text"
            color="#3B82F6"
            subtitle={t("parentHome.stats.completedSurveys.subtitle")}
            trend={statistics.completedSurveys > 0 ? "up" : "neutral"}
            percentage={statistics.completedSurveys > 0 ? 12 : 0}
            size="small"
          />
          <StatisticsCard
            title={t("parentHome.stats.averageScore.title")}
            value={statistics.averageScore || 0}
            change={statistics.averageScore > 0 ? "+2.1" : "0"}
            changeType={statistics.averageScore > 0 ? "positive" : "neutral"}
            icon="trending-up"
            color="#10B981"
            subtitle={t("parentHome.stats.averageScore.subtitle")}
            trend={statistics.averageScore > 0 ? "up" : "neutral"}
            percentage={statistics.averageScore > 0 ? 21 : 0}
            size="small"
          />
          <StatisticsCard
            title={t("parentHome.stats.appointments.title")}
            value={statistics.activeAppointments || 0}
            change={statistics.activeAppointments > 0 ? "+3" : "0"}
            changeType={
              statistics.activeAppointments > 0 ? "positive" : "neutral"
            }
            icon="calendar"
            color="#F59E0B"
            subtitle={t("parentHome.stats.appointments.subtitle")}
            trend={statistics.activeAppointments > 0 ? "up" : "neutral"}
            percentage={statistics.activeAppointments > 0 ? 15 : 0}
            size="small"
          />
          <StatisticsCard
            title={t("parentHome.stats.programs.title")}
            value={statistics.activePrograms || 0}
            change={statistics.activePrograms > 0 ? "+1" : "0"}
            changeType={statistics.activePrograms > 0 ? "positive" : "neutral"}
            icon="heart"
            color="#EF4444"
            subtitle={t("parentHome.stats.programs.subtitle")}
            trend={statistics.activePrograms > 0 ? "up" : "neutral"}
            percentage={statistics.activePrograms > 0 ? 8 : 0}
            size="small"
          />
        </View>
      </>
    );
  };

  const renderCharts = () => {
    return (
      <>
        {/* <SectionHeader
          title="Biểu đồ thống kê"
          subtitle="Xu hướng 7 ngày gần nhất"
          showViewAll={false}
        />

        <View style={styles.chartsContainer}>
          <Chart
            title="Điểm khảo sát"
            data={chartData}
            type="line"
            color="#10B981"
          />
          <Chart
            title="Số bài khảo sát"
            data={chartData}
            type="bar"
            color="#3B82F6"
          />
        </View> */}
      </>
    );
  };

  const renderAssessmentScores = () => {
    const { assessmentScores } = dashboardData;

    if (assessmentScores.length === 0) return null;

    return (
      <>
        <SectionHeader
          title={t("parentHome.assessment.title")}
          subtitle={t("parentHome.assessment.subtitle")}
          showViewAll={false}
        />
        <AssessmentScoreChart
          scores={assessmentScores}
          title="Phân tích đánh giá"
        />
      </>
    );
  };

  const renderSurveyRecords = () => {
    const { surveyRecords } = dashboardData;

    return (
      <>
        <SectionHeader
          title={t("parentHome.surveys.title")}
          subtitle={t("parentHome.surveys.subtitle", {
            count: surveyRecords.length,
          })}
          onViewAll={handleViewAllSurveys}
        />

        {surveyRecords.length > 0 ? (
          surveyRecords
            .slice(0, 3)
            .map((record, index) => (
              <RecordCard
                key={record.id || index}
                type="survey"
                title={record.survey?.name || record.name}
                subtitle={record.survey?.surveyCode || record.surveyCode}
                date={record.completedAt || record.createdAt}
                status={record.status}
                score={record.totalScore}
                icon="document-text"
                color="#3B82F6"
                onPress={() => handleViewSurveyDetail(record)}
              />
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {t("parentHome.surveys.emptyTitle")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t("parentHome.surveys.emptySubtitle")}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderAppointmentRecords = () => {
    const { appointmentRecords } = dashboardData;

    return (
      <>
        <SectionHeader
          title={t("parentHome.appointments.title")}
          subtitle={t("parentHome.appointments.subtitle", {
            count: appointmentRecords.length,
          })}
          onViewAll={handleViewAllAppointments}
        />

        {appointmentRecords.length > 0 ? (
          appointmentRecords
            .slice(0, 3)
            .map((record, index) => (
              <RecordCard
                key={record.id || index}
                type="appointment"
                title={record.title || record.appointmentType}
                subtitle={record.description}
                date={record.appointmentDate || record.createdAt}
                status={record.status}
                icon="calendar"
                color="#F59E0B"
                onPress={() => handleViewAppointmentDetail(record)}
              />
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {t("parentHome.appointments.emptyTitle")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t("parentHome.appointments.emptySubtitle")}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderSupportProgramRecords = () => {
    const { supportProgramRecords } = dashboardData;

    return (
      <>
        <SectionHeader
          title={t("parentHome.programs.title")}
          subtitle={t("parentHome.programs.subtitle", {
            count: supportProgramRecords.length,
          })}
          onViewAll={handleViewAllSupportPrograms}
        />

        {supportProgramRecords.length > 0 ? (
          supportProgramRecords
            .slice(0, 3)
            .map((record, index) => (
              <RecordCard
                key={record.id || index}
                type="support"
                title={record.programName || record.title}
                subtitle={record.description}
                date={record.startDate || record.createdAt}
                status={record.status}
                icon="heart"
                color="#EF4444"
                onPress={() => handleViewProgramDetail(record)}
              />
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>
              {t("parentHome.programs.emptyTitle")}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t("parentHome.programs.emptySubtitle")}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      bounces={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Child Selection Header */}
      {renderChildSelection()}

      {/* Selected Child Info */}
      {renderSelectedChildInfo()}

      {/* Dashboard Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GlobalStyles.colors.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>{t("common.errorTitle")}</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadDashboardData}
          >
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : selectedChild ? (
        <>
          {/* Quick Booking Button */}
          {renderBookingSection()}

          {/* Statistics Section */}
          {renderStatistics()}

          {/* Charts Section */}
          {renderCharts()}

          {/* Assessment Scores Section */}
          {renderAssessmentScores()}

          {/* Survey Records Section */}
          {renderSurveyRecords()}
          <View style={styles.space} />

          {/* Appointment Records Section */}
          {renderAppointmentRecords()}
          <View style={styles.space} />

          {/* Support Program Records Section */}
          {renderSupportProgramRecords()}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>{t("parentHome.noChild.title")}</Text>
          <Text style={styles.emptySubtitle}>
            {t("parentHome.noChild.subtitle")}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 0,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  scrollContainer: {
    paddingTop: 13,
    paddingHorizontal: 24,
  },
  childSelectionContainer: {
    marginBottom: 24,
  },
  childSelectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  childSelectionScroll: {
    gap: 12,
    paddingRight: 20,
  },
  childOption: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 100,
  },
  childOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: GlobalStyles.colors.primary,
  },
  childAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  childAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  childName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  childNameActive: {
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  selectedChildContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedChildHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedChildAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  selectedChildAvatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  selectedChildInfo: {
    flex: 1,
  },
  selectedChildName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  selectedChildStatus: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  selectedChildStatusActive: {
    color: "#059669",
  },
  selectedChildStatusInactive: {
    color: "#EF4444",
  },
  childSettingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  statisticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  chartsContainer: {
    marginBottom: 32,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  space: {
    marginBottom: 20,
  },
  bookingSection: {
    marginBottom: 24,
  },
  bookingButton: {
    borderRadius: 16,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  bookingGradient: {
    borderRadius: 16,
    padding: 20,
  },
  bookingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  bookingTextContainer: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  bookingSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    fontWeight: "400",
    lineHeight: 18,
  },
  bookingChildName: {
    fontWeight: 600,
    color: "#FFFFFF",
  },
  bookingArrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  childSelector: {
    marginTop: 8,
  },
});

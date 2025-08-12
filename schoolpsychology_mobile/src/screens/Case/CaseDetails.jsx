import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
  RefreshControl,
  Animated,
} from "react-native";
import { Card, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";
import StatisticsCard from "@/components/dashboard/StatisticsCard";
import BarChart from "@/components/charts/BarChart";
import Loading from "@/components/common/Loading";
import { useAuth, useChildren } from "@/contexts";
import { getCaseByCaseId } from "@/services/api/caseApi";
import { GlobalStyles } from "@/constants";
import { getLevelConfig } from "@/constants/levelConfig";
import ChildSelector, {
  ChildSelectorWithTitle,
} from "@/components/common/ChildSelector";
import { useFocusEffect } from "@react-navigation/native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const CaseDetails = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { caseId, headerTitle, from, subTitle } = route.params;
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { children, selectedChild } = useChildren();

  const fetchCaseDetails = async () => {
    try {
      if (!caseId && !user?.caseId && !selectedChild?.caseId) {
        setCaseDetails(null);
        return;
      }
      setLoading(true);

      const data = await getCaseByCaseId(
        caseId || user?.caseId || selectedChild?.caseId
      );
      setCaseDetails(data);

      // Animate content appearance
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Error fetching case details:", error);
      setCaseDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCaseDetails();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (!caseId && !user?.caseId && !selectedChild?.caseId) {
        setLoading(false);
        return;
      }
      fetchCaseDetails();
    }, [selectedChild, user?.caseId, caseId])
  );

  // Helper functions
  const getStatusConfig = (status) => {
    switch (status) {
      case "NEW":
        return {
          color: "#3B82F6",
          icon: "add-circle",
          label: t("case.status.new"),
          backgroundColor: "#DBEAFE",
          gradient: ["#3B82F6", "#1D4ED8"],
        };
      case "IN_PROGRESS":
        return {
          color: "#F59E0B",
          icon: "time-outline",
          label: t("case.status.inProgress"),
          backgroundColor: "#FEF3C7",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "CLOSED":
        return {
          color: "#10B981",
          icon: "checkmark-circle",
          label: t("case.status.closed"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.status.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "HIGH":
        return {
          color: "#EF4444",
          icon: "alert-circle",
          label: t("case.priority.high"),
          backgroundColor: "#FEE2E2",
          gradient: ["#EF4444", "#DC2626"],
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          icon: "warning-outline",
          label: t("case.priority.medium"),
          backgroundColor: "#FEF3C7",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "LOW":
        return {
          color: "#10B981",
          icon: "checkmark",
          label: t("case.priority.low"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.priority.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const getProgressTrendConfig = (trend) => {
    switch (trend) {
      case "IMPROVED":
        return {
          color: "#10B981",
          icon: "trending-up",
          label: t("case.progressTrend.improved"),
          backgroundColor: "#D1FAE5",
          gradient: ["#10B981", "#059669"],
        };
      case "STABLE":
        return {
          color: "#3B82F6",
          icon: "remove-outline",
          label: t("case.progressTrend.stable"),
          backgroundColor: "#DBEAFE",
          gradient: ["#3B82F6", "#1D4ED8"],
        };
      case "DECLINED":
        return {
          color: "#EF4444",
          icon: "trending-down",
          label: t("case.progressTrend.declined"),
          backgroundColor: "#FEE2E2",
          gradient: ["#EF4444", "#DC2626"],
        };
      default:
        return {
          color: "#6B7280",
          icon: "help-circle",
          label: t("case.progressTrend.unknown"),
          backgroundColor: "#F3F4F6",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  const renderEmptyState = (status) => {
    const statusConfig = getStatusConfig(status);

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={statusConfig.gradient}
          style={styles.emptyIconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={statusConfig.icon} size={48} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.emptyTitle}>
          {status === "CLOSED"
            ? t("case.emptyState.noCase")
            : t("case.emptyState.noCaseAssigned")}
        </Text>
        <Text style={styles.emptySubtitle}>
          {status === "CLOSED"
            ? t("case.emptyState.allCasesClosedSubtitle")
            : t("case.emptyState.noCaseAssignedSubtitle")}
        </Text>
      </View>
    );
  };

  const renderCaseInfo = () => {
    const { caseInfo } = caseDetails;
    const statusConfig = getStatusConfig(caseInfo.status);
    const priorityConfig = getPriorityConfig(caseInfo.priority);
    const progressConfig = getProgressTrendConfig(caseInfo.progressTrend);
    const currentLevelConfig = getLevelConfig(caseInfo.currentLevel?.levelType);
    const initialLevelConfig = getLevelConfig(caseInfo.initialLevel?.levelType);

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.caseInfoCard]}>
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={[styles.cardGradient]}
          >
            <View style={[styles.cardContent]}>
              {/* Header with gradient background */}
              <LinearGradient
                colors={statusConfig.gradient}
                style={styles.caseHeaderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.caseHeader}>
                  <View style={styles.caseTitleContainer}>
                    <Text style={styles.caseTitle}>{caseInfo.title}</Text>
                    <Text style={styles.caseId}>#{caseInfo.id}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <View style={styles.statusBadge}>
                      <Ionicons
                        name={statusConfig.icon}
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.statusBadgeText}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
              <View style={{ padding: 16, width: "100%" }}>
                {/* Description */}
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>{caseInfo.description}</Text>
                </View>

                {/* Status Indicators */}
                <View style={styles.statusIndicators}>
                  <View style={styles.statusRow}>
                    <LinearGradient
                      colors={priorityConfig.gradient}
                      style={styles.statusIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="flag" size={16} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statusLabel}>
                      {t("case.caseInfo.priority")}:
                    </Text>
                    <View style={styles.priorityChip}>
                      <Ionicons
                        name={priorityConfig.icon}
                        size={14}
                        color={priorityConfig.color}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          { color: priorityConfig.color },
                        ]}
                      >
                        {priorityConfig.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <LinearGradient
                      colors={progressConfig.gradient}
                      style={styles.statusIconContainer}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="trending-up" size={16} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statusLabel}>
                      {t("case.caseInfo.progressTrend")}:
                    </Text>
                    <View style={styles.progressChip}>
                      <Ionicons
                        name={progressConfig.icon}
                        size={14}
                        color={progressConfig.color}
                      />
                      <Text
                        style={[
                          styles.progressText,
                          { color: progressConfig.color },
                        ]}
                      >
                        {progressConfig.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Level Information */}
                <View style={styles.levelSection}>
                  <Text style={styles.sectionTitle}>
                    {t("case.level.title")}
                  </Text>
                  <View style={styles.levelCards}>
                    <LinearGradient
                      colors={
                        currentLevelConfig?.gradient || ["#3B82F6", "#1D4ED8"]
                      }
                      style={styles.levelCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.levelLabel}>
                        {t("case.level.current")}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Ionicons
                          name={currentLevelConfig?.icon}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.levelText}>
                          {currentLevelConfig?.label}
                        </Text>
                      </View>
                    </LinearGradient>

                    <LinearGradient
                      colors={
                        initialLevelConfig?.gradient || ["#6B7280", "#4B5563"]
                      }
                      style={styles.levelCard}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.levelLabel}>
                        {t("case.level.initial")}
                      </Text>
                      <View style={styles.levelBadge}>
                        <Ionicons
                          name={initialLevelConfig?.icon}
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.levelText}>
                          {initialLevelConfig?.label}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  const renderStatistics = () => {
    const { groupedStatic } = caseDetails;

    return (
      <Animated.View style={[styles.statisticsSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>{t("case.statistics.title")}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: "row", gap: 10 }}
        >
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.surveys")}
              value={
                groupedStatic.survey.activeSurveys +
                groupedStatic.survey.completedSurveys
              }
              subtitle={`${groupedStatic.survey.completedSurveys} ${t(
                "case.statistics.completed"
              )}`}
              icon="document-text"
              iconColor="#F59E0B"
              valueColor="#F59E0B"
              size="small"
            />
          </View>
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.appointments")}
              value={
                groupedStatic.appointment.activeAppointments +
                groupedStatic.appointment.completedAppointments
              }
              subtitle={`${groupedStatic.appointment.completedAppointments} ${t(
                "case.statistics.completed"
              )}`}
              icon="calendar"
              iconColor="#10B981"
              valueColor="#10B981"
              size="small"
            />
          </View>
          <View style={{ marginRight: 10 }}>
            <StatisticsCard
              title={t("case.statistics.programs")}
              value={
                groupedStatic.program.activePrograms +
                groupedStatic.program.completedPrograms
              }
              subtitle={`${groupedStatic.program.completedPrograms} ${t(
                "case.statistics.completed"
              )}`}
              icon="school"
              iconColor="#F59E0B"
              valueColor="#F59E0B"
              size="small"
            />
          </View>
        </ScrollView>
      </Animated.View>
    );
  };

  const renderCharts = () => {
    const { groupedStatic } = caseDetails;

    // Prepare chart data with proper formatting for 0.0-4.0 scale
    const formatChartData = (dataSet, title) => {
      if (!dataSet || dataSet.length === 0) {
        return [{ x: t("case.charts.noData"), y: 0 }];
      }

      return dataSet.map((item, index) => ({
        x: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("vi-VN")
          : `Lần ${index + 1}`,
        y: item.score || 0,
        label: t("case.charts.scoreFormat", { score: item.score || 0 }),
      }));
    };

    const surveyData = formatChartData(
      groupedStatic.survey.dataSet,
      "Khảo sát"
    );
    const appointmentData = formatChartData(
      groupedStatic.appointment.dataSet,
      "Lịch hẹn"
    );
    const programData = formatChartData(
      groupedStatic.program.dataSet,
      "Chương trình"
    );

    return (
      <Animated.View style={[styles.chartsSection, { opacity: fadeAnim }]}>
        <Text style={styles.sectionTitle}>{t("case.charts.title")}</Text>

        <View style={styles.chartContainer}>
          <BarChart
            data={surveyData}
            title={t("case.charts.surveys")}
            barColor="#3B82F6"
            height={150}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
          />
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={appointmentData}
            title={t("case.charts.appointments")}
            barColor="#10B981"
            height={150}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
          />
        </View>

        <View style={styles.chartContainer}>
          <BarChart
            data={programData}
            title={t("case.charts.programs")}
            barColor="#F59E0B"
            height={150}
            yAxisMax={4.0}
            valueFormatter={(value) =>
              t("case.charts.scoreFormat", { score: value.toFixed(1) })
            }
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <Container>
      {from === "tab" ? (
        <HeaderWithTab title={t("case.tab.title")} subtitle={t} />
      ) : (
        <HeaderWithoutTab
          title={headerTitle}
          onBackPress={() => navigation.goBack()}
        />
      )}

      {/* Child selector */}
      {user?.role === "PARENTS" &&
        children &&
        children.length > 0 &&
        from === "tab" && (
          <View style={styles.childSelectorContainer}>
            <ChildSelector style={styles.childSelector} />
          </View>
        )}

      {loading ? (
        <Loading />
      ) : (
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {!caseDetails ? (
            renderEmptyState(user?.caseId ? "IN_PROGRESS" : "CLOSED")
          ) : (
            <View style={styles.content}>
              {renderCaseInfo()}
              {renderStatistics()}
              {renderCharts()}
            </View>
          )}
        </ScrollView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  // childSelector: {
  //   marginTop: ,
  // },
  // childSelectionContainer: {
  //   paddingHorizontal: 16,
  //   minHeight: 150,
  // },
  scrollContent: {
    // paddingBottom: 32,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  caseInfoCard: {
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  cardGradient: {
    borderRadius: 20,
  },
  cardContent: {
    padding: 0,
  },
  caseHeaderGradient: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  caseTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  caseTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  caseId: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  descriptionContainer: {
    padding: 20,
    paddingTop: 16,
  },
  description: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    fontWeight: "400",
  },
  statusIndicators: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  levelSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  levelCards: {
    flexDirection: "row",
    gap: 16,
  },
  levelCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  levelLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statisticsSection: {
    marginBottom: 32,
  },
  statisticsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCardGradient: {
    flex: 1,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  chartsSection: {
    marginBottom: 32,
  },
  chartContainer: {},
  chartCard: {},
  studentCard: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  studentInfo: {
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginRight: 12,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
    flex: 1,
  },
});

export default CaseDetails;

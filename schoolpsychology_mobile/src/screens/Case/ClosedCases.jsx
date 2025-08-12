import { Container, Loading } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { getClosedCases } from "@/services/api/caseApi";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "@/utils/helpers";
import { getLevelConfig } from "@/constants/levelConfig";
import { useAuth, useChildren } from "@/contexts";

const ClosedCases = ({ navigation }) => {
  const { t } = useTranslation();
  const [closedCases, setClosedCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { selectedChild } = useChildren();

  const fetchClosedCases = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user?.role === "PARENTS") {
        if (!selectedChild?.id) {
          setClosedCases([]);
          return;
        }
      }
      if (!user?.userId || !user?.id) {
        setClosedCases([]);
        return;
      }

      const userId =
        user?.role === "PARENTS" ? selectedChild?.id : user?.id || user?.userId;

      const cases = await getClosedCases(userId);
      setClosedCases(cases || []);
    } catch (error) {
      console.error("Error fetching closed cases:", error);
      setError(error.message || "Failed to load closed cases");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClosedCases();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchClosedCases();
  }, []);

  const handleCasePress = (caseId) => {
    navigation.navigate("Case", {
      screen: "CaseDetails",
      params: {
        from: "closedCases",
        caseId,
        headerTitle: t("case.details"),
        emptyTitle: t("case.emptyTitle"),
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "CLOSED":
        return "#10B981";
      case "IN_PROGRESS":
        return "#F59E0B";
      case "NEW":
        return "#3B82F6";
      default:
        return "#6B7280";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "#EF4444";
      case "MEDIUM":
        return "#F59E0B";
      case "LOW":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getProgressTrendIcon = (trend) => {
    switch (trend?.toUpperCase()) {
      case "IMPROVED":
        return "trending-up";
      case "DECLINED":
        return "trending-down";
      case "STABLE":
        return "remove";
      default:
        return "help-circle";
    }
  };

  const getProgressTrendColor = (trend) => {
    switch (trend?.toUpperCase()) {
      case "IMPROVED":
        return "#10B981";
      case "DECLINED":
        return "#EF4444";
      case "STABLE":
        return "#6B7280";
      default:
        return "#9CA3AF";
    }
  };

  const renderCaseCard = (caseItem) => {
    const levelConfig = getLevelConfig(caseItem.currentLevel?.code);

    return (
      <TouchableOpacity
        key={caseItem.id}
        style={styles.caseCard}
        onPress={() => handleCasePress(caseItem.id)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.caseTitle} numberOfLines={2}>
              {caseItem.title}
            </Text>
            <Text style={styles.caseDescription} numberOfLines={2}>
              {caseItem.description}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(caseItem.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(caseItem.status) },
                ]}
              >
                {t(`case.status.${caseItem.status?.toLowerCase()}`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Priority and Progress */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(caseItem.priority) + "20" },
              ]}
            >
              <Ionicons
                name="flag"
                size={12}
                color={getPriorityColor(caseItem.priority)}
              />
              <Text
                style={[
                  styles.priorityText,
                  { color: getPriorityColor(caseItem.priority) },
                ]}
              >
                {t(`case.priority.${caseItem.priority?.toLowerCase()}`)}
              </Text>
            </View>
          </View>

          <View style={styles.metricItem}>
            <View style={styles.progressTrendContainer}>
              <Ionicons
                name={getProgressTrendIcon(caseItem.progressTrend)}
                size={14}
                color={getProgressTrendColor(caseItem.progressTrend)}
              />
              <Text
                style={[
                  styles.progressTrendText,
                  { color: getProgressTrendColor(caseItem.progressTrend) },
                ]}
              >
                {t(
                  `case.progressTrend.${caseItem.progressTrend?.toLowerCase()}`
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Level Information */}
        <View style={styles.levelSection}>
          <Text style={styles.levelLabel}>{t("case.level.current")}</Text>
          <View style={styles.levelContainer}>
            {levelConfig && (
              <View
                style={[
                  styles.levelBadge,
                  { backgroundColor: levelConfig.backgroundColor },
                ]}
              >
                <Ionicons
                  name={levelConfig.icon}
                  size={16}
                  color={levelConfig.color}
                />
                <Text style={[styles.levelText, { color: levelConfig.color }]}>
                  {caseItem.currentLevel?.label || levelConfig.label}
                </Text>
              </View>
            )}
            <Text style={styles.levelScore}>
              {caseItem.currentLevel?.minScore || 0} -{" "}
              {caseItem.currentLevel?.maxScore || 0}
            </Text>
          </View>
        </View>

        {/* Student and Counselor Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {caseItem.student?.fullName || t("common.notAvailable")}
            </Text>
            <Text style={styles.infoSubtext}>
              {caseItem.student?.classDto?.codeClass || ""}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {caseItem.createBy?.fullName || t("common.notAvailable")}
            </Text>
            <Text style={styles.infoSubtext}>
              {t("case.studentInfo.teacher")}
            </Text>
          </View>
        </View>

        {/* Arrow indicator */}
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="checkmark-circle" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>
        {t("case.emptyState.allCasesClosed")}
      </Text>
      <Text style={styles.emptySubtitle}>
        {t("case.emptyState.allCasesClosedSubtitle")}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconContainer}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
      </View>
      <Text style={styles.errorTitle}>{t("common.errorTitle")}</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchClosedCases}>
        <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <Container>
        <HeaderWithoutTab
          title={t("case.closedCases.title")}
          onBackPress={() => navigation.goBack()}
          showChildSelector
          onChildSelect={() => console.log("Child selected for cases")}
        />
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title={t("case.closedCases.title")}
        onBackPress={() => navigation.goBack()}
        showChildSelector
        onChildSelect={() => console.log("Child selected for cases")}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          renderErrorState()
        ) : closedCases.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>
                {t("case.closedCases.title")} ({closedCases.length})
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t("case.closedCases.description")}
              </Text>
            </View>

            <View style={styles.casesContainer}>
              {closedCases.map(renderCaseCard)}
            </View>
          </>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  casesContainer: {
    paddingHorizontal: 16,
  },
  caseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
    lineHeight: 22,
  },
  caseDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    gap: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressTrendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-end",
  },
  progressTrendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  levelSection: {
    marginBottom: 16,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  levelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  levelScore: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  infoSubtext: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  arrowContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  errorIconContainer: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ClosedCases;

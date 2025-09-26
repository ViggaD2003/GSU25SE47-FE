import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  Container,
  Loading,
  LazyLoader,
  ChildSelector,
} from "../../components";
import { StatisticsCard } from "../../components/dashboard";
import { ReusableBarChart } from "../../components";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { getPastAppointments } from "@/services/api/AppointmentService";
import { useAuth, useChildren } from "@/contexts";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";

dayjs.locale("vi");

const AppointmentRecord = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { selectedChild, children } = useChildren();

  // Fetch appointment records
  const fetchRecords = useCallback(async () => {
    try {
      if (user?.role === "PARENTS") {
        if (!selectedChild?.id) {
          setRecords([]);
          return;
        }
      }
      if (!user?.userId || !user?.id) {
        setRecords([]);
        return;
      }
      setLoading(true);

      const userId =
        user?.role === "PARENTS"
          ? selectedChild?.id || selectedChild?.userId
          : user?.id || user?.userId;

      console.log("userId", userId);

      const response = await getPastAppointments(userId);

      console.log("response", response);
      const recordsData = Array.isArray(response)
        ? response
        : response.data || [];
      setRecords(recordsData);
    } catch (error) {
      console.warn("Lỗi khi tải danh sách hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedChild, user?.id]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  }, [fetchRecords]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [fetchRecords])
  );

  // Calculate statistics - memoized for performance
  const stats = useMemo(() => {
    const total = records.length;
    const completed = records.filter((r) => r.status === "COMPLETED").length;
    const canceled = records.filter((r) => r.status === "CANCELED").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;

    return { total, completed, canceled, absent };
  }, [records]);

  // Prepare chart data - memoized for performance
  const chartData = useMemo(() => {
    return [
      {
        label: t("appointment.record.status.completed"),
        value: stats.completed,
        color: "#059669",
      },
      {
        label: t("appointment.record.status.canceled"),
        value: stats.canceled,
        color: "#DC2626",
      },
      {
        label: t("appointment.record.status.absent"),
        value: stats.absent,
        color: "#F59E0B",
      },
      // { label: "Hết hạn", value: stats.expired, color: "#6B7280" },
    ].filter((item) => item.value > 0);
  }, [stats]);

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          icon: "checkmark-circle",
          text: t("appointment.record.status.completed"),
        };
      case "ABSENT":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "close-circle",
          text: t("appointment.record.status.absent"),
        };
      case "CANCELED":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          icon: "close-circle",
          text: t("appointment.record.status.canceled"),
        };
      case "EXPIRED":
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "time",
          text: t("appointment.record.status.expired"),
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "time",
          text: t("appointment.record.status.notDetermined"),
        };
    }
  };

  // Get session flow color and icon
  const getSessionFlowConfig = (sessionFlow) => {
    switch (sessionFlow?.toUpperCase()) {
      case "GOOD":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          icon: "happy",
          text: t("appointment.record.sessionFlow.good"),
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: t("appointment.record.sessionFlow.medium"),
        };
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: t("appointment.record.sessionFlow.medium"),
        };
      case "LOW":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          icon: "sad",
          text: t("appointment.record.sessionFlow.low"),
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "help",
          text: t("appointment.record.sessionFlow.notEvaluated"),
        };
    }
  };

  // Get cooperation level config
  const getCoopLevelConfig = (level) => {
    switch (level?.toUpperCase()) {
      case "GOOD":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          text: t("appointment.record.cooperationLevel.good"),
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          text: t("appointment.record.cooperationLevel.medium"),
        };
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          text: t("appointment.record.cooperationLevel.medium"),
        };
      case "LOW":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          text: t("appointment.record.cooperationLevel.low"),
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          text: t("appointment.record.cooperationLevel.notEvaluated"),
        };
    }
  };

  // Render record card - memoized for performance
  const renderRecordCard = useCallback(
    (record) => {
      const statusConfig = getStatusConfig(record.status);
      const sessionFlowConfig = getSessionFlowConfig(record.sessionFlow);
      const coopLevelConfig = getCoopLevelConfig(record.studentCoopLevel);

      return (
        <TouchableOpacity
          key={record.id}
          style={styles.recordCard}
          onPress={() =>
            navigation.navigate("AppointmentRecordDetail", {
              recordId: record.id,
            })
          }
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.recordIdContainer}>
                <Ionicons name="document-text" size={16} color="#3B82F6" />
                <Text style={styles.recordIdText}>#{record.id}</Text>
              </View>
              <Text style={styles.dateText}>
                {dayjs(record.startDateTime).format("DD/MM/YYYY HH:mm")}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.backgroundColor },
              ]}
            >
              <Ionicons
                name={statusConfig.icon}
                size={12}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Host Type */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="person" size={16} color="#6B7280" />
              </View>
              <Text style={styles.infoLabel}>
                {t("appointment.labels.hostType")}:
              </Text>
              <Text style={styles.infoValue}>
                {record.hostType === "COUNSELOR"
                  ? t("appointment.host.counselor")
                  : t("appointment.host.teacher")}
              </Text>
            </View>

            {/* Location/Online */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name={record.isOnline ? "wifi" : "location"}
                  size={16}
                  color="#6B7280"
                />
              </View>
              <Text style={styles.infoLabel}>
                {t("appointment.labels.mode")}:
              </Text>
              <Text style={styles.infoValue}>
                {record.isOnline
                  ? t("appointment.labels.online")
                  : t("appointment.labels.offline")}
              </Text>
            </View>

            {/* Session Flow - Only show for COMPLETED */}
            {record.status === "COMPLETED" && record.sessionFlow && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name={sessionFlowConfig.icon}
                    size={16}
                    color={sessionFlowConfig.color}
                  />
                </View>
                <Text style={styles.infoLabel}>
                  {t("appointment.labels.sessionFlow")}:
                </Text>
                <View
                  style={[
                    styles.flowBadge,
                    { backgroundColor: sessionFlowConfig.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.flowText,
                      { color: sessionFlowConfig.color },
                    ]}
                  >
                    {sessionFlowConfig.text}
                  </Text>
                </View>
              </View>
            )}

            {/* Cooperation Level - Only show for COMPLETED */}
            {record.status === "COMPLETED" && record.studentCoopLevel && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="people" size={16} color="#6B7280" />
                </View>
                <Text style={styles.infoLabel}>
                  {t("appointment.labels.cooperationLevel")}:
                </Text>
                <View
                  style={[
                    styles.coopBadge,
                    { backgroundColor: coopLevelConfig.backgroundColor },
                  ]}
                >
                  <Text
                    style={[styles.coopText, { color: coopLevelConfig.color }]}
                  >
                    {coopLevelConfig.text}
                  </Text>
                </View>
              </View>
            )}

            {/* Cancel Reason - Only show for CANCELED */}
            {record.status === "CANCELED" && record.cancelReason && (
              <View style={styles.reasonContainer}>
                <View style={styles.infoIconContainer}>
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#DC2626"
                  />
                </View>
                <Text style={styles.reasonText} numberOfLines={2}>
                  {record.cancelReason}
                </Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <Ionicons name="calendar" size={14} color="#9CA3AF" />
              <Text style={styles.footerText}>
                {t("appointment.record.lastUpdated")}:{" "}
                {dayjs(record.endDateTime || record.startDateTime).format(
                  "DD/MM/YYYY"
                )}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  return (
    <Container edges={["top", "bottom"]}>
      {/* Header */}
      <HeaderWithoutTab
        title={t("appointment.record.title")}
        onBackPress={() => navigation.goBack()}
      />

      {user?.role === "PARENTS" && children && children?.length > 0 && (
        <View style={styles.childSelectorContainer}>
          <ChildSelector />
        </View>
      )}

      {/* Content */}
      {loading ? (
        <Loading text={t("appointment.record.loading")} />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Records List */}
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>
                {t("appointment.record.emptyTitle")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("appointment.record.emptySubtitle")}
              </Text>
            </View>
          ) : (
            <LazyLoader delay={600}>
              <View style={styles.recordsHeader}>
                <Text style={styles.sectionTitle}>
                  {t("appointment.record.listTitle", { count: records.length })}
                </Text>
                <View style={styles.recordsCount}>
                  <Text style={styles.recordsCountText}>
                    {t("appointment.record.status.absent")}{" "}
                    {records.filter((r) => r.status === "ABSENT").length} /{" "}
                    {records.length} {t("appointment.record.buoi")}
                  </Text>
                </View>
              </View>
              <View style={styles.recordsList}>
                {records.map(renderRecordCard)}
              </View>
            </LazyLoader>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recordsCount: {
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordsCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3030",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  chartContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  recordsList: {
    gap: 12,
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  recordIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  recordIdText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 6,
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  flowBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  flowText: {
    fontSize: 12,
    fontWeight: "600",
  },
  coopBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coopText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  reasonText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default AppointmentRecord;

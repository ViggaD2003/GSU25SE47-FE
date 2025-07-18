import React, { useState, useEffect, useCallback } from "react";
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
import { Container, Loading } from "../../components";
import { getAppointmentRecord } from "../../services/api/AppointmentService";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { width } = Dimensions.get("window");

const AppointmentRecord = () => {
  const navigation = useNavigation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch appointment records
  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAppointmentRecord();
      const recordsData = Array.isArray(response)
        ? response
        : response.data || [];
      setRecords(recordsData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "FINALIZED":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          icon: "checkmark-circle",
          text: "Hoàn thành",
        };
      case "SUBMITTED":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "paper-plane",
          text: "Đã nộp",
        };
      case "CANCELLED":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          icon: "close-circle",
          text: "Đã hủy",
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "time",
          text: "Chưa xác định",
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
          text: "Tốt",
        };
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: "Trung bình",
        };
      case "POOR":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          icon: "sad",
          text: "Kém",
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "help",
          text: "Chưa đánh giá",
        };
    }
  };

  // Get cooperation level config
  const getCoopLevelConfig = (level) => {
    switch (level?.toUpperCase()) {
      case "HIGH":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          text: "Cao",
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          text: "Trung bình",
        };
      case "LOW":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          text: "Thấp",
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          text: "Chưa đánh giá",
        };
    }
  };

  // Render record card
  const renderRecordCard = (record) => {
    const statusConfig = getStatusConfig(record.status);
    const sessionFlowConfig = getSessionFlowConfig(record.sessionFlow);
    const coopLevelConfig = getCoopLevelConfig(record.studentCoopLevel);

    return (
      <TouchableOpacity
        key={record.id}
        style={styles.recordCard}
        onPress={() =>
          navigation.navigate("AppointmentRecordDetail", { record })
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
              {dayjs(record.createdDate).format("DD/MM/YYYY HH:mm")}
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
          {/* Score */}
          {record.totalScore !== null && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
              </View>
              <Text style={styles.infoLabel}>Điểm tổng:</Text>
              <Text style={styles.scoreValue}>{record.totalScore}</Text>
            </View>
          )}

          {/* Session Flow */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons
                name={sessionFlowConfig.icon}
                size={16}
                color={sessionFlowConfig.color}
              />
            </View>
            <Text style={styles.infoLabel}>Tiến trình:</Text>
            <View
              style={[
                styles.flowBadge,
                { backgroundColor: sessionFlowConfig.backgroundColor },
              ]}
            >
              <Text
                style={[styles.flowText, { color: sessionFlowConfig.color }]}
              >
                {sessionFlowConfig.text}
              </Text>
            </View>
          </View>

          {/* Cooperation Level */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="people" size={16} color="#6B7280" />
            </View>
            <Text style={styles.infoLabel}>Mức độ hợp tác:</Text>
            <View
              style={[
                styles.coopBadge,
                { backgroundColor: coopLevelConfig.backgroundColor },
              ]}
            >
              <Text style={[styles.coopText, { color: coopLevelConfig.color }]}>
                {coopLevelConfig.text}
              </Text>
            </View>
          </View>

          {/* Reason */}
          {record.reason && (
            <View style={styles.reasonContainer}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="information-circle" size={16} color="#6B7280" />
              </View>
              <Text style={styles.reasonText} numberOfLines={2}>
                {record.reason}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="calendar" size={14} color="#9CA3AF" />
            <Text style={styles.footerText}>
              Cập nhật: {dayjs(record.updatedDate).format("DD/MM/YYYY")}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ tư vấn</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {loading ? (
        <Loading text="Đang tải hồ sơ..." />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{records.length}</Text>
              <Text style={styles.statLabel}>Tổng hồ sơ</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {records.filter((r) => r.status === "FINALIZED").length}
              </Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {records.filter((r) => r.sessionFlow === "GOOD").length}
              </Text>
              <Text style={styles.statLabel}>Tiến trình tốt</Text>
            </View>
          </View>

          {/* Records List */}
          {records.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Chưa có hồ sơ tư vấn</Text>
              <Text style={styles.emptySubtitle}>
                Hồ sơ tư vấn sẽ được tạo sau khi hoàn thành buổi tư vấn
              </Text>
            </View>
          ) : (
            <View style={styles.recordsList}>
              <Text style={styles.sectionTitle}>
                Danh sách hồ sơ ({records.length})
              </Text>
              {records.map(renderRecordCard)}
            </View>
          )}
        </ScrollView>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
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
  scoreValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
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

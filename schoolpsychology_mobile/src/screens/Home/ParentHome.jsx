import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import {
  StatisticsCard,
  RecordCard,
  SectionHeader,
  Chart,
} from "../../components";
import { ParentDashboardService } from "../../services";

export default function ParentHome({
  user,
  navigation,
  setShowToast,
  setToastMessage,
  setToastType,
}) {
  const [selectedChild, setSelectedChild] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    statistics: {},
    surveyRecords: [],
    appointmentRecords: [],
    supportProgramRecords: [],
  });

  // Set default selected child when component mounts or user changes
  useEffect(() => {
    if (user?.children && user.children.length > 0) {
      setSelectedChild(user.children[0]);
    }
  }, [user]);

  // Load dashboard data when selected child changes
  useEffect(() => {
    if (selectedChild) {
      loadDashboardData();
    }
  }, [selectedChild]);

  const loadDashboardData = async () => {
    if (!selectedChild?.userId) return;

    try {
      setLoading(true);
      const [surveyRecords, appointmentRecords, supportProgramRecords] =
        await Promise.all([
          ParentDashboardService.getChildSurveyRecords(selectedChild.userId),
          ParentDashboardService.getChildAppointmentRecords(
            selectedChild.userId
          ),
          ParentDashboardService.getChildSupportProgramRecords(
            selectedChild.userId
          ),
        ]);

      setDashboardData({
        surveyRecords: surveyRecords || [],
        appointmentRecords: appointmentRecords?.data || [],
        supportProgramRecords: supportProgramRecords?.data || [],
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setShowToast(true);
      setToastMessage("Có lỗi xảy ra khi tải dữ liệu");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  const handleViewAllSurveys = () => {
    navigation.navigate("SurveyRecord");
  };

  const handleViewAllAppointments = () => {
    // Navigate to appointments screen
    navigation.navigate("Appointments");
  };

  const handleViewAllSupportPrograms = () => {
    // Navigate to support programs screen
    navigation.navigate("SupportPrograms");
  };

  const handleViewSurveyDetail = (record) => {
    navigation.navigate("SurveyResult", {
      survey: {
        surveyCode: record.surveyCode,
        name: record.surveyName,
        id: record.surveyId,
      },
      result: record,
      screen: "ParentHome",
      showRecordsButton: false,
    });
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
      {user?.children && user.children.length > 1 && (
        <View style={styles.childSelectionContainer}>
          <Text style={styles.childSelectionTitle}>Select Child</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.childSelectionScroll}
          >
            {user.children.map((child, index) => (
              <TouchableOpacity
                key={child.userId}
                style={[
                  styles.childOption,
                  selectedChild?.userId === child.userId &&
                    styles.childOptionActive,
                ]}
                onPress={() => handleChildSelect(child)}
              >
                <View style={styles.childAvatarContainer}>
                  <Text style={styles.childAvatarText}>
                    {child.fullName?.charAt(0)?.toUpperCase() || "C"}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.childName,
                    selectedChild?.userId === child.userId &&
                      styles.childNameActive,
                  ]}
                  numberOfLines={1}
                >
                  {child.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Child Info */}
      {selectedChild && (
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
                    Đang nhận bài khảo sát
                  </Text>
                ) : (
                  <Text style={styles.selectedChildStatusInactive}>
                    Đã ngưng nhận bài khảo sát
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Dashboard Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GlobalStyles.colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : selectedChild ? (
        <>
          {/* Statistics Section */}
          <SectionHeader
            title="Thống kê tổng quan"
            subtitle="Dữ liệu 30 ngày gần nhất"
            showViewAll={false}
          />

          <View style={styles.statisticsGrid}>
            <StatisticsCard
              title="Bài khảo sát"
              value={dashboardData.surveyRecords.length || 0}
              change={"+12%"}
              changeType="positive"
              icon="document-text"
              color="#3B82F6"
              subtitle="Đã hoàn thành"
            />
            <StatisticsCard
              title="Điểm trung bình"
              value={0}
              change={"+2.1"}
              changeType="positive"
              icon="trending-up"
              color="#10B981"
              subtitle="Trên 10"
            />
            <StatisticsCard
              title="Lịch hẹn"
              value={0}
              change={"+3"}
              changeType="positive"
              icon="calendar"
              color="#F59E0B"
              subtitle="Đã lên lịch"
            />
            <StatisticsCard
              title="Chương trình hỗ trợ"
              value={0}
              change={"+1"}
              changeType="positive"
              icon="heart"
              color="#EF4444"
              subtitle="Đang tham gia"
            />
          </View>

          {/* Charts Section */}
          <SectionHeader
            title="Biểu đồ thống kê"
            subtitle="Xu hướng 7 ngày gần nhất"
            showViewAll={false}
          />

          <View style={styles.chartsContainer}>
            <Chart
              title="Điểm khảo sát"
              data={[
                { label: "T2", value: 8 },
                { label: "T3", value: 7 },
                { label: "T4", value: 9 },
                { label: "T5", value: 8 },
                { label: "T6", value: 9 },
                { label: "T7", value: 8 },
                { label: "CN", value: 9 },
              ]}
              type="line"
              color="#10B981"
            />
            <Chart
              title="Số bài khảo sát"
              data={[
                { label: "T2", value: 2 },
                { label: "T3", value: 1 },
                { label: "T4", value: 3 },
                { label: "T5", value: 2 },
                { label: "T6", value: 1 },
                { label: "T7", value: 2 },
                { label: "CN", value: 1 },
              ]}
              type="bar"
              color="#3B82F6"
            />
          </View>

          {/* Survey Records Section */}
          <SectionHeader
            title="Bài khảo sát gần đây"
            subtitle={`${dashboardData.surveyRecords.length} bài khảo sát`}
            onViewAll={handleViewAllSurveys}
          />

          {dashboardData.surveyRecords.length > 0 ? (
            dashboardData.surveyRecords
              .slice(0, 3)
              .map((record, index) => (
                <RecordCard
                  key={record.id || index}
                  type="survey"
                  title={record.surveyName || record.name}
                  subtitle={record.surveyCode}
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
              <Ionicons
                name="document-text-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>Chưa có bài khảo sát</Text>
              <Text style={styles.emptySubtitle}>
                Con của bạn chưa hoàn thành bài khảo sát nào
              </Text>
            </View>
          )}
          <View style={styles.space} />

          {/* Appointment Records Section */}
          <SectionHeader
            title="Lịch hẹn gần đây"
            subtitle={`${dashboardData.appointmentRecords.length} lịch hẹn`}
            onViewAll={handleViewAllAppointments}
          />

          {dashboardData.appointmentRecords.length > 0 ? (
            dashboardData.appointmentRecords
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
                  onPress={() => {}}
                />
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Chưa có lịch hẹn</Text>
              <Text style={styles.emptySubtitle}>
                Chưa có lịch hẹn nào được lên lịch
              </Text>
            </View>
          )}
          <View style={styles.space} />

          {/* Support Program Records Section */}
          <SectionHeader
            title="Chương trình hỗ trợ"
            subtitle={`${dashboardData.supportProgramRecords.length} chương trình`}
            onViewAll={handleViewAllSupportPrograms}
          />

          {dashboardData.supportProgramRecords.length > 0 ? (
            dashboardData.supportProgramRecords
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
                  onPress={() => {}}
                />
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>Chưa có chương trình hỗ trợ</Text>
              <Text style={styles.emptySubtitle}>
                Chưa có chương trình hỗ trợ nào được đề xuất
              </Text>
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Chưa chọn con</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng chọn một con để xem thông tin chi tiết
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
  statisticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
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
});

import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Toast, StatisticsCard } from "../../components";
import { ReusableBarChart } from "../../components/charts";
import { getSurveyRecords } from "../../services/api/SurveyService";
import {
  formatDate,
  getScoreColor,
  getScoreIcon,
  getScoreLevel,
} from "../../utils/helpers";
import { useFocusEffect } from "@react-navigation/native";
import HorizontalChartCarousel from "@/components/charts/HorizontalChartCarousel";

const PAGE_SIZE = 3; // Number of records to fetch per page

const SurveyRecord = ({ navigation }) => {
  const [allSurveyRecords, setAllSurveyRecords] = useState([]);
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [page, setPage] = useState(1);
  const [statistics, setStatistics] = useState({
    totalSurveys: 0,
    completedSurveys: 0,
    completionRate: 0,
    scoreLevelDistribution: [],
  });

  useEffect(() => {
    fetchSurveyRecords();
  }, []);

  const calculateStatistics = (records) => {
    if (!records || records.length === 0) {
      return {
        totalSurveys: 0,
        completedSurveys: 0,
        completionRate: 0,
        scoreLevelDistribution: [],
      };
    }

    const completedSurveys = records.length;
    // Giả sử có 10 khảo sát khả dụng (có thể lấy từ API khác)
    const totalSurveys = Math.max(completedSurveys, 10);
    const completionRate = Math.round((completedSurveys / totalSurveys) * 100);

    // Tạo score level distribution theo mức độ cho BarChart
    const scoreLevels = [
      { level: "Rất thấp", min: 0, max: 20, color: "#EF4444" },
      { level: "Thấp", min: 21, max: 40, color: "#F59E0B" },
      { level: "Trung bình", min: 41, max: 60, color: "#10B981" },
      { level: "Cao", min: 61, max: 80, color: "#3B82F6" },
      { level: "Rất cao", min: 81, max: 100, color: "#8B5CF6" },
    ];

    const scoreLevelDistribution = scoreLevels.map((level) => {
      const count = records.filter(
        (record) =>
          record.totalScore >= level.min && record.totalScore <= level.max
      ).length;
      const percentage =
        completedSurveys > 0 ? Math.round((count / completedSurveys) * 100) : 0;

      return {
        label: level.level,
        value: percentage,
        count: count,
        color: level.color,
      };
    });

    return {
      totalSurveys,
      completedSurveys,
      completionRate,
      scoreLevelDistribution,
    };
  };

  const fetchSurveyRecords = async () => {
    try {
      setInitialLoading(true);
      const response = await getSurveyRecords();
      if (response.data) {
        const allSurveyRecords = response.data;
        setAllSurveyRecords(allSurveyRecords || []);

        const surveyRecords = allSurveyRecords.slice(0, PAGE_SIZE);
        setSurveyRecords(surveyRecords || []);

        // Calculate statistics
        const stats = calculateStatistics(allSurveyRecords);
        setStatistics(stats);

        setPage(1);
      } else {
        showToast("Không thể tải dữ liệu khảo sát", "error");
      }
    } catch (error) {
      console.error("Error fetching survey records:", error);
      showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setInitialLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSurveyRecords();
    setRefreshing(false);
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSurveyRecords();
    }, [])
  );

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleViewResult = useCallback(
    (record) => {
      const survey = {
        surveyCode: record.surveyCode,
        name: record.surveyName,
        id: record.surveyId,
        ...record,
      };

      navigation.navigate("Survey", {
        screen: "SurveyResult",
        params: {
          survey,
          result: record,
          showRecordsButton: false,
        },
      });
    },
    [navigation]
  );

  const renderSurveyRecord = (record) => (
    <TouchableOpacity
      key={record.id}
      style={styles.recordCard}
      onPress={() => handleViewResult(record)}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordIcon}>
          <Ionicons name="document-text" size={24} color="#3B82F6" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{record.survey.name}</Text>
          <Text style={styles.recordDate}>
            Hoàn thành: {formatDate(record.completedAt)}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <View
            style={[styles.scoreCircle, { borderColor: getScoreColor(record) }]}
          >
            <Text style={[styles.scoreText, { color: getScoreColor(record) }]}>
              {record.totalScore}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <View style={styles.scoreInfo}>
          <Ionicons
            name={getScoreIcon(record)}
            size={20}
            color={getScoreColor(record)}
          />
          <Text style={[styles.scoreLevel, { color: getScoreColor(record) }]}>
            {getScoreLevel(record)}
          </Text>
        </View>

        {record.noteSuggest && (
          <View style={styles.suggestionContainer}>
            <Text style={styles.suggestionText} numberOfLines={2}>
              {record.noteSuggest}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.viewResultText}>Xem chi tiết</Text>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const loadMore = () => {
    if (loadingMore || initialLoading) return;

    const nextPage = page + 1;
    const nextRecords = allSurveyRecords.slice(0, nextPage * PAGE_SIZE);

    if (nextRecords.length > surveyRecords.length) {
      setLoadingMore(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setSurveyRecords(nextRecords);
        setPage(nextPage);
        setLoadingMore(false);
      }, 500);
    }
  };

  const renderStatisticsSection = () => (
    <View style={styles.statisticsSection}>
      {/* Header */}
      <View style={styles.statsHeader}>
        <Text style={styles.statsTitle}>Thống kê tổng quan</Text>
        <View style={styles.statsBadge}>
          <Ionicons name="analytics" size={16} color="#3B82F6" />
        </View>
      </View>

      {/* Main Statistics Cards */}
      <View style={styles.mainStatsContainer}>
        <StatisticsCard
          title="Tổng khảo sát"
          value={statistics.completedSurveys}
          // subtitle={`/${statistics.totalSurveys} khả dụng`}
          icon="document-text"
          iconColor="#3B82F6"
          valueColor="#1A1A1A"
          size="small"
        />
        <StatisticsCard
          title="Tỷ lệ hoàn thành"
          value={`${statistics.completionRate}%`}
          // subtitle="Hoàn thành"
          icon="checkmark-circle"
          iconColor="#10B981"
          valueColor="#10B981"
          size="small"
        />
      </View>

      {/* Charts Section with Horizontal Scroll */}
      {statistics.scoreLevelDistribution.length > 0 && (
        <View style={styles.chartsSection}>
          <Text style={styles.chartsSectionTitle}>Phân tích chi tiết</Text>
          <HorizontalChartCarousel>
            {/* Score Level Distribution Chart */}
            <ReusableBarChart
              data={statistics.scoreLevelDistribution.map((item) => ({
                x: item.label,
                y: item.value,
              }))}
              title="Phân bố mức độ điểm số (%)"
              yAxisMax={100}
              barColor="#3B82F6"
              height={200}
              valueFormatter={(value) => `${value}%`}
            />

            {/* Additional chart if needed */}
            {statistics.completionRate > 0 && (
              <ReusableBarChart
                data={[
                  {
                    x: "Hoàn thành",
                    y: statistics.completionRate,
                  },
                  {
                    x: "Chưa làm",
                    y: 100 - statistics.completionRate,
                  },
                ]}
                title="Tỷ lệ hoàn thành (%)"
                yAxisMax={100}
                barColor="#10B981"
                height={200}
                valueFormatter={(value) => `${value}%`}
              />
            )}
          </HorizontalChartCarousel>
        </View>
      )}
    </View>
  );

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch sử khảo sát</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={GlobalStyles.colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử khảo sát</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Section */}
        {renderStatisticsSection()}

        {/* Survey Records */}
        <View style={styles.recordsSection}>
          <View style={styles.recordsHeader}>
            <Text style={styles.sectionTitle}>Danh sách khảo sát</Text>
            <View style={styles.recordsCount}>
              <Text style={styles.recordsCountText}>
                {allSurveyRecords.length} bài
              </Text>
            </View>
          </View>

          {surveyRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color="#9CA3AF"
                />
              </View>
              <Text style={styles.emptyTitle}>Chưa có kết quả khảo sát</Text>
              <Text style={styles.emptySubtitle}>
                Hoàn thành khảo sát đầu tiên để xem kết quả tại đây
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("MainBottomTabs")}
              >
                <Ionicons
                  name="add-circle"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.emptyButtonText}>Đi đến khảo sát</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {surveyRecords.map((record) => renderSurveyRecord(record))}

              {/* Load More Button */}
              {surveyRecords.length < allSurveyRecords.length && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.loadMoreText}>
                        Xem thêm (
                        {allSurveyRecords.length - surveyRecords.length})
                      </Text>
                      <Ionicons name="chevron-down" size={16} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
  },
  statisticsSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  statsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },
  mainStatsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  chartsSection: {
    marginTop: 8,
  },
  chartsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  chartsScrollView: {
    paddingLeft: 24,
  },
  chartsContainer: {
    paddingRight: 24,
  },
  chartCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  recordsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  recordsCount: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordsCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: GlobalStyles.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  scoreContainer: {
    marginLeft: 12,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
  },
  recordDetails: {
    marginBottom: 16,
  },
  scoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreLevel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  suggestionContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
  },
  suggestionText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16,
  },
  recordFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewResultText: {
    fontSize: 14,
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  loadMoreButton: {
    backgroundColor: GlobalStyles.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  loadMoreText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default SurveyRecord;

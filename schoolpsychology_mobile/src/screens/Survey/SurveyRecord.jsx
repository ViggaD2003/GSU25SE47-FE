import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import {
  Toast,
  ReusableBarChart,
  StatisticsCard,
  HorizontalChartCarousel,
  Container,
  FilterSortModal,
  SurveyRecordCard,
  ChildSelector,
  Loading,
} from "../../components";
import { getSurveyRecordsByAccount } from "../../services/api/SurveyService";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth, useChildren } from "../../contexts";
import { filterSurveyTypes } from "../../utils/helpers";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 2; // Number of records to fetch per page

const SurveyRecord = ({ navigation }) => {
  const { user } = useAuth();
  const { selectedChild, children } = useChildren();
  const { t } = useTranslation();
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  // Pagination state (1-based indexing for frontend)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [numberOfSkipped, setNumberOfSkipped] = useState(0);

  // Filter and sort state
  const [filters, setFilters] = useState({
    surveyType: "",
  });
  const [sort, setSort] = useState({
    label: "Mới nhất",
    value: "completedAt",
    direction: "desc",
  });
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [statistics, setStatistics] = useState({
    totalSurveys: 0,
    currentSurveys: 0,
    completionRate: 0,
    scoreLevelDistribution: [],
    levelDistribution: [],
    surveyTypeDistribution: [],
    averageScore: 0,
  });

  const calculateStatistics = useCallback(
    (records, totalRecords, recordsSkipped) => {
      if (!records || records.length === 0) {
        return {
          totalSurveys: 0,
          currentSurveys: 0,
          completionRate: 0,
          scoreLevelDistribution: [],
          levelDistribution: [],
          surveyTypeDistribution: [],
          averageScore: 0,
        };
      }

      const totalSurveys = totalRecords;
      const currentSurveys = records.length;
      const completedSurveys = totalRecords - recordsSkipped;
      const completionRate =
        totalRecords > 0
          ? Math.round((completedSurveys / totalRecords) * 100)
          : 0;

      // Calculate average score
      const validScores = records
        .filter(
          (record) => !record.isSkipped && record.totalScore !== undefined
        )
        .map((record) => record.totalScore);
      const averageScore =
        validScores.length > 0
          ? Math.round(
              (validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length) *
                10
            ) / 10
          : 0;

      // Create level distribution based on actual level data from API
      const levelCounts = {};
      const surveyTypeCounts = {};

      records.forEach((record) => {
        if (!record.isSkipped) {
          // Count by level
          const levelLabel = record.level?.label || "Không xác định";
          levelCounts[levelLabel] = (levelCounts[levelLabel] || 0) + 1;

          // Count by survey type
          const surveyType = record.survey?.surveyType || "Không xác định";
          const surveyTypeLabel =
            surveyType === "SCREENING"
              ? "Sàng lọc"
              : surveyType === "FOLLOWUP"
              ? "Theo dõi"
              : surveyType;
          surveyTypeCounts[surveyTypeLabel] =
            (surveyTypeCounts[surveyTypeLabel] || 0) + 1;
        }
      });

      // Convert level counts to chart data
      const levelDistribution = Object.entries(levelCounts).map(
        ([label, count]) => {
          const percentage =
            completedSurveys > 0
              ? Math.round((count / completedSurveys) * 100)
              : 0;
          return {
            label,
            value: percentage,
            count,
            color: getLevelColor(label),
          };
        }
      );

      // Convert survey type counts to chart data
      const surveyTypeDistribution = Object.entries(surveyTypeCounts).map(
        ([label, count]) => {
          const percentage =
            completedSurveys > 0
              ? Math.round((count / completedSurveys) * 100)
              : 0;
          return {
            label,
            value: percentage,
            count,
            color: getSurveyTypeColor(label),
          };
        }
      );

      // Create score level distribution for BarChart (fallback if no level data)
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
            !record.isSkipped &&
            record.totalScore >= level.min &&
            record.totalScore <= level.max
        ).length;
        const percentage =
          completedSurveys > 0
            ? Math.round((count / completedSurveys) * 100)
            : 0;

        return {
          label: level.level,
          value: percentage,
          count: count,
          color: level.color,
        };
      });

      return {
        totalSurveys,
        currentSurveys,
        completionRate,
        scoreLevelDistribution,
        levelDistribution,
        surveyTypeDistribution,
        averageScore,
      };
    },
    []
  );

  // Helper function to get color for level
  const getLevelColor = (levelLabel) => {
    const colorMap = {
      Thấp: "#10B981",
      "Trung bình": "#3B82F6",
      "Vừa phải": "#F59E0B",
      "Nghiêm trọng": "#EF4444",
      "Nguy hiểm": "#7C2D12",
      "Rủi ro nghiêm trọng": "#7C2D12",
      "Rủi ro vừa phải": "#F59E0B",
      "Rủi ro thấp": "#10B981",
    };
    return colorMap[levelLabel] || "#6B7280";
  };

  // Helper function to get color for survey type
  const getSurveyTypeColor = (surveyType) => {
    const colorMap = {
      "Sàng lọc": "#3B82F6",
      "Theo dõi": "#10B981",
    };
    return colorMap[surveyType] || "#6B7280";
  };

  const fetchSurveyRecords = useCallback(
    async (page = 1, isRefresh = false) => {
      try {
        if (page === 1) {
          setInitialLoading(true);
        } else {
          setLoadingMore(true);
        }

        const params = {
          page: page,
          size: PAGE_SIZE,
          field: sort.value,
          direction: sort.direction,
          ...filters,
        };

        if (user?.role === "PARENTS") {
          if (!selectedChild?.id) {
            setSurveyRecords([]);
            return;
          }
        }

        if (!user?.userId || !user?.id) {
          setSurveyRecords([]);
          return;
        }

        const userId =
          user?.role === "PARENTS"
            ? selectedChild?.id
            : user?.id || user?.userId;

        const response = await getSurveyRecordsByAccount(userId, params);
        console.log("Response:", response);

        if (response) {
          const newRecords = Array.isArray(response?.content)
            ? response.content.filter((record) => {
                return filterSurveyTypes({
                  surveyType: record.survey?.surveyType,
                  allowedTypes: ["SCREENING", "FOLLOWUP"],
                });
              })
            : [];

          if (isRefresh || page === 1) {
            setSurveyRecords(newRecords);
          } else {
            // console.log("New Records:", newRecords);

            setSurveyRecords((prev) => {
              // Create a map to avoid duplicates based on record ID
              const existingIds = new Set(prev.map((record) => record.id));
              const uniqueNewRecords = newRecords.filter(
                (record) => !existingIds.has(record.id)
              );
              return [...prev, ...uniqueNewRecords];
            });
          }

          // Convert 0-based page to 1-based for frontend consistency
          setCurrentPage((response.page || 0) + 1);
          setTotalElements(response.totalElements || 0);
          setNumberOfSkipped(response.numberOfSkipped || 0);
          setHasNext(response.hasNext || false);

          // Calculate statistics for all records (use the same deduplication logic)
          const allRecords =
            isRefresh || page === 1
              ? newRecords
              : (() => {
                  const existingIds = new Set(
                    surveyRecords.map((record) => record.id)
                  );
                  const uniqueNewRecords = newRecords.filter(
                    (record) => !existingIds.has(record.id)
                  );
                  return [...surveyRecords, ...uniqueNewRecords];
                })();

          const stats = calculateStatistics(
            allRecords,
            response.totalElements,
            response?.numberOfSkipped || 0
          );
          setStatistics(stats);
        } else {
          showToast("Không thể tải dữ liệu khảo sát", "error");
        }
      } catch (error) {
        console.error("Error fetching survey records:", error);
        showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedChild, sort, filters]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSurveyRecords(1, true);
    setRefreshing(false);
  }, [fetchSurveyRecords]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSurveyRecords(1, true);
    }, [fetchSurveyRecords])
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
      navigation.navigate("SurveyResult", {
        result: record,
        showRecordsButton: false,
        type: "record",
      });
    },
    [navigation]
  );

  const handleFilterSortApply = useCallback(
    ({ filters: newFilters, sort: newSort }) => {
      console.log("Applying filters and sort:", { newFilters, newSort });
      setFilters(newFilters);
      setSort(newSort);
      setCurrentPage(1);
      fetchSurveyRecords(1, true);
    },
    [fetchSurveyRecords]
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasNext) return;

    const nextPage = currentPage + 1;
    console.log(
      "Loading more - currentPage:",
      currentPage,
      "nextPage:",
      nextPage
    );
    fetchSurveyRecords(nextPage, false);
  }, [loadingMore, hasNext, currentPage, fetchSurveyRecords]);

  const renderSurveyRecord = useCallback(
    (record, index) => (
      <SurveyRecordCard
        key={`${record.id}-${index}`}
        record={record}
        onPress={() => handleViewResult(record)}
        showIntervention={true}
      />
    ),
    [handleViewResult]
  );

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title={t("survey.record.title")}
        onBackPress={handleBackPress}
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Ionicons name="filter" size={20} color="#3B82F6" />
          </TouchableOpacity>
        }
      />

      {user?.role === "PARENTS" && children?.length > 0 && (
        <View style={styles.childSelectorContainer}>
          <ChildSelector />
        </View>
      )}

      {initialLoading && !refreshing ? (
        <Loading />
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Survey Records */}
          <View style={styles.recordsSection}>
            <View style={styles.recordsHeader}>
              <Text style={styles.sectionTitle}>Danh sách khảo sát</Text>
              <View style={styles.recordsCountContainer}>
                <View style={styles.recordsCountSkipped}>
                  <Text style={styles.recordsCountTextSkipped}>
                    {numberOfSkipped} bài bỏ qua
                  </Text>
                </View>
                <View style={styles.recordsCount}>
                  <Text style={styles.recordsCountText}>
                    {statistics.currentSurveys} / {totalElements} bài
                  </Text>
                </View>
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
                <Text style={styles.emptyTitle}>
                  {t("survey.record.emptyTitle")}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t("survey.record.emptySubtitle")}
                </Text>
                {user?.role === "STUDENT" && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() =>
                      navigation.navigate("Event", {
                        screen: "EventList",
                        params: { type: "SURVEY" },
                      })
                    }
                  >
                    <Ionicons
                      name="add-circle"
                      size={18}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.emptyButtonText}>
                      {t("survey.record.goToSurvey")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <>
                {surveyRecords.map((record, index) =>
                  renderSurveyRecord(record, index)
                )}

                {/* Load More Button */}
                {hasNext && (
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
                          {t("survey.record.loadMore", {
                            count: totalElements - surveyRecords.length,
                          })}
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
      )}

      {/* Filter & Sort Modal */}
      <FilterSortModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFilterSortApply}
        currentFilters={filters}
        currentSort={sort}
      />

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
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
  filterButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
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
    gap: 8,
    marginBottom: 24,
    flexWrap: "wrap",
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
  detailedStatsSection: {
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
  detailedStatsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  detailedStatsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  detailedStatsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  detailedStatsCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  detailedStatsCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  levelDistributionList: {
    gap: 8,
  },
  levelDistributionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  levelColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  levelDistributionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  levelDistributionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  surveyTypeList: {
    gap: 8,
  },
  surveyTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  surveyTypeColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  surveyTypeLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  surveyTypeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  scoreSummaryList: {
    gap: 12,
  },
  scoreSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  scoreSummaryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginLeft: 12,
  },
  scoreSummaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
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

  recordsCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  recordsCountSkipped: {
    backgroundColor: "#E7E7E796",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordsCountTextSkipped: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9B9B9BFF",
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

import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Toast } from "../../components";
import { getSurveyRecords } from "../../services/api/SurveyService";
import {
  formatDate,
  getScoreColor,
  getScoreIcon,
  getScoreLevel,
} from "../../utils/helpers";
import { useFocusEffect } from "@react-navigation/native";

const PAGE_SIZE = 3; // Number of records to fetch per page

const SurveyRecord = ({ navigation }) => {
  const [allSurveyRecords, setAllSurveyRecords] = useState([]);
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const fetchSurveyRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSurveyRecords();
      const recordData = Array.isArray(response)
        ? response
        : response.data || [];
      setAllSurveyRecords(recordData || []);
      const initialRecords = recordData.slice(0, PAGE_SIZE);
      setSurveyRecords(initialRecords || []);
      setPage(1);
      setHasMoreData(recordData.length > PAGE_SIZE);
    } catch (error) {
      console.error("Error fetching survey records:", error);
      showToast("Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveyRecords();
  }, [fetchSurveyRecords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMoreData(true);
    await fetchSurveyRecords();
    setRefreshing(false);
  }, [fetchSurveyRecords]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSurveyRecords();
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

  const renderSurveyRecord = useCallback(
    ({ item: record }) => (
      <TouchableOpacity
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
              style={[
                styles.scoreCircle,
                { borderColor: getScoreColor(record) },
              ]}
            >
              <Text
                style={[styles.scoreText, { color: getScoreColor(record) }]}
              >
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
    ),
    [handleViewResult]
  );

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMoreData || loading) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const startIndex = 0;
    const endIndex = nextPage * PAGE_SIZE;
    const nextRecords = allSurveyRecords.slice(startIndex, endIndex);

    // Simulate network delay for smooth UX
    setTimeout(() => {
      if (nextRecords.length > surveyRecords.length) {
        setSurveyRecords(nextRecords);
        setPage(nextPage);
        setHasMoreData(nextRecords.length < allSurveyRecords.length);
      } else {
        setHasMoreData(false);
      }
      setLoadingMore(false);
    }, 500);
  }, [
    loadingMore,
    hasMoreData,
    loading,
    page,
    allSurveyRecords,
    surveyRecords.length,
  ]);

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

      <FlatList
        data={surveyRecords}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurveyRecord}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>Chưa có kết quả khảo sát</Text>
              <Text style={styles.emptySubtitle}>
                Hoàn thành khảo sát đầu tiên để xem kết quả tại đây
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate("MainBottomTabs")}
              >
                <Text style={styles.emptyButtonText}>Đi đến khảo sát</Text>
              </TouchableOpacity>
            </View>
          )
        }
        ListHeaderComponent={
          surveyRecords.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{allSurveyRecords.length}</Text>
                <Text style={styles.statLabel}>Tổng số khảo sát</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {allSurveyRecords.length > 0
                    ? Math.round(
                        allSurveyRecords.reduce(
                          (sum, record) => sum + record.totalScore,
                          0
                        ) / allSurveyRecords.length
                      )
                    : 0}
                </Text>
                <Text style={styles.statLabel}>Điểm trung bình</Text>
              </View>
            </View>
          )
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={() => {
          if (loading && surveyRecords.length === 0) {
            return (
              <ActivityIndicator
                style={{ marginVertical: 32 }}
                size="large"
                color={GlobalStyles.colors.primary}
              />
            );
          }

          if (loadingMore && hasMoreData) {
            return (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator
                  size="small"
                  color={GlobalStyles.colors.primary}
                />
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            );
          }

          if (
            !hasMoreData &&
            surveyRecords.length > 0 &&
            allSurveyRecords.length > PAGE_SIZE
          ) {
            return (
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>
                  Đã hiển thị tất cả {allSurveyRecords.length} kết quả
                </Text>
              </View>
            );
          }

          return null;
        }}
      />

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
  loadingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 20,
    position: "relative",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
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
  emptyButton: {
    backgroundColor: GlobalStyles.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: GlobalStyles.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  recordsContainer: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
    borderTopColor: "#E5E7EB",
  },
  viewResultText: {
    fontSize: 14,
    color: GlobalStyles.colors.primary,
    fontWeight: "500",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  endOfListContainer: {
    paddingVertical: 16,
    alignItems: "center",
  },
  endOfListText: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default SurveyRecord;

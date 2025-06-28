import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import Toast from "../../components/common/Toast";
import api from "../../utils/axios";

const SurveyRecord = ({ navigation }) => {
  const [surveyRecords, setSurveyRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    fetchSurveyRecords();
  }, []);

  const fetchSurveyRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/v1/survey-records");

      if (response.data && response.data.success) {
        setSurveyRecords(response.data.data || []);
      } else {
        showToast("Không thể tải dữ liệu khảo sát", "error");
      }
    } catch (error) {
      console.error("Error fetching survey records:", error);
      showToast("Có lỗi xảy ra khi tải dữ liệu", "error");

      // Mock data for development
      setSurveyRecords([
        {
          id: 1,
          surveyId: 1,
          surveyCode: "GAD-7",
          surveyTitle: "Khảo sát tâm lý học sinh",
          totalScore: 85,
          status: "COMPLETED",
          completedAt: "2024-01-15",
          noteSuggest: "Bạn có tâm lý ổn định. Hãy duy trì lối sống lành mạnh.",
        },
        {
          id: 2,
          surveyId: 2,
          surveyCode: "SCHOOL_ENV",
          surveyTitle: "Đánh giá stress học tập",
          totalScore: 65,
          status: "COMPLETED",
          completedAt: "2024-01-10",
          noteSuggest:
            "Bạn có dấu hiệu stress nhẹ. Hãy thử các bài tập thở và nghỉ ngơi đầy đủ.",
        },
        {
          id: 3,
          surveyId: 3,
          surveyCode: "FAMILY_ENV",
          surveyTitle: "Khảo sát về mối quan hệ bạn bè",
          totalScore: 90,
          status: "COMPLETED",
          completedAt: "2024-01-05",
          noteSuggest:
            "Bạn có mối quan hệ bạn bè tốt. Hãy duy trì và phát triển thêm.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSurveyRecords();
    setRefreshing(false);
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleBackPress = useCallback(() => {
    navigation.goBack("Profile");
  }, [navigation]);

  const handleViewResult = useCallback(
    (record) => {
      navigation.navigate("SurveyResult", {
        survey: {
          title: record.surveyTitle,
          surveyId: record.surveyId,
        },
        result: record,
        type: "record",
      });
    },
    [navigation]
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10B981";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return "Tốt";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return "happy";
    if (score >= 60) return "help-circle";
    return "sad";
  };

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
          <Text style={styles.recordTitle}>{record.surveyTitle}</Text>
          <Text style={styles.recordDate}>
            Hoàn thành: {formatDate(record.completedAt)}
          </Text>
        </View>
        <View style={styles.scoreContainer}>
          <View
            style={[
              styles.scoreCircle,
              { borderColor: getScoreColor(record.totalScore) },
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                { color: getScoreColor(record.totalScore) },
              ]}
            >
              {record.totalScore}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <View style={styles.scoreInfo}>
          <Ionicons
            name={getScoreIcon(record.totalScore)}
            size={20}
            color={getScoreColor(record.totalScore)}
          />
          <Text
            style={[
              styles.scoreLevel,
              { color: getScoreColor(record.totalScore) },
            ]}
          >
            {getScoreLevel(record.totalScore)}
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

  if (loading) {
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {surveyRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>Chưa có kết quả khảo sát</Text>
            <Text style={styles.emptySubtitle}>
              Hoàn thành khảo sát đầu tiên để xem kết quả tại đây
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate("Survey")}
            >
              <Text style={styles.emptyButtonText}>Đi đến khảo sát</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{surveyRecords.length}</Text>
                <Text style={styles.statLabel}>Tổng số khảo sát</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {Math.round(
                    surveyRecords.reduce(
                      (sum, record) => sum + record.totalScore,
                      0
                    ) / surveyRecords.length
                  )}
                </Text>
                <Text style={styles.statLabel}>Điểm trung bình</Text>
              </View>
            </View>

            <View style={styles.recordsContainer}>
              {surveyRecords.map(renderSurveyRecord)}
            </View>
          </>
        )}
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
});

export default SurveyRecord;

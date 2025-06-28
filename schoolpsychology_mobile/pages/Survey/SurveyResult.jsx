import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { surveyResult } from "../../constants/survey";
import Toast from "../../components/common/Toast";

const SurveyResult = ({ route, navigation }) => {
  const { survey, result, type } = route.params || {};
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleBackPress = useCallback(() => {
    if (type === "record") {
      navigation.goBack();
    } else {
      navigation.goBack("Home");
    }
  }, [navigation]);

  // Get survey configuration based on survey code
  const getSurveyConfig = useCallback(() => {
    return surveyResult.find(
      (config) => config.surveyCode === survey?.surveyCode
    );
  }, [survey?.surveyCode]);

  // Get level configuration based on score
  const getLevelConfig = useCallback(
    (score) => {
      const config = getSurveyConfig();
      if (!config) return null;

      return config.levels.find(
        (level) => score >= level.min && score <= level.max
      );
    },
    [getSurveyConfig]
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
    const levelConfig = getLevelConfig(score);
    if (!levelConfig) return "#6B7280";

    switch (levelConfig.level) {
      case "low":
        return "#10B981"; // Green
      case "medium":
        return "#F59E0B"; // Yellow
      case "high":
        return "#EF4444"; // Red
      case "critical":
        return "#DC2626"; // Dark red
      default:
        return "#6B7280";
    }
  };

  const getScoreLevel = (score) => {
    const levelConfig = getLevelConfig(score);
    if (!levelConfig) return "Không xác định";
    return levelConfig.level;
  };

  const getScoreIcon = (score) => {
    const levelConfig = getLevelConfig(score);
    if (!levelConfig) return "help-circle";

    switch (levelConfig.level) {
      case "low":
        return "happy";
      case "medium":
        return "help-circle";
      case "high":
      case "critical":
        return "sad";
      default:
        return "help-circle";
    }
  };

  const getSuggestions = (score) => {
    const levelConfig = getLevelConfig(score);
    return levelConfig?.noteSuggest || result?.noteSuggest || "";
  };

  const currentScore = result?.totalScore || 0;
  const suggestions = getSuggestions(currentScore);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả khảo sát</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultIcon}>
              <Ionicons
                name="trophy"
                size={24}
                color={getScoreColor(currentScore)}
              />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>Kết quả khảo sát</Text>
              <Text style={styles.resultSubtitle}>
                {survey?.name || "Khảo sát tâm lý"}
              </Text>
            </View>
          </View>

          {/* Score Display */}
          <View style={styles.scoreContainer}>
            <View style={styles.scoreCircle}>
              <Text
                style={[
                  styles.scoreText,
                  { color: getScoreColor(currentScore) },
                ]}
              >
                {currentScore}
              </Text>
              <Text style={styles.scoreLabel}>điểm</Text>
            </View>
            <View style={styles.scoreInfo}>
              <View style={styles.scoreIconContainer}>
                <Ionicons
                  name={getScoreIcon(currentScore)}
                  size={24}
                  color={getScoreColor(currentScore)}
                />
              </View>
              <Text
                style={[
                  styles.scoreLevel,
                  { color: getScoreColor(currentScore) },
                ]}
              >
                {getScoreLevel(currentScore)}
              </Text>
            </View>
          </View>

          {/* Completion Info */}
          <View style={styles.completionInfo}>
            <View style={styles.completionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.completionText}>
                Hoàn thành: {formatDate(result?.completedAt || new Date())}
              </Text>
            </View>
            <View style={styles.completionItem}>
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text style={styles.completionText}>
                Thời gian làm: {result?.estimatedTime || "15 phút"}
              </Text>
            </View>
          </View>
        </View>

        {/* Suggestions */}
        {suggestions && (
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.suggestionsTitle}>Gợi ý</Text>
            </View>
            <Text style={styles.suggestionsText}>{suggestions}</Text>
          </View>
        )}

        {/* Answer Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="list" size={24} color="#3B82F6" />
            <Text style={styles.summaryTitle}>Tóm tắt câu trả lời</Text>
          </View>

          {result?.answerRecords?.map((record, index) => (
            <View key={index} style={styles.answerItem}>
              <View style={styles.questionInfo}>
                <Text style={styles.questionNumber}>Câu {index + 1}</Text>
                <Text style={styles.questionText}>
                  {record.questionResponse?.text || "Câu hỏi"}
                </Text>
              </View>
              <View style={styles.answerInfo}>
                <Text style={styles.answerLabel}>Trả lời:</Text>
                <Text style={styles.answerText}>
                  {record.answerResponse?.text || "Chưa trả lời"}
                </Text>
              </View>
              {record.skipped && (
                <View style={styles.skippedBadge}>
                  <Text style={styles.skippedText}>Bỏ qua</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              showToast("Đã lưu kết quả vào hồ sơ", "success");
            }}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Lưu kết quả</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backToRecordsButton}
            onPress={() =>
              navigation.navigate("Survey", {
                screen: "SurveyRecord",
              })
            }
          >
            <Text style={styles.backToRecordsButtonText}>
              Xem tất cả kết quả
            </Text>
          </TouchableOpacity>
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
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -4,
  },
  scoreInfo: {
    flex: 1,
    marginLeft: 20,
  },
  scoreLevel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  scoreIconContainer: {
    alignSelf: "flex-start",
  },
  completionInfo: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 20,
  },
  completionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  completionText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
  },
  suggestionsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  suggestionsText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  answerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
  },
  questionInfo: {
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  answerInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginRight: 8,
  },
  answerText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  skippedBadge: {
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  skippedText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GlobalStyles.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  backToRecordsButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GlobalStyles.colors.primary,
  },
  backToRecordsButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
    marginLeft: 8,
  },
});

export default SurveyResult;

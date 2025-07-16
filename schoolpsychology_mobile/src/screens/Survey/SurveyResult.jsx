import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Toast } from "../../components";
import {
  formatDate,
  getScoreColor,
  getScoreIcon,
  getScoreLevel,
} from "../../utils/helpers";

const SurveyResult = ({ route, navigation }) => {
  const { survey, result, showRecordsButton } = route.params || {};
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleBackPress = useCallback(() => {
    if (route.params?.screen === "SurveyTaking") {
      navigation.popTo("MainBottomTabs");
    } else {
      navigation.goBack();
    }
  }, [navigation]);

  const toggleAnswers = useCallback(() => {
    const toValue = showAllAnswers ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowAllAnswers(!showAllAnswers);
  }, [showAllAnswers, animation]);

  const currentScore = result?.totalScore || 0;
  const answerRecords = result?.answerRecords || [];
  const hasAnswers = answerRecords.length > 0;

  // Calculate summary stats
  const answeredCount = answerRecords.filter(
    (record) => !record.skipped
  ).length;
  const skippedCount = answerRecords.filter((record) => record.skipped).length;

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
              <Ionicons name="trophy" size={24} color={getScoreColor(result)} />
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
            <View
              style={[
                styles.scoreCircle,
                { borderColor: getScoreColor(result) },
              ]}
            >
              <Text
                style={[styles.scoreText, { color: getScoreColor(result) }]}
              >
                {currentScore}
              </Text>
              <Text style={styles.scoreLabel}>điểm</Text>
            </View>
            <View style={styles.scoreInfo}>
              <View style={styles.scoreIconContainer}>
                <Ionicons
                  name={getScoreIcon(result)}
                  size={24}
                  color={getScoreColor(result)}
                />
              </View>
              <Text
                style={[styles.scoreLevel, { color: getScoreColor(result) }]}
              >
                {getScoreLevel(result)}
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
            {/* <View style={styles.completionItem}>
              <Ionicons name="time" size={20} color="#6B7280" />
              <Text style={styles.completionText}>
                Thời gian làm: {result?.estimatedTime || "15 phút"}
              </Text>
            </View> */}
          </View>
        </View>

        {/* Suggestions */}
        {result?.noteSuggest && (
          <View style={styles.suggestionsCard}>
            <View style={styles.suggestionsHeader}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.suggestionsTitle}>Gợi ý</Text>
            </View>
            <Text style={styles.suggestionsText}>{result?.noteSuggest}</Text>
          </View>
        )}

        {/* Answer Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="list" size={24} color="#3B82F6" />
            <Text style={styles.summaryTitle}>Tóm tắt câu trả lời</Text>
          </View>

          {/* Summary Stats */}
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              </View>
              <Text style={styles.statText}>
                {answeredCount} câu đã trả lời
              </Text>
            </View>
            {skippedCount > 0 && (
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Ionicons name="close-circle" size={16} color="#EF4444" />
                </View>
                <Text style={styles.statText}>{skippedCount} câu bỏ qua</Text>
              </View>
            )}
          </View>

          {/* Toggle Button */}
          {hasAnswers && (
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleAnswers}
              activeOpacity={0.8}
            >
              <View style={styles.toggleButtonContent}>
                <Ionicons
                  name={showAllAnswers ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={GlobalStyles.colors.primary}
                />
                <Text style={styles.toggleButtonText}>
                  {showAllAnswers ? "Thu gọn" : "Xem tất cả câu trả lời"}
                </Text>
              </View>
              <View style={styles.toggleButtonBadge}>
                <Text style={styles.toggleButtonBadgeText}>
                  {answerRecords.length}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Answer Details */}
          <Animated.View
            style={[
              styles.answerDetails,
              {
                maxHeight: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1000],
                }),
                opacity: animation,
              },
            ]}
          >
            {answerRecords?.map((record, index) => (
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
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              showToast("Đã lưu kết quả vào hồ sơ", "success");
            }}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>Lưu kết quả</Text>
          </TouchableOpacity> */}

          {showRecordsButton && (
            <TouchableOpacity
              style={styles.backToRecordsButton}
              onPress={() => navigation.navigate("SurveyRecord")}
            >
              <Text style={styles.backToRecordsButtonText}>
                Xem tất cả kết quả
              </Text>
            </TouchableOpacity>
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
  summaryStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  statText: {
    fontSize: 14,
    color: "#374151",
  },
  toggleButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: GlobalStyles.colors.primary,
  },
  toggleButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
    marginLeft: 8,
  },
  toggleButtonBadge: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  toggleButtonBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  answerDetails: {
    overflow: "hidden",
  },
});

export default SurveyResult;

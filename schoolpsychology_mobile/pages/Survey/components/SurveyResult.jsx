import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../../constants";

const SurveyResult = ({ survey, result, onBack }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10B981"; // Green for high scores
    if (score >= 60) return "#F59E0B"; // Yellow for medium scores
    return "#EF4444"; // Red for low scores
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return "Tốt";
    if (score >= 60) return "Trung bình";
    return "Cần cải thiện";
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return "happy";
    if (score >= 60) return "neutral";
    return "sad";
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Survey Info Card */}
      <View style={styles.surveyInfoCard}>
        <View style={styles.surveyHeader}>
          <Text style={styles.surveyTitle}>{survey.name}</Text>
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.completedBadgeText}>Đã hoàn thành</Text>
          </View>
        </View>
        <Text style={styles.surveyDescription}>{survey.description}</Text>

        <View style={styles.completionInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Hoàn thành: {formatDate(result.completedAt)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {result.answerRecords.length} câu hỏi đã trả lời
            </Text>
          </View>
        </View>
      </View>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <Ionicons
            name={getScoreIcon(result.totalScore)}
            size={32}
            color={getScoreColor(result.totalScore)}
          />
          <Text style={styles.scoreTitle}>Điểm số tổng quan</Text>
        </View>

        <View style={styles.scoreDisplay}>
          <Text
            style={[
              styles.scoreNumber,
              { color: getScoreColor(result.totalScore) },
            ]}
          >
            {result.totalScore}
          </Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>

        <Text
          style={[
            styles.scoreLevel,
            { color: getScoreColor(result.totalScore) },
          ]}
        >
          {getScoreLevel(result.totalScore)}
        </Text>
      </View>

      {/* Suggestion Card */}
      <View style={styles.suggestionCard}>
        <View style={styles.suggestionHeader}>
          <Ionicons
            name="bulb-outline"
            size={24}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.suggestionTitle}>Khuyến nghị</Text>
        </View>
        <Text style={styles.suggestionText}>{result.noteSuggest}</Text>
      </View>

      {/* Student Info Card */}
      <View style={styles.studentInfoCard}>
        <View style={styles.studentHeader}>
          <Ionicons
            name="person-circle-outline"
            size={24}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.studentTitle}>Thông tin học sinh</Text>
        </View>

        <View style={styles.studentInfo}>
          <View style={styles.studentRow}>
            <Text style={styles.studentLabel}>Họ tên:</Text>
            <Text style={styles.studentValue}>
              {result.studentDto.fullName}
            </Text>
          </View>
          <View style={styles.studentRow}>
            <Text style={styles.studentLabel}>Mã học sinh:</Text>
            <Text style={styles.studentValue}>
              {result.studentDto.studentCode}
            </Text>
          </View>
          <View style={styles.studentRow}>
            <Text style={styles.studentLabel}>Lớp:</Text>
            <Text style={styles.studentValue}>
              {result.studentDto.classDto.codeClass}
            </Text>
          </View>
          <View style={styles.studentRow}>
            <Text style={styles.studentLabel}>Giáo viên chủ nhiệm:</Text>
            <Text style={styles.studentValue}>
              {result.studentDto.classDto.teacher.fullName}
            </Text>
          </View>
        </View>
      </View>

      {/* Answer Summary */}
      <View style={styles.answerSummaryCard}>
        <View style={styles.summaryHeader}>
          <Ionicons
            name="list-outline"
            size={24}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.summaryTitle}>Tóm tắt câu trả lời</Text>
        </View>

        <View style={styles.answerList}>
          {result.answerRecords.map((record, index) => (
            <View key={record.id} style={styles.answerItem}>
              <View style={styles.answerHeader}>
                <Text style={styles.answerNumber}>Câu {index + 1}</Text>
                {record.skipped && (
                  <View style={styles.skippedBadge}>
                    <Text style={styles.skippedText}>Bỏ qua</Text>
                  </View>
                )}
              </View>
              <Text style={styles.questionText}>
                {record.questionResponse.text}
              </Text>
              {!record.skipped && (
                <View style={styles.selectedAnswer}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={GlobalStyles.colors.primary}
                  />
                  <Text style={styles.selectedAnswerText}>
                    {record.answerResponse.text}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Back Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surveyInfoCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  surveyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    marginRight: 12,
    lineHeight: 28,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  completedBadgeText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 12,
  },
  surveyDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 16,
  },
  completionInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "700",
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 4,
  },
  scoreLevel: {
    fontSize: 16,
    fontWeight: "600",
  },
  suggestionCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  suggestionText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  studentInfoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  studentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  studentInfo: {
    gap: 12,
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  studentValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  answerSummaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  answerList: {
    gap: 16,
  },
  answerItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 16,
  },
  answerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  answerNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
  },
  skippedBadge: {
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  skippedText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 8,
  },
  selectedAnswer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    padding: 12,
  },
  selectedAnswerText: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  backButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SurveyResult;

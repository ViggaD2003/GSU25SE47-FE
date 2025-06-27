import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../../constants";

const SurveyInfo = ({ survey, onStartSurvey }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRecurringText = (cycle) => {
    switch (cycle) {
      case "DAILY":
        return "Hàng ngày";
      case "WEEKLY":
        return "Hàng tuần";
      case "MONTHLY":
        return "Hàng tháng";
      case "YEARLY":
        return "Hàng năm";
      default:
        return cycle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "#10B981";
      case "DRAFT":
        return "#6B7280";
      case "ARCHIVED":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "Đã xuất bản";
      case "DRAFT":
        return "Bản nháp";
      case "ARCHIVED":
        return "Đã lưu trữ";
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Survey Header Card */}
      <View style={styles.surveyHeaderCard}>
        <View style={styles.surveyHeaderTop}>
          <Text style={styles.surveyTitle} numberOfLines={2}>
            {survey.name}
          </Text>
          {survey.isRequired && (
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>Bắt buộc</Text>
            </View>
          )}
        </View>

        <Text style={styles.surveyDescription}>{survey.description}</Text>

        <View style={styles.surveyMetaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {formatDate(survey.startDate)} - {formatDate(survey.endDate)}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="refresh-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {survey.isRecurring
                ? getRecurringText(survey.recurringCycle)
                : "Một lần"}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="help-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>
              {survey.questions.length} câu hỏi
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#6B7280"
            />
            <Text
              style={[
                styles.metaText,
                { color: getStatusColor(survey.status) },
              ]}
            >
              {getStatusText(survey.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Instructions Card */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionsHeader}>
          <Ionicons
            name="information-circle"
            size={24}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.instructionsTitle}>Hướng dẫn làm khảo sát</Text>
        </View>

        <View style={styles.instructionsList}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Đọc kỹ từng câu hỏi và các lựa chọn trả lời
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Chọn câu trả lời phù hợp nhất với tình trạng hiện tại của bạn
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Trả lời tất cả câu hỏi bắt buộc (có dấu *) trước khi nộp bài
            </Text>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Bạn có thể quay lại sửa câu trả lời trước khi nộp bài
            </Text>
          </View>
        </View>
      </View>

      {/* Start Survey Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={onStartSurvey}>
          <Ionicons name="play-circle" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Bắt đầu làm khảo sát</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surveyHeaderCard: {
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
  surveyHeaderTop: {
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
  requiredBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  requiredBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  surveyDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 16,
  },
  surveyMetaContainer: {
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  instructionsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  instructionNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  instructionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  startButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: GlobalStyles.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SurveyInfo;

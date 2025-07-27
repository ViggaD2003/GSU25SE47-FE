import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ConfirmModal from "./ConfirmModal";
import { skipSurvey } from "@/services/api/SurveyService";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function SurveyCard({
  survey,
  navigation,
  onRefresh,
  setShowToast,
  setToastMessage,
  setToastType,
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Helper function to get calming gradient colors based on survey type
  const getCalmingGradientColors = () => {
    switch (survey.surveyType) {
      case "SCREENING":
        return ["#ECFDF5", "#F0FDF4"]; // Light green - based on primary color
      case "ASSESSMENT":
        return ["#FEF7ED", "#FFFBEB"]; // Light orange - complementary
      case "EVALUATION":
        return ["#F0F9FF", "#F8FAFC"]; // Light blue - harmonious
      default:
        return ["#F9FAFB", "#FFFFFF"]; // Light gray - neutral
    }
  };

  // Helper function to get supportive category colors
  const getSupportiveCategoryColor = () => {
    const colors = {
      EMO: "#059669", // Primary green for emotional
      COG: "#0EA5E9", // Blue for cognitive
      SOC: "#F59E0B", // Orange for social
      BEH: "#8B5CF6", // Purple for behavioral
      default: "#6B7280", // Gray for default
    };
    return colors[survey.category?.code] || colors.default;
  };

  // Helper function to format date range in a supportive way
  const formatSupportiveDateRange = () => {
    if (!survey.startDate || !survey.endDate) return "No time limit";

    const startDate = new Date(survey.startDate);
    const endDate = new Date(survey.endDate);

    const startFormatted = startDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
    const endFormatted = endDate.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
  };

  // Helper function to get supportive status badge
  const getSupportiveStatusBadge = () => {
    if (survey.isRequired) {
      return (
        <View style={[styles.statusBadge, styles.requiredBadge]}>
          <Ionicons name="shield-checkmark" size={12} color="#059669" />
          <Text style={styles.requiredBadgeText}>Quan trọng</Text>
        </View>
      );
    } else {
      return (
        <View style={[styles.statusBadge, styles.optionalBadge]}>
          <Ionicons name="heart-outline" size={12} color="#276FFFFF" />
          <Text style={styles.optionalBadgeText}>Tùy chọn</Text>
        </View>
      );
    }
  };

  // Helper function to get supportive icon based on survey type
  const getSupportiveIcon = () => {
    switch (survey.surveyType) {
      case "SCREENING":
        return "clipboard-outline"; // Medical/health icon
      case "ASSESSMENT":
        return "analytics-outline"; // Analysis icon
      case "EVALUATION":
        return "star-outline"; // Evaluation icon
      default:
        return "document-text-outline"; // General document icon
    }
  };

  const onPress = () => {
    navigation.navigate("Survey", {
      screen: "SurveyInfo",
      params: { surveyId: survey.surveyId },
    });
  };

  const onPressSkip = () => {
    setShowConfirmModal(true);
  };

  const handleSkipConfirm = async () => {
    try {
      const response = await skipSurvey(survey.surveyId);
      console.log("skip survey response", response);
      setToastMessage("Đã bỏ qua khảo sát");
      setToastType("info");
      setShowToast(true);
      onRefresh();
    } catch (error) {
      console.log("skip survey error", error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.surveyCard, isPressed && styles.surveyCardPressed]}
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        activeOpacity={0.95}
      >
        <LinearGradient
          colors={getCalmingGradientColors()}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.cardContent}>
            {/* Header Section with Supportive Design */}
            <View style={styles.headerSection}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getSupportiveIcon()}
                  size={24}
                  color={getSupportiveCategoryColor()}
                />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.surveyTitle} numberOfLines={2}>
                  {survey?.title || survey?.name}
                </Text>
                <Text style={styles.surveyDescription} numberOfLines={2}>
                  {survey.description ||
                    "Khảo sát để hỗ trợ sức khỏe tâm thần của bạn"}
                </Text>
              </View>
              {getSupportiveStatusBadge()}
            </View>

            {/* Supportive Category and Type Info */}
            <View style={styles.infoSection}>
              <View style={styles.categoryContainer}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: getSupportiveCategoryColor() },
                  ]}
                />
                <Text style={styles.categoryText}>
                  {survey.category?.name || "Chăm sóc sức khỏe"}
                </Text>
              </View>
              <View style={styles.typeContainer}>
                <Text style={styles.typeText}>
                  {survey.surveyType === "SCREENING"
                    ? "Kiểm tra sức khỏe"
                    : survey.surveyType === "ASSESSMENT"
                    ? "Đánh giá"
                    : survey.surveyType === "EVALUATION"
                    ? "Đánh giá chi tiết"
                    : "Khảo sát"}
                </Text>
              </View>
            </View>

            {/* Supportive Date and Time Info */}
            <View style={styles.dateSection}>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={16} color="#374151" />
                <Text style={styles.dateText}>
                  {formatSupportiveDateRange()}
                </Text>
              </View>
              {survey.isRecurring && (
                <View style={styles.recurringContainer}>
                  <Ionicons name="repeat-outline" size={16} color="#374151" />
                  <Text style={styles.recurringText}>
                    {survey.recurringCycle === "MONTHLY"
                      ? "Hàng tháng"
                      : "Định kỳ"}
                  </Text>
                </View>
              )}
            </View>

            {/* Supportive Action Section */}
            <View style={styles.actionSection}>
              <View style={styles.metaInfo}>
                {survey.category?.questionLength && (
                  <View style={styles.questionCountContainer}>
                    <Ionicons
                      name="help-circle-outline"
                      size={14}
                      color="#374151"
                    />
                    <Text style={styles.questionCount}>
                      {survey.category.questionLength} câu hỏi
                    </Text>
                  </View>
                )}
                <View style={styles.targetScopeContainer}>
                  <Ionicons name="people-outline" size={14} color="#374151" />
                  <Text style={styles.targetScope}>
                    {survey.targetScope === "ALL"
                      ? "Tất cả học sinh"
                      : "Theo khối lớp"}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                {!survey.isRequired && (
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={onPressSkip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.skipButtonText}>Bỏ qua</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={onPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#059669", "#047857"]}
                    style={styles.startButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="play-circle" size={20} color="#ffffff" />
                    <Text style={styles.startButtonText}>Bắt đầu</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <ConfirmModal
        visible={showConfirmModal}
        title="Xác nhận bỏ qua"
        message={`Bạn có chắc chắn muốn bỏ qua khảo sát "${
          survey?.title || survey?.name
        }"?`}
        onConfirm={handleSkipConfirm}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Bỏ qua"
        cancelText="Tiếp tục"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  surveyCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: "#ffffff",
  },
  surveyCardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.12,
  },
  gradientBackground: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  cardContent: {
    padding: 20,
  },

  // Header Section - More supportive and calming
  headerSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  surveyTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: "600",
    color: "#1F2937", // Darker text for better contrast
    marginBottom: 4,
    lineHeight: isSmallDevice ? 22 : 24,
  },
  surveyDescription: {
    fontSize: isSmallDevice ? 13 : 14,
    color: "#374151", // Darker gray for better readability
    lineHeight: isSmallDevice ? 18 : 20,
  },

  // Supportive Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  requiredBadge: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.2)",
  },
  requiredBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#059669",
  },
  optionalBadge: {
    backgroundColor: "#C7DAFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionalBadgeText: {
    color: "#276FFFFF",
    fontWeight: "500",
    fontSize: 11,
  },

  // Info Section - Calming design
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // More opaque background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)", // Subtle border for definition
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151", // Darker text for better contrast
  },
  typeContainer: {
    backgroundColor: "rgba(5, 150, 105, 0.05)", // Primary green background
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.2)", // Primary green border
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#047857", // Darker green for better contrast
  },

  // Date Section - Supportive layout
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "white", // Light green background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.1)", // Light green border
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    color: "#374151", // Darker text for better contrast
    marginLeft: 6,
  },
  recurringContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  recurringText: {
    fontSize: 13,
    color: "#374151", // Darker text for better contrast
    marginLeft: 6,
  },

  // Action Section - Encouraging design
  actionSection: {
    gap: 12,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // More opaque background
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)", // Subtle border
  },
  questionCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionCount: {
    fontSize: 12,
    color: "#374151", // Darker text for better contrast
    marginLeft: 4,
  },
  targetScopeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  targetScope: {
    fontSize: 12,
    color: "#374151", // Darker text for better contrast
    marginLeft: 4,
  },

  // Button Container - Supportive and accessible
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(249, 250, 251, 0.95)", // Light gray background
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.2)", // Primary green border
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#059669", // Primary green text
  },
  startButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
});

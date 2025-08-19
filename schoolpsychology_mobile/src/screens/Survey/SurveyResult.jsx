import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLevelConfig, GlobalStyles } from "../../constants";
import { Container, Toast } from "../../components";
import {
  formatDate,
  getLevelDescription,
  getInterventionRequired,
  getSymptomsDescription,
} from "../../utils/helpers";
import { getSurveyRecordById } from "@/services/api/SurveyService";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";

const SurveyResult = ({ route, navigation }) => {
  const { result, showRecordsButton, type, programId } = route.params || {};
  const [surveyRecord, setSurveyRecord] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const fetchSurveyRecord = async () => {
    try {
      setLoading(true);
      const response = await getSurveyRecordById(result.id);
      setSurveyRecord(response);
    } catch (error) {
      console.log("Lỗi khi lấy kết quả khảo sát:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("type", type);
    if (type === "submit") {
      setSurveyRecord(result);
      showToast("Đã lưu kết quả vào hồ sơ", "success");
    } else {
      fetchSurveyRecord();
    }
  }, [type, result]);

  const handleBackPress = useCallback(() => {
    if (type === "submit") {
      navigation.popTo("MainBottomTabs", {
        screen: "Home",
      });
    } else if (programId && surveyRecord?.survey?.surveyType === "PROGRAM") {
      navigation.popTo("ProgramDetail", {
        programId,
      });
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

  const currentScore = surveyRecord?.totalScore || 0;
  const answerRecords = surveyRecord?.answerRecords || [];
  const hasAnswers = answerRecords?.length > 0 ?? false;
  const isSkipped = surveyRecord?.isSkipped || false;

  // Calculate summary stats - only for non-skipped surveys
  const answeredCount = isSkipped
    ? 0
    : answerRecords?.filter((record) => !record.skipped).length;
  const skippedCount = isSkipped
    ? 0
    : answerRecords?.filter((record) => record.skipped).length;

  const level = surveyRecord?.level;
  const levelConfig = getLevelConfig(level?.code || level?.levelType);

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="refresh"
            size={32}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.loadingText}>Đang tải thông tin khảo sát...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title={isSkipped ? "Khảo sát đã bỏ qua" : "Kết quả khảo sát"}
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Result Card */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View
              style={[
                styles.resultIcon,
                { backgroundColor: isSkipped ? "#F3F4F6" : "#FEF3C7" },
              ]}
            >
              <Ionicons
                name={isSkipped ? "close-circle" : "trophy"}
                size={24}
                color={isSkipped ? "#6B7280" : levelConfig?.color}
              />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultTitle}>
                {isSkipped ? "Khảo sát đã bỏ qua" : "Kết quả khảo sát"}
              </Text>
              <Text style={styles.resultSubtitle}>
                {surveyRecord?.survey?.title || "Khảo sát tâm lý"}
              </Text>
              {surveyRecord?.survey?.surveyType && (
                <Text style={styles.surveyType}>
                  {surveyRecord.survey.surveyType === "SCREENING"
                    ? "Sàng lọc"
                    : surveyRecord.survey.surveyType === "FOLLOWUP"
                    ? "Theo dõi"
                    : surveyRecord.survey.surveyType}
                </Text>
              )}
              {surveyRecord?.survey?.category?.name && (
                <Text style={styles.surveyCategory}>
                  {surveyRecord.survey.category.name}
                </Text>
              )}
            </View>
          </View>

          {/* Score Display */}
          {!isSkipped && (
            <View style={styles.scoreContainer}>
              <View
                style={[
                  styles.scoreCircle,
                  { borderColor: levelConfig?.color },
                ]}
              >
                <Text style={[styles.scoreText, { color: levelConfig?.color }]}>
                  {currentScore}
                </Text>
                <Text style={styles.scoreLabel}>điểm</Text>
              </View>
              <View style={styles.scoreInfo}>
                <View style={styles.scoreInfoHeader}>
                  <View style={styles.scoreIconContainer}>
                    <Ionicons
                      name={levelConfig?.icon}
                      size={24}
                      color={levelConfig?.color}
                    />
                  </View>
                  <Text
                    style={[styles.scoreLevel, { color: levelConfig?.color }]}
                  >
                    {level?.label || levelConfig?.label}
                  </Text>
                </View>

                {(level?.description || levelConfig?.description) && (
                  <Text style={styles.scoreDescription}>
                    {level?.description || levelConfig?.description}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Skipped Display */}
          {isSkipped && (
            <View style={styles.skippedContainer}>
              <View style={styles.skippedIcon}>
                <Ionicons name="close-circle" size={48} color="#6B7280" />
              </View>
              <Text style={styles.skippedTitle}>Khảo sát đã bỏ qua</Text>
              <Text style={styles.skippedSubtitle}>
                Bạn đã chọn bỏ qua khảo sát này
              </Text>
            </View>
          )}

          {/* Completion Info */}
          <View style={styles.completionInfo}>
            <View style={styles.completionItem}>
              <Ionicons
                name={isSkipped ? "close-circle" : "checkmark-circle"}
                size={20}
                color={isSkipped ? "#6B7280" : "#10B981"}
              />
              <Text style={styles.completionText}>
                {isSkipped ? "Bỏ qua" : "Hoàn thành"}:{" "}
                {formatDate(surveyRecord?.completedAt || new Date())}
              </Text>
            </View>
            {isSkipped && (
              <View style={styles.completionItem}>
                <Ionicons name="information-circle" size={20} color="#6B7280" />
                <Text style={styles.completionText}>
                  Không có dữ liệu kết quả để hiển thị
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Level Information */}
        {!isSkipped && levelConfig && (
          <View style={styles.levelInfoCard}>
            <View style={styles.levelInfoHeader}>
              <Ionicons name="information-circle" size={24} color="#3B82F6" />
              <Text style={styles.levelInfoTitle}>Thông tin mức độ</Text>
            </View>

            {(level?.description || getLevelDescription(levelConfig)) && (
              <View style={styles.levelInfoItem}>
                <Text style={styles.levelInfoLabel}>Mô tả:</Text>
                <Text style={styles.levelInfoText}>
                  {level?.description || getLevelDescription(levelConfig)}
                </Text>
              </View>
            )}

            {(level?.symptomsDescription ||
              getSymptomsDescription(levelConfig)) && (
              <View style={styles.levelInfoItem}>
                <Text style={styles.levelInfoLabel}>Triệu chứng:</Text>
                <Text style={styles.levelInfoText}>
                  {level?.symptomsDescription ||
                    getSymptomsDescription(levelConfig)}
                </Text>
              </View>
            )}

            {level?.minScore !== undefined && level?.maxScore !== undefined && (
              <View style={styles.levelInfoItem}>
                <Text style={styles.levelInfoLabel}>Khoảng điểm:</Text>
                <Text style={styles.levelInfoText}>
                  {level.minScore} - {level.maxScore} điểm
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Skipped Survey Information */}
        {isSkipped && (
          <View style={styles.skippedInfoCard}>
            <View style={styles.skippedInfoHeader}>
              <Ionicons name="information-circle" size={24} color="#6B7280" />
              <Text style={styles.skippedInfoTitle}>Thông tin khảo sát</Text>
            </View>
            <View style={styles.skippedInfoItem}>
              <Text style={styles.skippedInfoLabel}>Trạng thái:</Text>
              <Text style={styles.skippedInfoText}>Đã bỏ qua khảo sát</Text>
            </View>
            <View style={styles.skippedInfoItem}>
              <Text style={styles.skippedInfoLabel}>Lý do:</Text>
              <Text style={styles.skippedInfoText}>
                Bạn đã chọn bỏ qua khảo sát này. Không có dữ liệu kết quả để
                hiển thị.
              </Text>
            </View>
            {surveyRecord?.survey?.description && (
              <View style={styles.skippedInfoItem}>
                <Text style={styles.skippedInfoLabel}>Mô tả khảo sát:</Text>
                <Text style={styles.skippedInfoText}>
                  {surveyRecord.survey.description}
                </Text>
              </View>
            )}
            {surveyRecord?.survey?.category?.description && (
              <View style={styles.skippedInfoItem}>
                <Text style={styles.skippedInfoLabel}>Mô tả danh mục:</Text>
                <Text style={styles.skippedInfoText}>
                  {surveyRecord.survey.category.description}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Suggestions */}
        {!isSkipped &&
          (level?.interventionRequired ||
            getInterventionRequired(levelConfig)) && (
            <View style={styles.suggestionsCard}>
              <View style={styles.suggestionsHeader}>
                <Ionicons name="bulb" size={24} color="#F59E0B" />
                <Text style={styles.suggestionsTitle}>Gợi ý can thiệp</Text>
              </View>
              <Text style={styles.suggestionsText}>
                {level?.interventionRequired ||
                  getInterventionRequired(levelConfig)}
              </Text>
            </View>
          )}

        {/* Answer Summary - Only show if not skipped and has answers */}
        {!isSkipped && hasAnswers && (
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
                  {answerRecords.length ?? 0}
                </Text>
              </View>
            </TouchableOpacity>

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
                      {record.answerResponse?.questionResponse?.text ||
                        "Câu hỏi"}
                    </Text>
                  </View>
                  <View style={styles.answerInfo}>
                    <Text style={styles.answerLabel}>Trả lời:</Text>
                    <Text style={styles.answerText}>
                      {record.answerResponse?.answerResponse?.text ||
                        "Chưa trả lời"}
                    </Text>
                    {record.answerResponse?.answerResponse?.score !==
                      undefined && (
                      <Text style={styles.answerScore}>
                        (Điểm: {record.answerResponse.answerResponse.score})
                      </Text>
                    )}
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
        )}

        {/* No Answers Message for Non-Skipped Surveys */}
        {!isSkipped && !hasAnswers && (
          <View style={styles.noAnswersCard}>
            <View style={styles.noAnswersHeader}>
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <Text style={styles.noAnswersTitle}>
                Không có dữ liệu câu trả lời
              </Text>
            </View>
            <Text style={styles.noAnswersText}>
              Khảo sát này đã hoàn thành nhưng không có dữ liệu câu trả lời để
              hiển thị.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {showRecordsButton &&
            surveyRecord?.survey?.surveyType !== "PROGRAM" && (
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
    </Container>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
    fontWeight: "500",
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
    marginBottom: 2,
  },
  surveyType: {
    fontSize: 12,
    color: "#3B82F6",
    fontWeight: "500",
  },
  surveyCategory: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
    marginTop: 2,
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
  scoreDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  scoreInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreIconContainer: {
    alignSelf: "flex-start",
  },
  skippedContainer: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
  },
  skippedIcon: {
    marginBottom: 16,
  },
  skippedTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  skippedSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
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
  levelInfoCard: {
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
  levelInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  levelInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  levelInfoItem: {
    marginBottom: 12,
  },
  levelInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  levelInfoText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
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
  skippedInfoCard: {
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
  skippedInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  skippedInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  skippedInfoItem: {
    marginBottom: 12,
  },
  skippedInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  skippedInfoText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
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
  answerScore: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginLeft: 8,
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
  noAnswersCard: {
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
  noAnswersHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  noAnswersTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  noAnswersText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
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

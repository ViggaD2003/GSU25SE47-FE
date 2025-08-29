import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Container, Toast } from "../../components";
import {
  loadSurveyProgress,
  getSurveyById,
} from "../../services/api/SurveyService";
import { useFocusEffect } from "@react-navigation/native";
import dayjs from "dayjs";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts";

const { width } = Dimensions.get("window");

const SurveyInfo = ({ route, navigation }) => {
  const { user } = useAuth();
  const { surveyId, progressSaved, programId } = route.params || {};
  const { t } = useTranslation();
  const [survey, setSurvey] = useState(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const fetchSurvey = async () => {
    try {
      setLoading(true);
      const response = await getSurveyById(surveyId);
      if (response) {
        setSurvey(response);
      }
    } catch (error) {
      console.warn("Lỗi khi lấy thông tin khảo sát:", error);
      showToast(t("survey.info.loadError"), "error");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra tiến độ mỗi khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchSurvey();
      checkSavedProgress();

      // Hiển thị thông báo nếu vừa lưu tiến độ
      if (progressSaved) {
        showToast(t("survey.info.progressSaved"), "success");
        // Xóa thông tin progressSaved để tránh hiển thị lại
        navigation.setParams({ progressSaved: undefined });
      }
    }, [surveyId, progressSaved, navigation])
  );

  const checkSavedProgress = useCallback(async () => {
    if (survey?.surveyId) {
      const savedAnswers = await loadSurveyProgress(survey.surveyId);
      setHasSavedProgress(savedAnswers && Object.keys(savedAnswers).length > 0);
    }
  }, [survey?.surveyId]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleStartSurvey = useCallback(() => {
    if (hasSavedProgress) {
      showToast("Tiếp tục khảo sát với tiến độ đã lưu của bạn", "info");
      setTimeout(() => {
        navigation.navigate("SurveyTaking", { survey, programId });
      }, 1000);
    } else {
      navigation.navigate("SurveyTaking", { survey, programId });
    }
  }, [hasSavedProgress, showToast, navigation, survey]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const getSurveyTypeIcon = (type) => {
    switch (type) {
      case "SCREENING":
        return "clipboard-outline";
      case "ASSESSMENT":
        return "analytics-outline";
      case "EVALUATION":
        return "star-outline";
      default:
        return "document-text-outline";
    }
  };

  const getSurveyTypeColor = (type) => {
    switch (type) {
      case "SCREENING":
        return "#10B981";
      case "PROGRAM":
        return "#3B82F6";
      case "FOLLOWUP":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "Đã xuất bản";
      default:
        return status;
    }
  };

  const getTargetScopeText = (scope) => {
    switch (scope) {
      case "GRADE":
        return "Theo khối lớp";
      case "ALL":
        return "Toàn trường";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="refresh"
            size={32}
            color={GlobalStyles.colors.primary}
          />
          <Text style={styles.loadingText}>{t("survey.info.loading")}</Text>
        </View>
      </Container>
    );
  }

  if (!survey) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={32} color="#EF4444" />
          <Text style={styles.errorText}>{t("survey.info.loadError")}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchSurvey}>
            <Text style={styles.retryButtonText}>{t("survey.info.retry")}</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title={t("survey.info.title")}
        onBackPress={handleBackPress}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Survey Header Card */}
        <View style={styles.surveyHeaderCard}>
          <View style={styles.surveyHeaderTop}>
            <View style={styles.surveyIcon}>
              <Ionicons
                name={getSurveyTypeIcon(survey.surveyType)}
                size={28}
                color={getSurveyTypeColor(survey.surveyType)}
              />
            </View>
            <View style={styles.surveyInfo}>
              <View style={styles.surveyTitleContainer}>
                <Text style={styles.surveyTitle}>{survey.title}</Text>
              </View>
              <Text style={styles.surveySubtitle}>
                {survey.description || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Info */}
        {survey.category && (
          <View style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Ionicons name="folder-outline" size={20} color="#6B7280" />
              <Text style={styles.categoryTitle}>
                {t("survey.info.category")}
              </Text>
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryName}>{survey.category.name}</Text>
              <Text style={styles.categoryDescription}>
                {survey.category.description}
              </Text>
            </View>
          </View>
        )}

        {/* Survey Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t("survey.info.details")}</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>
                {t("survey.info.questions")}
              </Text>
              <Text style={styles.detailValue}>
                {survey.questions?.length || 0} câu
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>
                {t("survey.info.estimatedTime")}
              </Text>
              <Text style={styles.detailValue}>15-20 phút</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>{t("survey.info.target")}</Text>
              <Text style={styles.detailValue}>
                {getTargetScopeText(survey.targetScope)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.detailLabel}>
                {t("survey.info.createdAt")}
              </Text>
              <Text style={styles.detailValue}>
                {formatDate(survey.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.dateRangeCard}>
          <Text style={styles.sectionTitle}>{t("survey.info.dateRange")}</Text>
          <View style={styles.dateRangeContent}>
            <View style={styles.dateItem}>
              <Ionicons name="play-circle-outline" size={20} color="#10B981" />
              <Text style={styles.dateLabel}>{t("survey.info.startDate")}</Text>
              <Text style={styles.dateValue}>
                {formatDate(survey.startDate)}
              </Text>
            </View>
            <View style={styles.dateDivider} />
            <View style={styles.dateItem}>
              <Ionicons name="stop-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.dateLabel}>{t("survey.info.endDate")}</Text>
              <Text style={styles.dateValue}>{formatDate(survey.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Target Grades */}
        {survey.targetGrade && survey.targetGrade.length > 0 && (
          <View style={styles.targetGradesCard}>
            <Text style={styles.sectionTitle}>{t("survey.info.grades")}</Text>
            <View style={styles.gradesContainer}>
              {survey.targetGrade.map((grade, index) => (
                <View key={index} style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>
                    {grade.targetLevel.replace("GRADE_", "Khối ")}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Progress Info */}
        {hasSavedProgress && (
          <View style={styles.progressInfo}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>
                {t("survey.info.savedProgress.title")}
              </Text>
              <Text style={styles.progressText}>
                {t("survey.info.savedProgress.text")}
              </Text>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>
            {t("survey.info.instructions.title")}
          </Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                {t("survey.info.instructions.step1")}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                {t("survey.info.instructions.step2")}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                {t("survey.info.instructions.step3")}
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                {t("survey.info.instructions.step4")}
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        {user?.role === "STUDENT" && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSurvey}
              activeOpacity={0.8}
            >
              <Ionicons
                name={hasSavedProgress ? "play" : "play-circle"}
                size={24}
                color="#fff"
              />
              <Text style={styles.startButtonText}>
                {hasSavedProgress
                  ? t("survey.info.continue")
                  : t("survey.info.start")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  surveyHeaderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  surveyHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  surveyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  surveyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  surveySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    padding: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    // marginRight: 6,
  },
  // statusText: {
  //   fontSize: 12,
  //   fontWeight: "600",
  // },
  categoryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  categoryContent: {
    paddingLeft: 28,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: (width - width * 0.22) / 2,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  dateRangeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dateRangeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dateDivider: {
    width: 40,
    height: 1,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 16,
  },
  targetGradesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gradeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  progressContent: {
    flex: 1,
    marginLeft: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#1E40AF",
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  instructionText: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingTop: 10,
  },
  startButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: GlobalStyles.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginLeft: 8,
  },
});

export default SurveyInfo;

import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import SurveyTaking from "./SurveyTaking";
import Toast from "../../components/common/Toast";
import {
  saveSurveyProgress,
  loadSurveyProgress,
  clearSurveyProgress,
} from "../../utils/SurveyService";
import { surveyResult } from "../../constants/survey";

const SurveyDetails = ({ route, navigation }) => {
  const { survey } = route.params || {};
  const [answers, setAnswers] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    // Load saved progress if exists
    if (survey?.surveyId) {
      loadSavedProgress();
    }
  }, [survey?.surveyId]);

  const loadSavedProgress = async () => {
    const savedAnswers = await loadSurveyProgress(survey.surveyId);
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      setAnswers(savedAnswers);
      showToast("Đã tải lại tiến độ trước đó", "info");
    }
  };

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const handleBackToInfo = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = async () => {
    // Save progress before exiting
    if (survey?.surveyId && Object.keys(answers).length > 0) {
      const saved = await saveSurveyProgress(survey.surveyId, answers);
      if (saved) {
        showToast("Đã lưu tiến độ khảo sát", "success");
        // Delay to show toast before closing modal and navigating
        setTimeout(() => {
          setShowExitModal(false);
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }, 2000);
      } else {
        showToast("Không thể lưu tiến độ", "error");
        // Delay to show toast before closing modal and navigating
        setTimeout(() => {
          setShowExitModal(false);
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        }, 2000);
      }
    } else {
      setShowExitModal(false);
      navigation.goBack();
    }
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // Get survey configuration based on survey code
  const getSurveyConfig = useCallback(() => {
    return surveyResult.find(
      (config) => config.surveyCode === survey?.surveyCode || "GAD-7"
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

  const handleSubmitSurvey = async (submittedAnswers) => {
    try {
      // Clear saved progress after successful submission
      if (survey?.surveyId) {
        await clearSurveyProgress(survey.surveyId);
      }

      // Process submitted answers to create proper survey result
      const answerRecordRequests = Object.entries(submittedAnswers).map(
        ([questionId, answer]) => ({
          answerId: parseInt(questionId),
          skipped: !answer || answer === "",
          answerValue: answer || null,
        })
      );

      // Calculate total score based on answers (you may need to adjust this logic)
      const totalScore = Object.values(submittedAnswers).reduce(
        (score, answer) => {
          const numAnswer = parseInt(answer);
          return score + (isNaN(numAnswer) ? 0 : numAnswer);
        },
        0
      );

      const scoreLevel = getLevelConfig(totalScore);

      const surveyResult = {
        level: scoreLevel?.level,
        noteSuggest: scoreLevel?.noteSuggest,
        surveyStatus: "COMPLETED",
        surveyId: survey?.surveyId,
        totalScore: totalScore,
        answerRecordRequests: answerRecordRequests,
      };

      console.log("Survey submitted:", surveyResult);

      showToast("Khảo sát đã được nộp thành công!", "success");

      // Navigate to result screen
      navigation.navigate("SurveyResult", {
        survey: { ...survey, surveyCode: "GAD-7" },
        result: surveyResult,
        answers: submittedAnswers,
        type: "orther",
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      showToast("Có lỗi xảy ra khi nộp khảo sát", "error");
    }
  };

  const handleBackPress = () => {
    handleBackToInfo();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Làm khảo sát</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <SurveyTaking
          survey={survey}
          answers={answers}
          setAnswers={setAnswers}
          onSubmit={handleSubmitSurvey}
          onBack={handleBackToInfo}
          showToast={showToast}
        />
      </ScrollView>

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelExit}
      >
        <TouchableWithoutFeedback onPress={handleCancelExit}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Ionicons name="warning" size={32} color="#F59E0B" />
                  <Text style={styles.modalTitle}>Thoát khỏi bài khảo sát</Text>
                </View>

                <Text style={styles.modalMessage}>
                  Tiến độ hiện tại sẽ được lưu lại. Bạn có thể tiếp tục làm bài
                  sau.
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={handleCancelExit}
                  >
                    <Text style={styles.modalButtonCancelText}>
                      Tiếp tục làm
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={handleConfirmExit}
                  >
                    <Text style={styles.modalButtonConfirmText}>
                      Lưu và thoát
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 300,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.primary,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

export default SurveyDetails;

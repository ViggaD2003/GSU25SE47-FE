import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Toast } from "../../components";
import { surveyResult } from "../../constants/survey";
import {
  clearSurveyProgress,
  loadSurveyProgress,
  postSurveyResult,
  saveSurveyProgress,
} from "../../services/api/SurveyService";

const SurveyTaking = ({ route, navigation }) => {
  const { survey } = route.params || {};
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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

  // Note: Removed automatic answer cleaning to prevent useInsertionEffect warnings
  // Answers are now only cleaned when loading saved progress

  const loadSavedProgress = async () => {
    if (!survey?.surveyId) {
      console.warn("No survey ID available for loading progress");
      return;
    }

    const savedAnswers = await loadSurveyProgress(survey.surveyId);
    if (savedAnswers && Object.keys(savedAnswers).length > 0) {
      // Clean up invalid answers before setting state
      const cleanedAnswers = cleanInvalidAnswers(savedAnswers);
      setAnswers(cleanedAnswers);

      if (Object.keys(cleanedAnswers).length > 0) {
        showToast("Đã tải lại tiến độ trước đó của bạn", "info");
      } else {
        showToast(
          "Tiến độ trước đó không hợp lệ, bắt đầu làm bài mới",
          "warning"
        );
      }
    }
  };

  // Clean up invalid answers that don't exist in current survey
  const cleanInvalidAnswers = useCallback(
    (answers) => {
      if (!survey || !survey.questions) {
        return {};
      }

      const validQuestionIds = survey.questions.map((q) => q.questionId);
      const cleanedAnswers = {};

      Object.entries(answers).forEach(([questionId, answerId]) => {
        const questionIdNum = parseInt(questionId);

        // Check if question exists in current survey
        if (validQuestionIds.includes(questionIdNum)) {
          const currentQuestion = survey.questions.find(
            (q) => q.questionId === questionIdNum
          );

          // Check if answer exists for this question
          const validAnswerIds = currentQuestion.answers.map((a) => a.id);
          if (validAnswerIds.includes(answerId)) {
            cleanedAnswers[questionId] = answerId;
          } else {
            console.warn(
              `Removing invalid answerId: ${answerId} for questionId: ${questionId}`
            );
          }
        } else {
          console.warn(
            `Removing invalid questionId: ${questionId} from saved progress`
          );
        }
      });

      return cleanedAnswers;
    },
    [survey?.questions] // Only depend on survey questions, not the entire survey object
  );

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ visible: false, message: "", type: "info" });
  };

  const handleAnswerSelect = (questionId, answerId, score) => {
    // Check if survey and questions exist
    if (!survey || !survey.questions) {
      console.warn("Survey or questions not available");
      return;
    }

    // Validate questionId exists in current survey
    const isValidQuestion = survey.questions.some(
      (question) => question.questionId === questionId
    );

    if (!isValidQuestion) {
      console.warn(
        `Invalid questionId: ${questionId}. Question not found in current survey.`
      );
      return;
    }

    // Validate answerId exists for the given question
    const currentQuestion = survey.questions.find(
      (question) => question.questionId === questionId
    );

    const isValidAnswer = currentQuestion.answers.some(
      (answer) => answer.id === answerId
    );

    if (!isValidAnswer) {
      console.warn(
        `Invalid answerId: ${answerId} for questionId: ${questionId}`
      );
      return;
    }

    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: answerId,
      };

      console.log("Updated answers:", newAnswers);
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (
      survey?.questions &&
      currentQuestionIndex < survey.questions.length - 1
    ) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Check if survey and questions exist
    if (!survey || !survey.questions) {
      showToast("Không tìm thấy thông tin khảo sát", "error");
      return;
    }

    // Validate all answers before submission
    const validationResult = validateAllAnswers(answers);

    if (!validationResult.isValid) {
      console.warn("Invalid answers found:", validationResult.invalidAnswers);
      showToast(
        "Có câu trả lời không hợp lệ, vui lòng kiểm tra lại",
        "warning"
      );
      return;
    }

    const unansweredRequired = survey.questions.filter(
      (q) => q.required && !answers[q.questionId]
    );

    if (unansweredRequired.length > 0) {
      showToast(
        "Vui lòng trả lời tất cả câu hỏi bắt buộc trước khi nộp bài",
        "warning"
      );
      return;
    }

    setShowSubmitModal(true);
  };

  // Validate all answers in the current state
  const validateAllAnswers = (currentAnswers) => {
    if (!survey || !survey.questions) {
      return {
        isValid: false,
        invalidAnswers: [],
      };
    }

    const validQuestionIds = survey.questions.map((q) => q.questionId);
    const invalidAnswers = [];

    Object.entries(currentAnswers).forEach(([questionId, answerId]) => {
      const questionIdNum = parseInt(questionId);

      // Check if question exists
      if (!validQuestionIds.includes(questionIdNum)) {
        invalidAnswers.push({
          questionId,
          answerId,
          reason: "Question not found in current survey",
        });
        return;
      }

      // Check if answer exists for this question
      const currentQuestion = survey.questions.find(
        (q) => q.questionId === questionIdNum
      );
      const validAnswerIds = currentQuestion.answers.map((a) => a.id);

      if (!validAnswerIds.includes(answerId)) {
        invalidAnswers.push({
          questionId,
          answerId,
          reason: "Answer not found for this question",
        });
      }
    });

    return {
      isValid: invalidAnswers.length === 0,
      invalidAnswers,
    };
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    handleSubmitSurvey(answers);
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
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
            // Navigate back to survey info with progress saved flag
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

  const handleSubmitSurvey = async (submittedAnswers) => {
    try {
      // Check if survey and questions exist
      if (!survey || !survey.questions) {
        showToast("Không tìm thấy thông tin khảo sát", "error");
        return;
      }

      // Clear saved progress after successful submission
      if (survey?.surveyId) {
        await clearSurveyProgress(survey.surveyId);
      }

      // Process submitted answers to create proper survey result
      const answerRecordRequests = Object.entries(submittedAnswers).map(
        ([answer, answerId]) => ({
          answerId: parseInt(answerId),
          skipped: !answer || answer === "",
        })
      );

      // Calculate total score based on answers (you may need to adjust this logic)
      const surveyConfig = getSurveyConfig();
      let totalScore;

      // Chuyển đổi answerId thành score
      const answerScores = [];
      Object.entries(submittedAnswers).forEach(
        ([questionId, answerId], index) => {
          // Chuyển đổi sang number để so sánh
          const questionIdNum = parseInt(questionId);
          const answerIdNum = parseInt(answerId);

          const question = survey.questions.find(
            (q) => q.questionId === questionIdNum
          );
          if (question) {
            const answer = question.answers.find((a) => a.id === answerIdNum);
            if (answer && answer.score !== undefined) {
              answerScores.push(answer.score);
              console.log(
                `Question ${index + 1}, Answer ${answerId}, Score: ${
                  answer.score
                }`
              );
            } else {
              console.log(
                `No valid answer found for Question ${questionId}, Answer ${answerId}`
              );
            }
          } else {
            console.log(`No question found for QuestionId: ${questionId}`);
          }
        }
      );

      if (!surveyConfig) {
        console.log("No survey config found, using default SUM method");
        // Mặc định sử dụng SUM nếu không tìm thấy config
        totalScore = answerScores.reduce((sum, score) => sum + score, 0);
      } else if (surveyConfig.method === "sum") {
        // Cộng tất cả điểm
        totalScore = answerScores.reduce((sum, score) => sum + score, 0);
        console.log("Using SUM method, Total Score:", totalScore);
      } else {
        // Tính trung bình cộng (mặc định nếu không có method hoặc method khác 'sum')
        if (answerScores.length > 0) {
          const sum = answerScores.reduce((total, score) => total + score, 0);
          totalScore = Math.round((sum / answerScores.length) * 10) / 10; // Làm tròn 1 chữ số thập phân
          console.log(
            "Using AVERAGE method, Total Score:",
            totalScore,
            "from",
            answerScores.length,
            "valid answers"
          );
        } else {
          totalScore = 0;
          console.log("No valid answers found, Total Score:", totalScore);
        }
      }

      // Fallback: nếu không có điểm nào, thử tính điểm từ submittedAnswers trực tiếp
      if (totalScore === 0 && Object.keys(submittedAnswers).length > 0) {
        console.log(
          "Fallback: Trying to calculate score directly from submittedAnswers"
        );
        const fallbackScores = Object.values(submittedAnswers)
          .map((answerId) => parseInt(answerId))
          .filter((score) => !isNaN(score));

        if (fallbackScores.length > 0) {
          totalScore = fallbackScores.reduce((sum, score) => sum + score, 0);
          console.log("Fallback scores calculated:", totalScore);
        }
      }

      const scoreLevel = getLevelConfig(totalScore);

      const surveyResult = {
        level: scoreLevel?.level.toUpperCase(),
        noteSuggest: scoreLevel?.noteSuggest,
        status: "COMPLETED",
        surveyId: survey?.surveyId,
        totalScore: totalScore,
        answerRecordRequests: answerRecordRequests,
      };

      // console.log("Survey submitted:", surveyResult);
      const response = await postSurveyResult(surveyResult);

      // Navigate to result screen
      navigation.navigate("SurveyResult", {
        survey,
        result: response.data,
        screen: "SurveyTaking",
        showRecordsButton: true,
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      showToast("Có lỗi xảy ra khi nộp khảo sát", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    handleBackToInfo();
  };

  // Early return if survey is not available
  if (!survey || !survey.questions) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Làm khảo sát</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
            Không tìm thấy thông tin khảo sát. Vui lòng thử lại.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];

  // Additional check for currentQuestion
  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Làm khảo sát</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text style={{ fontSize: 16, color: "#6B7280", textAlign: "center" }}>
            Không tìm thấy câu hỏi hiện tại. Vui lòng thử lại.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {isSubmitting && (
        <ActivityIndicator
          style={styles.loadingIndicator}
          size={50}
          color={GlobalStyles.colors.primary}
        />
      )}

      {/* Toast */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

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
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Câu hỏi {currentQuestionIndex + 1} / {survey.questions.length}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <Text style={styles.questionNumber}>
              Q{currentQuestionIndex + 1}
            </Text>
            {currentQuestion.required && (
              <Text style={styles.requiredText}>*</Text>
            )}
          </View>

          <Text style={styles.questionText}>
            {currentQuestion.text || "Không có nội dung câu hỏi"}
          </Text>

          {currentQuestion.description && (
            <Text style={styles.questionDescription}>
              {currentQuestion.description}
            </Text>
          )}

          {/* Score Legend */}
          <View style={styles.scoreLegend}>
            <Text style={styles.scoreLegendText}>
              💡 Các lựa chọn được sắp xếp theo mức độ từ thấp đến cao
            </Text>
          </View>

          {/* Answer Options */}
          <View style={styles.answersContainer}>
            {currentQuestion.answers && currentQuestion.answers.length > 0 ? (
              currentQuestion.answers
                .sort((a, b) => (a.score || 0) - (b.score || 0)) // Sắp xếp theo score từ bé đến lớn
                .map((answer) => (
                  <TouchableOpacity
                    key={answer.id}
                    style={[
                      styles.answerOption,
                      answers[currentQuestion.questionId] === answer.id &&
                        styles.selectedAnswer,
                    ]}
                    onPress={() =>
                      handleAnswerSelect(
                        currentQuestion.questionId,
                        answer.id,
                        answer.score
                      )
                    }
                  >
                    <View style={styles.answerRadio}>
                      {answers[currentQuestion.questionId] === answer.id && (
                        <View style={styles.radioSelected} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.answerText,
                        answers[currentQuestion.questionId] === answer.id &&
                          styles.selectedAnswerText,
                      ]}
                    >
                      {answer.text || "Không có nội dung câu trả lời"}
                    </Text>
                    <Text style={styles.answerScore}>
                      ({answer.score || 0})
                    </Text>
                  </TouchableOpacity>
                ))
            ) : (
              <Text
                style={{ textAlign: "center", color: "#6B7280", padding: 20 }}
              >
                Không có câu trả lời nào cho câu hỏi này.
              </Text>
            )}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.previousButton,
              currentQuestionIndex === 0 && styles.disabledButton,
            ]}
            onPress={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <Ionicons name="chevron-back" size={20} color="#6B7280" />
            <Text style={styles.navButtonText}>Trước</Text>
          </TouchableOpacity>

          {currentQuestionIndex === survey.questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.submitButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Đang nộp...</Text>
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Nộp bài</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navButton} onPress={handleNext}>
              <Text style={styles.navButtonText}>Tiếp</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={GlobalStyles.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelSubmit}
      >
        <TouchableWithoutFeedback onPress={handleCancelSubmit}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Ionicons
                    name="checkmark-circle"
                    size={32}
                    color={GlobalStyles.colors.primary}
                  />
                  <Text style={styles.modalTitle}>Nộp bài khảo sát</Text>
                </View>

                <Text style={styles.modalMessage}>
                  Bạn có chắc chắn muốn nộp bài? Không thể sửa đổi sau khi nộp.
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={handleCancelSubmit}
                  >
                    <Text style={styles.modalButtonCancelText}>
                      Kiểm tra lại
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={handleConfirmSubmit}
                  >
                    <Text style={styles.modalButtonConfirmText}>Nộp bài</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
                  sau. Lưu ý: Không thể quay lại màn hình trước đó khi đang làm
                  khảo sát.
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
    position: "relative",
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
    marginTop: 20,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 3,
  },
  questionCard: {
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
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: GlobalStyles.colors.primary,
    marginRight: 4,
  },
  requiredText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#EF4444",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 26,
    marginBottom: 8,
  },
  questionDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  scoreLegend: {
    backgroundColor: "#F0F9FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  scoreLegendText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1E40AF",
    lineHeight: 18,
  },
  answersContainer: {
    gap: 12,
  },
  answerOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },
  selectedAnswer: {
    borderColor: GlobalStyles.colors.primary,
    backgroundColor: "#F0F9FF",
  },
  answerRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GlobalStyles.colors.primary,
  },
  answerText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    lineHeight: 22,
  },
  selectedAnswerText: {
    color: "#1A1A1A",
    fontWeight: "500",
  },
  answerScore: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    marginLeft: 8,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flex: 1,
    gap: 8,
  },
  previousButton: {
    backgroundColor: "#F8FAFC",
  },
  submitButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderColor: GlobalStyles.colors.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  bottomSpacing: {
    height: 40,
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

export default SurveyTaking;

import React, { useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../../constants";

const SurveyTaking = ({ survey, answers, setAnswers, onSubmit, onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const unansweredRequired = survey.questions.filter(
      (q) => q.required && !answers[q.questionId]
    );

    if (unansweredRequired.length > 0) {
      Alert.alert(
        "Khảo sát chưa hoàn thành",
        "Vui lòng trả lời tất cả câu hỏi bắt buộc trước khi nộp bài.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Nộp bài khảo sát",
      "Bạn có chắc chắn muốn nộp bài? Không thể sửa đổi sau khi nộp.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Nộp bài",
          style: "default",
          onPress: () => {
            setIsSubmitting(true);
            onSubmit(answers);
          },
        },
      ]
    );
  };

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Câu hỏi {currentQuestionIndex + 1} / {survey.questions.length}
          </Text>
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
          {currentQuestion.required && (
            <Text style={styles.requiredText}>*</Text>
          )}
        </View>

        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {currentQuestion.description && (
          <Text style={styles.questionDescription}>
            {currentQuestion.description}
          </Text>
        )}

        {/* Answer Options */}
        <View style={styles.answersContainer}>
          {currentQuestion.answers.map((answer) => (
            <TouchableOpacity
              key={answer.id}
              style={[
                styles.answerOption,
                answers[currentQuestion.questionId] === answer.id &&
                  styles.selectedAnswer,
              ]}
              onPress={() =>
                handleAnswerSelect(currentQuestion.questionId, answer.id)
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
                {answer.text}
              </Text>
            </TouchableOpacity>
          ))}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
});

export default SurveyTaking;

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import SurveyInfo from "./components/SurveyInfo";
import SurveyTaking from "./components/SurveyTaking";
import SurveyResult from "./components/SurveyResult";

const SurveyDetails = ({ route, navigation }) => {
  const { survey } = route.params || {};
  const [surveyState, setSurveyState] = useState("info"); // "info", "taking", "result"
  const [surveyResult, setSurveyResult] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  // Mock survey result data for completed surveys
  const mockSurveyResult = {
    id: 1073741824,
    noteSuggest:
      "Bạn có dấu hiệu stress nhẹ. Hãy thử các bài tập thở và nghỉ ngơi đầy đủ.",
    totalScore: 75,
    status: "COMPLETED",
    completedAt: "2025-06-27",
    surveyId: survey?.surveyId,
    studentDto: {
      email: "student@example.com",
      phoneNumber: "0123456789",
      fullName: "Nguyễn Văn A",
      gender: true,
      dob: "2005-06-27",
      studentCode: "SV001",
      isEnableSurvey: true,
      classDto: {
        teacher: {
          teacherCode: "GV001",
          fullName: "Trần Thị B",
          phoneNumber: "0987654321",
          email: "teacher@example.com",
        },
        codeClass: "12A1",
        classYear: "2024-2025",
      },
    },
    mentalEvaluationId: 1073741824,
    answerRecords:
      survey?.questions?.map((question, index) => ({
        id: index + 1,
        questionResponse: question,
        answerResponse: question.answers[0], // Mock selected answer
        skipped: false,
      })) || [],
  };

  useEffect(() => {
    // Determine initial state based on survey status
    if (survey?.status === "ARCHIVED" || survey?.recordStatus === "COMPLETED") {
      setSurveyState("result");
      setSurveyResult(mockSurveyResult);
    } else if (
      survey?.status === "PUBLISHED" &&
      survey?.recordStatus === "NOT_STARTED"
    ) {
      setSurveyState("info");
    }
  }, [survey]);

  const handleStartSurvey = () => {
    // console.log("handleStartSurvey called");
    setSurveyState("taking");
  };

  const handleBackToInfo = () => {
    // console.log("handleBackToInfo called - showing modal");
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    // console.log("User confirmed exit - going back to info");
    setShowExitModal(false);
    setSurveyState("info");
    setAnswers({});
  };

  const handleCancelExit = () => {
    // console.log("User cancelled exit");
    setShowExitModal(false);
  };

  const handleSubmitSurvey = (submittedAnswers) => {
    // Mock API call
    setTimeout(() => {
      const result = {
        ...mockSurveyResult,
        totalScore: Math.floor(Math.random() * 100) + 1,
        completedAt: new Date().toISOString().split("T")[0],
        answerRecords: survey.questions.map((question, index) => ({
          id: index + 1,
          questionResponse: question,
          answerResponse: question.answers.find(
            (a) => a.id === submittedAnswers[question.questionId]
          ),
          skipped: !submittedAnswers[question.questionId],
        })),
      };

      setSurveyResult(result);
      setSurveyState("result");
    }, 2000);
  };

  const renderContent = () => {
    switch (surveyState) {
      case "info":
        return <SurveyInfo survey={survey} onStartSurvey={handleStartSurvey} />;
      case "taking":
        return (
          <SurveyTaking
            survey={survey}
            answers={answers}
            setAnswers={setAnswers}
            onSubmit={handleSubmitSurvey}
            onBack={handleBackToInfo}
          />
        );
      case "result":
        return (
          <SurveyResult
            survey={survey}
            result={surveyResult}
            onBack={() => navigation.goBack()}
          />
        );
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (surveyState) {
      case "info":
        return "Thông tin khảo sát";
      case "taking":
        return "Làm khảo sát";
      case "result":
        return "Kết quả khảo sát";
      default:
        return "Khảo sát";
    }
  };

  const handleBackPress = () => {
    console.log("handleBackPress called, surveyState:", surveyState);
    if (surveyState === "taking") {
      // console.log("In taking state, calling handleBackToInfo");
      handleBackToInfo();
    } else {
      // console.log("Not in taking state, going back to previous screen");
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

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
                  Bạn có chắc chắn muốn thoát? Tiến độ hiện tại sẽ không được
                  lưu.
                </Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButtonCancel}
                    onPress={handleCancelExit}
                  >
                    <Text style={styles.modalButtonCancelText}>Hủy</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalButtonConfirm}
                    onPress={handleConfirmExit}
                  >
                    <Text style={styles.modalButtonConfirmText}>Thoát</Text>
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
    backgroundColor: "#EF4444",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
});

export default SurveyDetails;

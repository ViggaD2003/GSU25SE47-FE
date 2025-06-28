import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import Toast from "../../components/common/Toast";
import { loadSurveyProgress } from "../../utils/SurveyService";

const SurveyInfo = ({ route, navigation }) => {
  const { survey } = route.params || {};
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    checkSavedProgress();
  }, [survey?.surveyId]);

  const checkSavedProgress = async () => {
    if (survey?.surveyId) {
      const savedAnswers = await loadSurveyProgress(survey.surveyId);
      setHasSavedProgress(savedAnswers && Object.keys(savedAnswers).length > 0);
    }
  };

  const showToast = useCallback((message, type = "info") => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast({ visible: false, message: "", type: "info" });
  }, []);

  const handleStartSurvey = useCallback(() => {
    if (hasSavedProgress) {
      showToast("Tiếp tục khảo sát với tiến độ đã lưu", "info");
      setTimeout(() => {
        navigation.navigate("SurveyDetails", { survey });
      }, 1000);
    } else {
      navigation.navigate("SurveyDetails", { survey });
    }
  }, [hasSavedProgress, showToast, navigation, survey]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin khảo sát</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Survey Card */}
        <View style={styles.surveyCard}>
          <View style={styles.surveyHeader}>
            <View style={styles.surveyIcon}>
              <Ionicons name="document-text" size={24} color="#3B82F6" />
            </View>
            <View style={styles.surveyInfo}>
              <Text style={styles.surveyTitle}>{survey?.name}</Text>
              <Text style={styles.surveySubtitle}>
                {survey?.description || "Khảo sát tâm lý học sinh"}
              </Text>
            </View>
          </View>

          {/* Survey Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Thời gian: {survey?.estimatedTime || "15-20 phút"}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Số câu hỏi: {survey?.questions?.length || 0} câu
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                Ngày tạo: {formatDate(survey?.createdAt || new Date())}
              </Text>
            </View>

            {survey?.deadline && (
              <View style={styles.detailItem}>
                <Ionicons name="warning-outline" size={20} color="#F59E0B" />
                <Text style={styles.detailText}>
                  Hạn nộp: {formatDate(survey.deadline)}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Info */}
          {hasSavedProgress && (
            <View style={styles.progressInfo}>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text style={styles.progressText}>
                Bạn có tiến độ đã lưu trước đó. Nhấn "Tiếp tục" để làm tiếp.
              </Text>
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Hướng dẫn:</Text>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1.</Text>
              <Text style={styles.instructionText}>
                Đọc kỹ từng câu hỏi trước khi trả lời
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2.</Text>
              <Text style={styles.instructionText}>
                Chọn câu trả lời phù hợp nhất với tình huống của bạn
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3.</Text>
              <Text style={styles.instructionText}>
                Bạn có thể lưu tiến độ và tiếp tục sau
              </Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>4.</Text>
              <Text style={styles.instructionText}>
                Trả lời thành thật để có kết quả chính xác nhất
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartSurvey}
          >
            <Ionicons
              name={hasSavedProgress ? "play" : "play-circle"}
              size={24}
              color="#fff"
            />
            <Text style={styles.startButtonText}>
              {hasSavedProgress ? "Tiếp tục khảo sát" : "Bắt đầu khảo sát"}
            </Text>
          </TouchableOpacity>

          {/* Test Toast Button */}
          {/* <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: "#10B981", marginTop: 12 },
            ]}
            onPress={() => showToast("Test toast message", "success")}
          >
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.startButtonText}>Test Toast</Text>
          </TouchableOpacity> */}
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
  surveyCard: {
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
  surveyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  surveyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  surveyInfo: {
    flex: 1,
  },
  surveyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  surveySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 12,
    flex: 1,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#1E40AF",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: GlobalStyles.colors.primary,
    marginRight: 8,
    minWidth: 20,
  },
  instructionText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startButton: {
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
  startButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
});

export default SurveyInfo;

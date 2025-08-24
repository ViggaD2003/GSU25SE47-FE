import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Container, Loading } from "../../components";
import { AssessmentScoreChart } from "../../components/charts";
import { getAppointmentById } from "@/services/api/AppointmentService";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";

dayjs.locale("vi");

const { width } = Dimensions.get("window");

const AppointmentRecordDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { recordId } = route.params;

  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch appointment details
  useEffect(() => {
    const fetchRecordDetails = async () => {
      try {
        setLoading(true);
        const data = await getAppointmentById(recordId);
        setRecord(data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết hồ sơ:", error);
        Alert.alert("Lỗi", "Không thể tải chi tiết hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    if (recordId) {
      fetchRecordDetails();
    }
  }, [recordId]);

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          borderColor: "#059669",
          icon: "checkmark-circle",
          text: "Hoàn thành",
          gradient: ["#059669", "#047857"],
        };
      case "ABSENT":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          borderColor: "#F59E0B",
          icon: "close-circle",
          text: "Vắng",
          gradient: ["#F59E0B", "#D97706"],
        };
      case "CANCELED":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          borderColor: "#DC2626",
          icon: "close-circle",
          text: "Đã hủy",
          gradient: ["#DC2626", "#B91C1C"],
        };
      case "EXPIRED":
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          borderColor: "#6B7280",
          icon: "time",
          text: "Hết hạn",
          gradient: ["#6B7280", "#4B5563"],
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          borderColor: "#6B7280",
          icon: "help",
          text: "Chưa xác định",
          gradient: ["#6B7280", "#4B5563"],
        };
    }
  };

  // Get session flow configuration
  const getSessionFlowConfig = (sessionFlow) => {
    switch (sessionFlow?.toUpperCase()) {
      case "GOOD":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          icon: "happy",
          text: "Tốt",
          description: "Buổi tư vấn diễn ra thuận lợi",
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: "Trung bình",
          description: "Buổi tư vấn có một số khó khăn",
        };
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: "Trung bình",
          description: "Buổi tư vấn có một số khó khăn",
        };
      case "LOW":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          icon: "sad",
          text: "Kém",
          description: "Buổi tư vấn gặp nhiều khó khăn",
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          icon: "help",
          text: "Chưa đánh giá",
          description: "Chưa có đánh giá cho buổi tư vấn",
        };
    }
  };

  // Get cooperation level configuration
  const getCoopLevelConfig = (level) => {
    switch (level?.toUpperCase()) {
      case "GOOD":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          text: "Tốt",
          description: "Học sinh tích cực hợp tác",
        };
      case "MEDIUM":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          text: "Trung bình",
          description: "Học sinh hợp tác ở mức độ vừa phải",
        };
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          text: "Trung bình",
          description: "Học sinh hợp tác ở mức độ vừa phải",
        };
      case "LOW":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          text: "Thấp",
          description: "Học sinh ít hợp tác",
        };
      default:
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          text: "Chưa đánh giá",
          description: "Chưa có đánh giá mức độ hợp tác",
        };
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading text="Đang tải chi tiết hồ sơ..." />
      </Container>
    );
  }

  if (!record) {
    return (
      <Container>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>Không tìm thấy hồ sơ</Text>
          <Text style={styles.errorSubtitle}>
            Hồ sơ bạn đang tìm kiếm không tồn tại hoặc đã bị xóa
          </Text>
        </View>
      </Container>
    );
  }

  const statusConfig = getStatusConfig(record.status);
  const sessionFlowConfig = getSessionFlowConfig(record.sessionFlow);
  const coopLevelConfig = getCoopLevelConfig(record.studentCoopLevel);

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title={"Chi tiết hồ sơ"}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <LinearGradient
            colors={statusConfig.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusGradient}
          >
            <View style={styles.statusContent}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIconContainer}>
                  <Ionicons
                    name={statusConfig.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={styles.recordId}>Hồ sơ #{record.id}</Text>
                  <Text style={styles.statusText}>{statusConfig.text}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Appointment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin lịch hẹn</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian bắt đầu</Text>
                <Text style={styles.infoValue}>
                  {dayjs(record.startDateTime).format("dddd, DD/MM/YYYY HH:mm")}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="time" size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian kết thúc</Text>
                <Text style={styles.infoValue}>
                  {dayjs(record.endDateTime).format("dddd, DD/MM/YYYY HH:mm")}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="person" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Loại tư vấn</Text>
                <Text style={styles.infoValue}>
                  {record.hostType === "COUNSELOR"
                    ? "Tư vấn viên"
                    : "Giáo viên"}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name={record.isOnline ? "wifi" : "location"}
                  size={20}
                  color="#10B981"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Hình thức</Text>
                <Text style={styles.infoValue}>
                  {record.isOnline ? "Trực tuyến" : "Tại chỗ"}
                </Text>
              </View>
            </View>
            {record.location && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location" size={20} color="#F59E0B" />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa điểm</Text>
                  <Text style={styles.infoValue}>{record.location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin người dùng</Text>
          <View style={styles.sectionContent}>
            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <Ionicons name="person-circle" size={24} color="#3B82F6" />
                <Text style={styles.userTitle}>Người được tư vấn</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{record.bookedFor.fullName}</Text>
                <Text style={styles.userDetail}>{record.bookedFor.email}</Text>
                <Text style={styles.userDetail}>
                  {record.bookedFor.phoneNumber}
                </Text>
              </View>
            </View>

            <View style={styles.userCard}>
              <View style={styles.userHeader}>
                <Ionicons name="person" size={24} color="#10B981" />
                <Text style={styles.userTitle}>Người đặt lịch</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{record.bookedBy.fullName}</Text>
                <Text style={styles.userDetail}>{record.bookedBy.email}</Text>
                <Text style={styles.userDetail}>
                  {record.bookedBy.phoneNumber}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Evaluation Section - Only for COMPLETED */}
        {record.status === "COMPLETED" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đánh giá buổi tư vấn</Text>
            <View style={styles.sectionContent}>
              {/* Session Flow */}
              {record.sessionFlow && (
                <View style={styles.evaluationCard}>
                  <View style={styles.evaluationHeader}>
                    <View
                      style={[
                        styles.evaluationIconContainer,
                        { backgroundColor: sessionFlowConfig.backgroundColor },
                      ]}
                    >
                      <Ionicons
                        name={sessionFlowConfig.icon}
                        size={20}
                        color={sessionFlowConfig.color}
                      />
                    </View>
                    <View style={styles.evaluationInfo}>
                      <Text style={styles.evaluationTitle}>
                        Tiến trình buổi tư vấn
                      </Text>
                      <View
                        style={[
                          styles.evaluationBadge,
                          {
                            backgroundColor: sessionFlowConfig.backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.evaluationBadgeText,
                            { color: sessionFlowConfig.color },
                          ]}
                        >
                          {sessionFlowConfig.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.evaluationDescription}>
                    {sessionFlowConfig.description}
                  </Text>
                </View>
              )}

              {/* Cooperation Level */}
              {record.studentCoopLevel && (
                <View
                  style={[
                    styles.evaluationCard,
                    { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 },
                  ]}
                >
                  <View style={styles.evaluationHeader}>
                    <View
                      style={[
                        styles.evaluationIconContainer,
                        { backgroundColor: coopLevelConfig.backgroundColor },
                      ]}
                    >
                      <Ionicons
                        name="people"
                        size={20}
                        color={coopLevelConfig.color}
                      />
                    </View>
                    <View style={styles.evaluationInfo}>
                      <Text style={styles.evaluationTitle}>Mức độ hợp tác</Text>
                      <View
                        style={[
                          styles.evaluationBadge,
                          { backgroundColor: coopLevelConfig.backgroundColor },
                        ]}
                      >
                        <Text
                          style={[
                            styles.evaluationBadgeText,
                            { color: coopLevelConfig.color },
                          ]}
                        >
                          {coopLevelConfig.text}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.evaluationDescription}>
                    {coopLevelConfig.description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú & Đề xuất</Text>
          <View style={styles.sectionContent}>
            {/* Cancel Reason - Only for CANCELED */}
            {record.status === "CANCELED" && record.cancelReason && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#DC2626"
                  />
                  <Text style={styles.noteTitle}>Lý do hủy buổi tư vấn</Text>
                </View>
                <Text style={styles.noteContent}>{record.cancelReason}</Text>
              </View>
            )}

            {/* Session Notes */}
            {record.sessionNotes && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Ionicons name="document-text" size={20} color="#3B82F6" />
                  <Text style={styles.noteTitle}>Ghi chú buổi tư vấn</Text>
                </View>
                <Text style={styles.noteContent}>{record.sessionNotes}</Text>
              </View>
            )}

            {/* Summary */}
            {record.noteSummary && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Ionicons name="document-text" size={20} color="#059669" />
                  <Text style={styles.noteTitle}>Tóm tắt buổi tư vấn</Text>
                </View>
                <Text style={styles.noteContent}>{record.noteSummary}</Text>
              </View>
            )}

            {/* Suggestions */}
            {record.noteSuggestion && (
              <View
                style={[
                  styles.noteCard,
                  { marginBottom: 0, borderBottomWidth: 0, paddingBottom: 0 },
                ]}
              >
                <View style={styles.noteHeader}>
                  <Ionicons name="bulb" size={20} color="#F59E0B" />
                  <Text style={styles.noteTitle}>Gợi ý & Khuyến nghị</Text>
                </View>
                <Text style={styles.noteContent}>{record.noteSuggestion}</Text>
              </View>
            )}

            {!record.cancelReason &&
              !record.sessionNotes &&
              !record.noteSummary &&
              !record.noteSuggestion && (
                <View style={styles.emptyNotesContainer}>
                  <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyNotesText}>
                    Chưa có ghi chú cho hồ sơ này
                  </Text>
                </View>
              )}
          </View>
        </View>

        {/* Assessment Scores */}
        {record.assessmentScores && record.assessmentScores.length > 0 && (
          <View style={styles.section}>
            <AssessmentScoreChart
              scores={record.assessmentScores}
              title="Kết quả đánh giá chi tiết"
            />
          </View>
        )}
      </ScrollView>
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
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  content: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  contentContainer: {
    padding: 20,
  },
  statusCard: {
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statusGradient: {
    borderRadius: 16,
    padding: 20,
  },
  statusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  recordId: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  statusText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  userCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  userInfo: {
    marginLeft: 32,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userDetail: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  evaluationCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  evaluationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  evaluationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  evaluationInfo: {
    flex: 1,
  },
  evaluationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  evaluationBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  evaluationBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  evaluationDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginLeft: 52,
  },
  noteCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    marginLeft: 28,
  },
  emptyNotesContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyNotesText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AppointmentRecordDetail;

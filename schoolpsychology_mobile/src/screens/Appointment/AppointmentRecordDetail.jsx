import React, { useState } from "react";
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
import { Container } from "../../components";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const { width } = Dimensions.get("window");

const AppointmentRecordDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { record } = route.params;

  // Get status configuration
  const getStatusConfig = (status) => {
    switch (status?.toUpperCase()) {
      case "FINALIZED":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          borderColor: "#059669",
          icon: "checkmark-circle",
          text: "Hoàn thành",
          gradient: ["#059669", "#047857"],
        };
      case "SUBMITTED":
        return {
          color: "#DC2626",
          backgroundColor: "#FEE2E2",
          borderColor: "#DC2626",
          icon: "paper-plane",
          text: "Đã nộp",
          gradient: ["#DC2626", "#B91C1C"],
        };
      case "CANCELLED":
        return {
          color: "#6B7280",
          backgroundColor: "#F3F4F6",
          borderColor: "#6B7280",
          icon: "close-circle",
          text: "Đã hủy",
          gradient: ["#6B7280", "#4B5563"],
        };
      default:
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          borderColor: "#F59E0B",
          icon: "time",
          text: "Chưa xác định",
          gradient: ["#F59E0B", "#D97706"],
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
      case "AVERAGE":
        return {
          color: "#F59E0B",
          backgroundColor: "#FEF3C7",
          icon: "remove",
          text: "Trung bình",
          description: "Buổi tư vấn có một số khó khăn",
        };
      case "POOR":
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
      case "HIGH":
        return {
          color: "#059669",
          backgroundColor: "#D1FAE5",
          text: "Cao",
          description: "Học sinh tích cực hợp tác",
        };
      case "MEDIUM":
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

  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return "#059669";
    if (score >= 60) return "#F59E0B";
    if (score >= 40) return "#EF4444";
    return "#DC2626";
  };

  // Share record
  const handleShare = async () => {
    try {
      const statusConfig = getStatusConfig(record.status);
      const sessionFlowConfig = getSessionFlowConfig(record.sessionFlow);
      const coopLevelConfig = getCoopLevelConfig(record.studentCoopLevel);

      const shareContent = `📋 Hồ sơ tư vấn #${record.id}

📅 Ngày tạo: ${dayjs(record.createdDate).format("DD/MM/YYYY HH:mm")}
🏥 Trạng thái: ${statusConfig.text}
⭐ Điểm tổng: ${record.totalScore || "Chưa có"}
📈 Tiến trình: ${sessionFlowConfig.text}
🤝 Mức độ hợp tác: ${coopLevelConfig.text}

💡 Lý do: ${record.reason || "Không có"}

📝 Tóm tắt: ${record.noteSummary || "Chưa có tóm tắt"}
💭 Gợi ý: ${record.noteSuggest || "Chưa có gợi ý"}`;

      await Share.share({
        message: shareContent,
        title: `Hồ sơ tư vấn #${record.id}`,
      });
    } catch (error) {
      console.error("Error sharing record:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ hồ sơ");
    }
  };

  const statusConfig = getStatusConfig(record.status);
  const sessionFlowConfig = getSessionFlowConfig(record.sessionFlow);
  const coopLevelConfig = getCoopLevelConfig(record.studentCoopLevel);

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết hồ sơ</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

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
              {record.total_score !== null && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Điểm tổng</Text>
                  <Text style={styles.scoreValue}>{record.totalScore}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Date Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thời gian</Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày tạo</Text>
                <Text style={styles.infoValue}>
                  {dayjs(record.createdDate).format("dddd, DD/MM/YYYY HH:mm")}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="refresh" size={20} color="#6B7280" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Cập nhật lần cuối</Text>
                <Text style={styles.infoValue}>
                  {dayjs(record.updatedDate).format("dddd, DD/MM/YYYY HH:mm")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Evaluation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá buổi tư vấn</Text>
          <View style={styles.sectionContent}>
            {/* Session Flow */}
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
                      { backgroundColor: sessionFlowConfig.backgroundColor },
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

            {/* Cooperation Level */}
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

            {/* Score Detail */}
            {/* {record.total_score !== null && (
              <View style={styles.evaluationCard}>
                <View style={styles.evaluationHeader}>
                  <View
                    style={[
                      styles.evaluationIconContainer,
                      {
                        backgroundColor: `${getScoreColor(
                          record.totalScore
                        )}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="star"
                      size={20}
                      color={getScoreColor(record.totalScore)}
                    />
                  </View>
                  <View style={styles.evaluationInfo}>
                    <Text style={styles.evaluationTitle}>Điểm đánh giá</Text>
                    <Text
                      style={[
                        styles.scoreDetailValue,
                        { color: getScoreColor(record.totalScore) },
                      ]}
                    >
                      {record.totalScore}/100
                    </Text>
                  </View>
                </View>
                <View style={styles.scoreProgressContainer}>
                  <View style={styles.scoreProgressTrack}>
                    <View
                      style={[
                        styles.scoreProgressFill,
                        {
                          width: `${record.total_score}%`,
                          backgroundColor: getScoreColor(record.total_score),
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )} */}
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú & Đề xuất</Text>
          <View style={styles.sectionContent}>
            {/* Reason */}
            {record.status === "CANCELLED" && record.reason && (
              <View style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#3B82F6"
                  />
                  <Text style={styles.noteTitle}>Lý do hủy buổi tư vấn</Text>
                </View>
                <Text style={styles.noteContent}>{record.reason}</Text>
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
            {record.noteSuggest && (
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
                <Text style={styles.noteContent}>{record.noteSuggest}</Text>
              </View>
            )}

            {!record.reason && !record.noteSummary && !record.noteSuggest && (
              <View style={styles.emptyNotesContainer}>
                <Ionicons name="document-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyNotesText}>
                  Chưa có ghi chú cho hồ sơ này
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Appointment Reference */}
        {record.appointmentId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liên kết</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.linkCard}>
                <View style={styles.linkIconContainer}>
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                </View>
                <View style={styles.linkContent}>
                  <Text style={styles.linkTitle}>Lịch hẹn liên quan</Text>
                  <Text style={styles.linkSubtitle}>
                    ID: {record.appointmentId}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
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
  scoreContainer: {
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
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
  scoreDetailValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  scoreProgressContainer: {
    marginLeft: 52,
    marginTop: 8,
  },
  scoreProgressTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  scoreProgressFill: {
    height: "100%",
    borderRadius: 3,
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
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  linkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default AppointmentRecordDetail;

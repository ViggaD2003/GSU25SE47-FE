import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function MyChildren({ route }) {
  const { data, onRefresh: onRefreshParent } = route?.params || {};
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("data", data);
    const students = Array.isArray(data.student)
      ? data.student.map((student, idx) => ({
          ...student,
          id: student.studentCode || idx.toString(),
        }))
      : [];
    setChildren(students);
    setLoading(false);
  }, [data]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefreshParent();
    setRefreshing(false);
  }, [onRefreshParent]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getGenderIcon = (gender) => {
    return gender ? "male" : "female";
  };

  const getGenderColor = (gender) => {
    return gender ? "#3B82F6" : "#EC4899";
  };

  const getGenderText = (gender) => {
    return gender ? "Nam" : "Nữ";
  };

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Con của tôi</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : children.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-child-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Chưa có con nào</Text>
          <Text style={styles.emptyText}>
            Thông tin con sẽ hiển thị ở đây khi được thêm vào hệ thống
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{children.length}</Text>
              <Text style={styles.statLabel}>Tổng số con</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {children.filter((child) => child.isEnableSurvey).length}
              </Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Danh sách con</Text>

          {children.map((child, index) => (
            <ChildCard
              key={child.id}
              child={child}
              index={index}
              formatDate={formatDate}
              getGenderIcon={getGenderIcon}
              getGenderColor={getGenderColor}
              getGenderText={getGenderText}
            />
          ))}
        </ScrollView>
      )}
    </Container>
  );
}

function ChildCard({
  child,
  index,
  formatDate,
  getGenderIcon,
  getGenderColor,
  getGenderText,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { marginTop: index === 0 ? 0 : 16 }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-child-circle" size={40} color="#10B981" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.childName}>{child.fullName}</Text>
          <Text style={styles.childCode}>{child.studentCode}</Text>
        </View>
        <View style={styles.headerActions}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: child.isEnableSurvey ? "#D1FAE5" : "#FEE2E2" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: child.isEnableSurvey ? "#065F46" : "#DC2626" },
              ]}
            >
              {child.isEnableSurvey ? "Hoạt động" : "Tạm dừng"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setExpanded(!expanded)}
          >
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Basic Info */}
      <View style={styles.basicInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {child.email}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{child.phoneNumber || "Chưa có"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name={getGenderIcon(child.gender)}
            size={16}
            color={getGenderColor(child.gender)}
          />
          <Text style={styles.infoText}>{getGenderText(child.gender)}</Text>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Thông tin cá nhân</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày sinh:</Text>
              <Text style={styles.detailValue}>{formatDate(child.dob)}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Thông tin lớp học</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Lớp:</Text>
              <Text style={styles.detailValue}>
                {child.classDto?.codeClass || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Năm học:</Text>
              <Text style={styles.detailValue}>
                {child.classDto?.classYear || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giáo viên:</Text>
              <Text style={styles.detailValue}>
                {child.classDto?.teacher?.fullName || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email GV:</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {child.classDto?.teacher?.email || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>Cài đặt khảo sát</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: child.isEnableSurvey
                        ? "#10B981"
                        : "#EF4444",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.detailValue,
                    { color: child.isEnableSurvey ? "#10B981" : "#EF4444" },
                  ]}
                >
                  {child.isEnableSurvey ? "Đang bật" : "Đã tắt"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
  },
  childCode: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  headerActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  expandButton: {
    padding: 4,
  },
  basicInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  expandedDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 20,
  },
  detailSection: {
    gap: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    textAlign: "right",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
});

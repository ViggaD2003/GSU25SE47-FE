import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";
import { useNavigation } from "@react-navigation/native";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";
import { updateIsAbleSurvey } from "@/services/api/account";
import { useChildren } from "@/contexts";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

export default function MyChildren({ route }) {
  const { t } = useTranslation();
  const { onRefresh: onRefreshParent } = route?.params || {};
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { children, updateChild } = useChildren();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefreshParent) {
      await onRefreshParent();
    }
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
    return gender ? t("common.male") : t("common.female");
  };

  const handleUpdateIsEnableSurvey = async (childId) => {
    const child = children.find(
      (child) => child.id || child.userId === childId
    );
    if (!child) return;
    try {
      await updateIsAbleSurvey(child.id || child.userId, !child.isEnableSurvey);
      updateChild(childId, {
        ...child,
        isEnableSurvey: !child.isEnableSurvey,
      });

      Alert.alert("Thành công", "Cập nhật trạng thái thành công", [
        {
          text: "OK",
          onPress: () => {
            onRefresh();
          },
        },
      ]);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <Container edges={["bottom"]}>
      {/* Header */}
      <HeaderWithoutTab
        title={t("myChildren.title")}
        onBackPress={handleBackPress}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate("AddChild")}>
            <Icon name="plus" size={24} color="#10B981" />
          </TouchableOpacity>
        }
      />

      {refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : children.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-child-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>{t("myChildren.emptyTitle")}</Text>
          <Text style={styles.emptyText}>{t("myChildren.emptySubtitle")}</Text>
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
              <Text style={styles.statLabel}>
                {t("myChildren.totalChildren")}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {children.filter((child) => child.isEnableSurvey).length}
              </Text>
              <Text style={styles.statLabel}>
                {t("myChildren.activeChildren")}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            {t("myChildren.listChildren")}
          </Text>

          {children.map((child, index) => (
            <ChildCard
              t={t}
              key={child.id}
              child={child}
              index={index}
              formatDate={formatDate}
              getGenderIcon={getGenderIcon}
              getGenderColor={getGenderColor}
              getGenderText={getGenderText}
              handleUpdateIsEnableSurvey={handleUpdateIsEnableSurvey}
            />
          ))}
        </ScrollView>
      )}
    </Container>
  );
}

function ChildCard({
  t,
  child,
  index,
  formatDate,
  getGenderIcon,
  getGenderColor,
  getGenderText,
  handleUpdateIsEnableSurvey,
}) {
  const [expanded, setExpanded] = useState(false);

  // Safety check for child data
  if (!child) {
    return null;
  }

  console.log("child", child.classDto);

  return (
    <View style={[styles.card, { marginTop: index === 0 ? 0 : 16 }]}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="account-child-circle" size={40} color="#10B981" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.childName}>{child.fullName || "Unknown"}</Text>
          <Text style={styles.childCode}>
            {child.studentCode || child.userId || "N/A"}
          </Text>
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
              {child.isEnableSurvey
                ? t("myChildren.active")
                : t("myChildren.inactive")}
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
      <View style={styles.basicInfoContainer}>
        <View style={styles.basicInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText} numberOfLines={1}>
              {child.email || "N/A"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              {child.phoneNumber || t("myChildren.noPhone")}
            </Text>
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
        <View
          style={[
            styles.inputGroup,
            { borderColor: !child.isEnableSurvey ? "#10B981" : "#EF4444" },
          ]}
        >
          <TouchableOpacity
            onPress={() => handleUpdateIsEnableSurvey(child.id || child.userId)}
          >
            <Text
              style={[
                styles.switchText,
                { color: !child.isEnableSurvey ? "#10B981" : "#EF4444" },
              ]}
            >
              {!child.isEnableSurvey ? t("myChildren.on") : t("myChildren.off")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedDetails}>
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>
              {t("myChildren.personalInfo")}
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("myChildren.dob")}</Text>
              <Text style={styles.detailValue}>{formatDate(child.dob)}</Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>{t("myChildren.classInfo")}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("myChildren.class")}</Text>
              <Text style={styles.detailValue}>
                {child.classDto?.codeClass || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("myChildren.classYear")}
              </Text>
              <Text style={styles.detailValue}>
                {child.classDto?.schoolYear?.name || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("myChildren.teacher")}</Text>
              <Text style={styles.detailValue}>
                {child.classDto?.teacher?.fullName || "N/A"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("myChildren.teacherEmail")}
              </Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {child.classDto?.teacher?.email || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>{t("myChildren.surveyInfo")}</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("myChildren.status")}</Text>
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
                  {child.isEnableSurvey
                    ? t("myChildren.on")
                    : t("myChildren.off")}
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
  inputGroup: {
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
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
  basicInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  basicInfo: {
    flex: 1,
    gap: 8,
  },
  infoRow: {
    flex: 1,
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

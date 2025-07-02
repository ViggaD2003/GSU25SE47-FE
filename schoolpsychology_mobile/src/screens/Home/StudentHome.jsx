import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { surveyData } from "../../constants/survey";
import Loading from "../../components/common/Loading";
import SurveyCard from "../../components/common/SurveyCard";
import { getPublishedSurveys } from "../../services/api/SurveyService";
import { Container, Alert } from "../../components";
import { GlobalStyles } from "../../constants";
import { useAuth } from "../../contexts";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
// const isLargeDevice = width >= 414;

export default function StudentHome({
  navigation,
  setShowToast,
  setToastMessage,
  setToastType,
}) {
  const { user } = useAuth();
  const [messageCount, setMessageCount] = useState(3);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("survey");
  const isEnableSurvey = user?.isEnableSurvey;
  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

  const fetchSurveys = async () => {
    try {
      const response = await getPublishedSurveys();
      setData(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải surveys:", error);
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );

      setData(publishedSurveys);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setData([]);
    } catch (error) {
      console.error("Lỗi khi tải appointments:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setData([]);
    } catch (error) {
      console.error("Lỗi khi tải programs:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = async (type = activeTab) => {
    setRefreshing(true);
    setLoading(true);
    setActiveTab(type);
    switch (type) {
      case "survey":
        isEnableSurvey && (await fetchSurveys());
        break;
      case "appointment":
        await fetchAppointments();
        break;
      case "program":
        await fetchPrograms();
        break;
      default:
        await fetchSurveys();
        break;
    }
  };

  useFocusEffect(
    useCallback(() => {
      isEnableSurvey ? onRefresh("survey") : onRefresh("appointment");
    }, [navigation, isEnableSurvey])
  );

  return (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.userSection}
        >
          <View style={styles.avatarContainer}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>Good morning</Text>
            <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
          </View>
        </TouchableOpacity>

        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <View style={styles.notificationContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#374151"
              />
              {messageCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {messageCount > 9 ? "9+" : messageCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stress Alert */}
        {!isEnableSurvey && (
          <Alert
            type="warning"
            title={"Khảo sát hiện đã bị vô hiệu hóa"}
            description={
              user.role === "STUDENT"
                ? "Tính năng này đã bị tắt hoặc không còn hiệu lực vào thời điểm hiện tại."
                : "Vui lòng bật lại trong phần cài đặt nếu muốn học viên tiếp tục sử dụng."
            }
            showCloseButton={false}
          />
        )}
        <Alert
          type="error"
          title="Cảnh báo mức độ căng thẳng cao"
          description="Dựa trên các đánh giá gần đây, chúng tôi khuyến nghị bạn nên thực hiện các biện pháp để quản lý mức độ căng thẳng."
          showCloseButton={false}
        />

        {/* Featured Programs */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Programs</Text>
            <TouchableOpacity style={styles.sectionLinkContainer}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
              }}
              style={styles.featuredImg}
              resizeMode="cover"
            />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTag}>SUPPORT PROGRAM</Text>
                <Text style={styles.featuredTitle}>
                  Career Development Workshop
                </Text>
                <Text style={styles.featuredTime}>
                  May 25, 2025 • 13:00 - 15:30
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.connectRow}>
            <TouchableOpacity
              style={styles.connectBox}
              onPress={() => navigation.navigate("Blog")}
            >
              <View style={styles.connectIconContainer}>
                <Text style={styles.connectIcon}>📚</Text>
              </View>
              <Text style={styles.connectTitle}>Doc & Blog</Text>
              <Text style={styles.connectDesc}>
                Khám phá kiến thức và chia sẻ từ chuyên gia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.connectBox}
              onPress={() => navigation.navigate("Appointment")}
            >
              <View style={styles.connectIconContainer}>
                <Text style={styles.connectIcon}>📅</Text>
              </View>
              <Text style={styles.connectTitle}>Đặt lịch tư vấn</Text>
              <Text style={styles.connectDesc}>
                Hẹn gặp chuyên gia tâm lý để được hỗ trợ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Events */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Events</Text>
          </View>
          <View style={styles.eventTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventTabsScrollContent}
            >
              {isEnableSurvey && (
                <TouchableOpacity
                  style={
                    activeTab === "survey"
                      ? styles.eventTabActive
                      : styles.eventTab
                  }
                  onPress={() => onRefresh("survey")}
                >
                  <Text
                    style={
                      activeTab === "survey"
                        ? styles.eventTabTextActive
                        : styles.eventTabText
                    }
                  >
                    Survey
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={
                  activeTab === "appointment"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => onRefresh("appointment")}
              >
                <Text
                  style={
                    activeTab === "appointment"
                      ? styles.eventTabTextActive
                      : styles.eventTabText
                  }
                >
                  Appointments
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  activeTab === "program"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => onRefresh("program")}
              >
                <Text
                  style={
                    activeTab === "program"
                      ? styles.eventTabTextActive
                      : styles.eventTabText
                  }
                >
                  Support Programs
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View style={styles.requiredSurveys}>
            {/* <View style={styles.requiredTitleRow}>
              <Text style={styles.requiredTitle}>Required Surveys</Text>
              <Badge>{data.length} </Badge>
            </View> */}
            {loading ? (
              <Loading text={`Loading ${activeTab}s...`} />
            ) : data.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No available {activeTab}</Text>
              </View>
            ) : isEnableSurvey && activeTab === "survey" ? (
              data.map((data, index) => (
                <SurveyCard
                  survey={data}
                  key={index}
                  navigation={navigation}
                  onRefresh={onRefresh}
                  setShowToast={setShowToast}
                  setToastMessage={setToastMessage}
                  setToastType={setToastType}
                />
              ))
            ) : null}
          </View>
        </View>
      </ScrollView>
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
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0.1,
    borderBottomWidth: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  scrollContainer: {
    paddingTop: 13,
    paddingHorizontal: 24,
  },
  alertSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: 18,
    borderLeftWidth: 5,
    borderLeftColor: "#EF4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#DC2626",
    fontSize: isSmallDevice ? 16 : 17,
    flex: 1,
  },
  alertDesc: {
    color: "#7F1D1D",
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 22,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionLinkContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  sectionLink: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  featuredImg: {
    width: "100%",
    height: isSmallDevice ? 180 : isMediumDevice ? 200 : 220,
  },
  featuredOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  featuredContent: {
    padding: isSmallDevice ? 20 : 24,
  },
  featuredTag: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
  },
  featuredTime: {
    color: "#E5E7EB",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "500",
  },
  connectRow: {
    flexDirection: "row",
    gap: isSmallDevice ? 16 : 20,
  },
  connectBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    alignItems: "center",
    padding: isSmallDevice ? 20 : 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  connectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  connectIcon: {
    fontSize: isSmallDevice ? 28 : 32,
  },
  connectTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  connectDesc: {
    color: "#64748B",
    textAlign: "center",
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
  },
  eventTabsContainer: {
    marginBottom: 20,
    // backgroundColor: "#F8FAFC",
    borderRadius: 20,
    minWidth: "100%",
    // paddingRight: 10,
  },
  eventTabsScrollContent: {
    // paddingRight: 10,
    gap: 10,
    justifyContent: "space-between",
  },
  eventTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 18 : 20,
    marginHorizontal: 2,
    minWidth: isSmallDevice ? 120 : 140,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTabActive: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 18 : 20,
    marginHorizontal: 2,
    minWidth: isSmallDevice ? 120 : 140,
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
  },
  eventTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 17,
    fontWeight: "500",
  },
});

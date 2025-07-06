import React, { useState, useCallback } from "react";
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
import AppointmentCard from "../../components/common/AppointmentCard";
import { getPublishedSurveys } from "../../services/api/SurveyService";
import { getAppointmentHistory } from "../../services/api/AppointmentService";
import { Alert } from "../../components";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
// const isLargeDevice = width >= 414;

const PAGE_SIZE = 2; // Page size for lazy loading

export default function StudentHome({
  user,
  navigation,
  setShowToast,
  setToastMessage,
  setToastType,
}) {
  const scrollViewRef = React.useRef(null);
  const [allData, setAllData] = useState([]); // Store all data
  const [displayedData, setDisplayedData] = useState([]); // Store currently displayed data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("survey");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isEnableSurvey = user?.isEnableSurvey;

  // Function to load more data
  const loadMoreData = useCallback(() => {
    if (!hasMoreData || loadingMore) return;

    setLoadingMore(true);

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const newData = allData.slice(startIndex, endIndex);

    if (newData.length > 0) {
      setDisplayedData((prev) => [...prev, ...newData]);
      setCurrentPage((prev) => prev + 1);
      setHasMoreData(endIndex < allData.length);
    } else {
      setHasMoreData(false);
    }

    setLoadingMore(false);
  }, [allData, currentPage, hasMoreData, loadingMore]);

  // Function to reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setHasMoreData(true);
    setDisplayedData([]);
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await getPublishedSurveys();
      const surveyData = Array.isArray(response)
        ? response
        : response.data || [];
      setAllData(surveyData);

      // Load first page
      const firstPageData = surveyData.slice(0, PAGE_SIZE);
      setDisplayedData(firstPageData);
      setCurrentPage(2); // Next page will be 2
      setHasMoreData(surveyData.length > PAGE_SIZE);
    } catch (error) {
      console.error("Lỗi khi tải surveys:", error);
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );

      setAllData(publishedSurveys);
      const firstPageData = publishedSurveys.slice(0, PAGE_SIZE);
      setDisplayedData(firstPageData);
      setCurrentPage(2);
      setHasMoreData(publishedSurveys.length > PAGE_SIZE);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getAppointmentHistory();
      const appointmentData = Array.isArray(response)
        ? response
        : response.data || [];

      // Sort appointments by date (newest first)
      const sortedAppointments = appointmentData.sort(
        (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
      );

      setAllData(sortedAppointments);
      // console.log("sortedAppointments", sortedAppointments);
      // Load first page
      const firstPageData = sortedAppointments.slice(0, PAGE_SIZE);
      setDisplayedData(firstPageData);
      setCurrentPage(2); // Next page will be 2
      setHasMoreData(sortedAppointments.length > PAGE_SIZE);
    } catch (error) {
      console.error("Lỗi khi tải appointments:", error);
      setAllData([]);
      setDisplayedData([]);
      setCurrentPage(1);
      setHasMoreData(false);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      setAllData([]);
      setDisplayedData([]);
      setHasMoreData(false);
    } catch (error) {
      console.error("Lỗi khi tải programs:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const onRefresh = async (type = activeTab) => {
    setRefreshing(true);
    await loadTabData(type);
  };

  // Function to handle tab change with immediate scroll
  const handleTabChange = async (type) => {
    // Immediately scroll to bottom for better UX
    scrollViewRef.current?.scrollToEnd({ animated: true });

    // Update state and fetch data
    await loadTabData(type);
  };

  // Centralized function to load tab data
  const loadTabData = async (type) => {
    setActiveTab(type);
    setLoading(true);
    resetPagination();

    try {
      switch (type) {
        case "survey":
          if (isEnableSurvey) {
            await fetchSurveys();
          }
          break;
        case "appointment":
          await fetchAppointments();
          break;
        case "program":
          await fetchPrograms();
          break;
        default:
          if (isEnableSurvey) {
            await fetchSurveys();
          }
          break;
      }
    } catch (error) {
      console.error(`Error loading ${type} data:`, error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const initialTab = isEnableSurvey ? "survey" : "appointment";
      loadTabData(initialTab);
    }, [navigation, isEnableSurvey])
  );

  const handleAppointmentPress = (appointment) => {
    // Pass only the appointment ID to avoid circular reference issues
    navigation.navigate("Appointment", {
      screen: "AppointmentDetails",
      params: { appointment: appointment },
    });
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
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
            bounces={false}
          >
            {isEnableSurvey && (
              <TouchableOpacity
                style={
                  activeTab === "survey"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => handleTabChange("survey")}
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
              onPress={() => handleTabChange("appointment")}
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
              onPress={() => handleTabChange("program")}
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
        <View style={styles.requiredEventContainer}>
          {loading ? (
            <Loading
              text={
                activeTab === "survey"
                  ? "Đang tải khảo sát..."
                  : activeTab === "appointment"
                  ? "Đang tải lịch hẹn..."
                  : "Đang tải chương trình..."
              }
            />
          ) : displayedData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                {activeTab === "survey"
                  ? "📋"
                  : activeTab === "appointment"
                  ? "📅"
                  : "🎯"}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === "survey"
                  ? "Không có khảo sát nào"
                  : activeTab === "appointment"
                  ? "Chưa có lịch hẹn nào"
                  : "Không có chương trình nào"}
              </Text>
            </View>
          ) : isEnableSurvey && activeTab === "survey" ? (
            <>
              {displayedData.map((data, index) => (
                <SurveyCard
                  survey={data}
                  key={index}
                  navigation={navigation}
                  onRefresh={onRefresh}
                  setShowToast={setShowToast}
                  setToastMessage={setToastMessage}
                  setToastType={setToastType}
                />
              ))}
              {hasMoreData && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreData}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loading text="Loading more..." />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : activeTab === "appointment" ? (
            <>
              {displayedData.map((appointment, index) => (
                <AppointmentCard
                  appointment={appointment}
                  key={appointment.id || index}
                  onPress={() => handleAppointmentPress(appointment)}
                />
              ))}
              {hasMoreData && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreData}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <Loading text="Loading more..." />
                  ) : (
                    <Text style={styles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 25,
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
  requiredEventContainer: {
    minHeight: 450,
    paddingBottom: 25,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 100,
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
  loadMoreButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  loadMoreText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
});

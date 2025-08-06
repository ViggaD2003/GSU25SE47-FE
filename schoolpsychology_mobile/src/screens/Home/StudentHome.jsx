import React, { useState, useCallback, useMemo } from "react";
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
import Loading from "../../components/common/Loading";
import {
  getActiveAppointments,
  getAppointmentHistory,
} from "../../services/api/AppointmentService";
import { Alert } from "../../components";
import { Entypo } from "@expo/vector-icons";
import useNotifications from "@/hooks/useNotifications";

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
  const [allData, setAllData] = useState([]); // Store all data
  const [displayedData, setDisplayedData] = useState([]); // Store currently displayed data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const isEnableSurvey = user?.isEnableSurvey;

  const { refreshAllNotifications } = useNotifications();

  const actionItems = useMemo(
    () => [
      {
        title: "Booking",
        key: "booking",
        icon: "calendar",
        onPress: () => {
          console.log("StudentHome: Navigating to Appointment");
          navigation.navigate("Appointment");
        },
      },
      {
        title: "Doc & Blog",
        key: "doc-blog",
        icon: "book",
        onPress: () => {
          console.log("StudentHome: Navigating to Blog");
          navigation.navigate("Blog");
        },
      },
      {
        title: "History",
        key: "history",
        icon: "back-in-time",
        onPress: () => {
          console.log("StudentHome: Navigating to Record");
          navigation.navigate("Record");
        },
      },
    ],
    [navigation]
  );

  // Function to load more data
  const loadMoreData = useCallback(() => {
    if (!hasMoreData || loadingMore) return;

    setLoadingMore(true);

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const newData = allData.slice(startIndex, endIndex);
    console.log("newData", newData);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await refreshAllNotifications();
  };

  // Centralized function to load tab data
  const loadData = async () => {
    setLoading(true);
    // Reset pagination at the start of loading new tab data
    setCurrentPage(1);
    setHasMoreData(true);
    setDisplayedData([]);

    try {
      console.log("loadData");
    } catch (error) {
      console.error(`Error loading data:`, error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [navigation, isEnableSurvey])
  );

  return (
    <ScrollView
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
      {/* <Alert
        type="error"
        title="Cảnh báo mức độ căng thẳng cao"
        description="Dựa trên các đánh giá gần đây, chúng tôi khuyến nghị bạn nên thực hiện các biện pháp để quản lý mức độ căng thẳng."
        showCloseButton={false}
      /> */}

      {/* Featured Programs */}
      <View style={styles.sectionContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Programs</Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllContainer}
            onPress={() => {
              console.log("StudentHome: Navigating to Program");
              navigation.navigate("Program");
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
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
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.connectBox}
              onPress={item.onPress}
            >
              <Entypo name={item.icon} size={24} color="#438455FF" />
              <Text style={styles.connectTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Plan for today */}
      <View style={styles.sectionContainer}>
        <View style={styles.headerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Plan for today</Text>
            <View style={styles.planCountContainer}>
              <Text style={styles.planCountText}>
                {displayedData.length}{" "}
                {displayedData.length === 1 || displayedData.length === 0
                  ? "plan"
                  : "plans"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewAllContainer}
            onPress={() => {
              console.log(
                "StudentHome: Navigating to Record from Plan section"
              );
              navigation.navigate("Record");
            }}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {displayedData.length > 0 ? (
          <>
            <ScrollView
              style={styles.planContainer}
              showsVerticalScrollIndicator={true}
            >
              {displayedData.map((item) => (
                <View style={styles.planItem}>
                  <Text style={styles.planTitle}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No plan for today</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 13,
    paddingHorizontal: 24,
    flex: 1,
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
    marginBottom: 30,
    gap: 10,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 10,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 16 : isMediumDevice ? 18 : 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  planCountContainer: {},
  planCountText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#5D5D5D",
  },
  viewAllContainer: {
    borderRadius: 10,
    padding: 10,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#438455FF",
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    gap: 10,
  },
  emptyContainer: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 30,
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

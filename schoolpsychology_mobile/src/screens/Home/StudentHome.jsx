import React, { useState, useCallback, useMemo, useEffect } from "react";
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
import { Loading } from "../../components";
import { Alert } from "../../components";
import { Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNotifications } from "../../utils/hooks";
import EventService from "../../services/api/EventService";
import { fetchAllRecommendedPrograms } from "../../services/api/ProgramService";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
// const isLargeDevice = width >= 414;

const PAGE_SIZE = 2; // Page size for lazy loading

export default function StudentHome({ user, navigation }) {
  const { t } = useTranslation();
  const [todayPlans, setTodayPlans] = useState([]); // Store all data
  const [recommandedPrograms, setRecommandedPrograms] = useState([]);
  const [displayedData, setDisplayedData] = useState([]); // Store currently displayed data
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isEnableSurvey = user?.isEnableSurvey;

  const { fetchNotifications } = useNotifications();

  const actionItems = useMemo(
    () => [
      {
        title: t("home.actions.booking"),
        key: "booking",
        icon: "users",
        onPress: () => {
          navigation.navigate("Appointment");
        },
      },
      {
        title: t("home.actions.event"),
        key: "event",
        icon: "calendar",
        onPress: () => {
          navigation.navigate("Event");
        },
      },
      {
        title: t("home.actions.blog"),
        key: "doc-blog",
        icon: "book",
        onPress: () => {
          navigation.navigate("Blog");
        },
      },
      {
        title: t("home.actions.history"),
        key: "history",
        icon: "back-in-time",
        onPress: () => {
          navigation.navigate("Record");
        },
      },
    ],
    [navigation, t]
  );

  const fetchRecommandedPrograms = async () => {
    try {
      const response = await fetchAllRecommendedPrograms(user.id);
      setRecommandedPrograms(response);
    } catch (error) {
      console.error(`Error loading recommended programs:`, error);
      setRecommandedPrograms([]);
    }
  };

  const getTodayPlans = async () => {
    try {
      if (!user?.id) {
        console.warn("User ID not available");
        setTodayPlans([]);
        setDisplayedData([]);
        return;
      }

      const today = dayjs().format("YYYY-MM-DD");
      const params = {
        startDate: today,
        endDate: today,
      };
      const response = await EventService.getEvents(user.id, params);
      setTodayPlans(response || []);
      // Update displayed data with pagination
      const initialData = (response || []).slice(0, PAGE_SIZE);
      setDisplayedData(initialData);
    } catch (error) {
      console.error(`Error loading today's plans:`, error);
      setTodayPlans([]);
      setDisplayedData([]);
    }
  };

  const loadMorePlans = () => {
    const nextPage = currentPage + 1;
    const startIndex = (nextPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const newData = todayPlans.slice(startIndex, endIndex);

    if (newData.length > 0) {
      setDisplayedData((prev) => [...prev, ...newData]);
      setCurrentPage(nextPage);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await fetchNotifications();
  };

  // Centralized function to load tab data
  const loadData = async () => {
    setLoading(true);
    // Reset pagination at the start of loading new tab data
    setCurrentPage(1);
    setDisplayedData([]);

    try {
      await Promise.all([getTodayPlans(), fetchRecommandedPrograms()]);
    } catch (error) {
      console.error(`Error loading data:`, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      fetchNotifications();
    }, [])
  );

  const getEventIcon = (eventSource) => {
    switch (eventSource?.toLowerCase()) {
      case "appointment":
        return "calendar";
      case "survey":
        return "clipboard";
      case "program":
        return "school";
      default:
        return "event";
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType?.toLowerCase()) {
      case "appointment":
        return "#3B82F6";
      case "survey":
        return "#10B981";
      case "program":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const formatTime = (dateString, timeString) => {
    if (!timeString || !dateString) return "";

    try {
      // Parse timeString to determine if it's hours or minutes
      const timeValue = parseFloat(timeString);
      if (isNaN(timeValue)) return timeString;

      // If timeString is <= 24, treat as hours (e.g., 1, 1.5, 2, 24)
      // If timeString is > 24, treat as minutes (e.g., 30, 60, 90)
      const unit = timeValue <= 24 ? "hours" : "minutes";

      const dateTime = dayjs(dateString).add(timeValue, unit).format("HH:mm");

      return dateTime;
    } catch (error) {
      return timeString;
    }
  };

  const handlePlanItemPress = (item) => {
    if (item.source === "SURVEY") {
      navigation.navigate("Survey", {
        screen: "SurveyInfo",
        params: {
          surveyId: item.relatedId,
        },
      });
    } else if (item.source === "PROGRAM") {
      navigation.navigate("Program", {
        screen: "ProgramDetail",
        params: {
          programId: item.relatedId,
        },
      });
    } else {
      navigation.navigate("Appointment", {
        screen: "AppointmentDetails",
        params: {
          appointment: {
            id: item.relatedId,
          },
        },
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  console.log("user", user);

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
          title={t("home.alerts.surveyDisabled.title")}
          description={t("home.alerts.surveyDisabled.description.student")}
          showCloseButton={false}
        />
      )}

      {user?.caseId && (
        <Alert
          type="info"
          title={t("home.alerts.caseCreated.title")}
          description={t("home.alerts.caseCreated.description")}
          showCloseButton={false}
        />
      )}

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("home.quickActions")}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.connectRow}
        >
          {actionItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.connectBox}
              onPress={item.onPress}
            >
              <View style={styles.iconContainer}>
                <Entypo name={item.icon} size={24} color="#438455FF" />
              </View>
              <Text style={styles.connectTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recommended Programs */}
      {user?.role === "STUDENT" && !user?.caseId && (
        <View style={styles.sectionContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t("home.recommendedPrograms.title")}
              </Text>
              <View style={styles.programCountContainer}>
                <Text style={styles.programCountText}>
                  {t("home.recommendedPrograms.available", {
                    count: recommandedPrograms.length,
                  })}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllContainer}
              onPress={() => {
                navigation.navigate("Program");
              }}
            >
              <Text style={styles.viewAllText}>
                {t("home.recommendedPrograms.viewAll")}
              </Text>
            </TouchableOpacity>
          </View>

          {recommandedPrograms.length > 0 ? (
            <>
              {/* Featured Program Banner */}
              <View style={styles.featuredProgramBanner}>
                <View style={styles.bannerContent}>
                  {/* Header with badge and icon */}
                  <View style={styles.bannerHeader}>
                    <View style={styles.bannerIconContainer}>
                      <MaterialIcons name="star" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.bannerBadge}>
                      <Text style={styles.bannerBadgeText}>
                        {t("home.recommendedPrograms.featured")}
                      </Text>
                    </View>
                  </View>

                  {/* Main content */}
                  <View style={styles.bannerMainContent}>
                    <Text style={styles.bannerTitle} numberOfLines={2}>
                      {recommandedPrograms[0]?.title ||
                        "Career Development Workshop"}
                    </Text>
                    <Text style={styles.bannerDescription} numberOfLines={3}>
                      {recommandedPrograms[0]?.description ||
                        t("home.recommendedPrograms.defaultDescription")}
                    </Text>
                  </View>

                  {/* Stats section */}
                  <View style={styles.bannerStatsContainer}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color="#6B7280"
                        />
                      </View>
                      <Text style={styles.statText}>
                        {t("home.recommendedPrograms.enrolled", {
                          count: recommandedPrograms[0]?.participants ?? 0,
                        })}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color="#6B7280"
                        />
                      </View>
                      <Text style={styles.statText}>
                        {dayjs(recommandedPrograms[0]?.startDate).format(
                          "DD/MM/YYYY"
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* CTA Button */}
                  <TouchableOpacity
                    style={styles.bannerButton}
                    onPress={() => {
                      navigation.navigate("Program", {
                        screen: "ProgramDetail",
                        params: {
                          programId: recommandedPrograms[0]?.id,
                        },
                      });
                    }}
                  >
                    <Text style={styles.bannerButtonText}>
                      {t("home.recommendedPrograms.learnMore")}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Program Cards */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.programScrollContainer}
              >
                {recommandedPrograms.slice(1, 4).map((program, index) => (
                  <TouchableOpacity
                    key={program.id || index}
                    style={styles.programCard}
                    onPress={() => {
                      navigation.navigate("Program", {
                        screen: "ProgramDetail",
                        params: {
                          programId: program.id,
                        },
                      });
                    }}
                  >
                    <View style={styles.programHeader}>
                      <View style={styles.programIconContainer}>
                        <MaterialIcons
                          name="school"
                          size={20}
                          color="#F59E0B"
                        />
                      </View>
                      <View style={styles.programStatus}>
                        <Text style={styles.programStatusText}>
                          {t("home.recommendedPrograms.active")}
                        </Text>
                      </View>
                    </View>

                    {/* Category Badge */}
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>
                        {program.category?.name ||
                          t("home.recommendedPrograms.professional")}
                      </Text>
                    </View>

                    <Text style={styles.programTitle} numberOfLines={2}>
                      {program.title ||
                        program.name ||
                        t("home.recommendedPrograms.untitled")}
                    </Text>
                    <Text style={styles.programDescription} numberOfLines={2}>
                      {program.description ||
                        t("home.recommendedPrograms.noDescription")}
                    </Text>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${(program.participants ?? 0) * 100}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {t("home.recommendedPrograms.participants")}
                      </Text>
                    </View>

                    <View style={styles.programFooter}>
                      <View style={styles.programDuration}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text style={styles.programDurationText}>
                          {program.duration ||
                            t("home.recommendedPrograms.flexible")}
                        </Text>
                      </View>
                      {/* <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => {
                        joinProgram(program.id);
                      }}
                    >
                      <Text style={styles.joinButtonText}>Join</Text>
                    </TouchableOpacity> */}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Quick Stats */}
              {/* <View style={styles.programStats}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialIcons name="trending-up" size={20} color="#10B981" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>85%</Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialIcons name="group" size={20} color="#3B82F6" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>150+</Text>
                  <Text style={styles.statLabel}>Students</Text>
                </View>
              </View>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <MaterialIcons name="schedule" size={20} color="#F59E0B" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>24/7</Text>
                  <Text style={styles.statLabel}>Support</Text>
                </View>
              </View>
            </View> */}
            </>
          ) : (
            <View style={styles.programEmptyContainer}>
              <View style={styles.programEmptyIconContainer}>
                <MaterialIcons name="school" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.programEmptyText}>
                {t("home.recommendedPrograms.empty.title")}
              </Text>
              <Text style={styles.programEmptySubText}>
                {t("home.recommendedPrograms.empty.description")}
              </Text>
              {/* <TouchableOpacity style={styles.programEmptyButton}>
              <Text style={styles.programEmptyButtonText}>
                {t("home.recommendedPrograms.browseAll")}
              </Text>
            </TouchableOpacity> */}
            </View>
          )}
        </View>
      )}

      {/* Plan for today */}
      <View style={[styles.sectionContainer]}>
        <View style={styles.headerContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("home.planToday.title")}</Text>
            <View style={styles.planCountContainer}>
              <Text style={styles.planCountText}>
                {todayPlans.length === 1 || todayPlans.length === 0
                  ? t("home.planToday.count_one", { count: todayPlans.length })
                  : t("home.planToday.count_other", {
                      count: todayPlans.length,
                    })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewAllContainer}
            onPress={() => {
              navigation.navigate("Event");
            }}
          >
            <Text style={styles.viewAllText}>
              {t("home.planToday.viewAll")}
            </Text>
          </TouchableOpacity>
        </View>
        {displayedData.length > 0 ? (
          <>
            <View style={styles.planContainer}>
              {displayedData.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  style={styles.planItem}
                  onPress={() => handlePlanItemPress(item)}
                >
                  <View style={styles.planItemHeader}>
                    <View style={styles.planIconContainer}>
                      <Ionicons
                        name={getEventIcon(item.source)}
                        size={20}
                        color={getEventColor(item.source)}
                      />
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={styles.planTitle} numberOfLines={2}>
                        {item.title}
                      </Text>
                      {item.description && (
                        <Text style={styles.planDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.planTimeContainer}>
                      {item.time && item.date && item.source !== "SURVEY" && (
                        <Text style={styles.planTime}>
                          {formatTime(item.date, item.time)}
                        </Text>
                      )}
                      <MaterialIcons
                        name="chevron-right"
                        size={20}
                        color="#9CA3AF"
                      />
                    </View>
                  </View>
                  {item.location && (
                    <View style={styles.planLocation}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#6B7280"
                      />
                      <Text style={styles.planLocationText}>
                        {item.location}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {displayedData.length < todayPlans.length && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMorePlans}
              >
                <Ionicons name="add-circle-outline" size={20} color="#374151" />
                <Text style={styles.loadMoreText}>
                  {t("home.planToday.loadMore")}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="event-busy" size={48} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyText}>
              {t("home.planToday.empty.title")}
            </Text>
            <Text style={styles.emptySubText}>
              {t("home.planToday.empty.description")}
            </Text>
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
  programCountContainer: {},
  programCountText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#10B981",
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
    padding: 12,
    gap: 5,
    width: 110,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  connectTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  // Program Styles
  programScrollContainer: {
    paddingRight: 24,
  },
  programCard: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  programHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  programIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  programStatus: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065F46",
  },
  programTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 22,
  },
  programDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  programFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  programDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  programDurationText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  joinButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Plan Styles
  planContainer: {
    gap: 12,
  },
  planItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
    lineHeight: 22,
  },
  planDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  planTimeContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  planTime: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  planLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  planLocationText: {
    fontSize: 13,
    color: "#6B7280",
  },
  emptyContainer: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
    flexDirection: "row",
    gap: 8,
  },
  loadMoreText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  // New styles for Recommended Programs section
  featuredProgramBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  bannerContent: {
    flex: 1,
  },
  bannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  bannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  bannerBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerMainContent: {
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  bannerDescription: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    fontWeight: "400",
  },
  bannerStatsContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  statText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
  bannerButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  categoryBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E40AF",
  },
  progressContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
    marginTop: 4,
  },
  programStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statCard: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statContent: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Program Empty State Styles
  programEmptyContainer: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 40,
    marginTop: 10,
  },
  programEmptyIconContainer: {
    marginBottom: 16,
  },
  programEmptyText: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  programEmptySubText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  programEmptyButton: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  programEmptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

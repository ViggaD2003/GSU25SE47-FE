import React, { useState, useEffect, useCallback } from "react";
import { Container, ChildSelector, DateRangeSelector } from "@/components";
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";
import { useChildren } from "@/contexts";
import DashboardOverview from "../../components/dashboard/DashboardOverview";

// Try to import MentalHealthSection with error handling
let MentalHealthSection;
try {
  MentalHealthSection =
    require("../../components/dashboard/MentalHealthSection").default;
  console.log(
    "MentalHealthSection imported successfully:",
    MentalHealthSection
  );
} catch (error) {
  console.error("Error importing MentalHealthSection:", error);
  MentalHealthSection = null;
}

import StudentDashboardService from "@/services/api/StudentDashboardService";
import { useAuth } from "@/contexts";

const DashboardScreen = () => {
  const { t } = useTranslation();
  const { selectedChild } = useChildren();
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [error, setError] = useState(null);

  // Initialize date range
  useEffect(() => {
    // console.log("Dashboard: Initializing date range...");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // console.log("Dashboard: Date initialization complete:", {
    //   startDateStr,
    //   endDateStr,
    //   startDateISO: startDate.toISOString(),
    //   endDateISO: endDate.toISOString(),
    // });

    setCustomStartDate(startDateStr);
    setCustomEndDate(endDateStr);
  }, []);

  // Monitor date state changes
  useEffect(() => {
    // console.log("Dashboard: Date state updated:", {
    //   customStartDate,
    //   customEndDate,
    //   hasUser: !!user,
    //   hasSelectedChild: !!selectedChild,
    //   studentId: getStudentId(),
    // });
  }, [customStartDate, customEndDate, user, selectedChild]);

  // Get the student ID based on user role
  const getStudentId = () => {
    if (!user) return null;
    if (user.role === "PARENTS" && selectedChild) return selectedChild.id;
    if (user.role === "STUDENT") return user.userId || user.id;
    return null;
  };

  // Check if component is ready to fetch data
  const isReadyToFetch = useCallback(() => {
    const ready = user && customStartDate && customEndDate && getStudentId();
    if (ready) {
      // console.log("Dashboard component ready to fetch data:", {
      //   hasUser: !!user,
      //   hasStartDate: !!customStartDate,
      //   hasEndDate: !!customEndDate,
      //   studentId: getStudentId(),
      //   userRole: user?.role,
      // });
    }
    return ready;
  }, [user, customStartDate, customEndDate, selectedChild]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isReadyToFetch()) {
      // console.log("Component not ready to fetch data:", {
      //   hasUser: !!user,
      //   hasStartDate: !!customStartDate,
      //   hasEndDate: !!customEndDate,
      //   studentId: getStudentId(),
      // });
      return;
    }

    const studentId = getStudentId();
    if (!studentId) {
      console.log("No student ID available, skipping dashboard data fetch");
      return;
    }

    // Check if dates are properly initialized
    if (!customStartDate || !customEndDate) {
      console.log("Dates not yet initialized, skipping dashboard data fetch");
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(customStartDate) || !dateRegex.test(customEndDate)) {
      console.log("Invalid date format, skipping dashboard data fetch");
      setError("Invalid date format. Please try refreshing the page.");
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log("Fetching dashboard data for student:", studentId);
      console.log("Date range:", { from: customStartDate, to: customEndDate });

      const data = await StudentDashboardService.getStudentDashboard({
        from: customStartDate,
        to: customEndDate,
        studentId: studentId,
      });

      console.log("Dashboard data received:", data);
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
      setError(error.message || "Failed to load dashboard data");
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  }, [
    user,
    user?.role,
    user?.userId,
    selectedChild?.id,
    customStartDate,
    customEndDate,
    isReadyToFetch,
  ]);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    if (isReadyToFetch()) {
      fetchDashboardData();
    }
  }, [isReadyToFetch, fetchDashboardData]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    setError(null);
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle date range change
  const handleRangeChange = (range) => {
    setSelectedRange(range);
  };

  // Handle custom date change
  const handleCustomDateChange = (startDate, endDate) => {
    // console.log("Dashboard: Date range changed:", { startDate, endDate });
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  // Auto-fetch data when dates change
  useEffect(() => {
    if (
      customStartDate &&
      customEndDate &&
      user &&
      getStudentId() &&
      !loading
    ) {
      // console.log("Dashboard: Dates changed, auto-fetching data");
      fetchDashboardData();
    }
  }, [customStartDate, customEndDate]);

  // Show initialization loading state
  if (!customStartDate || !customEndDate) {
    return (
      <Container>
        <HeaderWithTab
          title={t("tabs.dashboard")}
          subtitle={t("dashboard.mobileSubtitle")}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {t("common.initializing") || "Initializing..."}
          </Text>
        </View>
      </Container>
    );
  }

  // Show no child selected state for parents
  if (user.role === "PARENTS" && !selectedChild) {
    return (
      <Container>
        <HeaderWithTab
          title={t("tabs.dashboard")}
          subtitle={t("dashboard.mobileSubtitle")}
        />
        <View style={styles.noChildContainer}>
          <Text style={styles.noChildTitle}>
            {t("dashboard.noChild.title")}
          </Text>
          <Text style={styles.noChildSubtitle}>
            {t("dashboard.noChild.subtitle")}
          </Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <HeaderWithTab
        title={t("tabs.dashboard")}
        subtitle={t("dashboard.mobileSubtitle")}
      />

      <View style={styles.childSelectorContainer}>
        {/* <ChildSelector /> */}
        {user.role === "PARENTS" && <ChildSelector />}

        {/* Date Range Selector */}
        <View style={styles.dateRangeContainer}>
          <DateRangeSelector
            selectedRange={selectedRange}
            onRangeChange={handleRangeChange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomDateChange={handleCustomDateChange}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : (
        <>
          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {/* Dashboard Overview */}
            {dashboardData?.overview && (
              <DashboardOverview overview={dashboardData.overview} />
            )}

            {/* Mental Health Statistics */}
            {dashboardData?.mentalStatistic &&
              Object.keys(dashboardData.mentalStatistic).length > 0 &&
              getStudentId() && (
                <MentalHealthSection
                  t={t}
                  mentalStatistic={dashboardData.mentalStatistic}
                  key={`mental-health-${getStudentId()}`}
                />
              )}

            {/* Empty State */}
            {!dashboardData && !error && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  {t("dashboard.empty.title")}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t("dashboard.empty.subtitle")}
                </Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                  {t("dashboard.error.title") || "Error Loading Dashboard"}
                </Text>
                <Text style={styles.errorSubtitle}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>
                    {t("common.retry") || "Retry"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  childSelectorContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  dateRangeContainer: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  noChildContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 40,
  },
  noChildTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  noChildSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  errorContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  debugContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 4,
  },
});

export default DashboardScreen;

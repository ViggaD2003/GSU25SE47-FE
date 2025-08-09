import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { Container } from "../../components";
import { WeekCalendar, EventCard } from "../../components/common";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import EventService from "@/services/api/EventService";
import { useAuth } from "@/contexts";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const EventScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Remove incorrect initial fetch that passed an invalid params shape

  // Filter events by selected date
  const filteredEvents = useMemo(() => {
    const selectedDateStr = dayjs(selectedDate).format("YYYY-MM-DD");
    return events.filter((event) => event.date === selectedDateStr);
  }, [events, selectedDate]);

  // Get week date range
  const getWeekDateRange = useCallback((weekIndex) => {
    const today = new Date();
    const startOfWeek = new Date(today);

    // Calculate start of current week (Monday) in local time
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Add weeks based on weekIndex
    startOfWeek.setDate(startOfWeek.getDate() + weekIndex * 7);

    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      startDate: dayjs(startOfWeek).format("YYYY-MM-DD"),
      endDate: dayjs(endOfWeek).format("YYYY-MM-DD"),
      startOfWeek,
      endOfWeek,
    };
  }, []);

  // Load events data for specific week
  const loadEventsForWeek = useCallback(
    async (weekIndex) => {
      setLoading(true);
      try {
        if (!user?.id) {
          setEvents([]);
          return;
        }

        // Get date range for the week
        const { startDate, endDate } = getWeekDateRange(weekIndex);

        const effectiveStartDate =
          weekIndex === 0 ? dayjs().format("YYYY-MM-DD") : startDate;

        console.log(
          `Loading events for week ${weekIndex}: ${effectiveStartDate} to ${endDate}`
        );

        const data = await EventService.getEvents(user.id, {
          startDate: effectiveStartDate,
          endDate,
        });

        setEvents(data || []);
      } catch (error) {
        console.error("Error loading events for week:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    },
    [getWeekDateRange, user?.id]
  );

  // Load events data (for backward compatibility)
  const loadEvents = useCallback(async () => {
    await loadEventsForWeek(currentWeekIndex);
  }, [loadEventsForWeek, currentWeekIndex]);

  // Handle date selection
  const handleDateSelect = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateCheck = new Date(date);
    selectedDateCheck.setHours(0, 0, 0, 0);

    // Only allow selecting today or future dates
    if (selectedDateCheck >= today) {
      setSelectedDate(date);
    }
  }, []);

  // Handle week change
  const handleWeekChange = useCallback(
    async (newWeekIndex) => {
      setCurrentWeekIndex(newWeekIndex);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (newWeekIndex === 0) {
        // If returning to current week, select today
        setSelectedDate(today);
      } else {
        // For other weeks, select the first day of the week (Monday)
        const newWeekStart = new Date();
        const dayOfWeek = newWeekStart.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        newWeekStart.setDate(newWeekStart.getDate() - daysToSubtract);
        newWeekStart.setDate(newWeekStart.getDate() + newWeekIndex * 7);

        // Only select if it's not a past date
        const selectedDateCheck = new Date(newWeekStart);
        selectedDateCheck.setHours(0, 0, 0, 0);

        if (selectedDateCheck >= today) {
          setSelectedDate(newWeekStart);
        }
      }

      // Load events for the new week
      await loadEventsForWeek(newWeekIndex);
    },
    [loadEventsForWeek]
  );

  // Handle event press
  const handleEventPress = useCallback(
    (event) => {
      console.log("Event pressed:", event);

      // Navigate to appropriate screen based on source
      switch (event.source) {
        case "Appointment":
          navigation.navigate("Appointment", {
            screen: "AppointmentDetails",
            params: { appointmentId: event.relatedId },
          });
          break;
        case "Survey":
          navigation.navigate("Survey", {
            screen: "SurveyInfo",
            params: { surveyId: event.relatedId },
          });
          break;
        case "Program":
          navigation.navigate("Program", {
            screen: "ProgramDetails",
            params: { programId: event.relatedId },
          });
          break;
        default:
          console.log("Unknown event source:", event.source);
      }
    },
    [navigation]
  );

  // Handle quick actions press
  const handlePress = useCallback(
    (type) => {
      navigation.navigate("EventList", { type });
    },
    [navigation]
  );

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  // Load initial data
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <Container>
      <HeaderWithoutTab
        title={t("events.title")}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Week Calendar */}
        <WeekCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          events={events}
          onWeekChange={handleWeekChange}
          currentWeekIndex={currentWeekIndex}
        />

        {/* Selected Date Events */}
        <View style={styles.eventsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
            {filteredEvents.length > 0 && (
              <View style={styles.eventCount}>
                <Text style={styles.eventCountText}>
                  {t("events.count", { count: filteredEvents.length })}
                </Text>
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons name="hourglass-outline" size={32} color="#8E8E93" />
              <Text style={styles.loadingText}>{t("events.loading")}</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#8E8E93" />
              <Text style={styles.emptyText}>{t("events.noEvents")}</Text>
              <Text style={styles.emptySubtext}>
                {t("events.selectAnotherDate")}
              </Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.source + "_" + event.relatedId}
                  event={event}
                  onPress={handleEventPress}
                />
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>{t("events.schedule")}</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePress("APPOINTMENT")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E3F2FD" }]}>
                <Ionicons name="calendar" size={24} color="#007AFF" />
              </View>
              <Text style={styles.actionText}>{t("events.appointment")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePress("SURVEY")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
                <Ionicons name="clipboard" size={24} color="#FF9500" />
              </View>
              <Text style={styles.actionText}>{t("events.survey")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handlePress("PROGRAM")}
            >
              <View style={[styles.actionIcon, { backgroundColor: "#E8F5E8" }]}>
                <Ionicons name="school" size={24} color="#34C759" />
              </View>
              <Text style={styles.actionText}>{t("events.program")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  eventsContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  eventCount: {
    backgroundColor: `${GlobalStyles.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  eventCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: GlobalStyles.colors.primary,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#C7C7CC",
    marginTop: 4,
    textAlign: "center",
  },
  eventsList: {
    paddingHorizontal: 16,
  },
  quickActions: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginBottom: 8,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1C1C1E",
    textAlign: "center",
  },
});

export default EventScreen;

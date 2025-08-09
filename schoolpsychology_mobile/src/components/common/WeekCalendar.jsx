import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import dayjs from "dayjs";

const WeekCalendar = ({
  selectedDate,
  onDateSelect,
  events = [],
  onWeekChange,
  currentWeekIndex = 0,
}) => {
  // Generate week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const today = new Date();

    // Calculate start of current week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToSubtract);

    // Add weeks based on currentWeekIndex
    startOfWeek.setDate(startOfWeek.getDate() + currentWeekIndex * 7);

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, [currentWeekIndex]);

  // Check if date is in the past
  const isPastDate = useCallback((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateCheck = new Date(date);
      selectedDateCheck.setHours(0, 0, 0, 0);

      // Only allow selecting today or future dates
      if (selectedDateCheck >= today) {
        onDateSelect(date);
      }
    },
    [onDateSelect]
  );

  // Handle week navigation
  const handleWeekChange = useCallback(
    (direction) => {
      const newWeekIndex = currentWeekIndex + direction;
      if (newWeekIndex >= 0) {
        onWeekChange(newWeekIndex);
      }
    },
    [currentWeekIndex, onWeekChange]
  );

  // Get event count for a specific date
  const getEventCount = useCallback(
    (date) => {
      const dateStr = dayjs(date).format("YYYY-MM-DD");
      const isPast = isPastDate(date);

      if (isPast) return 0;

      return events.filter((event) => event.date === dateStr).length;
    },
    [events, isPastDate]
  );

  // Get day name in Vietnamese
  const getDayName = useCallback((date) => {
    const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    return dayNames[date.getDay()];
  }, []);

  // Get week range text
  const getWeekRangeText = useCallback(() => {
    if (currentWeekIndex === 0) {
      return "Tuần này";
    }

    const startDate = weekDates[0];
    const endDate = weekDates[6];

    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();

    if (startMonth === endMonth) {
      return `${startDate.getDate()} - ${endDate.getDate()} ${startDate.toLocaleDateString(
        "vi-VN",
        { month: "long" }
      )}`;
    } else {
      return `${startDate.getDate()} ${startDate.toLocaleDateString("vi-VN", {
        month: "short",
      })} - ${endDate.getDate()} ${endDate.toLocaleDateString("vi-VN", {
        month: "short",
      })}`;
    }
  }, [currentWeekIndex, weekDates]);

  return (
    <View style={styles.container}>
      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleWeekChange(-1)}
          disabled={currentWeekIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={currentWeekIndex === 0 ? "#C7C7CC" : "#007AFF"}
          />
        </TouchableOpacity>

        <Text style={styles.weekTitle}>{getWeekRangeText()}</Text>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => handleWeekChange(1)}
        >
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Week Calendar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContainer}
      >
        {weekDates.map((date, index) => {
          const isSelected =
            selectedDate.toDateString() === date.toDateString();
          const isPast = isPastDate(date);
          const eventCount = getEventCount(date);

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                isPast && styles.pastCard,
                isSelected && styles.selectedCard,
              ]}
              onPress={() => handleDateSelect(date)}
              disabled={isPast}
              activeOpacity={isPast ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  isPast && styles.pastText,
                  isSelected && styles.selectedText,
                ]}
              >
                {getDayName(date)}
              </Text>

              <Text
                style={[
                  styles.dateNumber,
                  isPast && styles.pastText,
                  isSelected && styles.selectedText,
                ]}
              >
                {date.getDate()}
              </Text>

              {!isPast && eventCount > 0 && (
                <View style={styles.eventIndicator}>
                  <Text style={styles.eventCount}>{eventCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    marginBottom: 8,
  },
  weekNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  calendarContainer: {
    paddingHorizontal: 16,
  },
  dateCard: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 64,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    marginTop: 5,
  },
  pastCard: {
    backgroundColor: "#F2F2F7",
    opacity: 0.5,
  },
  selectedCard: {
    backgroundColor: GlobalStyles.colors.primary,
    borderWidth: 2,
    borderColor: GlobalStyles.colors.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#8E8E93",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  pastText: {
    color: "#C7C7CC",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  eventIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  eventCount: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default WeekCalendar;

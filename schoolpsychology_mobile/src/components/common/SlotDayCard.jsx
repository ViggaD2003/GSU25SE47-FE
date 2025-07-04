import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Loading from "./Loading";
import { ActivityIndicator } from "react-native-paper";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const SlotDayCard = ({
  daySlots,
  selectedSlot,
  onSelectSlot,
  disabled = false,
}) => {
  const [visibleSlots, setVisibleSlots] = useState(6); // Show first 6 slots initially
  const [loadingMore, setLoadingMore] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getDateFromDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toDateString();
  };

  const generateTimeSlots = (slots) => {
    if (!slots || slots.length === 0) return [];

    // Sort slots by start time
    const sortedSlots = [...slots].sort(
      (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
    );

    const timeSlots = [];
    const date = getDateFromDateTime(sortedSlots[0].startDateTime);

    // Find the earliest and latest time for the day
    const earliestTime = new Date(sortedSlots[0].startDateTime);
    const latestTime = new Date(
      sortedSlots[sortedSlots.length - 1].endDateTime
    );

    // Generate 30-minute slots from earliest to latest
    let currentTime = new Date(earliestTime);
    currentTime.setMinutes(Math.floor(currentTime.getMinutes() / 30) * 30);
    currentTime.setSeconds(0);
    currentTime.setMilliseconds(0);

    while (currentTime < latestTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes

      // Check if this time slot overlaps with any available slot
      const overlappingSlot = sortedSlots.find((slot) => {
        const slotStartTime = new Date(slot.startDateTime);
        const slotEndTime = new Date(slot.endDateTime);

        return slotStart < slotEndTime && slotEnd > slotStartTime;
      });

      if (overlappingSlot) {
        timeSlots.push({
          id: `${date}_${slotStart.getTime()}`,
          startTime: slotStart,
          endTime: slotEnd,
          slot: overlappingSlot,
          isAvailable: true,
          isBooked: overlappingSlot.status === "BOOKED",
          exactStartTime: slotStart,
          exactEndTime: slotEnd,
        });
      } else {
        timeSlots.push({
          id: `${date}_${slotStart.getTime()}`,
          startTime: slotStart,
          endTime: slotEnd,
          slot: null,
          isAvailable: false,
          isBooked: false,
          exactStartTime: slotStart,
          exactEndTime: slotEnd,
        });
      }

      currentTime = slotEnd;
    }

    return timeSlots;
  };

  const timeSlots = generateTimeSlots(daySlots);
  const timeSlotsAvailable = timeSlots.filter((slot) => slot.isAvailable);

  const date =
    daySlots && daySlots.length > 0
      ? getDateFromDateTime(daySlots[0].startDateTime)
      : "";

  // Load more slots
  const loadMoreSlots = useCallback(async () => {
    if (loadingMore || visibleSlots >= timeSlotsAvailable.length) return;

    setLoadingMore(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    setVisibleSlots((prev) => Math.min(prev + 6, timeSlotsAvailable.length));
    setLoadingMore(false);
  }, [loadingMore, visibleSlots, timeSlotsAvailable.length]);

  const handleSlotPress = (timeSlot) => {
    if (timeSlot.isAvailable && !timeSlot.isBooked && !disabled) {
      // Create a modified slot object with the exact time of the selected card
      const selectedTimeSlot = {
        ...timeSlot.slot,
        startDateTime: timeSlot.exactStartTime.toISOString(),
        endDateTime: timeSlot.exactEndTime.toISOString(),
        selectedStartTime: timeSlot.exactStartTime,
        selectedEndTime: timeSlot.exactEndTime,
        timeSlotId: timeSlot.id,
      };

      onSelectSlot(selectedTimeSlot);
    }
  };

  const isSlotSelected = (timeSlot) => {
    return selectedSlot && selectedSlot.timeSlotId === timeSlot.id;
  };

  const displayedSlots = timeSlotsAvailable.slice(0, visibleSlots);
  const hasMoreSlots = visibleSlots < timeSlotsAvailable.length;

  return (
    <View style={styles.container}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
        <Text style={styles.dateText}>
          {daySlots && daySlots.length > 0
            ? formatDate(daySlots[0].startDateTime)
            : ""}
        </Text>
        <Text style={styles.slotCount}>
          ({timeSlotsAvailable.length} khả dụng)
        </Text>
      </View>

      {/* Time Slots */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timeSlotsContainer}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToRight = 20;

          if (
            layoutMeasurement.width + contentOffset.x >=
            contentSize.width - paddingToRight
          ) {
            loadMoreSlots();
          }
        }}
        scrollEventThrottle={400}
      >
        {displayedSlots.map((timeSlot, index) => (
          <TouchableOpacity
            key={timeSlot.id}
            style={[
              styles.timeSlot,
              timeSlot.isAvailable && styles.availableSlot,
              isSlotSelected(timeSlot) && styles.selectedSlot,
              !timeSlot.isAvailable && styles.unavailableSlot,
            ]}
            onPress={() => handleSlotPress(timeSlot)}
            disabled={!timeSlot.isAvailable || timeSlot.isBooked || disabled}
          >
            <Text
              style={[
                styles.timeSlotText,
                timeSlot.isAvailable &&
                  !timeSlot.isBooked &&
                  styles.availableText,
                timeSlot.isBooked && styles.bookedText,
                isSlotSelected(timeSlot) && styles.selectedText,
                !timeSlot.isAvailable && styles.unavailableText,
              ]}
            >
              {formatTime(timeSlot.startTime)}
            </Text>
            <Text
              style={[
                styles.timeSlotText,
                timeSlot.isAvailable &&
                  !timeSlot.isBooked &&
                  styles.availableText,
                timeSlot.isBooked && styles.bookedText,
                isSlotSelected(timeSlot) && styles.selectedText,
                !timeSlot.isAvailable && styles.unavailableText,
              ]}
            >
              {formatTime(timeSlot.endTime)}
            </Text>

            {timeSlot.isBooked && (
              <View style={styles.bookedIndicator}>
                <Ionicons name="close-circle" size={12} color="#EF4444" />
              </View>
            )}

            {isSlotSelected(timeSlot) && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Load More Indicator */}
        {hasMoreSlots && (
          <TouchableOpacity
            style={styles.loadMoreSlot}
            onPress={loadMoreSlots}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Legend */}
      {/* <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.availableDot]} />
          <Text style={styles.legendText}>Khả dụng</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.bookedDot]} />
          <Text style={styles.legendText}>Đã đặt</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.unavailableDot]} />
          <Text style={styles.legendText}>Không khả dụng</Text>
        </View>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 4,
    flex: 1,
  },
  slotCount: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  timeSlotsContainer: {
    paddingBottom: 8,
  },
  timeSlot: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 80,
    borderWidth: 1,
    position: "relative",
  },
  availableSlot: {
    backgroundColor: "#F0F9FF",
    borderColor: "#3B82F6",
  },
  bookedSlot: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  selectedSlot: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  unavailableSlot: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  loadMoreSlot: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: "500",
  },
  availableText: {
    color: "#1E40AF",
  },
  bookedText: {
    color: "#DC2626",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  unavailableText: {
    color: "#9CA3AF",
  },
  bookedIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  selectedIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  availableDot: {
    backgroundColor: "#3B82F6",
  },
  bookedDot: {
    backgroundColor: "#EF4444",
  },
  unavailableDot: {
    backgroundColor: "#9CA3AF",
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default SlotDayCard;

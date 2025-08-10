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
import {
  formatDate,
  formatTime,
  generateTimeSlots,
} from "../../utils/slotUtils";
import { log } from "console";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const SlotDayCard = ({
  daySlots,
  selectedSlot,
  onSelectSlot,
  disabled = false,
  t,
}) => {
  const [visibleSlots, setVisibleSlots] = useState(6); // Show first 6 slots initially
  const [loadingMore, setLoadingMore] = useState(false);

  // Generate time slots using utility function
  const timeSlots = generateTimeSlots(daySlots);

  // Filter only available and non-booked slots
  const timeSlotsAvailable = timeSlots.filter(
    (slot) => slot.isAvailable && !slot.isBooked
  );

  // Nếu không còn slot khả dụng thì không render gì cả
  if (timeSlotsAvailable.length === 0) return null;

  // Load more slots
  const loadMoreSlots = useCallback(async () => {
    if (loadingMore || visibleSlots >= timeSlotsAvailable.length) return;

    setLoadingMore(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    setVisibleSlots((prev) => Math.min(prev + 6, timeSlotsAvailable.length));
    setLoadingMore(false);
  }, [loadingMore, visibleSlots, timeSlotsAvailable.length]);

  /**
   * Handle slot selection
   * Only allow selection of available and non-booked slots
   */
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
          ({timeSlotsAvailable.length}{" "}
          {t("appointment.booking.slots.available")})
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

import dayjs from "dayjs";

/**
 * Utility functions for slot management
 * Tập trung tất cả logic xử lý slots để tránh trùng lặp code
 */

/**
 * Format date to Vietnamese locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Format time to Vietnamese locale (HH:mm format)
 * @param {string} dateTimeString - ISO datetime string
 * @returns {string} Formatted time string
 */
export const formatTime = (dateTimeString) => {
  if (!dateTimeString) return "";
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

/**
 * Get date string from datetime (for grouping)
 * @param {string} dateTimeString - ISO datetime string
 * @returns {string} Date string
 */
export const getDateFromDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toDateString();
};

/**
 * Check if a time slot overlaps with booked slots
 * Hàm kiểm tra xem một khung giờ có bị đặt trước hay không
 *
 * Logic:
 * - So sánh thời gian bắt đầu và kết thúc của slot hiện tại
 * - Với thời gian bắt đầu và kết thúc của các slot đã đặt
 * - Nếu có overlap thì slot đó đã được đặt
 *
 * @param {Object} timeSlot - Time slot object with startTime and endTime
 * @param {Array} bookedSlots - Array of booked slot objects from API
 * @returns {boolean} True if slot is booked
 */
export const isSlotBooked = (timeSlot, bookedSlots) => {
  if (!bookedSlots || bookedSlots.length === 0) return false;

  return bookedSlots.some((bookedSlot) => {
    const bookedStart = new Date(bookedSlot.startDateTime);
    const bookedEnd = new Date(bookedSlot.endDateTime);
    const slotStart = new Date(timeSlot.startTime);
    const slotEnd = new Date(timeSlot.endTime);

    // Check if there's any overlap between time ranges
    return slotStart < bookedEnd && slotEnd > bookedStart;
  });
};

/**
 * Generate time slots for a specific day with 30-minute intervals
 * @param {Array} daySlots - Array of slot objects for a day
 * @returns {Array} Array of time slot objects
 */
export const generateTimeSlots = (daySlots) => {
  if (!daySlots || daySlots.length === 0) return [];

  // Sort slots by start time
  const sortedSlots = [...daySlots].sort(
    (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
  );

  const timeSlots = [];
  const date = getDateFromDateTime(sortedSlots[0].startDateTime);

  // Find the earliest and latest time for the day
  const earliestTime = new Date(sortedSlots[0].startDateTime);
  const latestTime = new Date(sortedSlots[sortedSlots.length - 1].endDateTime);

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
      // Check if this specific time slot is booked
      const isBooked = isSlotBooked(
        { startTime: slotStart, endTime: slotEnd },
        overlappingSlot.booked || []
      );

      timeSlots.push({
        id: `${date}_${slotStart.getTime()}`,
        startTime: slotStart,
        endTime: slotEnd,
        slot: overlappingSlot,
        isAvailable: true,
        isBooked: isBooked,
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

/**
 * Group slots by date
 * @param {Array} slotsData - Array of slot objects
 * @returns {Object} Object with dates as keys and slot arrays as values
 */
export const groupSlotsByDate = (slotsData) => {
  const grouped = {};

  slotsData.forEach((slot) => {
    const date = getDateFromDateTime(slot.startDateTime);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(slot);
  });

  // Sort dates chronologically
  const sortedGrouped = {};
  Object.keys(grouped)
    .sort((a, b) => new Date(a) - new Date(b))
    .forEach((date) => {
      sortedGrouped[date] = grouped[date];
    });

  return sortedGrouped;
};

/**
 * Get available days (days with at least one available slot)
 * @param {Object} groupedSlots - Grouped slots object
 * @returns {Array} Array of available date strings
 */
export const getAvailableDays = (groupedSlots) => {
  return Object.keys(groupedSlots).filter((date) => {
    const daySlots = groupedSlots[date];
    const timeSlots = generateTimeSlots(daySlots);
    const availableSlots = timeSlots.filter(
      (slot) => slot.isAvailable && !slot.isBooked
    );
    return availableSlots.length > 0;
  });
};

/**
 * Count total available slots across all days
 * @param {Object} groupedSlots - Grouped slots object
 * @returns {number} Total count of available slots
 */
export const countTotalAvailableSlots = (groupedSlots) => {
  return Object.values(groupedSlots).reduce((total, daySlots) => {
    const timeSlots = generateTimeSlots(daySlots);
    const availableSlots = timeSlots.filter(
      (slot) => slot.isAvailable && !slot.isBooked
    );
    return total + availableSlots.length;
  }, 0);
};

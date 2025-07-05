import dayjs from "dayjs";
import { GlobalStyles } from "../constants";

// Date formatting utilities
export const formatDate = (date, format = "YYYY-MM-DD") => {
  return dayjs(date).format(format);
};

export const formatTime = (date, format = "HH:mm") => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date, format = "YYYY-MM-DD HH:mm") => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date) => {
  const now = dayjs();
  const targetDate = dayjs(date);
  const diffInMinutes = now.diff(targetDate, "minute");
  const diffInHours = now.diff(targetDate, "hour");
  const diffInDays = now.diff(targetDate, "day");

  if (diffInMinutes < 60) {
    return `${Math.abs(diffInMinutes)} minutes ${
      diffInMinutes > 0 ? "ago" : "from now"
    }`;
  } else if (diffInHours < 24) {
    return `${Math.abs(diffInHours)} hours ${
      diffInHours > 0 ? "ago" : "from now"
    }`;
  } else {
    return `${Math.abs(diffInDays)} days ${
      diffInDays > 0 ? "ago" : "from now"
    }`;
  }
};

// Calendar event utilities
export const createCalendarEvent = (appointment) => {
  return {
    title: appointment.title || "Appointment",
    startDate: new Date(appointment.startTime),
    endDate: new Date(appointment.endTime || appointment.startTime),
    location: appointment.location || "",
    notes: appointment.notes || appointment.description || "",
    alarms: appointment.reminderEnabled
      ? [
          {
            relativeOffset: -15, // 15 minutes before
            method: "ALERT",
          },
        ]
      : [],
  };
};

export const formatEventForCalendar = (appointment) => {
  const date = formatDate(appointment.startTime);
  return {
    id: appointment.id,
    title: appointment.title,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    location: appointment.location,
    type: appointment.type,
    status: appointment.status,
    date: date,
  };
};

// Event status utilities
export const getEventStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "#4CAF50";
    case "pending":
      return "#FF9800";
    case "cancelled":
      return "#F44336";
    case "completed":
      return "#2196F3";
    default:
      return "#666";
  }
};

export const getEventStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "check-circle";
    case "pending":
      return "clock-outline";
    case "cancelled":
      return "close-circle";
    case "completed":
      return "check-circle-outline";
    default:
      return "help-circle-outline";
  }
};

// Calendar marking utilities
export const createMarkedDates = (events, selectedDate = null) => {
  const marked = {};

  Object.keys(events).forEach((date) => {
    const dayEvents = events[date];
    const hasConfirmed = dayEvents.some(
      (event) => event.status === "confirmed"
    );
    const hasPending = dayEvents.some((event) => event.status === "pending");
    const hasCancelled = dayEvents.some(
      (event) => event.status === "cancelled"
    );

    let dotColor = GlobalStyles.colors.primary;
    if (hasCancelled) {
      dotColor = "#F44336";
    } else if (hasPending) {
      dotColor = "#FF9800";
    } else if (hasConfirmed) {
      dotColor = "#4CAF50";
    }

    marked[date] = {
      marked: true,
      dotColor: dotColor,
      selected: date === selectedDate,
      selectedColor: GlobalStyles.colors.primary,
    };
  });

  return marked;
};

// Time utilities
export const getTimeSlots = (startHour = 8, endHour = 18, interval = 30) => {
  const slots = [];
  const startTime = dayjs().hour(startHour).minute(0);
  const endTime = dayjs().hour(endHour).minute(0);

  let currentTime = startTime;
  while (currentTime.isBefore(endTime)) {
    slots.push({
      time: currentTime.format("HH:mm"),
      value: currentTime.toDate(),
    });
    currentTime = currentTime.add(interval, "minute");
  }

  return slots;
};

export const isTimeSlotAvailable = (timeSlot, existingEvents) => {
  const slotStart = dayjs(timeSlot);
  const slotEnd = slotStart.add(30, "minute");

  return !existingEvents.some((event) => {
    const eventStart = dayjs(event.startTime);
    const eventEnd = dayjs(event.endTime);

    return (
      (slotStart.isBefore(eventEnd) && slotEnd.isAfter(eventStart)) ||
      slotStart.isSame(eventStart) ||
      slotEnd.isSame(eventEnd)
    );
  });
};

// Duration utilities
export const calculateDuration = (startTime, endTime) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const diffInMinutes = end.diff(start, "minute");

  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
};

// Week utilities
export const getWeekDates = (date = new Date()) => {
  const startOfWeek = dayjs(date).startOf("week");
  const dates = [];

  for (let i = 0; i < 7; i++) {
    dates.push(startOfWeek.add(i, "day"));
  }

  return dates;
};

export const getMonthDates = (date = new Date()) => {
  const startOfMonth = dayjs(date).startOf("month");
  const endOfMonth = dayjs(date).endOf("month");
  const startOfWeek = startOfMonth.startOf("week");
  const endOfWeek = endOfMonth.endOf("week");

  const dates = [];
  let currentDate = startOfWeek;

  while (
    currentDate.isBefore(endOfWeek) ||
    currentDate.isSame(endOfWeek, "day")
  ) {
    dates.push(currentDate);
    currentDate = currentDate.add(1, "day");
  }

  return dates;
};

// Validation utilities
export const isValidAppointmentTime = (startTime, endTime) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  return start.isBefore(end) && start.isAfter(dayjs());
};

export const isBusinessHours = (time) => {
  const hour = dayjs(time).hour();
  return hour >= 8 && hour <= 18;
};

// Notification utilities
export const getReminderTime = (appointmentTime, reminderMinutes = 15) => {
  return dayjs(appointmentTime).subtract(reminderMinutes, "minute");
};

export const shouldSendReminder = (appointmentTime, reminderMinutes = 15) => {
  const reminderTime = getReminderTime(appointmentTime, reminderMinutes);
  const now = dayjs();
  return now.isAfter(reminderTime) && now.isBefore(dayjs(appointmentTime));
};

// Export utilities
export const exportToICS = (appointments) => {
  let icsContent =
    "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//School Psychology//Calendar//EN\n";

  appointments.forEach((appointment) => {
    const startDate = formatDateTime(appointment.startTime, "YYYYMMDDTHHmmss");
    const endDate = formatDateTime(appointment.endTime, "YYYYMMDDTHHmmss");

    icsContent += `BEGIN:VEVENT\n`;
    icsContent += `UID:${appointment.id}@schoolpsychology.com\n`;
    icsContent += `DTSTART:${startDate}\n`;
    icsContent += `DTEND:${endDate}\n`;
    icsContent += `SUMMARY:${appointment.title}\n`;
    icsContent += `LOCATION:${appointment.location || ""}\n`;
    icsContent += `DESCRIPTION:${appointment.notes || ""}\n`;
    icsContent += `END:VEVENT\n`;
  });

  icsContent += "END:VCALENDAR";
  return icsContent;
};

// Theme utilities
export const getCalendarTheme = (
  primaryColor = GlobalStyles.colors.primary
) => {
  return {
    backgroundColor: "#ffffff",
    calendarBackground: "#ffffff",
    textSectionTitleColor: "#1A1A1A",
    selectedDayBackgroundColor: primaryColor,
    selectedDayTextColor: "#ffffff",
    todayTextColor: primaryColor,
    dayTextColor: "#1A1A1A",
    textDisabledColor: "#d9e1e8",
    dotColor: primaryColor,
    selectedDotColor: "#ffffff",
    arrowColor: primaryColor,
    monthTextColor: "#1A1A1A",
    indicatorColor: primaryColor,
    textDayFontWeight: "300",
    textMonthFontWeight: "600",
    textDayHeaderFontWeight: "500",
    textDayFontSize: 16,
    textMonthFontSize: 18,
    textDayHeaderFontSize: 14,
  };
};

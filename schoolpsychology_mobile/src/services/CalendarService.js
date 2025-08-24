import * as Calendar from "expo-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

// State variables
let defaultCalendarId = null;
let settings = {
  syncEnabled: false,
  autoSync: false,
  reminderEnabled: false,
  reminderTime: 15, // minutes before appointment
};

// Load settings from AsyncStorage
const loadSettings = async () => {
  try {
    const storedSettings = await AsyncStorage.getItem("calendarSettings");
    if (storedSettings) {
      settings = { ...settings, ...JSON.parse(storedSettings) };
    }
  } catch (error) {
    console.error("Error loading calendar settings:", error);
  }
};

// Save settings to AsyncStorage
const saveSettings = async () => {
  try {
    console.log("Saving calendar settings to AsyncStorage:", settings);
    await AsyncStorage.setItem("calendarSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving calendar settings:", error);
  }
};

// Check calendar permissions
const checkPermissions = async () => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking calendar permissions:", error);
    return false;
  }
};

// Request calendar permissions
const requestPermissions = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting calendar permissions:", error);
    return false;
  }
};

// Get default calendar
const getDefaultCalendar = async () => {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return null;
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );

    // Check if any calendar allows modifications
    const writableCalendars = calendars.filter(
      (cal) => cal.allowsModifications
    );
    if (writableCalendars.length === 0) {
      console.log("No writable calendars found - calendar is read-only");
      return null;
    }

    const defaultCalendar =
      writableCalendars.find((cal) => cal.isPrimary) || writableCalendars[0];
    defaultCalendarId = defaultCalendar?.id;
    return defaultCalendarId;
  } catch (error) {
    console.error("Error getting default calendar:", error);
    return null;
  }
};

// Get all calendars
const getCalendars = async () => {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    return calendars;
  } catch (error) {
    console.error("Error getting calendars:", error);
    return [];
  }
};

// Check if event is already added
const isEventAlreadyAdded = async (
  calendarId,
  targetTitle,
  startDate,
  endDate
) => {
  try {
    // Mở rộng khoảng thời gian tìm kiếm để bắt được các event gần nhau
    const searchStartDate = new Date(startDate);
    searchStartDate.setMinutes(searchStartDate.getMinutes() - 5); // 5 phút trước

    const searchEndDate = new Date(endDate);
    searchEndDate.setMinutes(searchEndDate.getMinutes() + 5); // 5 phút sau

    const events = await Calendar.getEventsAsync(
      [calendarId],
      searchStartDate,
      searchEndDate
    );

    return events.some((event) => {
      // So sánh title (không phân biệt hoa thường)
      const titleMatch =
        event.title.toLowerCase() === targetTitle.toLowerCase();

      // So sánh thời gian bắt đầu (cho phép sai lệch 5 phút)
      const eventStartTime = new Date(event.startDate).getTime();
      const targetStartTime = new Date(startDate).getTime();
      const timeDiff = Math.abs(eventStartTime - targetStartTime);
      const timeMatch = timeDiff <= 5 * 60 * 1000; // 5 phút = 300,000ms

      return titleMatch && timeMatch;
    });
  } catch (error) {
    console.error("Error checking if event already exists:", error);
    return false; // Nếu có lỗi, cho phép tạo event để tránh mất dữ liệu
  }
};

// Create calendar event
const createEvent = async (eventData) => {
  try {
    if (!settings.syncEnabled) {
      console.log("Calendar sync is disabled");
      return null;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return null;
    }

    const calendarId = defaultCalendarId;
    if (!calendarId) {
      console.log("No writable calendar available - calendar is read-only");
      return null;
    }

    const isAdded = await isEventAlreadyAdded(
      calendarId,
      eventData.title,
      eventData.startDate,
      eventData.endDate
    );

    if (isAdded) {
      console.log("Event already added");
      return null;
    }

    const eventDetails = {
      title: eventData.title || "Appointment",
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate || eventData.startDate),
      location: eventData.location || "",
      notes: eventData.notes || "",
      alarms: settings.reminderEnabled
        ? [
            {
              relativeOffset: -settings.reminderTime,
              method: Calendar.AlarmMethod.ALERT,
            },
          ]
        : [],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);
    console.log("Calendar event created:", eventId);
    return eventId;
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return null;
  }
};

// Update calendar event
const updateEvent = async (eventId, eventData) => {
  try {
    if (!settings.syncEnabled) {
      console.log("Calendar sync is disabled");
      return false;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return false;
    }

    if (!defaultCalendarId) {
      console.log("No writable calendar available - calendar is read-only");
      return false;
    }

    const eventDetails = {
      title: eventData.title || "Appointment",
      startDate: new Date(eventData.startDate),
      endDate: new Date(eventData.endDate || eventData.startDate),
      location: eventData.location || "",
      notes: eventData.notes || "",
      alarms: settings.reminderEnabled
        ? [
            {
              relativeOffset: -settings.reminderTime,
              method: Calendar.AlarmMethod.ALERT,
            },
          ]
        : [],
    };

    await Calendar.updateEventAsync(eventId, eventDetails);
    console.log("Calendar event updated:", eventId);
    return true;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return false;
  }
};

// Delete calendar event
const deleteEvent = async (eventId) => {
  try {
    if (!settings.syncEnabled) {
      console.log("Calendar sync is disabled");
      return false;
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return false;
    }

    if (!defaultCalendarId) {
      console.log("No writable calendar available - calendar is read-only");
      return false;
    }

    await Calendar.deleteEventAsync(eventId);
    console.log("Calendar event deleted:", eventId);
    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return false;
  }
};

// Get events for a date range
const getEvents = async (startDate, endDate) => {
  try {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Calendar permission not granted");
      return [];
    }

    const events = await Calendar.getEventsAsync(
      [defaultCalendarId],
      new Date(startDate),
      new Date(endDate)
    );

    return events;
  } catch (error) {
    console.error("Error getting calendar events:", error);
    return [];
  }
};

// Store mapping between appointment ID and calendar event ID
const storeEventMapping = async (appointmentId, eventId) => {
  try {
    const mappings = await AsyncStorage.getItem("calendarEventMappings");
    const mappingsObj = mappings ? JSON.parse(mappings) : {};
    mappingsObj[appointmentId] = eventId;
    await AsyncStorage.setItem(
      "calendarEventMappings",
      JSON.stringify(mappingsObj)
    );
  } catch (error) {
    console.error("Error storing event mapping:", error);
  }
};

// Get calendar event ID for an appointment
const getEventIdForAppointment = async (appointmentId) => {
  try {
    const mappings = await AsyncStorage.getItem("calendarEventMappings");
    const mappingsObj = mappings ? JSON.parse(mappings) : {};
    return mappingsObj[appointmentId];
  } catch (error) {
    console.error("Error getting event mapping:", error);
    return null;
  }
};

// Remove event mapping for an appointment
const removeEventMapping = async (appointmentId) => {
  try {
    const mappings = await AsyncStorage.getItem("calendarEventMappings");
    const mappingsObj = mappings ? JSON.parse(mappings) : {};
    delete mappingsObj[appointmentId];
    await AsyncStorage.setItem(
      "calendarEventMappings",
      JSON.stringify(mappingsObj)
    );
  } catch (error) {
    console.error("Error removing event mapping:", error);
  }
};

// Sync appointments with calendar
const syncAppointments = async (calendarId, appointments = []) => {
  try {
    console.log("Syncing appointments:", appointments);
    // Format appointment for calendar
    const appointmentForCalendar = appointments.map((item) => {
      return {
        id: item.id,
        title:
          item.hostType === "teacher"
            ? "Tư vấn với giáo viên chủ nhiệm - "
            : "Tư vấn với tư vấn viên - " +
              dayjs(item.startDateTime).format("HH:mm"),
        type: item.hostType === "teacher" ? "Teacher" : "Counselor",
        startTime: dayjs(item.startDateTime).toDate(),
        endTime: dayjs(item.endDateTime).toDate(),
        location: item.isOnline ? "Trực tuyến" : "Trực tiếp",
        notes: item.reason || "Không có lý do",
        description: `Tư vấn với ${
          item.hostType === "teacher"
            ? "giáo viên chủ nhiệm"
            : item.counselorName || "tư vấn viên"
        }`,
      };
    });

    let syncedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const appointment of appointmentForCalendar) {
      try {
        // Kiểm tra xem appointment đã được sync chưa (dựa trên ID)
        const alreadySynced = await isAppointmentAlreadySynced(appointment.id);
        if (alreadySynced) {
          console.log(
            `Appointment ${appointment.id} already synced, skipping...`
          );
          skippedCount++;
          continue;
        }

        const eventTitle = `${appointment.title || appointment.type}`;

        // Kiểm tra xem event tương tự đã tồn tại trong calendar chưa
        const isAdded = await isEventAlreadyAdded(
          calendarId,
          eventTitle,
          appointment.startTime,
          appointment.endTime
        );

        if (isAdded) {
          console.log(`Event "${eventTitle}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const eventData = {
          title: eventTitle,
          startDate: appointment.startTime,
          endDate: appointment.endTime,
          location: appointment.location || "School Psychology Center",
          notes: appointment.notes || appointment.description || "",
          timeZone: "Asia/Ho_Chi_Minh",
        };

        const eventId = await createEvent(eventData);
        if (eventId) {
          syncedCount++;
          // Store mapping between appointment and calendar event
          await storeEventMapping(appointment.id, eventId);
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error("Error syncing appointment:", appointment.id, error);
        errorCount++;
      }
    }

    return {
      success: true,
      syncedCount,
      errorCount,
      skippedCount,
      message: `Synced ${syncedCount} appointments, skipped ${skippedCount}${
        errorCount > 0 ? `, ${errorCount} failed` : ""
      }`,
    };
  } catch (error) {
    console.error("Error syncing appointments:", error);
    return { success: false, message: "Failed to sync appointments" };
  }
};

// Sync surveys with calendar
const syncSurveys = async (calendarId, surveys) => {
  try {
    // Format appointment for calendar
    const surveyForCalendar = surveys.map((item) => {
      return {};
    });

    let syncedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const survey of surveyForCalendar) {
      try {
        // Kiểm tra xem appointment đã được sync chưa (dựa trên ID)
        const alreadySynced = await isSurveyAlreadySynced(survey.id);
        if (alreadySynced) {
          console.log(`Survey ${survey.id} already synced, skipping...`);
          skippedCount++;
          continue;
        }

        const eventTitle = `${survey.title || survey.type}`;

        // Kiểm tra xem event tương tự đã tồn tại trong calendar chưa
        const isAdded = await isEventAlreadyAdded(
          calendarId,
          eventTitle,
          survey.startTime,
          survey.endTime
        );

        if (isAdded) {
          console.log(`Event "${eventTitle}" already exists, skipping...`);
          skippedCount++;
          continue;
        }

        const eventData = {
          title: eventTitle,
          startDate: survey.startTime,
          endDate: survey.endTime,
          location: survey.location || "School Psychology Center",
          notes: survey.notes || survey.description || "",
          timeZone: "Asia/Ho_Chi_Minh",
        };

        const eventId = await createEvent(eventData);
        if (eventId) {
          syncedCount++;
          // Store mapping between appointment and calendar event
          await storeEventMapping(survey.id, eventId);
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error("Error syncing survey:", survey.id, error);
        errorCount++;
      }
    }

    return {
      success: true,
      syncedCount,
      errorCount,
      skippedCount,
      message: `Synced ${syncedCount} surveys, skipped ${skippedCount}${
        errorCount > 0 ? `, ${errorCount} failed` : ""
      }`,
    };
  } catch (error) {
    console.error("Error syncing surveys:", error);
    return { success: false, message: "Failed to sync surveys" };
  }
};

// Sync event to calendar
const syncEvent = async (eventType, eventData) => {
  try {
    if (!settings.syncEnabled) {
      console.log("Calendar sync is disabled");
      return { success: false, message: "Calendar sync is disabled" };
    }

    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      return { success: false, message: "Calendar permission not granted" };
    }

    const calendarId = defaultCalendarId;
    if (!calendarId) {
      return {
        success: false,
        message: "No writable calendar available - calendar is read-only",
      };
    }

    if (eventType === "appointment") {
      const result = await syncAppointments(calendarId, eventData);
      if (result.success) {
        return { success: true, message: "Appointments synced successfully" };
      } else {
        return { success: false, message: "Failed to sync appointments" };
      }
    } else if (eventType === "survey") {
      const result = await syncSurveys(calendarId, eventData);
      if (result.success) {
        return { success: true, message: "Surveys synced successfully" };
      } else {
        return { success: false, message: "Failed to sync surveys" };
      }
    } else {
      // TODO: Sync other event types
      return { success: false, message: "Invalid event type" };
    }
  } catch (error) {
    console.error("Error syncing event to calendar:", error);
    return { success: false, message: "Failed to sync event to calendar" };
  }
};

// Update settings
const updateSettings = async (newSettings) => {
  settings = { ...settings, ...newSettings };
  await saveSettings();
};

// Get current settings
const getSettings = () => {
  return { ...settings };
};

// Check if sync is enabled
const isSyncEnabled = () => {
  return settings.syncEnabled;
};

// Check if auto sync is enabled
const isAutoSyncEnabled = () => {
  return settings.autoSync;
};

// Check if reminders are enabled
const isReminderEnabled = () => {
  return settings.reminderEnabled;
};

// Check if calendar is writable
const isCalendarWritable = () => {
  return defaultCalendarId !== null;
};

// Check if appointment is already synced to calendar
const isAppointmentAlreadySynced = async (appointmentId) => {
  try {
    const eventId = await getEventIdForAppointment(appointmentId);
    if (!eventId) return false;

    // Kiểm tra xem event có còn tồn tại trong calendar không
    const hasPermission = await checkPermissions();
    if (!hasPermission) return false;

    try {
      // Thử lấy event để xem có còn tồn tại không
      const events = await Calendar.getEventsAsync(
        [defaultCalendarId],
        new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 giờ trước
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 năm sau
      );

      return events.some((event) => event.id === eventId);
    } catch (error) {
      // Nếu không thể kiểm tra, giả sử event đã bị xóa
      await removeEventMapping(appointmentId);
      return false;
    }
  } catch (error) {
    console.error("Error checking if appointment is synced:", error);
    return false;
  }
};

// Format appointment for calendar
const formatAppointmentForCalendar = (appointment) => {
  return {
    title: `Appointment - ${
      appointment.title || appointment.type || "Session"
    }`,
    startDate: new Date(appointment.startTime),
    endDate: new Date(appointment.endTime || appointment.startTime),
    location: appointment.location || "School Psychology Center",
    notes: appointment.notes || appointment.description || "",
    alarms: settings.reminderEnabled
      ? [
          {
            relativeOffset: -settings.reminderTime,
            method: Calendar.AlarmMethod.ALERT,
          },
        ]
      : [],
  };
};

// Initialize calendar service
const initialize = async () => {
  try {
    await loadSettings();

    // Check if we have permissions, if not, request them
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      console.log("Requesting calendar permissions...");
      const granted = await requestPermissions();
      if (!granted) {
        console.log("Calendar permissions not granted");
        return false;
      }
    }

    await getDefaultCalendar();
    return true;
  } catch (error) {
    console.error("Calendar service initialization error:", error);
    return false;
  }
};

// Export all functions
const CalendarService = {
  initialize,
  loadSettings,
  saveSettings,
  checkPermissions,
  requestPermissions,
  getDefaultCalendar,
  getCalendars,
  isEventAlreadyAdded,
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  syncAppointments,
  syncSurveys,
  syncEvent,
  storeEventMapping,
  getEventIdForAppointment,
  removeEventMapping,
  updateSettings,
  getSettings,
  isSyncEnabled,
  isAutoSyncEnabled,
  isReminderEnabled,
  isCalendarWritable,
  isAppointmentAlreadySynced,
  formatAppointmentForCalendar,
};

export default CalendarService;

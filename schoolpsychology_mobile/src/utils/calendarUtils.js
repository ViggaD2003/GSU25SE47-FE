import * as Calendar from "expo-calendar";
import dayjs from "dayjs";

/**
 * Request calendar permissions
 * @returns {Promise<boolean>} True if permissions granted, false otherwise
 */
export const requestCalendarPermissions = async () => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting calendar permissions:", error);
    return false;
  }
};

/**
 * Check if calendar permissions are granted
 * @returns {Promise<boolean>} True if permissions granted, false otherwise
 */
export const checkCalendarPermissions = async () => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking calendar permissions:", error);
    return false;
  }
};

/**
 * Get all available calendars
 * @returns {Promise<Array>} Array of calendar objects
 */
export const getCalendars = async () => {
  try {
    const hasPermission = await checkCalendarPermissions();
    if (!hasPermission) {
      throw new Error("Calendar permissions not granted");
    }

    const calendars = await Calendar.getCalendarsAsync(
      Calendar.EntityTypes.EVENT
    );
    return calendars;
  } catch (error) {
    console.error("Error getting calendars:", error);
    throw error;
  }
};

/**
 * Get default calendar (usually the main device calendar)
 * @returns {Promise<Object|null>} Default calendar object or null
 */
export const getDefaultCalendar = async () => {
  try {
    const calendars = await getCalendars();
    // Find the default calendar (usually the first one or one marked as default)
    const defaultCalendar =
      calendars.find((cal) => cal.isPrimary) || calendars[0];
    return defaultCalendar;
  } catch (error) {
    console.error("Error getting default calendar:", error);
    throw error;
  }
};

/**
 * Add event to system calendar
 * @param {Object} eventData - Event data object
 * @param {string} eventData.title - Event title
 * @param {string} eventData.description - Event description (optional)
 * @param {Date|string} eventData.startDate - Event start date
 * @param {Date|string} eventData.endDate - Event end date
 * @param {string} eventData.location - Event location (optional)
 * @param {string} eventData.calendarId - Calendar ID (optional, will use default if not provided)
 * @param {boolean} eventData.allDay - Whether event is all day (optional)
 * @param {Array} eventData.alarms - Array of alarm objects (optional)
 * @returns {Promise<string>} Event ID if successful
 */
export const addEventToCalendar = async (eventData) => {
  try {
    // Check permissions first
    const hasPermission = await checkCalendarPermissions();
    if (!hasPermission) {
      const granted = await requestCalendarPermissions();
      if (!granted) {
        throw new Error("Calendar permissions required to add events");
      }
    }

    // Get calendar ID
    let calendarId = eventData.calendarId;
    if (!calendarId) {
      const defaultCalendar = await getDefaultCalendar();
      if (!defaultCalendar) {
        throw new Error("No calendar available");
      }
      calendarId = defaultCalendar.id;
    }

    // Parse dates
    const startDate = dayjs(eventData.startDate).toDate();
    const endDate = dayjs(eventData.endDate).toDate();

    // Validate dates
    if (!startDate || !endDate) {
      throw new Error("Invalid start or end date");
    }

    if (startDate >= endDate) {
      throw new Error("Start date must be before end date");
    }

    // Prepare event details
    const eventDetails = {
      title: eventData.title,
      startDate: startDate,
      endDate: endDate,
      allDay: eventData.allDay || false,
      location: eventData.location || "",
      notes: eventData.description || "",
      alarms: eventData.alarms || [],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Add event to calendar
    const eventId = await Calendar.createEventAsync(calendarId, eventDetails);

    console.log("Event added successfully with ID:", eventId);
    return eventId;
  } catch (error) {
    console.error("Error adding event to calendar:", error);
    throw error;
  }
};

/**
 * Add appointment event to calendar
 * @param {Object} appointment - Appointment data
 * @param {string} appointment.title - Appointment title
 * @param {string} appointment.description - Appointment description
 * @param {Date|string} appointment.startTime - Appointment start time
 * @param {Date|string} appointment.endTime - Appointment end time
 * @param {string} appointment.location - Appointment location
 * @param {string} appointment.psychologistName - Psychologist name
 * @returns {Promise<string>} Event ID if successful
 */
export const addAppointmentToCalendar = async (appointment) => {
  const eventData = {
    title: appointment.title || `Cuộc hẹn với ${appointment.psychologistName}`,
    description:
      appointment.description ||
      `Cuộc hẹn tư vấn tâm lý với ${appointment.psychologistName}`,
    startDate: appointment.startTime,
    endDate: appointment.endTime,
    location: appointment.location || "Trung tâm Tư vấn Tâm lý",
    allDay: false,
    alarms: [
      {
        relativeOffset: -30, // 30 minutes before
        method: Calendar.AlarmMethod.ALERT,
      },
      {
        relativeOffset: -60, // 1 hour before
        method: Calendar.AlarmMethod.ALERT,
      },
    ],
  };

  return await addEventToCalendar(eventData);
};

/**
 * Add survey reminder to calendar
 * @param {Object} survey - Survey data
 * @param {string} survey.title - Survey title
 * @param {string} survey.description - Survey description
 * @param {Date|string} survey.dueDate - Survey due date
 * @returns {Promise<string>} Event ID if successful
 */
export const addSurveyReminderToCalendar = async (survey) => {
  const dueDate = dayjs(survey.dueDate);
  const reminderTime = dueDate.subtract(1, "day"); // 1 day before due date

  const eventData = {
    title: `Nhắc nhở: ${survey.title}`,
    description: survey.description || "Khảo sát cần hoàn thành",
    startDate: reminderTime.toDate(),
    endDate: reminderTime.add(1, "hour").toDate(),
    location: "Ứng dụng Tư vấn Tâm lý",
    allDay: false,
    alarms: [
      {
        relativeOffset: 0, // At the time of the event
        method: Calendar.AlarmMethod.ALERT,
      },
    ],
  };

  return await addEventToCalendar(eventData);
};

/**
 * Update existing calendar event
 * @param {string} eventId - Event ID to update
 * @param {Object} eventData - Updated event data
 * @returns {Promise<boolean>} True if successful
 */
export const updateCalendarEvent = async (eventId, eventData) => {
  try {
    const hasPermission = await checkCalendarPermissions();
    if (!hasPermission) {
      throw new Error("Calendar permissions required to update events");
    }

    // Parse dates if provided
    if (eventData.startDate) {
      eventData.startDate = dayjs(eventData.startDate).toDate();
    }
    if (eventData.endDate) {
      eventData.endDate = dayjs(eventData.endDate).toDate();
    }

    await Calendar.updateEventAsync(eventId, eventData);
    console.log("Event updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating calendar event:", error);
    throw error;
  }
};

/**
 * Delete calendar event
 * @param {string} eventId - Event ID to delete
 * @returns {Promise<boolean>} True if successful
 */
export const deleteCalendarEvent = async (eventId) => {
  try {
    const hasPermission = await checkCalendarPermissions();
    if (!hasPermission) {
      throw new Error("Calendar permissions required to delete events");
    }

    await Calendar.deleteEventAsync(eventId);
    console.log("Event deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    throw error;
  }
};

/**
 * Get events from calendar within a date range
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} calendarId - Calendar ID (optional)
 * @returns {Promise<Array>} Array of events
 */
export const getCalendarEvents = async (
  startDate,
  endDate,
  calendarId = null
) => {
  try {
    const hasPermission = await checkCalendarPermissions();
    if (!hasPermission) {
      throw new Error("Calendar permissions required to get events");
    }

    const start = dayjs(startDate).toDate();
    const end = dayjs(endDate).toDate();

    let calendars = [];
    if (calendarId) {
      calendars = [calendarId];
    } else {
      const allCalendars = await getCalendars();
      calendars = allCalendars.map((cal) => cal.id);
    }

    const events = await Calendar.getEventsAsync(calendars, start, end);
    return events;
  } catch (error) {
    console.error("Error getting calendar events:", error);
    throw error;
  }
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string (optional)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "DD/MM/YYYY HH:mm") => {
  return dayjs(date).format(format);
};

/**
 * Check if device supports calendar functionality
 * @returns {Promise<boolean>} True if supported
 */
export const isCalendarSupported = async () => {
  try {
    const calendars = await getCalendars();
    return calendars.length > 0;
  } catch (error) {
    return false;
  }
};

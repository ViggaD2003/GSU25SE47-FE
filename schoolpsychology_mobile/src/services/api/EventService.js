import axios from "./axios";

class EventService {
  /**
   * Get events for a specific date range
   * @param {Object} params - Query parameters
   * @param {string} params.startDate - Start date (YYYY-MM-DD)
   * @param {string} params.endDate - End date (YYYY-MM-DD)
   * @param {string} params.userId - User ID
   * @param {string} [params.source] - Filter by source (Appointment, Survey, Program)
   * @param {boolean} [params.from_case] - Filter by case events
   * @param {string} [params.status] - Filter by status (upcoming, completed, cancelled)
   * @param {number} [params.page] - Page number for pagination
   * @param {number} [params.limit] - Items per page
   * @returns {Promise<Object>} Response with events data
   */
  static async getEvents(params) {
    try {
      const response = await axios.get("/api/v1/events", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  }

  /**
   * Get events for a specific week
   * @param {Object} params - Query parameters
   * @param {number} params.weekIndex - Week index (0 = current week, 1 = next week, etc.)
   * @param {string} params.userId - User ID
   * @param {Object} [params.filters] - Additional filters
   * @returns {Promise<Object>} Response with events data
   */
  static async getEventsForWeek(params) {
    try {
      const { weekIndex, userId, filters = {} } = params;

      // Calculate date range for the week
      const today = new Date();
      const startOfWeek = new Date(today);

      // Calculate start of current week (Monday)
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(today.getDate() - daysToSubtract);

      // Add weeks based on weekIndex
      startOfWeek.setDate(startOfWeek.getDate() + weekIndex * 7);

      // Calculate end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startDate = startOfWeek.toISOString().split("T")[0];
      const endDate = endOfWeek.toISOString().split("T")[0];

      // Call the main getEvents method with calculated date range
      return await this.getEvents({
        startDate,
        endDate,
        userId,
        ...filters,
      });
    } catch (error) {
      console.error("Error fetching events for week:", error);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Event details
   */
  static async getEventById(eventId, userId) {
    try {
      const response = await axios.get(`/api/v1/events/${eventId}`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching event by ID:", error);
      throw error;
    }
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @param {string} eventData.title - Event title
   * @param {string} eventData.source - Event source (Appointment, Survey, Program)
   * @param {string} eventData.date - Event date (YYYY-MM-DD)
   * @param {string} eventData.time - Event time (HH:MM)
   * @param {string} [eventData.location] - Event location
   * @param {boolean} [eventData.from_case] - Whether event is from case
   * @param {string} eventData.userId - User ID
   * @returns {Promise<Object>} Created event
   */
  static async createEvent(eventData) {
    try {
      const response = await axios.post("/api/v1/events", eventData);
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  /**
   * Update an event
   * @param {string} eventId - Event ID
   * @param {Object} eventData - Updated event data
   * @returns {Promise<Object>} Updated event
   */
  static async updateEvent(eventId, eventData) {
    try {
      const response = await axios.put(`/api/v1/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteEvent(eventId) {
    try {
      const response = await axios.delete(`/api/v1/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  /**
   * Get event statistics
   * @param {Object} params - Query parameters
   * @param {string} params.userId - User ID
   * @param {string} [params.startDate] - Start date for statistics
   * @param {string} [params.endDate] - End date for statistics
   * @returns {Promise<Object>} Event statistics
   */
  static async getEventStatistics(params) {
    try {
      const response = await axios.get("/api/v1/events/statistics", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching event statistics:", error);
      throw error;
    }
  }
}

export default EventService;

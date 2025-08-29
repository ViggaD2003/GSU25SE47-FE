import axios from "./axios";

const EventService = {
  /**
   * Get events for a specific week
   * @param {Object} params - Query parameters
   * @param {number} params.weekIndex - Week index (0 = current week, 1 = next week, etc.)
   * @param {string} params.userId - User ID
   * @param {Object} [params.filters] - Additional filters
   * @returns {Promise<Object>} Response with events data
   */
  getEventsForWeek: async (params) => {
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
      throw error;
    }
  },

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
  getEvents: async (userId, params) => {
    try {
      const { startDate, endDate } = params;
      const response = await axios.get(
        `/api/v1/events/${userId}?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Event details
   */
  getEventById: async (eventId, userId) => {
    try {
      const response = await axios.get(`/api/v1/events/${eventId}`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      console.warn("Error fetching event by ID:", error);
      throw error;
    }
  },
};

export default EventService;

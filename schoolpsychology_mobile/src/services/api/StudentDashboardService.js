import api from "./axios";

class StudentDashboardService {
  /**
   * Get student dashboard data
   * @param {Object} params - Query parameters
   * @param {string} params.from - Start date (YYYY-MM-DD)
   * @param {string} params.to - End date (YYYY-MM-DD)
   * @param {string} params.studentId - Student ID
   * @returns {Promise<Object>} Dashboard data
   */
  static async getStudentDashboard(params) {
    try {
      const { from, to, studentId } = params;

      // Validate required parameters
      if (!from || !to || !studentId) {
        const missingParams = [];
        if (!from) missingParams.push("from");
        if (!to) missingParams.push("to");
        if (!studentId) missingParams.push("studentId");

        throw new Error(
          `Missing required parameters: ${missingParams.join(", ")}`
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(from) || !dateRegex.test(to)) {
        throw new Error("Invalid date format. Expected YYYY-MM-DD format");
      }

      const response = await api.get("/api/v1/dashboard/student", {
        params: {
          from,
          to,
          studentId,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      throw error;
    }
  }
}

export default StudentDashboardService;

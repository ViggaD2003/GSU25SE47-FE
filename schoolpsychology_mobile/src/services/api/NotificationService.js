import api from "./axios";

const NotificationAPI = {
  // Get all notifications for an account
  async getAllNotifications(accountId, page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/v1/noti/${accountId}`);

      console.log("NotificationAPI: Notifications retrieved successfully");
      return response.data;
    } catch (error) {
      console.error("NotificationAPI: Error getting notifications:", error);
      throw error;
    }
  },
};

export default NotificationAPI;

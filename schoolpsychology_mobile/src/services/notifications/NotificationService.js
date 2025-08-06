import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.isInitialized = false;
  }

  // Initialize notification service
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn(
          "NotificationService: Permission not granted for notifications"
        );
        return false;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
        console.log("NotificationService: Push token:", this.expoPushToken);
      } else {
        console.warn(
          "NotificationService: Must use physical device for push notifications"
        );
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("NotificationService: Error initializing:", error);
      return false;
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for incoming notifications
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(
          "NotificationService: Notification received:",
          notification
        );
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for notification responses (when user taps notification)
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("NotificationService: Notification response:", response);
        this.handleNotificationResponse(response);
      });
  }

  // Handle incoming notification
  handleNotificationReceived(notification) {
    const { title, body, data } = notification.request.content;

    // You can add custom logic here to handle different types of notifications
    console.log("NotificationService: Received notification:", {
      title,
      body,
      data,
    });

    // Emit custom event or call callback if needed
    if (this.onNotificationReceived) {
      this.onNotificationReceived(notification);
    }
  }

  // Handle notification response (user tap)
  handleNotificationResponse(response) {
    const { title, body, data } = response.notification.request.content;

    console.log("NotificationService: User tapped notification:", {
      title,
      body,
      data,
    });

    // Handle navigation or other actions based on notification data
    if (data?.screen) {
      // Navigate to specific screen
      this.handleNavigation(data.screen, data.params);
    }

    // Emit custom event or call callback if needed
    if (this.onNotificationResponse) {
      this.onNotificationResponse(response);
    }
  }

  // Handle navigation based on notification data
  handleNavigation(screen, params = {}) {
    // This will be implemented in the context to handle navigation
    console.log("NotificationService: Navigate to:", screen, params);
  }

  // Schedule local notification
  async scheduleLocalNotification({
    title,
    body,
    data = {},
    trigger = null,
    sound = true,
    priority = "default",
    channelId = "default",
  }) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound,
          priority,
        },
        trigger,
      });

      console.log(
        "NotificationService: Local notification scheduled:",
        notificationId
      );
      return notificationId;
    } catch (error) {
      console.error(
        "NotificationService: Error scheduling local notification:",
        error
      );
      throw error;
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(
        "NotificationService: Cancelled notification:",
        notificationId
      );
    } catch (error) {
      console.error(
        "NotificationService: Error cancelling notification:",
        error
      );
    }
  }

  // Cancel all scheduled notifications
  async cancelAllScheduledNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationAsync();
      console.log("NotificationService: Cancelled all scheduled notifications");
    } catch (error) {
      console.error(
        "NotificationService: Error cancelling all notifications:",
        error
      );
    }
  }

  // Get badge count
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error("NotificationService: Error getting badge count:", error);
      return 0;
    }
  }

  // Set badge count
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
      console.log("NotificationService: Set badge count to:", count);
    } catch (error) {
      console.error("NotificationService: Error setting badge count:", error);
    }
  }

  // Get push token
  getPushToken() {
    return this.expoPushToken;
  }

  // Set notification callbacks
  setNotificationCallbacks(onReceived, onResponse) {
    this.onNotificationReceived = onReceived;
    this.onNotificationResponse = onResponse;
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }

    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }

    this.isInitialized = false;
  }

  // Check if service is initialized
  isServiceInitialized() {
    return this.isInitialized;
  }
}

// Create singleton instance
const notificationService = new NotificationService();
export default notificationService;

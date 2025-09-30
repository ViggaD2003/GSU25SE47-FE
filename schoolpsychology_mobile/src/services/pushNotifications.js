import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure global notification handling behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // iOS presentation options
    shouldShowBanner: true,
    shouldShowList: true,
    // Cross-platform
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureAndroidChannelAsync() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export async function registerForPushNotificationsAsync(projectId) {
  // On iOS, first request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return null;
  }

  // Ensure Android notification channel exists
  await ensureAndroidChannelAsync();

  // Fetch Expo push token. If projectId not provided, Notifications will infer from app config.
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  return tokenResponse?.data ?? null;
}

export function addNotificationListeners({ onReceived, onResponse } = {}) {
  const receivedSub = Notifications.addNotificationReceivedListener((n) => {
    try {
      onReceived && onReceived(n);
    } catch {}
  });
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (r) => {
      try {
        onResponse && onResponse(r);
      } catch {}
    }
  );
  return () => {
    receivedSub?.remove?.();
    responseSub?.remove?.();
  };
}

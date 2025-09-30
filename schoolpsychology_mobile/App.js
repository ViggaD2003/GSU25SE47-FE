import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  AuthProvider,
  useAuth,
  RealTimeProvider,
  ChildrenProvider,
} from "./src/contexts";
import { setLogoutCallback } from "./src/services/api/axios";
import { useEffect, useCallback, useRef } from "react";
import { PaperProvider } from "react-native-paper";
import { PermissionProvider } from "./src/contexts";
import { LanguageProvider } from "./src/contexts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useTranslation } from "react-i18next";
import "./src/i18n";
import RootStack from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "dayjs/locale/vi";
import * as React from "react";
import Constants from "expo-constants";
import {
  registerForPushNotificationsAsync,
  addNotificationListeners,
} from "@/services/pushNotifications";
import { Toast } from "@/components";

// Extend dayjs with plugins
dayjs.extend(utc);

function RootNavigation() {
  const { user, loading, registerLogoutCallback, logout } = useAuth();
  const { t } = useTranslation();
  const logoutCallbackRef = useRef(null);
  const removeNotiListenersRef = useRef(null);

  // Toast state
  const [toastVisible, setToastVisible] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState("");
  const [toastType, setToastType] = React.useState("info");

  // Create a stable logout callback function
  const handleLogout = useCallback(async () => {
    console.log("Logout callback triggered from axios interceptor");
    try {
      // Ensure user state is cleared and navigate to login
      await logout();
    } catch (error) {
      console.warn("Error in logout callback:", error);
    }
  }, [logout]);

  // Handle logout notification
  const handleLogoutNotification = useCallback(() => {
    setToastVisible(true);
    setToastMessage(t("profile.logout"));
    setToastType("warning");
  }, [t]);

  useEffect(() => {
    // Register logout callback only once
    if (!logoutCallbackRef.current) {
      logoutCallbackRef.current = registerLogoutCallback(
        handleLogoutNotification
      );
    }

    // Set axios logout callback
    setLogoutCallback(handleLogout);

    // Register for push notifications and attach listeners
    (async () => {
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ||
          Constants?.easConfig?.projectId;
        const token = await registerForPushNotificationsAsync(projectId);
        if (token) {
          console.log("Expo push token:", token);
        } else {
          console.log("Push notification permission not granted");
        }

        removeNotiListenersRef.current = addNotificationListeners({
          onReceived: () => {
            // no-op; RealTimeContext/UI handles display
          },
          onResponse: (response) => {
            // Optionally navigate based on notification data
            try {
              const data = response?.notification?.request?.content?.data;
              // Example: route by type
              // if (data?.screen) navigation.navigate(data.screen, data.params || {});
            } catch {}
          },
        });
      } catch (e) {
        console.warn("Push notifications setup failed", e);
      }
    })();

    // Cleanup function
    return () => {
      if (logoutCallbackRef.current) {
        logoutCallbackRef.current();
        logoutCallbackRef.current = null;
      }
      if (removeNotiListenersRef.current) {
        try {
          removeNotiListenersRef.current();
        } catch {}
        removeNotiListenersRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  if (loading) return null; // hoặc loading indicator
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <RootStack />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PaperProvider>
          <AuthProvider>
            <PermissionProvider>
              <RealTimeProvider>
                <ChildrenProvider>
                  <RootNavigation />
                </ChildrenProvider>
              </RealTimeProvider>
            </PermissionProvider>
          </AuthProvider>
        </PaperProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

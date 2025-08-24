import * as encoding from "text-encoding";
import { StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  AuthProvider,
  useAuth,
  RealTimeProvider,
  ChildrenProvider,
} from "./src/contexts";
import { setLogoutCallback } from "./src/services/api/axios";
import { useEffect, useCallback, useRef } from "react";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import { PermissionProvider } from "./src/contexts";
import { LanguageProvider } from "./src/contexts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { TextEncoder, TextDecoder } from "text-encoding";
import { useTranslation } from "react-i18next";
import "./src/i18n";
import RootStack from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Extend global with TextEncoder and TextDecoder
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = TextDecoder;
}

// Extend dayjs with utc plugin only
dayjs.extend(utc);

function RootNavigation() {
  const { user, loading, registerLogoutCallback, logout } = useAuth();
  const { t } = useTranslation();
  const logoutCallbackRef = useRef(null);

  // Create a stable logout callback function
  const handleLogout = useCallback(async () => {
    console.log("Logout callback triggered from axios interceptor");
    try {
      // Ensure user state is cleared and navigate to login
      await logout();
    } catch (error) {
      console.error("Error in logout callback:", error);
    }
  }, [logout]);

  // Handle logout notification
  const handleLogoutNotification = useCallback(() => {
    Toast.show({
      type: "info",
      text1: t("profile.logout"),
      text2: t("profile.sessionEnded"),
      position: "top",
    });
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

    // Cleanup function
    return () => {
      if (logoutCallbackRef.current) {
        logoutCallbackRef.current();
        logoutCallbackRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once

  if (loading) return null; // hoặc loading indicator
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <RootStack />
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
                  <Toast />
                </ChildrenProvider>
              </RealTimeProvider>
            </PermissionProvider>
          </AuthProvider>
        </PaperProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

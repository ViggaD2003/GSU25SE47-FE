import { StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import MainTabs from "./src/navigation/MainTabs";
import {
  AuthProvider,
  useAuth,
  RealTimeProvider,
  useRealTime,
} from "./src/contexts";
import { setLogoutCallback } from "./src/services/api/axios";
import { useEffect, useCallback, useRef } from "react";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import { PermissionProvider } from "./src/contexts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Extend dayjs with utc plugin only
dayjs.extend(utc);

function RootNavigation() {
  const { user, loading, registerLogoutCallback, logout } = useAuth();
  const { setNavigationRef } = useRealTime();
  const logoutCallbackRef = useRef(null);
  const navigationRef = useRef(null);

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
    console.log("Logout callback triggered from App.js");
  }, []);

  // Set navigation ref for RealTimeProvider
  const onReady = useCallback(() => {
    setNavigationRef(navigationRef.current);
  }, [setNavigationRef]);

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
    <NavigationContainer ref={navigationRef} onReady={onReady}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PermissionProvider>
        <RealTimeProvider>
          <PaperProvider>
            <RootNavigation />
            <Toast />
          </PaperProvider>
        </RealTimeProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}

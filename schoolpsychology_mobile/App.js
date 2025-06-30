import { StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import MainTabs from "./src/navigation/MainTabs";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { setLogoutCallback } from "./src/services/api/axios";
import React, { useEffect, useCallback, useState, useRef } from "react";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";
import LogoutToast from "./src/components/common/LogoutToast";

function RootNavigation() {
  const { user, loading, registerLogoutCallback, logout } = useAuth();
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const logoutCallbackRef = useRef(null);

  // Create a stable logout callback function
  const handleLogout = useCallback(async () => {
    console.log("Logout callback triggered from axios interceptor");
    try {
      // Show logout toast
      setShowLogoutToast(true);

      // Ensure user state is cleared and navigate to login
      await logout();
    } catch (error) {
      console.error("Error in logout callback:", error);
    }
  }, [logout]);

  // Handle logout notification
  const handleLogoutNotification = useCallback(() => {
    console.log("Logout callback triggered from App.js");
    setShowLogoutToast(true);
  }, []);

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

  const handleToastHide = useCallback(() => {
    setShowLogoutToast(false);
  }, []);

  if (loading) return null; // hoặc loading indicator
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {user ? <MainTabs /> : <AuthStack />}

      <LogoutToast visible={showLogoutToast} onHide={handleToastHide} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <RootNavigation />
        <Toast />
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});

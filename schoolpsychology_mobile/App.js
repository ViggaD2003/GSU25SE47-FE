import { StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./src/navigation/AuthStack";
import MainTabs from "./src/navigation/MainTabs";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { setLogoutCallback } from "./src/services/api/axios";
import React, { useEffect, useCallback } from "react";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";

function RootNavigation() {
  const { user, loading, registerLogoutCallback, logout } = useAuth();

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

  useEffect(() => {
    const unregister = registerLogoutCallback(() => {
      // This will be called when axios interceptor triggers logout
      console.log("Logout callback triggered from App.js");
    });

    setLogoutCallback(handleLogout);

    return unregister;
  }, []); // Remove dependencies to prevent infinite re-renders

  if (loading) return null; // hoặc loading indicator
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {user ? <MainTabs /> : <AuthStack />}
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

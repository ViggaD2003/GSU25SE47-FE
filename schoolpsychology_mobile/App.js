import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./navigation/AuthStack";
import MainTabs from "./navigation/MainTabs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { setLogoutCallback } from "./utils/axios";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { PaperProvider } from "react-native-paper";

function RootNavigation() {
  const { user, loading, registerLogoutCallback } = useAuth();

  useEffect(() => {
    const unregister = registerLogoutCallback(() => {
      // This will be called when axios interceptor triggers logout
    });

    setLogoutCallback(() => {
      console.log("Logout callback triggered");
    });

    return unregister;
  }, [registerLogoutCallback]);

  if (loading) return null; // hoặc loading indicator
  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <StatusBar style="auto" />
        <RootNavigation />
        <Toast />
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});

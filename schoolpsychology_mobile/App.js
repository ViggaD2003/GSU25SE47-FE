import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./navigation/AuthStack";
import MainTabs from "./navigation/MainTabs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { setLogoutCallback } from "./utils/axios";
import React, { useEffect } from "react";

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
      <RootNavigation />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});

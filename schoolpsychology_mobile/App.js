import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthStack from "./navigation/AuthStack";
import MainTabs from "./navigation/MainTabs";
import { AuthProvider, useAuth } from "./context/AuthContext";
import React from "react";

function RootNavigation() {
  const { user, loading } = useAuth();
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

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Login from './pages/Authentication/Login';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AuthStack from './navigation/AuthStack';
import MainTabs from './navigation/MainTabs';
import { AuthProvider, useAuth } from './context/AuthContext';
import React from 'react';

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

const styles = StyleSheet.create({
});

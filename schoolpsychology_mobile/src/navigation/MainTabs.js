import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { StyleSheet } from "react-native";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { Badge } from "react-native-paper";
import { useAuth } from "../contexts";
import {
  AppointmentConfirmScreen,
  AppointmentDetailsScreen,
  AppointmentRecordScreen,
  BlogScreen,
  ChangePasswordScreen,
  HomeScreen,
  MyChildrenScreen,
  NotificationScreen,
  ProfileScreen,
  SurveyInfoScreen,
  SurveyRecordScreen,
  SurveyResultScreen,
  SurveyTakingScreen,
  UpdateProfileScreen,
} from "../screens";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppointmentScreen from "../screens/Appointment/AppointmentScreen";
import SuccessScreen from "../components/common/SuccessScreen";

const Stack = createNativeStackNavigator();

export default function MainTabs() {
  const [messageCount, setMessageCount] = useState(3);
  const insets = useSafeAreaInsets();

  const SurveyStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SurveyMain" component={SurveyRecordScreen} />
        <Stack.Screen name="SurveyRecord" component={SurveyRecordScreen} />
        <Stack.Screen name="SurveyInfo" component={SurveyInfoScreen} />
        <Stack.Screen
          name="SurveyTaking"
          component={SurveyTakingScreen}
          options={{
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="SurveyResult" component={SurveyResultScreen} />
      </Stack.Navigator>
    );
  };

  const ProfileStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="MyChildren" component={MyChildrenScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    );
  };

  const AppointmentStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AppointmentMain" component={AppointmentScreen} />
        <Stack.Screen
          name="AppointmentConfirm"
          component={AppointmentConfirmScreen}
        />
        <Stack.Screen
          name="AppointmentDetails"
          component={AppointmentDetailsScreen}
        />
        <Stack.Screen
          name="AppointmentRecord"
          component={AppointmentRecordScreen}
        />
      </Stack.Navigator>
    );
  };

  const CustomHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
    </View>
  );

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        header: () => <CustomHeader />,
        headerStyle: styles.headerStyle,
        headerStatusBarHeight: 0,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen
        name="BlogDetails"
        component={require("../screens").BlogDetails}
      />
      <Stack.Screen name="Profile" component={ProfileStack} />
      <Stack.Screen name="Survey" component={SurveyStack} />
      <Stack.Screen name="Appointment" component={AppointmentStack} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerContainer: {
    backgroundColor: "#FFFFFF",
  },
});

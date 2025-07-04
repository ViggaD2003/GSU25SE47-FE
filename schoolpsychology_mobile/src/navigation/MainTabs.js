import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import {
  BlogScreen,
  ChangePasswordScreen,
  HomeScreen,
  MyChildrenScreen,
  NotificationScreen,
  ProfileScreen,
  StatusScreen,
  SurveyInfoScreen,
  SurveyRecordScreen,
  SurveyResultScreen,
  SurveyTakingScreen,
  UpdateProfileScreen,
} from "../screens";
import BookingScreenWrapper from "../screens/Appointment/BookingScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SuccessScreen from "../screens/Appointment/StatusScreen";

const Stack = createNativeStackNavigator();

export default function MainTabs() {
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
        <Stack.Screen name="AppointmentMain" component={BookingScreenWrapper} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} />
        {/* <Stack.Screen
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
        /> */}
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

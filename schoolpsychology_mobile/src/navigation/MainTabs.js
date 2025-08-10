import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  AppointmentDetailsScreen,
  AppointmentRecordScreen,
  BlogDetails,
  BlogScreen,
  BookingScreen,
  CalendarAccess,
  ChangePasswordScreen,
  HomeScreen,
  MyChildrenScreen,
  ProfileScreen,
  StatusScreen,
  SurveyInfoScreen,
  SurveyRecordScreen,
  SurveyResultScreen,
  SurveyTakingScreen,
  UpdateProfileScreen,
  ProgramRecordScreen,
  RecordScreen,
  AppointmentRecordDetailScreen,
  DashboardScreen,
  NotificationScreen,
  EventScreen,
  EventList,
  CaseDetails,
  NotificationSettingsScreen,
  LanguageSettingsScreen,
  ClosedCases,
  ProgramListScreen,
  ProgramDetailScreen,
} from "../screens";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../utils/hooks";
import { useTranslation } from "react-i18next";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  // Hook mới không cần fetchNotifications vì đã tự động subscribe
  // const { fetchNotifications } = useNotifications();

  // useEffect(() => {
  //   fetchNotifications(1, true);
  // }, []);

  const BottomTabs = () => {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: true,
          header: (props) => <CustomHeader {...props} />,
          headerStyle: styles.headerStyle,
          headerStatusBarHeight: 0,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let iconSize = route.name === "AppointmentMain" ? 32 : 24;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Dashboard") {
              iconName = focused ? "stats-chart" : "stats-chart-outline";
            } else if (route.name === "CaseMain") {
              iconName = focused ? "document-text" : "document-text-outline";
            } else if (route.name === "ProfileMain") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },
          tabBarActiveTintColor: "#20734C",
          tabBarInactiveTintColor: "#6B7280",
          tabBarStyle: styles.tabBarStyle,
          tabBarLabelStyle: styles.tabBarLabelStyle,
          tabBarItemStyle: styles.tabBarItemStyle,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: t("tabs.home"),
          }}
        />
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: t("tabs.dashboard"),
          }}
        />
        <Tab.Screen
          name="CaseMain"
          component={CaseDetails}
          initialParams={{
            from: "tab",
            headerTitle: t("case.followUp"),
            subTitle: t("case.followUpSubtitle"),
            emptyTitle: t("case.empty"),
          }}
          options={{
            title: t("tabs.case"),
          }}
        />
        <Tab.Screen
          name="ProfileMain"
          component={ProfileScreen}
          options={{
            title: t("tabs.profile"),
          }}
        />
      </Tab.Navigator>
    );
  };

  const SurveyStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
        <Stack.Screen
          name="SurveyResult"
          options={{
            gestureEnabled: false,
            headerBackVisible: false,
          }}
          component={SurveyResultScreen}
        />
      </Stack.Navigator>
    );
  };

  const ProfileStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="EditProfile" component={UpdateProfileScreen} />
        <Stack.Screen name="MyChildren" component={MyChildrenScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="CalendarAccess" component={CalendarAccess} />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationSettingsScreen}
        />
        <Stack.Screen
          name="LanguageSettings"
          component={LanguageSettingsScreen}
        />
      </Stack.Navigator>
    );
  };

  const AppointmentStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Appointment" component={BookingScreen} />
        <Stack.Screen name="StatusScreen" component={StatusScreen} />
        <Stack.Screen
          name="AppointmentDetails"
          component={AppointmentDetailsScreen}
        />
        <Stack.Screen
          name="AppointmentRecord"
          component={AppointmentRecordScreen}
        />
        <Stack.Screen
          name="AppointmentRecordDetail"
          component={AppointmentRecordDetailScreen}
        />
      </Stack.Navigator>
    );
  };

  const BlogStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Blog" component={BlogScreen} />
        <Stack.Screen name="BlogDetails" component={BlogDetails} />
      </Stack.Navigator>
    );
  };

  const ProgramStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Program" component={ProgramListScreen} />
        <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
        <Stack.Screen name="ProgramRecord" component={ProgramRecordScreen} />
      </Stack.Navigator>
    );
  };

  const EventStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="Event"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Event" component={EventScreen} />
        <Stack.Screen name="EventList" component={EventList} />
      </Stack.Navigator>
    );
  };

  const CaseStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ClosedCases" component={ClosedCases} />
        <Stack.Screen name="CaseDetails" component={CaseDetails} />
      </Stack.Navigator>
    );
  };

  const CustomHeader = (props) => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
    </View>
  );

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="MainBottomTabs" component={BottomTabs} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Event" component={EventStack} />
      <Stack.Screen name="Case" component={CaseStack} />
      <Stack.Screen name="Record" component={RecordScreen} />
      <Stack.Screen name="Survey" component={SurveyStack} />
      <Stack.Screen name="Appointment" component={AppointmentStack} />
      <Stack.Screen name="Program" component={ProgramStack} />
      <Stack.Screen name="Profile" component={ProfileStack} />
      <Stack.Screen name="Blog" component={BlogStack} />
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: "center",
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#20734C",
  },
  tabBarStyle: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    height: 90,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabBarItemStyle: {
    paddingVertical: 8,
  },
});

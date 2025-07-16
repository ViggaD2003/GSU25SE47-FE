import React from "react";
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
} from "../screens";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const BottomTabs = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          header: () => <CustomHeader />,
          headerStyle: styles.headerStyle,
          headerStatusBarHeight: 0,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            let iconSize = route.name === "AppointmentMain" ? 32 : 24;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "BlogMain") {
              iconName = focused ? "library" : "library-outline";
            } else if (route.name === "RecordMain") {
              iconName = focused ? "folder" : "folder-outline";
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
            title: "Home",
          }}
        />
        <Tab.Screen
          name="BlogMain"
          component={BlogScreen}
          options={{
            title: "Blog",
          }}
        />
        <Tab.Screen
          name="AppointmentMain"
          component={BookingScreen}
          options={{
            tabBarShowLabel: false,
            tabBarLabelStyle: { display: "none" },
            tabBarStyle: [styles.tabBarStyle, styles.appointmentTabStyle],
            tabBarButton: () => (
              <TouchableOpacity
                style={styles.appointmentTabContainer}
                onPress={() => navigation.navigate("Appointment")}
              >
                <View style={styles.appointmentTabButton}>
                  <Ionicons name="calendar-outline" size={36} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen
          name="RecordMain"
          component={RecordScreen}
          options={{
            title: "Records",
          }}
        />
        <Tab.Screen
          name="ProfileMain"
          component={ProfileScreen}
          options={{
            title: "Profile",
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
      </Stack.Navigator>
    );
  };

  const AppointmentStack = () => {
    return (
      <Stack.Navigator
        initialRouteName="Appointment"
        screenOptions={{ headerShown: false }}
      >
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
      </Stack.Navigator>
    );
  };

  const BlogStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BlogDetails" component={BlogDetails} />
      </Stack.Navigator>
    );
  };

  const ProgramStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProgramRecord" component={ProgramRecordScreen} />
      </Stack.Navigator>
    );
  };

  const CustomHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
    </View>
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainBottomTabs" component={BottomTabs} />
      <Stack.Screen name="Home" component={HomeScreen} />
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
  tabBarStyle: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    // height: 70,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  tabBarItemStyle: {
    paddingVertical: 8,
  },
  appointmentTabContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  appointmentTabButton: {
    backgroundColor: "#20734C",
    width: 70,
    height: 70,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#20734C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appointmentTabItem: {
    // paddingVertical: 8,
  },
  appointmentTabStyle: {
    // Additional styles for appointment tab if needed
  },
});

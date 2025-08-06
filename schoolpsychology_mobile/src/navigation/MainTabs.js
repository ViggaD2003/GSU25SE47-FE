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
} from "../screens";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import useNotifications from "@/hooks/useNotifications";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { fetchNotifications } = useNotifications();

  useEffect(() => {
    fetchNotifications(1, true);
  }, []);

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
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Dashboard",
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
        <Stack.Screen name="ProgramRecord" component={ProgramRecordScreen} />
      </Stack.Navigator>
    );
  };

  const CustomHeader = (props) => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {/* <View style={styles.headerContent}>
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{props.route.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <NotificationBadge
            onPress={() => navigation.navigate("Notification")}
            size={24}
            iconColor="#20734C"
          />
        </View>
      </View> */}
    </View>
  );

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, gestureEnabled: false }}
    >
      <Stack.Screen name="MainBottomTabs" component={BottomTabs} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
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

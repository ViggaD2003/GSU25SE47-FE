import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../pages/Home/HomeScreen";
import ProfileScreen from "../pages/Profile/ProfileScreen";
import BlogScreen from "../pages/Blog/BlogScreen";
import NotificationScreen from "../pages/Notification/NotificationScreen";
import { FontAwesome } from "@expo/vector-icons";
import { GlobalStyles } from "../contants/styles";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UpdateProfile from "../pages/Profile/UpdateProfile";
import MyChildren from "../pages/Profile/MyChildren";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const Stack = createNativeStackNavigator();

  const ProfileStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={UpdateProfile} />
        <Stack.Screen name="MyChildren" component={MyChildren} />
      </Stack.Navigator>
    );
  }


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Blog") {
            iconName = "book";
          } else if (route.name === "Notification") {
            iconName = "bell";
          } else if (route.name === "Profile") {
            iconName = "user";
          }
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: GlobalStyles.colors.primary,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Blog" component={BlogScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

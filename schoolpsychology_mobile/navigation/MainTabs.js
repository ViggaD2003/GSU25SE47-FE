import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../pages/Home/HomeScreen";
import ProfileScreen from "../pages/Profile/ProfileScreen";
import BlogScreen from "../pages/Blog/BlogScreen";
import NotificationScreen from "../pages/Notification/NotificationScreen";
import { FontAwesome } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UpdateProfile from "../pages/Profile/UpdateProfile";
import MyChildren from "../pages/Profile/MyChildren";
import { useAuth } from "../context/AuthContext";
import { Text, View } from "react-native-web";
import { StyleSheet } from "react-native";
import { GlobalStyles } from "../constants";
import ChangePassword from "../pages/Profile/ChangePassword";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const Stack = createNativeStackNavigator();

  const ProfileStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={UpdateProfile} />
        <Stack.Screen name="MyChildren" component={MyChildren} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
      </Stack.Navigator>
    );
  };

  const { user } = useAuth();

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
        tabBarShowLabel: false,
        headerShown: false,
        headerTitle: () => (
          <View>
            <Text style={styles.roleText}>{user.role.toLowerCase()}</Text>
          </View>
        ),
        headerStyle: styles.headerStyle,
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Blog" component={BlogScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "light",
  },
  headerStyle: {
    borderBottomWidth: 0,
  },
  tabBarStyle: {
    borderTopWidth: 0,
    height: 60,
    paddingTop: 10,
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
    elevation: 5,
  },
});

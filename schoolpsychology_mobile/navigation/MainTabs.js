import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";
import { EvilIcons } from "@expo/vector-icons";
import { Badge } from "react-native-paper";

// Import screens
import HomeScreen from "../pages/Home/HomeScreen";
import ProfileScreen from "../pages/Profile/ProfileScreen";
import BlogScreen from "../pages/Blog/BlogScreen";
import NotificationScreen from "../pages/Notification/NotificationScreen";
import UpdateProfile from "../pages/Profile/UpdateProfile";
import MyChildren from "../pages/Profile/MyChildren";
import ChangePassword from "../pages/Profile/ChangePassword";
import SurveyRecord from "../pages/Survey/SurveyRecord";
import SurveyInfo from "../pages/Survey/SurveyInfo";
import SurveyDetails from "../pages/Survey/SurveyDetails";
import SurveyResult from "../pages/Survey/SurveyResult";

// Import context
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function MainTabs() {
  const [messageCount, setMessageCount] = useState(3);
  const { user } = useAuth();
  const navigation = useNavigation();

  const SurveyStack = () => {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SurveyMain" component={SurveyRecord} />
        <Stack.Screen name="SurveyRecord" component={SurveyRecord} />
        <Stack.Screen name="SurveyInfo" component={SurveyInfo} />
        <Stack.Screen name="SurveyDetails" component={SurveyDetails} />
        <Stack.Screen name="SurveyResult" component={SurveyResult} />
      </Stack.Navigator>
    );
  };

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

  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerStyle: styles.headerStyle,
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile")}
              style={styles.headerLeft}
            >
              <Text style={styles.nameText}>{user?.fullname || "User"}</Text>
              <Text style={styles.roleText}>
                {user?.role?.toLowerCase() || "user"}
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleNotificationPress}
              >
                <View style={styles.notificationContainer}>
                  <EvilIcons name="bell" size={24} color="#333" />
                  <Badge
                    visible={messageCount > 0}
                    style={styles.notificationBadge}
                  >
                    {messageCount}
                  </Badge>
                </View>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="Notification"
        // options={{ headerShown: false }}
        component={NotificationScreen}
      />
      <Stack.Screen
        name="Blog"
        options={{ headerShown: false }}
        component={BlogScreen}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Survey"
        options={{ headerShown: false }}
        component={SurveyStack}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerLeft: {
    paddingLeft: 20,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "300",
    color: "#666",
  },
  headerRight: {
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4757",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});

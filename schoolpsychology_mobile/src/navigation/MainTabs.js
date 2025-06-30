import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Text, View, TouchableOpacity, Image } from "react-native";
import { StyleSheet } from "react-native";
import { EvilIcons, Ionicons } from "@expo/vector-icons";
import { Badge } from "react-native-paper";
import { useAuth } from "../contexts";
import {
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
import { GlobalStyles } from "../constants";

const Stack = createNativeStackNavigator();

export default function MainTabs() {
  const [messageCount, setMessageCount] = useState(3);
  const { user } = useAuth();
  const navigation = useNavigation();
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

  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

  const CustomHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      {/* Left side - User info */}
      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={styles.userSection}
      >
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.greetingText}>Good morning</Text>
          <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
        </View>
      </TouchableOpacity>

      {/* Right side - Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleNotificationPress}
        >
          <View style={styles.notificationContainer}>
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            {messageCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {messageCount > 9 ? "9+" : messageCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: true,
          header: () => <CustomHeader />,
          headerStyle: styles.headerStyle,
          headerStatusBarHeight: 0,
        }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          headerShown: true,
          headerTitle: "Notifications",
          headerTitleStyle: styles.screenHeaderTitle,
          headerStyle: styles.headerStyle,
        }}
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
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
});

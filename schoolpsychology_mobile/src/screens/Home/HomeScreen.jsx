import React, { useState } from "react";
import { Container } from "../../components";
import Toast from "../../components/common/Toast";
import { useAuth } from "../../contexts";
import StudentHome from "./StudentHome";
import ParentHome from "./ParentHome";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { GlobalStyles } from "../../constants";
import { Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

// const isLargeDevice = width >= 414;

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>Good morning</Text>
            <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
          </View>
        </View>
        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.notificationContainer}>
              <Ionicons name="settings-outline" size={24} color="#374151" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View>
        {user.role === "STUDENT" ? (
          <StudentHome
            user={user}
            navigation={navigation}
            setShowToast={setShowToast}
            setToastMessage={setToastMessage}
            setToastType={setToastType}
          />
        ) : (
          <ParentHome
            user={user}
            navigation={navigation}
            setShowToast={setShowToast}
            setToastMessage={setToastMessage}
            setToastType={setToastType}
          />
        )}
      </View>
      <Toast message={toastMessage} type={toastType} visible={showToast} />
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    elevation: 0,
    shadowOpacity: 0.1,
    borderBottomWidth: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 1 },
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
    gap: 10,
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

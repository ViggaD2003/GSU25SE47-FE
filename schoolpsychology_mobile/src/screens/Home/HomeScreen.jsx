import React, { useState } from "react";
import { Container } from "../../components";
import { Toast } from "../../components";
import { useAuth } from "../../contexts";
import StudentHome from "./StudentHome";
import ParentHome from "./ParentHome";
import { StyleSheet, View } from "react-native";
import { GlobalStyles } from "../../constants";
import { Text } from "react-native-paper";
import { NotificationBadge } from "../../components/common";
import { useTranslation } from "react-i18next";
import { useNotifications } from "@/utils";
import { useFocusEffect } from "@react-navigation/native";

// const isLargeDevice = width >= 414;

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const { unreadCount, refreshNotifications } = useNotifications();

  useFocusEffect(
    React.useCallback(() => {
      refreshNotifications();
    }, [])
  );

  // console.log("user", user);

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return null;
  }

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
            <Text style={styles.greetingText}>{t("home.welcomeBack")}</Text>
            <Text style={styles.nameText}>{user?.fullName || "User"}</Text>
          </View>
        </View>

        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          <NotificationBadge
            unreadCount={unreadCount}
            onPress={() => navigation.navigate("Notification")}
            size={24}
            iconColor="#A7A7A7FF"
          />
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
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
    shadowOpacity: 0.03,
    borderBottomWidth: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 20 },
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 20,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  actionsSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 10,
  },
  childSelectorContainer: {
    marginRight: 8,
  },
  headerChildSelector: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 6,
  },
});

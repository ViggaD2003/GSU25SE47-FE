import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Container } from "../../components";
import { useAuth } from "../../contexts";
import { GlobalStyles } from "../../constants";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";
import { useTranslation } from "react-i18next";

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { logout, user, loading: authLoading, refreshUser } = useAuth();

  // Show loading state while auth is loading
  if (authLoading || !user) {
    return null;
  }

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // AuthContext will handle the state update and navigation
    } catch (error) {
      console.error("Logout error:", error);
      // Still logout locally even if API call fails
      await logout();
    }
  };

  const navigateToEditProfile = () => {
    navigation.navigate("Profile", {
      screen: "UpdateProfile",
      params: { profileData: user },
    });
  };

  const navigateToMyChildren = () => {
    navigation.navigate("Profile", {
      screen: "MyChildren",
      params: {
        data: user.relationships,
        onRefresh: refreshUser,
      },
    });
  };

  return (
    <Container>
      {/* Header */}
      <HeaderWithTab
        title={t("tabs.profile")}
        subtitle={t("profile.subtitle")}
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={authLoading}
            onRefresh={refreshUser}
            colors={["#10B981"]}
          />
        }
        style={{ paddingHorizontal: 20 }}
      >
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.fullName}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* Menu List */}
          <View style={styles.menuList}>
            <MenuItem
              icon="account-edit"
              label={t("profile.edit")}
              onPress={navigateToEditProfile}
            />
            {user?.role === "PARENTS" && (
              <MenuItem
                icon="baby-face-outline"
                label={t("profile.myChildren")}
                onPress={navigateToMyChildren}
              />
            )}
            <MenuItem
              icon="cog-outline"
              label={t("profile.settings")}
              onPress={() => setShowSettingsDropdown(!showSettingsDropdown)}
            />
            {showSettingsDropdown && (
              <View
                style={{ paddingLeft: 36, borderRadius: 8, marginBottom: 4 }}
              >
                <MenuItem
                  icon="lock-reset"
                  label={t("profile.changePassword")}
                  onPress={() =>
                    navigation.navigate("Profile", { screen: "ChangePassword" })
                  }
                />
                <MenuItem
                  icon="calendar-outline"
                  label={t("profile.calendarAccess")}
                  onPress={() =>
                    navigation.navigate("Profile", { screen: "CalendarAccess" })
                  }
                />
                {/* <MenuItem
                  icon="bell-outline"
                  label={t("profile.notificationSettings")}
                  onPress={() =>
                    navigation.navigate("Profile", {
                      screen: "NotificationSettings",
                    })
                  }
                /> */}
                <MenuItem
                  icon="translate"
                  label={t("profile.languageSettings")}
                  onPress={() =>
                    navigation.navigate("Profile", {
                      screen: "LanguageSettings",
                    })
                  }
                />
              </View>
            )}

            {/* Logout */}
            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <Icon name="power" size={24} color="#F44336" />
              <Text style={styles.logoutText}>{t("profile.logout")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress}>
      <Icon name={icon} size={22} color="#181A3D" style={{ width: 28 }} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon
        name="chevron-right"
        size={22}
        color="#181A3D"
        style={{ marginLeft: "auto" }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "600",
  },
  name: {
    fontSize: 22,
    fontWeight: "500",
    marginTop: 8,
    color: "#181A3D",
    textAlign: "center",
  },
  email: {
    fontSize: 15,
    color: "#888",
    marginBottom: 18,
    textAlign: "center",
  },
  menuList: {
    width: "100%",
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuLabel: {
    fontSize: 16,
    color: "#181A3D",
    marginLeft: 12,
    flex: 1,
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 8,
    borderTopColor: "#F0F0F0",
    width: "100%",
  },
  logoutText: {
    fontSize: 16,
    color: "#F44336",
    marginLeft: 12,
    fontWeight: "500",
  },
});

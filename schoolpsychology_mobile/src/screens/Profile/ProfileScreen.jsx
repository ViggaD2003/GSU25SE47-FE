import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";
import { api } from "../../services";
import { useAuth } from "../../contexts";
import { useNavigation } from "@react-navigation/native";
import { GlobalStyles } from "../../constants";

export default function ProfileScreen() {
  const [profile, setProfile] = useState({});
  const { logout, user } = useAuth();
  const navigation = useNavigation();
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

  const handleBackPress = () => {
    navigation.goBack();
  };

  const onRefresh = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/account");

      // console.log("response", response);
      setProfile(response.data);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error("Profile fetch error:", msg);
    }
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const navigateToEditProfile = () => {
    navigation.navigate("EditProfile", { data: profile });
  };

  const navigateToMyChildren = () => {
    navigation.navigate("MyChildren", {
      data: profile.relationships,
      onRefresh,
    });
  };

  const navigateToSurveyRecords = () => {
    navigation.navigate("Survey", {
      screen: "SurveyRecord",
    });
  };

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>
              {profile?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.email}>{profile.email}</Text>

          {/* Menu List */}
          <View style={styles.menuList}>
            <MenuItem
              icon="account-edit"
              label="Edit Profile"
              onPress={navigateToEditProfile}
            />
            {user.role === "PARENTS" && (
              <MenuItem
                icon="baby-face-outline"
                label="My Children"
                onPress={navigateToMyChildren}
              />
            )}

            {user.role === "STUDENT" && (
              <MenuItem
                icon="clipboard-text-outline"
                label="Survey Records"
                onPress={navigateToSurveyRecords}
              />
            )}

            <MenuItem
              icon="cog-outline"
              label="Settings"
              onPress={() => setShowSettingsDropdown(!showSettingsDropdown)}
            />
            {showSettingsDropdown && (
              <View
                style={{ paddingLeft: 36, borderRadius: 8, marginBottom: 4 }}
              >
                <MenuItem
                  icon="lock-reset"
                  label="Change Password"
                  onPress={() => navigation.navigate("ChangePassword")}
                />
                <MenuItem
                  icon="calendar-outline"
                  label="Calendar Access"
                  onPress={() => navigation.navigate("CalendarAccess")}
                />
              </View>
            )}
            <MenuItem icon="help-circle-outline" label="Need Help?" />

            {/* Logout */}
            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <Icon name="power" size={24} color="#F44336" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerSpacer: {
    width: 40,
  },
  card: {
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 8,
    alignItems: "center",
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
    elevation: 4,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: "50%",
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

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { useAuth } from "../../contexts";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;

export default function ParentHome({ navigation }) {
  const { user } = useAuth();
  const [messageCount, setMessageCount] = useState(3);
  const [selectedChild, setSelectedChild] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Set default selected child when component mounts or user changes
  useEffect(() => {
    if (user?.children && user.children.length > 0) {
      setSelectedChild(user.children[0]);
    }
  }, [user]);

  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Add refresh logic here if needed
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Profile")}
          style={styles.userSection}
        >
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || "P"}
              </Text>
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greetingText}>Good morning</Text>
            <Text style={styles.nameText}>{user?.fullName || "Parent"}</Text>
          </View>
        </TouchableOpacity>

        {/* Right side - Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationPress}
          >
            <View style={styles.notificationContainer}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#374151"
              />
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Child Selection Header */}
        {user?.children && user.children.length > 1 && (
          <View style={styles.childSelectionContainer}>
            <Text style={styles.childSelectionTitle}>Select Child</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.childSelectionScroll}
            >
              {user.children.map((child, index) => (
                <TouchableOpacity
                  key={child.userId}
                  style={[
                    styles.childOption,
                    selectedChild?.userId === child.userId &&
                      styles.childOptionActive,
                  ]}
                  onPress={() => handleChildSelect(child)}
                >
                  <View style={styles.childAvatarContainer}>
                    <Text style={styles.childAvatarText}>
                      {child.fullName?.charAt(0)?.toUpperCase() || "C"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.childName,
                      selectedChild?.userId === child.userId &&
                        styles.childNameActive,
                    ]}
                    numberOfLines={1}
                  >
                    {child.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Selected Child Info */}
        {selectedChild && (
          <View style={styles.selectedChildContainer}>
            <View style={styles.selectedChildHeader}>
              <View style={styles.selectedChildAvatar}>
                <Text style={styles.selectedChildAvatarText}>
                  {selectedChild.fullName?.charAt(0)?.toUpperCase() || "C"}
                </Text>
              </View>
              <View style={styles.selectedChildInfo}>
                <Text style={styles.selectedChildName}>
                  {selectedChild.fullName}
                </Text>
                <Text style={styles.selectedChildStatus}>
                  {selectedChild.isEnable ? "Active" : "Inactive"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Content placeholder */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentTitle}>Child Dashboard</Text>
          <Text style={styles.contentDescription}>
            {selectedChild
              ? `Viewing information for ${selectedChild.fullName}`
              : "Please select a child to view their information"}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    elevation: 0,
    shadowOpacity: 0.1,
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
  scrollContainer: {
    paddingTop: 13,
    paddingHorizontal: 24,
  },
  childSelectionContainer: {
    marginBottom: 24,
  },
  childSelectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  childSelectionScroll: {
    gap: 12,
    paddingRight: 20,
  },
  childOption: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: 100,
  },
  childOptionActive: {
    backgroundColor: "#E0F2FE",
    borderColor: GlobalStyles.colors.primary,
  },
  childAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  childAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  childName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
  },
  childNameActive: {
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  selectedChildContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  selectedChildHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedChildAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  selectedChildAvatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  selectedChildInfo: {
    flex: 1,
  },
  selectedChildName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  selectedChildStatus: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  contentDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
});

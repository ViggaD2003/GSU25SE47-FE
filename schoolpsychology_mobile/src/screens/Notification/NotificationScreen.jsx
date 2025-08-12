import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNotifications } from "../../utils/hooks";
import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useRealTime } from "@/contexts";
import WebSocketDebug from "@/components/common/WebSocketDebug";
import { useTranslation } from "react-i18next";

const NotificationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    notifications,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    unreadCount,
    totalCount,
  } = useNotifications();

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    console.log("🔄 NotificationScreen: Manual refresh triggered");
    try {
      await refreshNotifications();
    } catch (error) {
      console.error("❌ NotificationScreen: Refresh failed:", error);
      Alert.alert(t("common.errorTitle"), t("notifications.refreshFailed"));
    }
  }, [refreshNotifications]);

  // Handle manual refresh button
  const handleManualRefresh = useCallback(async () => {
    console.log("🔄 NotificationScreen: Manual refresh button pressed");
    try {
      await refreshNotifications();
    } catch (error) {
      console.error("❌ NotificationScreen: Manual refresh failed:", error);
      Alert.alert(t("common.errorTitle"), t("notifications.refreshFailed"));
    }
  }, [refreshNotifications]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        await markAsRead(notificationId);
      } catch (error) {
        console.error(
          "❌ NotificationScreen: Error marking notification as read:",
          error
        );
        Alert.alert(t("common.errorTitle"), t("notifications.markReadFailed"));
      }
    },
    [markAsRead]
  );

  // Handle notification tap
  const handleNotificationPress = useCallback(
    async (notification) => {
      console.log("📱 NotificationScreen: Notification pressed:", {
        id: notification.id,
        type: notification.type,
        title: notification.title,
      });

      try {
        // Mark as read if not already read
        if (!notification.isRead) {
          await handleMarkAsRead(notification.id);
        }

        // Navigate based on type
        switch (notification.type) {
          case "case":
            navigation.navigate("CaseDetails", {
              caseId: notification.relatedEntityId || notification.caseId,
            });
            break;
          case "appointment":
            navigation.navigate("AppointmentDetails", {
              appointmentId:
                notification.relatedEntityId || notification.appointmentId,
            });
            break;
          case "survey":
            navigation.navigate("SurveyTaking", {
              surveyId: notification.relatedEntityId || notification.surveyId,
            });
            break;
          case "program":
            navigation.navigate("ProgramDetails", {
              programId: notification.relatedEntityId || notification.programId,
            });
            break;
          case "message":
            console.log("💬 Message notification:", notification);
            Alert.alert(
              t("notifications.messageTitle"),
              notification.content || notification.body
            );
            break;
          case "general":
            console.log("📢 General notification:", notification);
            Alert.alert(
              t("notifications.generalTitle"),
              notification.content || notification.body
            );
            break;
          default:
            console.log("❓ Unknown notification type:", notification.type);
            Alert.alert(
              t("notifications.generalTitle"),
              notification.content || notification.body
            );
            break;
        }
      } catch (error) {
        console.error(
          "❌ NotificationScreen: Error handling notification press:",
          error
        );
        Alert.alert(t("common.errorTitle"), t("notifications.processFailed"));
      }
    },
    [handleMarkAsRead, navigation]
  );

  // Render notification item
  const renderNotificationItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.content} numberOfLines={2}>
            {item.body || item.content}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={styles.timeAgo}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            <View style={styles.typeContainer}>
              <MaterialIcons
                name={item.typeIcon || getNotificationIcon(item.type)}
                size={16}
                color="#666"
              />
              <Text style={styles.typeText}>
                {getNotificationTypeLabel(item.type)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleNotificationPress]
  );

  // Get notification icon
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case "appointment":
        return "event";
      case "survey":
        return "assignment";
      case "program":
        return "school";
      case "case":
        return "folder";
      case "message":
        return "message";
      case "general":
        return "notifications";
      default:
        return "notifications";
    }
  }, []);

  // Get notification type label
  const getNotificationTypeLabel = useCallback((type) => {
    switch (type) {
      case "appointment":
        return t("notifications.types.appointment");
      case "survey":
        return t("notifications.types.survey");
      case "program":
        return t("notifications.types.program");
      case "case":
        return t("notifications.types.case");
      case "message":
        return t("notifications.types.message");
      case "general":
        return t("notifications.types.general");
      default:
        return t("notifications.types.notification");
    }
  }, []);

  // Render empty state
  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="notifications-none" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Không có thông báo</Text>
        <Text style={styles.emptySubtitle}>
          Bạn sẽ nhận được thông báo khi có hoạt động mới
        </Text>
      </View>
    ),
    []
  );

  // Render error state
  const renderErrorState = useCallback(
    () => (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Lỗi tải thông báo</Text>
        <Text style={styles.errorSubtitle}>
          {error || "Đã xảy ra lỗi khi tải thông báo"}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    ),
    [error, handleRefresh]
  );

  // Memoize the refreshControl
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={handleRefresh}
        colors={["#007AFF"]}
        tintColor="#007AFF"
        progressBackgroundColor="#ffffff"
        size="large"
      />
    ),
    [isLoading, handleRefresh]
  );

  // Memoize the getItemLayout function
  const getItemLayout = useMemo(
    () => (data, index) => ({
      length: 100, // Approximate height of each item
      offset: 100 * index,
      index,
    }),
    []
  );

  // Create unique key extractor
  const keyExtractor = useMemo(
    () => (item, index) => {
      if (item.id) {
        return `notification-${item.id}`;
      }
      // Fallback for items without ID
      return `notification-fallback-${index}-${item.createdAt || Date.now()}`;
    },
    []
  );

  // Memoize contentContainerStyle
  const contentContainerStyle = useMemo(
    () => [styles.listContainer, notifications.length === 0 && { flex: 1 }],
    [notifications.length]
  );

  // Show loading screen only for initial load
  if (isLoading && notifications.length === 0) {
    return (
      <Container>
        <HeaderWithoutTab
          title="Thông báo"
          onBackPress={() => navigation.goBack()}
          showRefreshButton={false}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          <Text style={styles.loadingSubtext}>Vui lòng chờ trong giây lát</Text>
        </View>
      </Container>
    );
  }

  // Show error state
  if (error && notifications.length === 0) {
    return (
      <Container>
        <HeaderWithoutTab
          title="Thông báo"
          onBackPress={() => navigation.goBack()}
          showRefreshButton={true}
          onRefresh={handleManualRefresh}
          refreshing={false}
        />
        {renderErrorState()}
      </Container>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title={`Thông báo ${unreadCount > 0 ? `(${unreadCount})` : ""}`}
        onBackPress={() => navigation.goBack()}
        showRefreshButton={true}
        onRefresh={handleManualRefresh}
        refreshing={isLoading}
      />

      {/* Connection Status Indicator */}
      {/* <View style={styles.connectionStatusContainer}>
        <View style={styles.connectionStatusRow}>
          <View
            style={[
              styles.connectionDot,
              { backgroundColor: isWebSocketConnected ? "#28a745" : "#dc3545" },
            ]}
          />
          <Text style={styles.connectionStatusText}>
            {isWebSocketConnected ? "Kết nối thời gian thực" : "Không kết nối"}
          </Text>
        </View>
        <Text style={styles.connectionStatusDetail}>
          {totalCount} thông báo • {unreadCount} chưa đọc
        </Text>
      </View> */}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={getItemLayout}
        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
        onError={(error) => {
          console.error("❌ FlatList error:", error);
        }}
      />

      {/* WebSocket Debug Component - Only in development */}
      {/* <WebSocketDebug /> */}
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  markAllButton: {
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#007AFF",
    borderRadius: 16,
  },
  markAllText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  connectionStatusContainer: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  connectionStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#495057",
  },
  connectionStatusDetail: {
    fontSize: 10,
    color: "#6c757d",
    marginLeft: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  notificationItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    backgroundColor: "#f8f9ff",
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "bold",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginLeft: 8,
  },
  content: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeAgo: {
    fontSize: 12,
    color: "#adb5bd",
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#adb5bd",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  connectionWarning: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  connectionWarningText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#856404",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc3545",
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: "#adb5bd",
  },
});

export default React.memo(NotificationScreen);

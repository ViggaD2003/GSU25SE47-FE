import React, { useCallback } from "react";
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
import {
  useNotifications,
  NOTIFICATION_TYPES,
} from "../../hooks/useNotifications";
import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";

const NotificationScreen = ({ navigation }) => {
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    hasMore,
    fetchNotifications,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    getNotificationIcon,
    getNotificationType,
    NOTIFICATION_TYPES,
  } = useNotifications();

  // Handle pull to refresh
  const handleRefresh = useCallback(() => {
    refresh().catch((error) => {
      Alert.alert("Lỗi", "Không thể tải thông báo. Vui lòng thử lại.");
    });
  }, [refresh]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    loadMore().catch((error) => {
      console.error("Error loading more notifications:", error);
    });
  }, [loadMore]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        await markAsRead(notificationId);
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    },
    [markAsRead]
  );

  // Handle notification tap
  const handleNotificationPress = useCallback(
    (notification) => {
      // Mark as read if not already read
      if (!notification.isRead) {
        handleMarkAsRead(notification.id);
      }

      // Navigate based on notification_type
      switch (notification.notification_type) {
        case NOTIFICATION_TYPES.CASE:
          navigation.navigate("CaseDetails", {
            caseId: notification.relatedEntityId,
          });
          break;
        case NOTIFICATION_TYPES.APPOINTMENT:
          navigation.navigate("AppointmentDetails", {
            appointmentId: notification.relatedEntityId,
          });
          break;
        case NOTIFICATION_TYPES.SURVEY:
          navigation.navigate("SurveyTaking", {
            surveyId: notification.relatedEntityId,
          });
          break;
        case NOTIFICATION_TYPES.PROGRAM:
          navigation.navigate("ProgramDetails", {
            programId: notification.relatedEntityId,
          });
          break;
        case NOTIFICATION_TYPES.MESSAGE:
          // Handle message notifications
          console.log("Message notification:", notification);
          break;
        default:
          // Handle other notification types
          console.log(
            "Unknown notification type:",
            notification.notification_type
          );
          break;
      }
    },
    [handleMarkAsRead, navigation, NOTIFICATION_TYPES]
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đánh dấu tất cả đã đọc.");
    }
  }, [markAllAsRead]);

  // Focus effect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotifications(1, true).catch((error) => {
        console.error("Error fetching notifications on focus:", error);
      });
    }, [fetchNotifications])
  );

  // Render notification item
  const renderNotificationItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[styles.notificationItem, item.isNew && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.title, item.isNew && styles.unreadTitle]}>
              {item.title}
            </Text>
            {item.isNew && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.content} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.notificationFooter}>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            <View style={styles.typeContainer}>
              <MaterialIcons
                name={getNotificationIcon(item.notificationType)}
                size={16}
                color="#666"
              />
              <Text style={styles.typeText}>
                {getNotificationTypeLabel(item.notification_type)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleNotificationPress, getNotificationIcon]
  );

  // Get notification type label
  const getNotificationTypeLabel = useCallback(
    (notificationType) => {
      switch (notificationType) {
        case NOTIFICATION_TYPES.APPOINTMENT:
          return "Lịch hẹn";
        case NOTIFICATION_TYPES.SURVEY:
          return "Khảo sát";
        case NOTIFICATION_TYPES.PROGRAM:
          return "Chương trình";
        case NOTIFICATION_TYPES.CASE:
          return "Hồ sơ";
        case NOTIFICATION_TYPES.MESSAGE:
          return "Tin nhắn";
        case NOTIFICATION_TYPES.SYSTEM:
          return "Hệ thống";
        default:
          return "Thông báo";
      }
    },
    [NOTIFICATION_TYPES]
  );

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

  // Render header
  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <Text style={styles.markAllText}>Đánh dấu đã đọc</Text>
            </TouchableOpacity>
          )}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    ),
    [unreadCount, handleMarkAllAsRead]
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <Container>
      <HeaderWithoutTab
        title="Notification"
        onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
      />

      {loading && !refreshing && hasMore && (
        <View style={styles.loadMoreContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
        </View>
      )}
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
  loadMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loadMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6c757d",
  },
});

export default NotificationScreen;

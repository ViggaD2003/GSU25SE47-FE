import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Container } from "@/components";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useRealTime } from "@/contexts";

const NotificationSettings = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    isConnected,
    connect,
    disconnect,
    connectionStatus,
    manualDisconnect,
    resetManualDisconnect,
  } = useRealTime();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    appointmentReminders: true,
    surveyNotifications: true,
    programUpdates: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const [connectionInfo, setConnectionInfo] = useState({
    lastConnected: null,
    connectionAttempts: 0,
    reconnectInterval: 5000,
  });

  useEffect(() => {
    // Load saved settings from storage
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Load from AsyncStorage
      // const savedSettings = await AsyncStorage.getItem('notificationSettings');
      // if (savedSettings) {
      //   setSettings(JSON.parse(savedSettings));
      // }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      // TODO: Save to AsyncStorage
      // await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleSetting = (key) => {
    let newSettings = { ...settings };

    // Logic phụ thuộc giữa các setting
    if (key === "pushNotifications") {
      const newValue = !settings.pushNotifications;
      newSettings.pushNotifications = newValue;

      // Nếu tắt push notifications, tắt tất cả các loại thông báo khác
      if (!newValue) {
        newSettings.appointmentReminders = false;
        newSettings.surveyNotifications = false;
        newSettings.programUpdates = false;
        newSettings.soundEnabled = false;
        newSettings.vibrationEnabled = false;
      }
    } else if (key === "emailNotifications") {
      newSettings.emailNotifications = !settings.emailNotifications;
    } else if (key === "appointmentReminders") {
      // Chỉ cho phép bật nếu push notifications đang bật
      if (settings.pushNotifications) {
        newSettings.appointmentReminders = !settings.appointmentReminders;
      }
    } else if (key === "surveyNotifications") {
      // Chỉ cho phép bật nếu push notifications đang bật
      if (settings.pushNotifications) {
        newSettings.surveyNotifications = !settings.surveyNotifications;
      }
    } else if (key === "programUpdates") {
      // Chỉ cho phép bật nếu push notifications đang bật
      if (settings.pushNotifications) {
        newSettings.programUpdates = !settings.programUpdates;
      }
    } else if (key === "soundEnabled") {
      // Chỉ cho phép bật nếu push notifications đang bật
      if (settings.pushNotifications) {
        newSettings.soundEnabled = !settings.soundEnabled;
      }
    } else if (key === "vibrationEnabled") {
      // Chỉ cho phép bật nếu push notifications đang bật
      if (settings.pushNotifications) {
        newSettings.vibrationEnabled = !settings.vibrationEnabled;
      }
    }

    saveSettings(newSettings);
  };

  const handleWebSocketToggle = async () => {
    if (isConnected) {
      Alert.alert("Ngắt kết nối", "Bạn có chắc muốn ngắt kết nối WebSocket?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Ngắt kết nối",
          style: "destructive",
          onPress: async () => {
            await disconnect();
            setConnectionInfo((prev) => ({
              ...prev,
              lastConnected: new Date(),
            }));

            // Tắt tất cả thông báo khi ngắt WebSocket
            const newSettings = {
              ...settings,
              pushNotifications: false,
              appointmentReminders: false,
              surveyNotifications: false,
              programUpdates: false,
              soundEnabled: false,
              vibrationEnabled: false,
            };
            saveSettings(newSettings);
          },
        },
      ]);
    } else {
      // Reset manual disconnect flag when manually connecting
      await resetManualDisconnect();
      connect();
      setConnectionInfo((prev) => ({
        ...prev,
        connectionAttempts: prev.connectionAttempts + 1,
      }));
    }
  };

  const getConnectionStatusColor = () => {
    if (manualDisconnect && connectionStatus === "disconnected") {
      return "#9C27B0"; // Purple for manual disconnect
    }

    switch (connectionStatus) {
      case "connected":
        return "#4CAF50";
      case "connecting":
        return "#FF9800";
      case "disconnected":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getConnectionStatusText = () => {
    if (manualDisconnect && connectionStatus === "disconnected") {
      return "Đã ngắt thủ công";
    }

    switch (connectionStatus) {
      case "connected":
        return "Đã kết nối";
      case "connecting":
        return "Đang kết nối...";
      case "disconnected":
        return "Đã ngắt kết nối";
      default:
        return "Không xác định";
    }
  };

  const SettingItem = ({
    title,
    subtitle,
    value,
    onToggle,
    icon,
    iconColor = "#666",
    disabled = false,
  }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingLeft}>
        <MaterialIcons
          name={icon}
          size={24}
          color={disabled ? "#BDBDBD" : iconColor}
        />
        <View style={styles.settingText}>
          <Text
            style={[
              styles.settingTitle,
              disabled && styles.settingTitleDisabled,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                styles.settingSubtitle,
                disabled && styles.settingSubtitleDisabled,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{
          false: disabled ? "#F5F5F5" : "#E0E0E0",
          true: disabled ? "#E8F5E8" : "#4CAF50",
        }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        disabled={disabled}
        style={styles.switch}
      />
    </View>
  );

  const ConnectionInfoItem = ({ title, value, icon, color = "#666" }) => (
    <View style={styles.infoItem}>
      <MaterialIcons name={icon} size={20} color={color} />
      <Text style={styles.infoTitle}>{title}:</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <Container>
      <HeaderWithoutTab
        title={t("profile.notificationSettings")}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <View style={{ marginLeft: "auto" }}>
            <LanguageSwitcher />
          </View>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* WebSocket Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kết nối WebSocket</Text>

          <View style={styles.connectionCard}>
            <View style={styles.connectionHeader}>
              <View style={styles.connectionStatus}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getConnectionStatusColor() },
                  ]}
                />
                <Text style={styles.connectionStatusText}>
                  {getConnectionStatusText()}
                </Text>
              </View>
              <Switch
                value={isConnected}
                onValueChange={handleWebSocketToggle}
                trackColor={{ false: "#E0E0E0", true: "#4CAF50" }}
                thumbColor={isConnected ? "#fff" : "#f4f3f4"}
              />
            </View>

            <View style={styles.connectionInfo}>
              <ConnectionInfoItem
                title="Trạng thái"
                value={getConnectionStatusText()}
                icon="wifi"
                color={getConnectionStatusColor()}
              />
              {manualDisconnect && connectionStatus === "disconnected" && (
                <View style={styles.manualDisconnectNote}>
                  <MaterialIcons
                    name="info-outline"
                    size={16}
                    color="#9C27B0"
                  />
                  <Text style={styles.manualDisconnectText}>
                    WebSocket sẽ không tự động kết nối lại
                  </Text>
                </View>
              )}
              <ConnectionInfoItem
                title="Lần kết nối cuối"
                value={
                  connectionInfo.lastConnected
                    ? connectionInfo.lastConnected.toLocaleString("vi-VN")
                    : "Chưa có"
                }
                icon="schedule"
              />
              <ConnectionInfoItem
                title="Số lần thử kết nối"
                value={connectionInfo.connectionAttempts.toString()}
                icon="refresh"
              />
            </View>
          </View>
        </View>

        {/* Notification Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loại thông báo</Text>

          {!settings.pushNotifications && (
            <View style={styles.disabledNote}>
              <MaterialIcons name="info-outline" size={16} color="#FF9800" />
              <Text style={styles.disabledNoteText}>
                Bật "Thông báo đẩy" để sử dụng các tùy chọn khác
              </Text>
            </View>
          )}

          <SettingItem
            title="Thông báo đẩy"
            subtitle="Nhận thông báo trên thiết bị"
            value={settings.pushNotifications}
            onToggle={() => toggleSetting("pushNotifications")}
            icon="notifications"
            iconColor="#FF6B6B"
          />

          <SettingItem
            title="Thông báo email"
            subtitle="Nhận thông báo qua email"
            value={settings.emailNotifications}
            onToggle={() => toggleSetting("emailNotifications")}
            icon="email"
            iconColor="#4ECDC4"
          />

          <SettingItem
            title="Nhắc nhở cuộc hẹn"
            subtitle="Thông báo trước cuộc hẹn"
            value={settings.appointmentReminders}
            onToggle={() => toggleSetting("appointmentReminders")}
            icon="event"
            iconColor="#45B7D1"
            disabled={!settings.pushNotifications}
          />

          <SettingItem
            title="Thông báo khảo sát"
            subtitle="Khảo sát mới và nhắc nhở"
            value={settings.surveyNotifications}
            onToggle={() => toggleSetting("surveyNotifications")}
            icon="quiz"
            iconColor="#96CEB4"
            disabled={!settings.pushNotifications}
          />

          <SettingItem
            title="Cập nhật chương trình"
            subtitle="Thông báo về chương trình mới"
            value={settings.programUpdates}
            onToggle={() => toggleSetting("programUpdates")}
            icon="school"
            iconColor="#FFEAA7"
            disabled={!settings.pushNotifications}
          />
        </View>

        {/* Notification Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn thông báo</Text>

          <SettingItem
            title="Âm thanh"
            subtitle="Phát âm thanh khi có thông báo"
            value={settings.soundEnabled}
            onToggle={() => toggleSetting("soundEnabled")}
            icon="volume-up"
            iconColor="#A29BFE"
            disabled={!settings.pushNotifications}
          />

          <SettingItem
            title="Rung"
            subtitle="Rung thiết bị khi có thông báo"
            value={settings.vibrationEnabled}
            onToggle={() => toggleSetting("vibrationEnabled")}
            icon="vibration"
            iconColor="#FD79A8"
            disabled={!settings.pushNotifications}
          />
        </View>

        {/* Test Connection Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            if (isConnected) {
              Alert.alert("Thành công", "Kết nối WebSocket đang hoạt động!");
            } else {
              Alert.alert("Lỗi", "WebSocket chưa được kết nối!");
            }
          }}
        >
          <MaterialIcons name="wifi" size={20} color="#fff" />
          <Text style={styles.testButtonText}>Kiểm tra kết nối</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
  },
  connectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  connectionStatusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
  },
  connectionInfo: {
    gap: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoTitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 8,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 2,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  manualDisconnectNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#9C27B010",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  manualDisconnectText: {
    fontSize: 12,
    color: "#9C27B0",
    marginLeft: 6,
    fontStyle: "italic",
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingTitleDisabled: {
    color: "#BDBDBD",
  },
  settingSubtitleDisabled: {
    color: "#E0E0E0",
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },
  disabledNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9800",
  },
  disabledNoteText: {
    fontSize: 12,
    color: "#E65100",
    marginLeft: 6,
    flex: 1,
  },
});

export default NotificationSettings;

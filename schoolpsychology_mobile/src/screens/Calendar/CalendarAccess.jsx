import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Modal,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "../../components";
import { useAuth } from "../../contexts";
import { useNavigation } from "@react-navigation/native";
import { GlobalStyles } from "../../constants";
import calendarService from "../../services/CalendarService";
import { getAppointmentHistory } from "@/services/api/AppointmentService";

export default function CalendarAccess() {
  const [calendarPermission, setCalendarPermission] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(15);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [tempReminderTime, setTempReminderTime] = useState("15");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    initializeCalendar();
  }, []);

  const initializeCalendar = async () => {
    try {
      await calendarService.initialize();
      const settings = calendarService.getSettings();
      setSyncEnabled(settings.syncEnabled);
      setAutoSync(settings.autoSync);
      setReminderEnabled(settings.reminderEnabled);
      setReminderTime(settings.reminderTime || 15);
      setCalendarPermission(await calendarService.checkPermissions());
    } catch (error) {
      console.error("Error initializing calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings = null) => {
    try {
      const settingsToSave = newSettings || {
        syncEnabled,
        autoSync,
        reminderEnabled,
        reminderTime,
      };

      console.log("Saving calendar settings:", settingsToSave);
      await calendarService.updateSettings(settingsToSave);
    } catch (error) {
      console.error("Error saving calendar settings:", error);
      throw error; // Re-throw để component có thể handle
    }
  };

  const requestCalendarPermission = async () => {
    try {
      const hasPermission = await calendarService.requestPermissions();
      setCalendarPermission(hasPermission);

      if (hasPermission) {
        Alert.alert(
          "Permission Granted",
          "Calendar access has been granted. You can now sync your appointments.",
          [{ text: "OK" }]
        );
        console.log("Calendar permission granted successfully");
        return true;
      } else {
        Alert.alert(
          "Permission Required",
          "Calendar access is required to sync your appointments. Please enable it in your device settings.",
          [
            { text: "Cancel", style: "destructive" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );
        console.log("Calendar permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting calendar permission:", error);
      return false;
    }
  };

  const handleSyncToggle = async (value) => {
    try {
      if (value && !calendarPermission) {
        const permissionGranted = await requestCalendarPermission();
        if (!permissionGranted) {
          console.log("Permission not granted, sync toggle cancelled");
          return;
        }
      }

      // Update state immediately for better UX
      setSyncEnabled(value);

      if (value) {
        Alert.alert(
          "Sync Enabled",
          "Your appointments will now be synced with your device calendar.",
          [{ text: "OK" }]
        );
      }

      // Save with new value
      await saveSettings({
        syncEnabled: value,
        autoSync,
        reminderEnabled,
        reminderTime,
      });
    } catch (error) {
      console.error("Error in handleSyncToggle:", error);
      // Revert the state if save failed
      setSyncEnabled(!value);
      Alert.alert("Error", "Failed to save sync settings. Please try again.");
    }
  };

  const handleAutoSyncToggle = async (value) => {
    try {
      // Update state immediately for better UX
      setAutoSync(value);

      // Save with new value
      await saveSettings({
        syncEnabled,
        autoSync: value,
        reminderEnabled,
        reminderTime,
      });
    } catch (error) {
      console.error("Error in handleAutoSyncToggle:", error);
      // Revert the state if save failed
      setAutoSync(!value);
      Alert.alert(
        "Error",
        "Failed to save auto sync settings. Please try again."
      );
    }
  };

  const handleReminderToggle = async (value) => {
    try {
      setReminderEnabled(value);
      await saveSettings({
        syncEnabled,
        autoSync,
        reminderEnabled: value,
        reminderTime,
      });
    } catch (error) {
      console.error("Error in handleReminderToggle:", error);
      // Revert the state if save failed
      setReminderEnabled(!value);
      Alert.alert(
        "Error",
        "Failed to save reminder settings. Please try again."
      );
    }
  };

  const openReminderModal = () => {
    setTempReminderTime(reminderTime.toString());
    setShowReminderModal(true);
  };

  const closeReminderModal = () => {
    setShowReminderModal(false);
  };

  const saveReminderTime = async () => {
    try {
      const time = parseInt(tempReminderTime);
      if (isNaN(time) || time < 1 || time > 1440) {
        Alert.alert(
          "Invalid Time",
          "Please enter a valid time between 1 and 1440 minutes."
        );
        return;
      }

      setReminderTime(time);
      await saveSettings({
        syncEnabled,
        autoSync,
        reminderEnabled,
        reminderTime: time,
      });
      closeReminderModal();
    } catch (error) {
      console.error("Error in saveReminderTime:", error);
      Alert.alert("Error", "Failed to save reminder time. Please try again.");
    }
  };

  const formatReminderTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} phút`;
    } else if (minutes === 60) {
      return "1 giờ";
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} giờ`;
      } else {
        return `${hours} giờ ${remainingMinutes} phút`;
      }
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} ngày`;
    }
  };

  const quickReminderOptions = [
    { label: "5 phút", value: 5 },
    { label: "15 phút", value: 15 },
    { label: "30 phút", value: 30 },
    { label: "1 giờ", value: 60 },
    { label: "2 giờ", value: 120 },
    { label: "1 ngày", value: 1440 },
  ];

  const selectQuickOption = (value) => {
    setTempReminderTime(value.toString());
  };

  const syncNow = async () => {
    if (!calendarPermission) {
      Alert.alert(
        "Permission Required",
        "Please grant calendar permission first.",
        [{ text: "OK" }]
      );
      return;
    }

    if (syncing) {
      console.log("Sync already in progress...");
      return;
    }

    try {
      setSyncing(true);
      console.log("Starting manual sync...");

      // Sẽ thay bằng getEvent từ API
      const appointments = await getAppointmentHistory();

      if (!appointments || appointments.length === 0) {
        Alert.alert("No Appointments", "No appointments found to sync.");
        return;
      }

      const result = await calendarService.syncEvent(
        "appointment",
        appointments
      );

      if (result.success) {
        console.log(
          `Successfully synced ${result.syncedCount} appointments. ${
            result.skippedCount || 0
          } were skipped.`
        );
        Alert.alert("Sync Complete", `Successfully synced all appointments.`, [
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Sync Failed", result.message, [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Error syncing calendar:", error);
      Alert.alert("Error", "Failed to sync calendar. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendar Access</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="shield-check"
              size={24}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>Permission Status</Text>
          </View>

          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionTitle}>
                {calendarPermission
                  ? "Calendar Access Granted"
                  : "Calendar Access Required"}
              </Text>
              <Text style={styles.permissionDescription}>
                {calendarPermission
                  ? "Your app can sync appointments with your device calendar."
                  : "Grant permission to sync your appointments with your device calendar."}
              </Text>
            </View>

            <View style={styles.permissionStatus}>
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: calendarPermission ? "#4CAF50" : "#FF9800",
                  },
                ]}
              >
                <Icon
                  name={calendarPermission ? "check" : "alert"}
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>

          {!calendarPermission && (
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCalendarPermission}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sync Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="sync" size={24} color={GlobalStyles.colors.primary} />
            <Text style={styles.sectionTitle}>Sync Settings</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Calendar Sync</Text>
                <Text style={styles.settingDescription}>
                  Sync your appointments with your device calendar
                </Text>
              </View>
              <Switch
                value={syncEnabled}
                onValueChange={handleSyncToggle}
                trackColor={{
                  false: "#E0E0E0",
                  true: GlobalStyles.colors.primary,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {syncEnabled && (
            <>
              <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Auto Sync</Text>
                    <Text style={styles.settingDescription}>
                      Automatically sync appointments when they are created or
                      updated
                    </Text>
                  </View>
                  <Switch
                    value={autoSync}
                    onValueChange={handleAutoSyncToggle}
                    trackColor={{
                      false: "#E0E0E0",
                      true: GlobalStyles.colors.primary,
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Enable Reminders</Text>
                    <Text style={styles.settingDescription}>
                      Set reminders for your appointments
                    </Text>
                  </View>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={handleReminderToggle}
                    trackColor={{
                      false: "#E0E0E0",
                      true: GlobalStyles.colors.primary,
                    }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {reminderEnabled && (
                <View style={styles.settingCard}>
                  <TouchableOpacity
                    style={styles.settingRow}
                    onPress={openReminderModal}
                  >
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>Reminder Time</Text>
                      <Text style={styles.settingDescription}>
                        {formatReminderTime(reminderTime)} trước khi lịch hẹn
                      </Text>
                    </View>
                    <View style={styles.settingAction}>
                      <Text style={styles.settingValue}>
                        {formatReminderTime(reminderTime)}
                      </Text>
                      <Icon name="chevron-right" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.syncButton,
                  syncing && styles.syncButtonDisabled,
                ]}
                onPress={syncNow}
                disabled={!calendarPermission || syncing}
              >
                {syncing ? (
                  <>
                    <Icon
                      name="sync"
                      size={20}
                      color="#FFFFFF"
                      style={{ transform: [{ rotate: "360deg" }] }}
                    />
                    <Text style={styles.syncButtonText}>Syncing...</Text>
                  </>
                ) : (
                  <>
                    <Icon name="sync" size={20} color="#FFFFFF" />
                    <Text style={styles.syncButtonText}>Sync Now</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Calendar Integration */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="calendar-multiple"
              size={24}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>Calendar Integration</Text>
          </View>

          <View style={styles.integrationCard}>
            <View style={styles.integrationItem}>
              <Icon name="google" size={24} color="#4285F4" />
              <Text style={styles.integrationText}>Google Calendar</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>

            <View style={styles.integrationItem}>
              <Icon name="apple" size={24} color="#000000" />
              <Text style={styles.integrationText}>Apple Calendar</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>

            <View style={styles.integrationItem}>
              <Icon name="microsoft" size={24} color="#00A4EF" />
              <Text style={styles.integrationText}>Outlook Calendar</Text>
              <Icon name="chevron-right" size={20} color="#666" />
            </View>
          </View>
        </View> */}

        {/* Help Section */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon
              name="help-circle"
              size={24}
              color={GlobalStyles.colors.primary}
            />
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>

          <View style={styles.helpCard}>
            <TouchableOpacity style={styles.helpItem}>
              <Icon name="book-open-variant" size={20} color="#666" />
              <Text style={styles.helpText}>How to sync appointments</Text>
              <Icon name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpItem}>
              <Icon name="cog" size={20} color="#666" />
              <Text style={styles.helpText}>Calendar settings guide</Text>
              <Icon name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.helpItem}>
              <Icon name="message-text" size={20} color="#666" />
              <Text style={styles.helpText}>Contact support</Text>
              <Icon name="chevron-right" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* Reminder Time Modal */}
        <Modal
          visible={showReminderModal}
          transparent={true}
          animationType="slide"
          onRequestClose={closeReminderModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Chỉnh sửa thời gian nhắc nhở
                </Text>
                <TouchableOpacity onPress={closeReminderModal}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>
                  Nhắc nhở trước khi lịch hẹn (phút):
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={tempReminderTime}
                  onChangeText={setTempReminderTime}
                  keyboardType="numeric"
                  placeholder="Nhập số phút (1-1440)"
                  placeholderTextColor="#999"
                />
                <Text style={styles.modalHint}>
                  Gợi ý: 15, 30, 60, 120, 1440 (1 ngày)
                </Text>

                <Text style={styles.quickOptionsLabel}>Chọn nhanh:</Text>
                <View style={styles.quickOptionsContainer}>
                  {quickReminderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.quickOptionButton,
                        parseInt(tempReminderTime) === option.value &&
                          styles.quickOptionButtonSelected,
                      ]}
                      onPress={() => selectQuickOption(option.value)}
                    >
                      <Text
                        style={[
                          styles.quickOptionText,
                          parseInt(tempReminderTime) === option.value &&
                            styles.quickOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalButtonSecondary}
                  onPress={closeReminderModal}
                >
                  <Text style={styles.modalButtonTextSecondary}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButtonPrimary}
                  onPress={saveReminderTime}
                >
                  <Text style={styles.modalButtonTextPrimary}>Lưu</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginLeft: 12,
  },
  permissionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  permissionStatus: {
    marginLeft: 16,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  settingCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  syncButton: {
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  syncButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  integrationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  integrationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  integrationText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
  helpCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  helpText: {
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
  settingAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: GlobalStyles.colors.primary,
    fontWeight: "500",
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1A1A1A",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: GlobalStyles.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  quickOptionsLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  quickOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickOptionButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  quickOptionButtonSelected: {
    backgroundColor: GlobalStyles.colors.primary,
    borderColor: GlobalStyles.colors.primary,
  },
  quickOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  quickOptionTextSelected: {
    color: "#FFFFFF",
  },
});

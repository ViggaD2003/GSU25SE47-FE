import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import dayjs from "dayjs";

const DateRangeSelector = ({
  selectedRange,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  setIsCustomDate,
}) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const predefinedRanges = [
    { key: "7d", label: "dashboard.dateRanges.last7Days", days: 7 },
    { key: "30d", label: "dashboard.dateRanges.last30Days", days: 30 },
    { key: "90d", label: "dashboard.dateRanges.last90Days", days: 90 },
    { key: "custom", label: "dashboard.dateRanges.custom", days: null },
  ];

  const getCurrentRangeLabel = () => {
    const range = predefinedRanges.find((r) => r.key === selectedRange);
    if (range?.key === "custom" && customStartDate && customEndDate) {
      const startDate = dayjs(customStartDate).format("DD/MM/YYYY HH:mm");
      const endDate = dayjs(customEndDate).format("DD/MM/YYYY HH:mm");
      return `${startDate} - ${endDate}`;
    }
    return t(range?.label || "dashboard.dateRanges.last30Days");
  };

  const handleRangeSelect = (rangeKey) => {
    onRangeChange(rangeKey);

    if (rangeKey === "custom") {
      const endDate = dayjs().add(1, "day").format("YYYY-MM-DD");
      setIsCustomDate(true);
      setShowModal(false); // Đóng modal trước khi mở date picker
      setShowDatePicker(true);
      onCustomDateChange(dayjs().format("YYYY-MM-DD"), endDate);
    } else {
      const range = predefinedRanges.find((r) => r.key === rangeKey);
      if (range) {
        const endDate = dayjs().add(1, "day").format("YYYY-MM-DD");
        const startDate = dayjs()
          .subtract(range.days, "day")
          .format("YYYY-MM-DD");
        onCustomDateChange(startDate, endDate);
      }
      setIsCustomDate(false);
      setShowDatePicker(false);
      // setShowModal(false); // Đóng modal sau khi chọn
    }
  };

  const handleDateConfirm = (selectedDate) => {
    const startDate = dayjs(selectedDate).format("YYYY-MM-DD");
    const endDate = dayjs(selectedDate).add(1, "day").format("YYYY-MM-DD");
    onCustomDateChange(startDate, endDate);
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => {
          setShowModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="calendar-outline" size={20} color="#6B7280" />
          <Text style={styles.selectorText}>{getCurrentRangeLabel()}</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("dashboard.dateRanges.selectRange")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                }}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.rangeOptions}>
              {predefinedRanges.map((range) => (
                <TouchableOpacity
                  key={range.key}
                  style={[
                    styles.rangeOption,
                    selectedRange === range.key && styles.selectedRangeOption,
                  ]}
                  onPress={() => {
                    handleRangeSelect(range.key);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.rangeOptionText,
                      selectedRange === range.key &&
                        styles.selectedRangeOptionText,
                    ]}
                  >
                    {t(range.label)}
                  </Text>
                  {selectedRange === range.key && (
                    <Ionicons name="checkmark" size={20} color="#059669" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        mode="date"
        date={customStartDate ? new Date(customStartDate) : new Date()}
        isVisible={showDatePicker}
        onConfirm={handleDateConfirm}
        onCancel={() => {
          setShowDatePicker(false);
          // Không tự động chọn 30d, giữ nguyên selection hiện tại
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  selector: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  rangeOptions: {
    gap: 8,
  },
  rangeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  selectedRangeOption: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
  },
  rangeOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  selectedRangeOptionText: {
    color: "#059669",
  },
});

export default DateRangeSelector;

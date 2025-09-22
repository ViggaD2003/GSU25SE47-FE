import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;

const Dropdown = ({
  label,
  placeholder,
  data,
  value,
  onSelect,
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedItem = data?.find(
    (item) => item.id === value || item.value === value
  );

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const renderItem = ({ item, isLast }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, isLast && { borderBottomWidth: 0 }]}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.dropdownItemText}>{item.label || item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          isOpen && styles.dropdownActive,
        ]}
        onPress={() => !disabled && !loading && setIsOpen(true)}
        disabled={disabled || loading}
      >
        <Text
          style={[
            styles.dropdownText,
            !selectedItem && styles.placeholderText,
            disabled && styles.dropdownTextDisabled,
          ]}
        >
          {loading
            ? "Đang tải..."
            : selectedItem
            ? selectedItem.label || selectedItem.name
            : placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={disabled ? "#9CA3AF" : "#6B7280"}
        />
      </TouchableOpacity>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || "Chọn"}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={data || []}
              renderItem={({ item, index }) =>
                renderItem({ item, isLast: index === data.length - 1 })
              }
              keyExtractor={(item, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    minHeight: 50,
  },
  dropdownDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  dropdownActive: {
    borderColor: "#3B82F6",
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
  },
  dropdownTextDisabled: {
    color: "#9CA3AF",
  },
  placeholderText: {
    color: "#9CA3AF",
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
    width: isSmallDevice ? width - 40 : width - 60,
    maxHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
});

export default Dropdown;

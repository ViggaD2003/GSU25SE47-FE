import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";
import { useTranslation } from "react-i18next";

const FilterSortModal = ({
  visible,
  onClose,
  onApply,
  currentFilters = { surveyType: "" },
  currentSort,
}) => {
  const [selectedFilters, setSelectedFilters] = useState(currentFilters || {});
  const [selectedSort, setSelectedSort] = useState(currentSort || {});
  const { t } = useTranslation();
  // console.log("currentFilters:", currentFilters);
  const surveyTypes = [
    { label: t("survey.filterSortModal.all"), value: "" },
    { label: t("survey.filterSortModal.screening"), value: "SCREENING" },
    { label: t("survey.filterSortModal.followup"), value: "FOLLOWUP" },
    // { label: "Chương trình", value: "PROGRAM" },
  ];

  const sortOptions = [
    {
      label: t("survey.filterSortModal.newest"),
      value: "completedAt",
      direction: "desc",
    },
    {
      label: t("survey.filterSortModal.oldest"),
      value: "completedAt",
      direction: "asc",
    },
  ];

  const handleFilterChange = useCallback((key, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSortChange = useCallback((option) => {
    setSelectedSort(option);
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      filters: selectedFilters,
      sort: selectedSort,
    });
    onClose();
  }, [selectedFilters, selectedSort, onApply, onClose]);

  const handleReset = useCallback(() => {
    setSelectedFilters({});
    setSelectedSort({
      label: t("survey.filterSortModal.completedAt"),
      value: "completedAt",
      direction: "desc",
    });
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t("survey.filterSortModal.title")}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Survey Type Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("survey.filterSortModal.surveyType")}
              </Text>
              <View style={styles.optionsContainer}>
                {surveyTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      selectedFilters.surveyType === type.value &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleFilterChange("surveyType", type.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedFilters.surveyType === type.value &&
                          styles.optionTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("survey.filterSortModal.sortBy")}
              </Text>
              <View style={styles.optionsContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={`${option.value}-${option.direction}`}
                    style={[
                      styles.optionButton,
                      selectedSort.value === option.value &&
                        selectedSort.direction === option.direction &&
                        styles.optionButtonActive,
                    ]}
                    onPress={() => handleSortChange(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSort.value === option.value &&
                          selectedSort.direction === option.direction &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedSort.value === option.value &&
                      selectedSort.direction === option.direction && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={GlobalStyles.colors.primary}
                        />
                      )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>
                {t("survey.filterSortModal.reset")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                {t("survey.filterSortModal.apply")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FAFAFA",
  },
  optionButtonActive: {
    borderColor: GlobalStyles.colors.primary,
    backgroundColor: "#EFF6FF",
  },
  optionText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  optionTextActive: {
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: GlobalStyles.colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default FilterSortModal;

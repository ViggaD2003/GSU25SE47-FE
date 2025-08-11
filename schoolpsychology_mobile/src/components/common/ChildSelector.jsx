import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { useChildren } from "@/contexts";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const ChildSelector = ({
  compact = false,
  showStatus = true,
  showSwitchButtons = true,
  onChildSelect,
  style,
}) => {
  const { children, selectedChild, selectChild, switchChild } = useChildren();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!children || children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return (
      <View style={[styles.singleChildContainer, style]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="account-child-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: selectedChild?.isActive
                    ? "#10B981"
                    : "#EF4444",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.childInfo}>
          <Text style={styles.childName} numberOfLines={1}>
            {selectedChild?.fullName || t("children.empty.noChildren")}
          </Text>
          {!compact && (
            <View style={styles.childDetails}>
              <View style={styles.detailRow}>
                <Icon name="school" size={12} color="#6B7280" />
                <Text style={styles.detailText}>
                  {selectedChild?.class || t("children.info.class")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="card-account-details" size={12} color="#6B7280" />
                <Text style={styles.detailText}>
                  {selectedChild?.studentCode || t("children.info.studentCode")}
                </Text>
              </View>
            </View>
          )}
        </View>

        {showStatus && (
          <View style={styles.statusOneChildContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: selectedChild?.isActive
                    ? "#D1FAE5"
                    : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: selectedChild?.isActive ? "#065F46" : "#DC2626" },
                ]}
              >
                {selectedChild?.isActive
                  ? t("children.status.active")
                  : t("children.status.inactive")}
              </Text>
            </View>

            {selectedChild?.isEnableSurvey !== undefined && (
              <View
                style={[
                  styles.surveyBadge,
                  {
                    backgroundColor: selectedChild?.isEnableSurvey
                      ? "#DBEAFE"
                      : "#FEF3C7",
                  },
                ]}
              >
                <Icon
                  name={
                    selectedChild?.isEnableSurvey
                      ? "clipboard-check"
                      : "clipboard-remove"
                  }
                  size={10}
                  color={selectedChild?.isEnableSurvey ? "#1E40AF" : "#D97706"}
                />
                <Text
                  style={[
                    styles.surveyText,
                    {
                      color: selectedChild?.isEnableSurvey
                        ? "#1E40AF"
                        : "#D97706",
                    },
                  ]}
                >
                  {selectedChild?.isEnableSurvey
                    ? t("children.status.surveyActive")
                    : t("children.status.surveyInactive")}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main Child Info */}
      <TouchableOpacity
        style={styles.childInfoContainer}
        onPress={() => {
          setIsExpanded(!isExpanded);
          onChildSelect?.();
        }}
        activeOpacity={0.8}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Icon name="account-child-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: selectedChild?.isActive
                    ? "#10B981"
                    : "#EF4444",
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.childInfo}>
          <Text style={styles.childName} numberOfLines={1}>
            {selectedChild?.fullName || t("children.empty.noChildren")}
          </Text>
          {!compact && (
            <View style={styles.childDetails}>
              <View style={styles.detailRow}>
                <Icon name="school" size={12} color="#6B7280" />
                <Text style={styles.detailText}>
                  {selectedChild?.class || t("children.info.class")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="card-account-details" size={12} color="#6B7280" />
                <Text style={styles.detailText}>
                  {selectedChild?.studentCode || t("children.info.studentCode")}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Child Count and Dropdown */}
        <View style={styles.rightSection}>
          <View style={styles.childCountBadge}>
            <Text style={styles.childCountText}>{children.length}</Text>
            <Text style={styles.childCountLabel}>con</Text>
          </View>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#6B7280"
            style={styles.dropdownIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Expanded Children List */}
      {isExpanded && (
        <View style={styles.expandedList}>
          {children.map((child, index) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childItem,
                selectedChild?.id === child.id && styles.selectedChildItem,
              ]}
              onPress={() => {
                selectChild(child);
                setIsExpanded(false);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.childItemAvatar}>
                <Icon name="account-child-circle" size={20} color="#10B981" />
                <View
                  style={[
                    styles.childItemStatusDot,
                    { backgroundColor: child.isActive ? "#10B981" : "#EF4444" },
                  ]}
                />
              </View>

              <View style={styles.childItemInfo}>
                <Text
                  style={[
                    styles.childItemName,
                    selectedChild?.id === child.id &&
                      styles.selectedChildItemName,
                  ]}
                >
                  {child.fullName}
                </Text>
                <View style={styles.childItemDetails}>
                  <Text style={styles.childItemClass}>{child.class}</Text>
                  <Text style={styles.childItemCode}>{child.studentCode}</Text>
                </View>
              </View>

              {selectedChild?.id === child.id && (
                <View style={styles.selectedIndicator}>
                  <Icon name="check-circle" size={20} color="#10B981" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.footerContainer}>
        {/* Status Badges */}
        {showStatus && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: selectedChild?.isActive
                    ? "#D1FAE5"
                    : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: selectedChild?.isActive ? "#065F46" : "#DC2626" },
                ]}
              >
                {selectedChild?.isActive
                  ? t("children.status.active")
                  : t("children.status.inactive")}
              </Text>
            </View>

            {selectedChild?.isEnableSurvey !== undefined && (
              <View
                style={[
                  styles.surveyBadge,
                  {
                    backgroundColor: selectedChild?.isEnableSurvey
                      ? "#DBEAFE"
                      : "#FEF3C7",
                  },
                ]}
              >
                <Icon
                  name={
                    selectedChild?.isEnableSurvey
                      ? "clipboard-check"
                      : "clipboard-remove"
                  }
                  size={10}
                  color={selectedChild?.isEnableSurvey ? "#1E40AF" : "#D97706"}
                />
                <Text
                  style={[
                    styles.surveyText,
                    {
                      color: selectedChild?.isEnableSurvey
                        ? "#1E40AF"
                        : "#D97706",
                    },
                  ]}
                >
                  {selectedChild?.isEnableSurvey
                    ? t("children.status.surveyActive")
                    : t("children.status.surveyInactive")}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Switch Buttons */}
        {showSwitchButtons && children.length > 1 && !isExpanded && (
          <View style={styles.switchButtons}>
            <TouchableOpacity
              style={[styles.switchButton, styles.prevButton]}
              onPress={() => switchChild("prev")}
              disabled={children.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={18} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchButton, styles.nextButton]}
              onPress={() => switchChild("next")}
              disabled={children.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

// Compact version for headers
export const CompactChildSelector = ({ style }) => (
  <ChildSelector
    compact
    showStatus={false}
    showSwitchButtons={false}
    style={style}
  />
);

// Full version with all features
export const FullChildSelector = ({ style }) => (
  <ChildSelector compact={false} showStatus showSwitchButtons style={style} />
);

export const ChildSelectorWithTitle = ({ t, style, onChildSelect }) => (
  <View style={[styles.childSelectionContainer, style]}>
    <Text style={styles.childSelectionTitle}>
      {t("parentHome.childSelection.title") || "Chọn con"}
    </Text>
    <ChildSelector onChildSelect={onChildSelect} style={styles.childSelector} />
  </View>
);

const styles = StyleSheet.create({
  childSelector: {
    marginTop: 8,
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
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 4,
    minHeight: 150,
  },
  singleChildContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 4,
  },
  childInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  childInfo: {
    flex: 1,
    marginRight: 12,
  },
  childName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  childDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  childCountBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: "center",
    minWidth: 40,
  },
  childCountText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  childCountLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  dropdownIcon: {
    marginTop: 2,
  },
  expandedList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedChildItem: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  childItemAvatar: {
    position: "relative",
    marginRight: 12,
  },
  childItemStatusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  childItemInfo: {
    flex: 1,
  },
  childItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  selectedChildItemName: {
    color: "#065F46",
  },
  childItemDetails: {
    flexDirection: "row",
    gap: 12,
  },
  childItemClass: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  childItemCode: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  selectedIndicator: {
    marginLeft: 8,
  },
  switchButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },
  switchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 12,
    flexWrap: "wrap",
  },
  statusOneChildContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  statusContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  surveyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  surveyText: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default ChildSelector;

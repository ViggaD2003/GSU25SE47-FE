import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons as Icon, Ionicons } from "@expo/vector-icons";
import { useChildren } from "@/contexts";
import { useTranslation } from "react-i18next";

const ChildSelector = ({
  compact = false,
  showStatus = true,
  showSwitchButtons = true,
  onChildSelect,
  style,
}) => {
  const { children, selectedChild, selectChild, switchChild } = useChildren();
  const { t } = useTranslation();

  if (!children || children.length === 0) {
    return null;
  }

  if (children.length === 1) {
    return (
      <View style={[styles.singleChildContainer, style]}>
        <View style={styles.childInfo}>
          <Icon
            name="account-child-circle"
            size={compact ? 20 : 24}
            color="#10B981"
          />
          <View style={styles.childText}>
            <Text style={styles.childName} numberOfLines={1}>
              {selectedChild?.fullName || t("children.empty.noChildren")}
            </Text>
            {!compact && (
              <Text style={styles.childCode} numberOfLines={1}>
                {selectedChild?.studentCode ||
                  selectedChild?.userId ||
                  t("children.info.studentCode")}
              </Text>
            )}
          </View>
        </View>
        {showStatus && (
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
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Child Info */}
      <TouchableOpacity
        style={styles.childInfoContainer}
        onPress={() => {
          onChildSelect?.();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.childInfo}>
          <Icon
            name="account-child-circle"
            size={compact ? 20 : 24}
            color="#10B981"
          />
          <View style={styles.childText}>
            <Text style={styles.childName} numberOfLines={1}>
              {selectedChild?.fullName || t("children.empty.noChildren")}
            </Text>
            {!compact && (
              <Text style={styles.childCode} numberOfLines={1}>
                {selectedChild?.studentCode ||
                  selectedChild?.userId ||
                  t("children.info.studentCode")}
              </Text>
            )}
          </View>
        </View>

        {/* Child Count Badge */}
        <View style={styles.childCountBadge}>
          <Text style={styles.childCountText}>{children.length}</Text>
        </View>

        {/* Dropdown Indicator */}
        <Ionicons name="chevron-down" size={16} color="#6B7280" />
      </TouchableOpacity>

      {/* Switch Buttons */}
      {showSwitchButtons && children.length > 1 && (
        <View style={styles.switchButtons}>
          <TouchableOpacity
            style={[styles.switchButton, styles.prevButton]}
            onPress={() => switchChild("prev")}
            disabled={children.length <= 1}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchButton, styles.nextButton]}
            onPress={() => switchChild("next")}
            disabled={children.length <= 1}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Status Badge */}
      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: selectedChild?.isActive ? "#D1FAE5" : "#FEE2E2",
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
      )}
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  singleChildContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  childInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  childText: {
    marginLeft: 8,
    flex: 1,
  },
  childName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  childCode: {
    fontSize: 12,
    color: "#6B7280",
  },
  childCountBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  childCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },
  switchButtons: {
    flexDirection: "row",
    marginRight: 8,
  },
  switchButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 1,
  },
  prevButton: {
    marginRight: 2,
  },
  nextButton: {
    marginLeft: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
});

export default ChildSelector;

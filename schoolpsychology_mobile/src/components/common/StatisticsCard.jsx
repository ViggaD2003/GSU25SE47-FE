import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../../constants";

const StatisticsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = GlobalStyles.colors.primary,
  valueColor = GlobalStyles.colors.primary,
  backgroundColor = "#fff",
  percentage,
  trend, // 'up', 'down', or 'neutral'
  size = "medium", // 'small', 'medium', 'large'
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "arrow-up";
      case "down":
        return "arrow-down";
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#22C55E";
      case "down":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: styles.smallContainer,
          value: styles.smallValue,
          title: styles.smallTitle,
          subtitle: styles.smallSubtitle,
          iconSize: 18,
        };
      case "large":
        return {
          container: styles.largeContainer,
          value: styles.largeValue,
          title: styles.largeTitle,
          subtitle: styles.largeSubtitle,
          iconSize: 24,
        };
      default:
        return {
          container: styles.mediumContainer,
          value: styles.mediumValue,
          title: styles.mediumTitle,
          subtitle: styles.mediumSubtitle,
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor }]}>
      {/* Top section - Icon & Title */}
      <View style={styles.topSection}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, sizeStyles.title]}>{title}</Text>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${iconColor}10` },
              ]}
            >
              <Ionicons
                name={icon}
                size={sizeStyles.iconSize}
                color={iconColor}
              />
            </View>
          )}
        </View>
      </View>

      {/* Value section */}
      <View style={styles.valueSection}>
        <View style={styles.valueRow}>
          <Text style={[styles.value, sizeStyles.value, { color: valueColor }]}>
            {value}
          </Text>
          {trend && (
            <View style={styles.trendBadge}>
              <Ionicons
                name={getTrendIcon()}
                size={14}
                color={getTrendColor()}
              />
              {percentage !== undefined && (
                <Text style={[styles.trendText, { color: getTrendColor() }]}>
                  {Math.abs(percentage)}%
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Progress indicator */}
        {/* <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: `${valueColor}20` }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: valueColor,
                  width: `${Math.min(Math.max(parseInt(value) || 0, 0), 100)}%`,
                },
              ]}
            />
          </View>
        </View> */}
      </View>

      {/* Subtitle */}
      {subtitle && (
        <View style={styles.subtitleSection}>
          <Text style={[styles.subtitle, sizeStyles.subtitle]}>{subtitle}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F8FAFC",
  },
  topSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  valueSection: {
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  subtitleSection: {
    marginTop: 4,
  },

  // Small size styles
  smallContainer: {
    padding: 16,
    flex: 1,
  },
  smallValue: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  smallTitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 16,
  },
  smallSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "400",
    lineHeight: 14,
  },

  // Medium size styles
  mediumContainer: {
    padding: 20,
    flex: 1,
  },
  mediumValue: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.75,
  },
  mediumTitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 18,
  },
  mediumSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "400",
    lineHeight: 16,
  },

  // Large size styles
  largeContainer: {
    padding: 24,
  },
  largeValue: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -1,
  },
  largeTitle: {
    fontSize: 15,
    color: "#64748B",
    fontWeight: "500",
    lineHeight: 20,
  },
  largeSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "400",
    lineHeight: 18,
  },

  title: {
    flex: 1,
    marginRight: 8,
  },
  value: {
    flex: 1,
  },
  subtitle: {
    lineHeight: 16,
  },
});

export default StatisticsCard;

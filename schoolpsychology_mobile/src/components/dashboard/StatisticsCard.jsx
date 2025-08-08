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
        return "trending-up";
      case "down":
        return "trending-down";
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#10B981";
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
          iconSize: 20,
          iconContainerSize: 44,
        };
      case "large":
        return {
          container: styles.largeContainer,
          value: styles.largeValue,
          title: styles.largeTitle,
          subtitle: styles.largeSubtitle,
          iconSize: 28,
          iconContainerSize: 56,
        };
      default:
        return {
          container: styles.mediumContainer,
          value: styles.mediumValue,
          title: styles.mediumTitle,
          subtitle: styles.mediumSubtitle,
          iconSize: 24,
          iconContainerSize: 50,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, { backgroundColor }]}>
      {/* Content */}
      <View style={styles.content}>
        {/* Header section */}
        <View style={styles.headerSection}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, sizeStyles.title]}>{title}</Text>
            {trend && (
              <View style={styles.trendContainer}>
                <View
                  style={[
                    styles.trendBadge,
                    { backgroundColor: `${getTrendColor()}15` },
                  ]}
                >
                  <Ionicons
                    name={getTrendIcon()}
                    size={14}
                    color={getTrendColor()}
                  />
                  {percentage !== undefined && (
                    <Text
                      style={[styles.trendText, { color: getTrendColor() }]}
                    >
                      {Math.abs(percentage)}%
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>

          {icon && (
            <View
              style={[
                styles.iconContainer,
                {
                  width: sizeStyles.iconContainerSize,
                  height: sizeStyles.iconContainerSize,
                  backgroundColor: `${iconColor}15`,
                },
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

        {/* Value section */}
        <View style={styles.valueSection}>
          <Text style={[styles.value, sizeStyles.value, { color: valueColor }]}>
            {value}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressTrack,
              { backgroundColor: `${valueColor}15` },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(Math.max(parseInt(value) || 0, 0), 100)}%`,
                  backgroundColor: valueColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Subtitle */}
        {subtitle && (
          <View style={styles.subtitleSection}>
            <Text style={[styles.subtitle, sizeStyles.subtitle]}>
              {subtitle}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 160,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
    overflow: "hidden",
  },
  content: {
    padding: 5,
    position: "relative",
    zIndex: 1,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: "#FFF",
    fontWeight: "700",
    marginBottom: 8,
  },
  trendContainer: {
    alignSelf: "flex-start",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  iconContainer: {
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  valueSection: {
    marginBottom: 16,
  },
  value: {
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  subtitleSection: {
    marginTop: 4,
  },
  subtitle: {
    color: "#6B7280",
    fontWeight: "500",
    lineHeight: 18,
  },

  // Small size styles
  smallContainer: {
    padding: 20,
    flex: 1,
  },
  smallValue: {
    fontSize: 36,
  },
  smallTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  smallSubtitle: {
    fontSize: 13,
  },

  // Medium size styles
  mediumContainer: {
    padding: 24,
    flex: 1,
  },
  mediumValue: {
    fontSize: 42,
  },
  mediumTitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  mediumSubtitle: {
    fontSize: 14,
  },

  // Large size styles
  largeContainer: {
    padding: 28,
  },
  largeValue: {
    fontSize: 48,
  },
  largeTitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  largeSubtitle: {
    fontSize: 15,
  },
});

export default StatisticsCard;

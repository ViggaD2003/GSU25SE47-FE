import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const MentalHealthChart = ({
  data = [],
  title = "Mental Health Progress",
  type = "survey",
  emptyMessage = "No data available",
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      </View>
    );
  }

  const getTypeIcon = () => {
    switch (type) {
      case "survey":
        return "clipboard-outline";
      case "appointment":
        return "calendar-outline";
      case "program":
        return "school-outline";
      default:
        return "analytics-outline";
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "survey":
        return "#059669";
      case "appointment":
        return "#3B82F6";
      case "program":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return "#059669";
    if (score >= 0.6) return "#F59E0B";
    if (score >= 0.4) return "#EF4444";
    return "#DC2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 0.8) return "Excellent";
    if (score >= 0.6) return "Good";
    if (score >= 0.4) return "Fair";
    return "Needs Attention";
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getTypeColor()}15` },
            ]}
          >
            <Ionicons name={getTypeIcon()} size={20} color={getTypeColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const scoreValue = formatScore(item.score);
          const scoreColor = getScoreColor(item.score);
          const scoreLabel = getScoreLabel(item.score);

          return (
            <View key={index} style={styles.dataPoint}>
              <View style={styles.dataHeader}>
                <Text style={styles.dateText}>
                  {formatDate(item.createdAt)}
                </Text>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreValue, { color: scoreColor }]}>
                    {scoreValue}%
                  </Text>
                  <View
                    style={[
                      styles.scoreBadge,
                      { backgroundColor: `${scoreColor}15` },
                    ]}
                  >
                    <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                      {scoreLabel}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(scoreValue, 100)}%`,
                        backgroundColor: scoreColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  chartContainer: {
    gap: 16,
  },
  dataPoint: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dataHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  scoreContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "right",
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default MentalHealthChart;

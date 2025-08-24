import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const AssessmentScoreChart = ({ scores = [], title = "Đánh giá chi tiết" }) => {
  if (!scores || scores.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>Chưa có dữ liệu đánh giá</Text>
        </View>
      </View>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 4) return "#EF4444";
    if (score >= 2) return "#F59E0B";
    if (score >= 0) return "#059669";
    return "#DC2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return "Cần theo dõi";
    if (score >= 2) return "Có dấu hiệu";
    if (score >= 0) return "Không có dấu hiệu";
    return "Cần theo dõi";
  };

  const formatScore = (score) => {
    return score;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.scoresContainer}>
        {scores.map((score, index) => {
          const scoreValue = formatScore(score.compositeScore);
          const scoreColor = getScoreColor(score.compositeScore);
          const scoreLabel = getScoreLabel(score.compositeScore);

          return (
            <View key={score.id || index} style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{score.categoryName}</Text>
                  <Text style={styles.categoryCode}>{score.categoryCode}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={[styles.scoreValue, { color: scoreColor }]}>
                    {scoreValue}
                  </Text>
                  <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                    {scoreLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.scoreDetails}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreDetailLabel}>
                    Mức độ nghiêm trọng:
                  </Text>
                  <Text style={styles.scoreDetailValue}>
                    {formatScore(score.severityScore)}
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreDetailLabel}>Tần suất:</Text>
                  <Text style={styles.scoreDetailValue}>
                    {formatScore(score.frequencyScore)}
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreDetailLabel}>Mức độ suy giảm:</Text>
                  <Text style={styles.scoreDetailValue}>
                    {formatScore(score.impairmentScore)}
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreDetailLabel}>Tính mãn tính:</Text>
                  <Text style={styles.scoreDetailValue}>
                    {formatScore(score.chronicityScore)}
                  </Text>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
  },
  scoresContainer: {
    gap: 16,
  },
  scoreCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  categoryCode: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreBadge: {
    alignItems: "center",
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  scoreDetails: {
    gap: 6,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreDetailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  scoreDetailValue: {
    fontSize: 13,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  progressContainer: {
    marginTop: 8,
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
});

export default AssessmentScoreChart;

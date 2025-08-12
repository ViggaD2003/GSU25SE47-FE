import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const CombinedChart = ({
  t,
  appointmentData = [],
  programData = [],
  surveyData = [],
  title = "Mental Health Overview",
}) => {
  // Kiểm tra xem có dữ liệu nào không
  const hasData =
    appointmentData.length > 0 ||
    programData.length > 0 ||
    surveyData.length > 0;

  if (!hasData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>
            {t
              ? t("dashboard.mentalHealth.combined.noData")
              : "No data available"}
          </Text>
        </View>
      </View>
    );
  }

  // Hàm format ngày
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Hàm format điểm số - chuyển từ thang điểm 0-1 sang 0-100
  const formatScore = (score) => {
    // Nếu score đã là phần trăm (0-100), giữ nguyên
    if (score > 1) return Math.round(score);
    // Nếu score là thang điểm 0-1, chuyển sang phần trăm
    return Math.round(score * 100);
  };

  // Hàm lấy màu cho điểm số
  const getScoreColor = (score) => {
    const normalizedScore = score > 1 ? score / 100 : score;
    if (normalizedScore >= 0.8) return "#059669"; // Xanh lá - Tốt
    if (normalizedScore >= 0.6) return "#F59E0B"; // Vàng - Khá
    if (normalizedScore >= 0.4) return "#EF4444"; // Đỏ - Trung bình
    return "#DC2626"; // Đỏ đậm - Cần cải thiện
  };

  // Hàm lấy nhãn cho điểm số
  const getScoreLabel = (score) => {
    const normalizedScore = score > 1 ? score / 100 : score;
    if (normalizedScore >= 0.8)
      return t ? t("dashboard.mentalHealth.score.excellent") : "Excellent";
    if (normalizedScore >= 0.6)
      return t ? t("dashboard.mentalHealth.score.good") : "Good";
    if (normalizedScore >= 0.4)
      return t ? t("dashboard.mentalHealth.score.fair") : "Fair";
    return t
      ? t("dashboard.mentalHealth.score.needsAttention")
      : "Needs Attention";
  };

  // Tạo dữ liệu tổng hợp cho biểu đồ
  const createCombinedChartData = () => {
    const combined = [];

    // Thêm dữ liệu survey
    surveyData.forEach((item) => {
      combined.push({
        date: item.createdAt,
        score: formatScore(item.score),
        type: "survey",
        typeLabel: t ? t("dashboard.mentalHealth.type.survey") : "Survey",
        color: "#059669",
      });
    });

    // Thêm dữ liệu appointment (nếu có)
    appointmentData.forEach((item) => {
      combined.push({
        date: item.createdAt,
        score: formatScore(item.score),
        type: "appointment",
        typeLabel: t
          ? t("dashboard.mentalHealth.type.appointment")
          : "Appointment",
        color: "#3B82F6",
      });
    });

    // Thêm dữ liệu program (nếu có)
    programData.forEach((item) => {
      combined.push({
        date: item.createdAt,
        score: formatScore(item.score),
        type: "program",
        typeLabel: t ? t("dashboard.mentalHealth.type.program") : "Program",
        color: "#F59E0B",
      });
    });

    // Sắp xếp theo ngày
    return combined.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Tạo dữ liệu cho LineChart
  const createLineChartData = () => {
    const combinedData = createCombinedChartData();

    if (combinedData.length === 0) return null;

    // Nhóm dữ liệu theo ngày và tính điểm trung bình
    const groupedByDate = {};
    combinedData.forEach((item) => {
      if (!groupedByDate[item.date]) {
        groupedByDate[item.date] = [];
      }
      groupedByDate[item.date].push(item.score);
    });

    // Tính điểm trung bình cho mỗi ngày
    const chartData = Object.keys(groupedByDate).map((date) => {
      const scores = groupedByDate[date];
      const averageScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      return {
        date: formatDate(date),
        score: Math.round(averageScore),
      };
    });

    return {
      labels: chartData.map((item) => item.date),
      datasets: [
        {
          data: chartData.map((item) => item.score),
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo color
          strokeWidth: 3,
        },
      ],
    };
  };

  // Tạo dữ liệu cho BarChart theo loại
  const createBarChartData = () => {
    const surveyAvg =
      surveyData.length > 0
        ? surveyData.reduce((sum, item) => sum + formatScore(item.score), 0) /
          surveyData.length
        : 0;

    const appointmentAvg =
      appointmentData.length > 0
        ? appointmentData.reduce(
            (sum, item) => sum + formatScore(item.score),
            0
          ) / appointmentData.length
        : 0;

    const programAvg =
      programData.length > 0
        ? programData.reduce((sum, item) => sum + formatScore(item.score), 0) /
          programData.length
        : 0;

    return {
      labels: [
        t ? t("dashboard.mentalHealth.type.survey") : "Survey",
        t ? t("dashboard.mentalHealth.type.appointment") : "Appointment",
        t ? t("dashboard.mentalHealth.type.program") : "Program",
      ],
      datasets: [
        {
          data: [
            Math.round(surveyAvg),
            Math.round(appointmentAvg),
            Math.round(programAvg),
          ],
        },
      ],
    };
  };

  const lineChartData = createLineChartData();
  const barChartData = createBarChartData();

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4F46E5",
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#F1F5F9",
      strokeWidth: 1,
    },
  };

  const barChartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.6,
    fillShadowGradient: "#3B82F6",
    fillShadowGradientOpacity: 0.8,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
            <Ionicons name="analytics-outline" size={20} color="#6B7280" />
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {/* Line Chart - Xu hướng theo thời gian */}
        {lineChartData && (
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>
              {t
                ? t("dashboard.mentalHealth.combined.trendTitle")
                : "Score Trend Over Time"}
            </Text>
            <LineChart
              data={lineChartData}
              width={Math.max(width - 80, 300)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
              yAxisInterval={1}
              segments={5}
            />
          </View>
        )}

        {/* Bar Chart - So sánh điểm trung bình theo loại */}
        {barChartData && (
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>
              {t
                ? t("dashboard.mentalHealth.combined.averageTitle")
                : "Average Score by Category"}
            </Text>
            <BarChart
              data={barChartData}
              width={Math.max(width - 80, 300)}
              height={220}
              chartConfig={barChartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines
              yAxisInterval={1}
              segments={5}
            />
          </View>
        )}
      </ScrollView>
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
  chartWrapper: {
    marginRight: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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

export default CombinedChart;

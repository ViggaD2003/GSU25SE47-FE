import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";

const { width } = Dimensions.get("window");

const CombinedChart = ({
  t,
  appointmentData = [],
  programData = [],
  surveyData = [],
  title = "Mental Health Overview",
  type = "combined",
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
    return dayjs(dateString).format("DD/MM");
  };

  const formatYear = (dateString) => {
    return dayjs(dateString).format("YYYY");
  };

  // Tạo dữ liệu tổng hợp cho biểu đồ
  const createCombinedChartData = () => {
    const combined = [];

    // Thêm dữ liệu survey
    surveyData.length > 0 &&
      surveyData.forEach((item) => {
        combined.push({
          date: item.createdAt,
          score: item.score,
          type: "survey",
          typeLabel: t ? t("dashboard.mentalHealth.type.survey") : "Survey",
          color: "#059669",
        });
      });

    // Thêm dữ liệu appointment (nếu có)
    appointmentData.length > 0 &&
      appointmentData.forEach((item) => {
        combined.push({
          date: item.createdAt,
          score: item.score,
          type: "appointment",
          typeLabel: t
            ? t("dashboard.mentalHealth.type.appointment")
            : "Appointment",
          color: "#3B82F6",
        });
      });

    // Thêm dữ liệu program (nếu có)
    programData.length > 0 &&
      programData.forEach((item) => {
        combined.push({
          date: item.createdAt,
          score: item.score,
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

    // Nhóm dữ liệu theo ngày và loại
    const groupedByDate = {};
    combinedData.length > 0 &&
      combinedData.forEach((item) => {
        const formattedDate = formatDate(item.date);
        if (!groupedByDate[formattedDate]) {
          groupedByDate[formattedDate] = {
            survey: [],
            appointment: [],
            program: [],
          };
        }
        groupedByDate[formattedDate][item.type].push(item.score);
      });

    // Tạo danh sách tất cả các ngày và sắp xếp
    const allDates = Object.keys(groupedByDate).sort((a, b) => {
      const dateA = dayjs(a);
      const dateB = dayjs(b);
      return dateA - dateB;
    });

    // Tính điểm trung bình cho mỗi loại theo ngày
    const surveyDataset = [];
    const appointmentDataset = [];
    const programDataset = [];

    allDates.forEach((date) => {
      const dayData = groupedByDate[date];

      // Survey data
      if (type === "survey" || type === "combined") {
        if (dayData.survey) {
          if (dayData.survey.length > 0) {
            const avgScore =
              dayData.survey.reduce((sum, score) => sum + score, 0) /
              dayData.survey.length;
            surveyDataset.push(avgScore);
          } else {
            surveyDataset.push(0);
          }
        }
      }

      // Appointment data
      if (type === "appointment" || type === "combined") {
        if (dayData.appointment) {
          if (dayData.appointment.length > 0) {
            const avgScore =
              dayData.appointment.reduce((sum, score) => sum + score, 0) /
              dayData.appointment.length;
            appointmentDataset.push(avgScore);
          } else {
            appointmentDataset.push(0);
          }
        }
      }

      // Program data
      if (type === "program" || type === "combined") {
        if (dayData.program) {
          if (dayData.program.length > 0) {
            const avgScore =
              dayData.program.reduce((sum, score) => sum + score, 0) /
              dayData.program.length;
            programDataset.push(avgScore);
          } else {
            programDataset.push(0);
          }
        }
      }
    });

    const chartDatasets = [
      (type === "survey" || type === "combined") &&
        surveyDataset.length > 0 && {
          label: "Survey",
          data: surveyDataset,
          color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`, // Green for survey
          backgroundColor: "#059669",
        },
      (type === "appointment" || type === "combined") &&
        appointmentDataset.length > 0 && {
          label: "Appointment",
          data: appointmentDataset,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue for appointment
          backgroundColor: "#3B82F6",
        },
      (type === "program" || type === "combined") &&
        programDataset.length > 0 && {
          label: "Program",
          data: programDataset,
          color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`, // Orange for program
          backgroundColor: "#F59E0B",
        },
    ].filter((data) => data);

    return {
      labels: allDates,
      datasets: chartDatasets,
    };
  };

  const lineChartData = createLineChartData();

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#F1F5F9",
      strokeWidth: 1,
    },
    propsForDots: {
      r: "5",
    },
  };

  return (
    <View style={styles.container}>
      <View>
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
              yAxisInterval={0.1}
              segments={8}
              // withShadow={false}
            />
          </View>
        )}

        <View>
          {type === "combined" && (
            <View style={styles.legendContainer}>
              <View style={styles.legendWrapper}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#059669" }]}
                  />
                  <Text style={styles.legendText}>
                    {t ? t("dashboard.mentalHealth.type.survey") : "Survey"}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#3B82F6" }]}
                  />
                  <Text style={styles.legendText}>
                    {t
                      ? t("dashboard.mentalHealth.type.appointment")
                      : "Appointment"}
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: "#F59E0B" }]}
                  />
                  <Text style={styles.legendText}>
                    {t ? t("dashboard.mentalHealth.type.program") : "Program"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 30,
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
    marginTop: 8,
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
  legendContainer: {
    marginTop: 10,
    paddingHorizontal: 5,
  },
  legendWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
  },
});

export default CombinedChart;

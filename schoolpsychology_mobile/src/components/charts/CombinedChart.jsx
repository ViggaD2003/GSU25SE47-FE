import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const { width } = Dimensions.get("window");

const CombinedChart = ({
  t,
  appointmentData = [],
  programData = [],
  surveyData = [],
  title = "Mental Health Overview",
  type = "combined",
  isCustomDate = false,
}) => {
  // State cho tooltip hiển thị chi tiết
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Hàm tính toán chiều rộng biểu đồ linh hoạt
  const calculateDynamicWidth = (dataLength) => {
    const minWidth = width - 80; // Chiều rộng tối thiểu
    const basePointWidth = 60; // Khoảng cách cơ bản giữa các điểm
    const maxPointWidth = 120; // Khoảng cách tối đa giữa các điểm
    const minPointWidth = 40; // Khoảng cách tối thiểu giữa các điểm

    if (dataLength <= 2) {
      return Math.max(minWidth, dataLength * maxPointWidth);
    } else if (dataLength <= 5) {
      return Math.max(minWidth, dataLength * basePointWidth * 1.2);
    } else if (dataLength <= 10) {
      return Math.max(minWidth, dataLength * basePointWidth);
    } else {
      // Với nhiều data points, giảm khoảng cách để tránh biểu đồ quá rộng
      const calculatedWidth = dataLength * minPointWidth;
      return Math.max(minWidth, Math.min(calculatedWidth, width * 2.5));
    }
  };

  // Hàm tính toán rotation cho labels dựa trên density
  const calculateLabelRotation = (dataLength) => {
    if (isCustomDate) return 25; // Với custom date luôn xoay 45 độ
    if (dataLength <= 3) return 0;
    if (dataLength <= 6) return 10;
    if (dataLength <= 10) return 20;
    return 25;
  };

  // Hàm tính toán offset cho labels
  const calculateLabelOffset = (dataLength) => {
    if (dataLength <= 3) return 0;
    if (dataLength <= 6) return 5;
    if (dataLength <= 10) return 8;
    return 12;
  };
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

  // Hàm format ngày với kiểm tra an toàn - giữ nguyên thời gian từ backend
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Parse theo UTC để tránh timezone conversion
    const date = dayjs.utc(dateString);
    return date.isValid() ? date.format("DD/MM/YYYY") : "";
  };

  // Hàm format ngày và giờ với kiểm tra an toàn - giữ nguyên thời gian từ backend
  const formatDateHour = (dateString) => {
    if (!dateString) return "";
    // Parse theo UTC để tránh timezone conversion
    const date = dayjs.utc(dateString);
    return date.isValid() ? date.format("DD/MM/YYYY HH:mm") : "";
  };

  // Hàm format giờ với kiểm tra an toàn - giữ nguyên thời gian từ backend
  const formatHour = (dateString) => {
    if (!dateString) return "";
    // Parse theo UTC để tránh timezone conversion
    const date = dayjs.utc(dateString);
    return date.isValid() ? date.format("HH:mm") : "";
  };

  // Memoize combined data để tránh tính toán lại không cần thiết
  const combinedData = useMemo(() => {
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
  }, [appointmentData, programData, surveyData, t]);

  // Tạo map dữ liệu chi tiết cho click event
  const createDataPointMap = (label) => {
    // Parse label với format chính xác
    let parsedLabel = isCustomDate
      ? dayjs(label, "DD/MM/YYYY HH:mm")
      : dayjs(label, "DD/MM/YYYY");

    // Fallback: nếu parse thất bại, thử parse theo format ISO
    if (!parsedLabel.isValid()) {
      parsedLabel = dayjs(label);
    }

    // Nếu vẫn không parse được, return empty map
    if (!parsedLabel.isValid()) {
      console.warn("Cannot parse label:", label);
      return {};
    }

    // Filter dữ liệu theo label (ngày/giờ được click)
    const filteredData = combinedData.filter((item) => {
      return isCustomDate
        ? dayjs(item.date).isSame(parsedLabel, "hour")
        : dayjs(item.date).isSame(parsedLabel, "day");
    });

    // Nhóm dữ liệu theo giờ hoặc theo ngày
    const dataPointMap = {};
    filteredData.forEach((item) => {
      const key = isCustomDate ? formatHour(item.date) : formatDate(item.date);

      if (!dataPointMap[key]) {
        dataPointMap[key] = [];
      }
      dataPointMap[key].push(item);
    });

    return dataPointMap;
  };

  // Tạo dữ liệu cho LineChart
  const createLineChartData = () => {
    if (combinedData.length === 0) return null;
    // Nhóm dữ liệu theo ngày và loại

    const groupedByDate = {};
    combinedData.length > 0 &&
      combinedData.forEach((item) => {
        const formattedDate = formatDate(item.date);
        const formattedHour = isCustomDate
          ? formatDateHour(item.date)
          : formattedDate;

        if (!groupedByDate[formattedHour]) {
          groupedByDate[formattedHour] = {
            survey: [],
            appointment: [],
            program: [],
          };
        }
        groupedByDate[formattedHour][item.type].push(item.score);
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

  const lineChartData = useMemo(
    () => createLineChartData(),
    [combinedData, type, isCustomDate]
  );

  // Tính toán các thông số động cho biểu đồ
  const dataLength = lineChartData?.labels?.length || 0;
  const dynamicWidth = calculateDynamicWidth(dataLength);
  const labelRotation = calculateLabelRotation(dataLength);
  const labelOffset = calculateLabelOffset(dataLength);

  // Hàm xử lý click vào data point
  const handleDataPointClick = (data) => {
    const { index, dataset, x, y } = data;
    const label = lineChartData?.labels?.[index];
    const dataPointMap = createDataPointMap(label);

    if (label && Object.keys(dataPointMap).length > 0) {
      // Lấy tất cả dữ liệu cho ngày được click
      const allDataForDate = Object.values(dataPointMap).flat();

      const clickedData = {
        date: label,
        allDataForDate,
      };

      // Hiển thị tooltip
      setSelectedDataPoint(clickedData);
      setTooltipPosition({ x: x, y: y });
      setTooltipVisible(true);
    }
  };

  // Hàm đóng tooltip
  const closeTooltip = () => {
    setTooltipVisible(false);
    setSelectedDataPoint(null);
  };

  // Hàm format score theo type
  const getScoreDisplay = (item) => {
    if (!item || typeof item.score !== "number") return "0.00/4.00";
    const score = item.score.toFixed(2);
    return `${score}/4.00`;
  };

  // Cấu hình biểu đồ với responsive dot size
  const getDotSize = (dataLength) => {
    if (dataLength <= 5) return "5";
    if (dataLength <= 10) return "4";
    if (dataLength <= 20) return "2";
    return "3";
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    ...(type !== "combined" && {
      fillShadowGradientFrom:
        type === "survey"
          ? "#059669"
          : type === "appointment"
          ? "#3B82F6"
          : "#F59E0B",
      fillShadowGradientTo:
        type === "survey"
          ? "rgba(5, 150, 105, 0.2)"
          : type === "appointment"
          ? "rgba(59, 130, 246, 0.2)"
          : type === "program"
          ? "rgba(245, 158, 11, 0.2)"
          : "rgba(5, 150, 105, 0.2)",
    }),
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#F1F5F9",
      strokeWidth: 1,
    },
    propsForDots: {
      r: getDotSize(dataLength),
      strokeWidth: dataLength > 15 ? "1" : "2",
    },
    propsForVerticalLabels: {
      fontSize: 11,
      fontWeight: "500",
      color: "#374151",
    },
  };

  const totalDataPoints = useMemo(() => {
    return combinedData.length;
  }, [combinedData]);

  return (
    <View style={styles.container}>
      <Text style={styles.chartTitle}>
        {t
          ? t("dashboard.mentalHealth.combined.trendTitle")
          : "Score Trend Over Time"}
      </Text>
      {dataLength > 0 && (
        <Text style={styles.dataInfo}>
          {t
            ? `${dataLength} ${
                t("dashboard.mentalHealth.combined.dataPoints") || "data points"
              }`
            : `${dataLength} data points`}
        </Text>
      )}
      <ScrollView
        horizontal
        // showsHorizontalScrollIndicator={dynamicWidth > width - 80}
        scrollEventThrottle={16}
        decelerationRate="fast"
        contentContainerStyle={[styles.scrollContainer]}
      >
        {/* Line Chart - Xu hướng theo thời gian */}
        {lineChartData && (
          <View style={[styles.chartWrapper]}>
            <LineChart
              data={lineChartData}
              width={dynamicWidth}
              // width={500}
              height={isCustomDate ? 350 : 300}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
              yAxisInterval={0.1}
              verticalLabelRotation={labelRotation}
              xLabelsOffset={labelOffset}
              segments={Math.min(10, Math.max(5, Math.floor(dataLength / 2)))}
              onDataPointClick={handleDataPointClick}
              formatXLabel={(value) => {
                // Tự động rút gọn label nếu có quá nhiều data points
                if (dataLength > 15) {
                  return value.length > 8 ? value.slice(0, 8) + "..." : value;
                }
                return isCustomDate
                  ? dayjs.utc(value, "DD/MM/YYYY HH:mm").format("HH:mm")
                  : dayjs.utc(value, "DD/MM/YYYY").format("DD/MM");
              }}
            />
          </View>
        )}
      </ScrollView>
      <View>
        {type === "combined" && (
          <View
            style={[styles.legendContainer, isCustomDate && { marginTop: 10 }]}
          >
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
      {/* Tooltip hiển thị chi tiết data point */}
      {tooltipVisible && selectedDataPoint && (
        <View
          style={[
            styles.tooltipContainer,
            {
              position: "absolute",
              left: (() => {
                const halfWidth = width / 2;
                const isOnLeftHalf = tooltipPosition.x < halfWidth;
                const isNearHalf =
                  tooltipPosition.x < halfWidth + 50 &&
                  tooltipPosition.x > halfWidth - 50;

                if (isNearHalf) {
                  return halfWidth - 120;
                }
                if (!isOnLeftHalf) {
                  // Nếu ở nửa trái màn hình, hiển thị tooltip bên phải điểm chạm
                  return tooltipPosition.x - 130;
                } else {
                  // Nếu ở nửa phải màn hình, hiển thị tooltip bên trái điểm chạm
                  return tooltipPosition.x - 30;
                }
              })(),
              top: tooltipPosition.y,
              zIndex: 1000,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tooltipCloseButton}
            onPress={closeTooltip}
          >
            <Ionicons name="close" size={16} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.tooltipHeader}>
            <Ionicons name="calendar" size={16} color="#3B82F6" />
            <Text style={styles.tooltipDate}>{selectedDataPoint.date}</Text>
          </View>

          <View style={styles.tooltipBody}>
            <View style={styles.tooltipDetails}>
              {selectedDataPoint.allDataForDate.map((item, index) => (
                <View key={index} style={styles.tooltipDetailItem}>
                  <View style={styles.tooltipDetailHeader}>
                    <View style={styles.tooltipTypeContainer}>
                      <View
                        style={[
                          styles.tooltipTypeDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text style={styles.tooltipTypeName}>
                        {item.typeLabel}
                      </Text>
                    </View>
                    <Text style={styles.tooltipScore}>
                      {getScoreDisplay(item)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 30,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContainer: {
    alignItems: "center",
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
    width: "auto",
    marginRight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  dataInfo: {
    fontSize: 12,
    fontWeight: "400",
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
    fontStyle: "italic",
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
    paddingHorizontal: 5,
    // marginTop: 10,
  },
  legendWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
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
  // Tooltip styles
  tooltipContainer: {
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    width: "auto",
    height: "auto",
    minWidth: 150,
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  tooltipCloseButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1001,
  },
  tooltipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingRight: 24,
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 6,
  },
  tooltipBody: {
    // gap: 16,
  },
  tooltipSummary: {
    backgroundColor: "#F9FAFB",
    padding: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tooltipLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    flex: 1,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  tooltipDetails: {
    gap: 6,
    height: "auto",
    width: "auto",
    padding: 1,
  },
  tooltipDetailItem: {
    paddingVertical: 2,
  },
  tooltipDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },
  tooltipTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tooltipTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  tooltipTypeName: {
    fontSize: 11,
    fontWeight: "400",
    color: "#6B7280",
  },
  tooltipScore: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  tooltipMoreText: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
});

export default CombinedChart;

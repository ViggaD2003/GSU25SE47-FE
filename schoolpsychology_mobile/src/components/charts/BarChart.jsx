import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { GlobalStyles } from "../../constants";

const { width: screenWidth } = Dimensions.get("window");

const ReusableBarChart = ({
  data = [],
  title = "Chart",
  yAxisMax = 100,
  barColor = GlobalStyles.colors.primary,
  height = 200,
  showGrid = true,
  valueFormatter = (value) => `${value}%`,
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height: height + 80 }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  // Transform data for react-native-chart-kit format
  const chartData = {
    labels: data.map((item) => item.x || item.label || ""),
    datasets: [
      {
        data: data.map((item) => item.y || item.value || 0),
        color: (opacity = 1) => `rgba(${hexToRgb(barColor)}, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(barColor)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,

    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: barColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: showGrid ? "0" : "5,5",
      stroke: "#F1F5F9",
      strokeWidth: 1,
    },
    barPercentage: yAxisMax / 100,
    fillShadowGradient: barColor,
    fillShadowGradientOpacity: 1,
    yAxisInterval: Math.ceil(yAxisMax / 5),
  };

  return (
    <View style={[styles.container, { height: height + 80 }]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={screenWidth - 100}
          height={height}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showBarTops={false}
          fromZero={true}
          segments={5}
          showValuesOnTopOfBars={true}
          withInnerLines={showGrid}
          formatYLabel={valueFormatter}
        />
      </View>
    </View>
  );
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "52, 152, 219"; // Default blue color
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 10,
    borderColor: "#F1F5F9",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 120,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    margin: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
    fontWeight: "500",
  },
});

export default ReusableBarChart;

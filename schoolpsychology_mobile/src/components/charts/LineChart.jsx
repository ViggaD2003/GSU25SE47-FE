import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const LineChart = ({
  data,
  title,
  height = 200,
  showLegend = true,
  colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B"],
}) => {
  if (!data || data.length === 0) return null;

  // Find min and max values for scaling
  const allValues = data.flatMap((item) =>
    Object.keys(item)
      .filter((key) => key !== "label" && key !== "month")
      .map((key) => item[key])
      .filter((val) => typeof val === "number")
  );

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue || 1;

  // Get data series keys (excluding label/month)
  const seriesKeys = Object.keys(data[0]).filter(
    (key) =>
      key !== "label" && key !== "month" && typeof data[0][key] === "number"
  );

  // Calculate points for each series
  const getScaledY = (value) => {
    return height - ((value - minValue) / range) * height;
  };

  const pointWidth = 300 / Math.max(data.length - 1, 1);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chartContainer, { height: height + 50 }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxisContainer}>
            <Text style={styles.axisLabel}>{Math.round(maxValue)}</Text>
            <Text style={styles.axisLabel}>{Math.round(maxValue * 0.75)}</Text>
            <Text style={styles.axisLabel}>{Math.round(maxValue * 0.5)}</Text>
            <Text style={styles.axisLabel}>{Math.round(maxValue * 0.25)}</Text>
            <Text style={styles.axisLabel}>{Math.round(minValue)}</Text>
          </View>

          {/* Chart area */}
          <View style={[styles.chartArea, { height }]}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <View
                key={index}
                style={[styles.gridLine, { top: ratio * height }]}
              />
            ))}

            {/* Data lines */}
            {seriesKeys.map((seriesKey, seriesIndex) => {
              const points = data.map((item, index) => ({
                x: index * pointWidth,
                y: getScaledY(item[seriesKey] || 0),
                value: item[seriesKey] || 0,
              }));

              return (
                <View key={seriesKey} style={StyleSheet.absoluteFill}>
                  {/* Line segments */}
                  {points.slice(0, -1).map((point, index) => {
                    const nextPoint = points[index + 1];
                    const length = Math.sqrt(
                      Math.pow(nextPoint.x - point.x, 2) +
                        Math.pow(nextPoint.y - point.y, 2)
                    );
                    const angle =
                      (Math.atan2(
                        nextPoint.y - point.y,
                        nextPoint.x - point.x
                      ) *
                        180) /
                      Math.PI;

                    return (
                      <View
                        key={index}
                        style={[
                          styles.lineSegment,
                          {
                            left: point.x,
                            top: point.y,
                            width: length,
                            backgroundColor:
                              colors[seriesIndex % colors.length],
                            transform: [{ rotate: `${angle}deg` }],
                          },
                        ]}
                      />
                    );
                  })}

                  {/* Data points */}
                  {points.map((point, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dataPoint,
                        {
                          left: point.x - 4,
                          top: point.y - 4,
                          backgroundColor: colors[seriesIndex % colors.length],
                        },
                      ]}
                    />
                  ))}
                </View>
              );
            })}
          </View>

          {/* X-axis labels */}
          <View style={styles.xAxisContainer}>
            {data.map((item, index) => (
              <Text
                key={index}
                style={[
                  styles.xAxisLabel,
                  { left: index * pointWidth - 20, width: 40 },
                ]}
              >
                {item.label || item.month || index}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {seriesKeys.map((seriesKey, index) => (
            <View key={seriesKey} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: colors[index % colors.length] },
                ]}
              />
              <Text style={styles.legendText}>
                {seriesKey
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    flexDirection: "row",
    minWidth: 350,
  },
  yAxisContainer: {
    width: 40,
    height: "100%",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 10,
    paddingTop: 10,
  },
  axisLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  chartArea: {
    flex: 1,
    position: "relative",
    marginLeft: 10,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  lineSegment: {
    position: "absolute",
    height: 2,
    transformOrigin: "0 0",
  },
  dataPoint: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  xAxisContainer: {
    position: "relative",
    height: 30,
    marginLeft: 50,
  },
  xAxisLabel: {
    position: "absolute",
    top: 5,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});

export default LineChart;

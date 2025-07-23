import React from "react";
import { StyleSheet, View, Text } from "react-native";

const DATA = (length = 5) =>
  Array.from({ length }, (_, i) => ({
    month: i + 1,
    listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
  }));

const BarChart = () => {
  const data = DATA(5);
  const maxValue = Math.max(...data.map((item) => item.listenCount));

  const getMonthName = (monthIndex) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[monthIndex - 1] || "Jan";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stress Level Overview</Text>
      <View style={styles.chartContainer}>
        <View style={styles.yAxisContainer}>
          <Text style={styles.yAxisLabel}>100</Text>
          <Text style={styles.yAxisLabel}>75</Text>
          <Text style={styles.yAxisLabel}>50</Text>
          <Text style={styles.yAxisLabel}>25</Text>
          <Text style={styles.yAxisLabel}>0</Text>
        </View>

        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${(item.listenCount / maxValue) * 100}%`,
                      backgroundColor:
                        item.listenCount > 75
                          ? "#EF4444"
                          : item.listenCount > 50
                          ? "#F59E0B"
                          : "#10B981",
                    },
                  ]}
                />
              </View>
              <Text style={styles.xAxisLabel}>{getMonthName(item.month)}</Text>
            </View>
          ))}
        </View>
      </View>
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
    height: 200,
    alignItems: "flex-end",
  },
  yAxisContainer: {
    height: "100%",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginRight: 10,
    width: 30,
  },
  yAxisLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  barContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "60%",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  xAxisLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
});

export default BarChart;

import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Chart = ({ title, data, type = "bar", color = "#3B82F6" }) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {data.map((item, index) => (
        <View key={index} style={styles.barItem}>
          <View style={styles.barContainer}>
            <View
              style={[
                styles.bar,
                {
                  height: (item.value / maxValue) * 100,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.barLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );

  const renderLineChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.lineChart}>
        {data.map((item, index) => (
          <View key={index} style={styles.linePoint}>
            <View style={[styles.point, { backgroundColor: color }]} />
            {index < data.length - 1 && (
              <View style={[styles.line, { backgroundColor: color }]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.lineLabels}>
        {data.map((item, index) => (
          <Text key={index} style={styles.lineLabel}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {type === "bar" ? renderBarChart() : renderLineChart()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  chartContainer: {
    height: 120,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barContainer: {
    height: 80,
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  lineChart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    height: 80,
    marginBottom: 16,
  },
  linePoint: {
    alignItems: "center",
    flex: 1,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  line: {
    height: 2,
    flex: 1,
    marginBottom: 8,
  },
  lineLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  lineLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default Chart;

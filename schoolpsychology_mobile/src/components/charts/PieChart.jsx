import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PieChart = ({
  data,
  title,
  size = 200,
  colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"],
}) => {
  if (!data || data.length === 0) return null;

  // Calculate total and percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithPercentages = data.map((item) => ({
    ...item,
    percentage: (item.value / total) * 100,
    angle: (item.value / total) * 360,
  }));

  // Create pie slices using border radius trick
  const createPieSlice = (item, index, startAngle) => {
    const { angle, percentage } = item;
    const color = colors[index % colors.length];

    // For very small slices, just show a thin line
    if (percentage < 2) {
      return (
        <View
          key={index}
          style={[
            styles.thinSlice,
            {
              transform: [{ rotate: `${startAngle}deg` }],
              backgroundColor: color,
            },
          ]}
        />
      );
    }

    // Create arc using transform and clipping
    const isLargeArc = angle > 180;

    if (isLargeArc) {
      // Split large arcs into two parts
      return (
        <View key={index}>
          <View
            style={[
              styles.pieSlice,
              {
                width: size,
                height: size,
                transform: [{ rotate: `${startAngle}deg` }],
                backgroundColor: color,
              },
            ]}
          />
          <View
            style={[
              styles.pieSlice,
              {
                width: size,
                height: size,
                transform: [{ rotate: `${startAngle + 180}deg` }],
                backgroundColor: color,
              },
            ]}
          />
        </View>
      );
    }

    return (
      <View
        key={index}
        style={[
          styles.pieSlice,
          {
            width: size,
            height: size,
            transform: [{ rotate: `${startAngle}deg` }],
            backgroundColor: color,
          },
        ]}
      />
    );
  };

  // Simple approach: Create segments using rotation
  const renderSimplePie = () => {
    return (
      <View style={[styles.pieContainer, { width: size, height: size }]}>
        {dataWithPercentages.map((item, index) => {
          const startAngle = dataWithPercentages
            .slice(0, index)
            .reduce((sum, prev) => sum + prev.angle, 0);

          const segmentSize = size * 0.4;
          const centerOffset = (size - segmentSize) / 2;
          const angle = (startAngle + item.angle / 2) * (Math.PI / 180);
          const radius = size * 0.15;

          const x =
            centerOffset + segmentSize / 2 + Math.cos(angle) * radius - 15;
          const y =
            centerOffset + segmentSize / 2 + Math.sin(angle) * radius - 15;

          return (
            <View key={index}>
              {/* Segment indicator */}
              <View
                style={[
                  styles.segment,
                  {
                    left: x,
                    top: y,
                    backgroundColor: colors[index % colors.length],
                  },
                ]}
              />

              {/* Percentage label */}
              <Text
                style={[
                  styles.percentageLabel,
                  {
                    left: x + 35,
                    top: y + 5,
                  },
                ]}
              >
                {item.percentage.toFixed(1)}%
              </Text>
            </View>
          );
        })}

        {/* Center circle */}
        <View
          style={[
            styles.centerCircle,
            {
              width: size * 0.3,
              height: size * 0.3,
              left: size * 0.35,
              top: size * 0.35,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.chartWrapper}>{renderSimplePie()}</View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {dataWithPercentages.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors[index % colors.length] },
              ]}
            />
            <Text style={styles.legendText}>
              {item.label}: {item.value} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total: {total}</Text>
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
  chartWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  pieContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  pieSlice: {
    position: "absolute",
    borderRadius: 100,
    opacity: 0.8,
  },
  thinSlice: {
    position: "absolute",
    width: 2,
    height: 50,
    left: "50%",
    top: 0,
    transformOrigin: "center bottom",
  },
  segment: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  percentageLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  centerCircle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  summaryContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    alignItems: "center",
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});

export default PieChart;

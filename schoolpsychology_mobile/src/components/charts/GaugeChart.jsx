import React from "react";
import { View, Text, StyleSheet } from "react-native";

const GaugeChart = ({
  value,
  maxValue = 100,
  title,
  size = 200,
  thickness = 20,
  colors = {
    low: "#10B981", // Green for low stress (0-33)
    medium: "#F59E0B", // Yellow for medium stress (34-66)
    high: "#EF4444", // Red for high stress (67-100)
  },
}) => {
  // Clamp value between 0 and maxValue
  const clampedValue = Math.max(0, Math.min(value, maxValue));
  const percentage = (clampedValue / maxValue) * 100;

  // Determine color based on value ranges
  const getColor = () => {
    if (percentage <= 33) return colors.low;
    if (percentage <= 66) return colors.medium;
    return colors.high;
  };

  const getStatus = () => {
    if (percentage <= 33) return "Thấp";
    if (percentage <= 66) return "Trung bình";
    return "Cao";
  };

  // Calculate arc parameters
  const radius = (size - thickness) / 2;
  const circumference = Math.PI * radius; // Half circle
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Create gauge using multiple arcs
  const renderGaugeArcs = () => {
    const centerX = size / 2;
    const centerY = size / 2;
    const gaugeRadius = radius;

    // Background arc
    const backgroundArc = (
      <View
        style={[
          styles.gaugeArc,
          {
            width: size,
            height: size / 2 + thickness,
            borderRadius: size / 2,
            borderWidth: thickness,
            borderColor: "#E5E7EB",
            borderBottomColor: "transparent",
          },
        ]}
      />
    );

    // Progress arc
    const progressAngle = (percentage / 100) * 180; // Half circle = 180 degrees
    const progressArc = (
      <View
        style={[
          styles.progressContainer,
          { width: size, height: size / 2 + thickness },
        ]}
      >
        <View
          style={[
            styles.progressArc,
            {
              width: size,
              height: size / 2 + thickness,
              borderRadius: size / 2,
              borderWidth: thickness,
              borderColor: getColor(),
              borderBottomColor: "transparent",
              borderRightColor: progressAngle < 90 ? "transparent" : getColor(),
              borderLeftColor: progressAngle < 90 ? "transparent" : getColor(),
              transform: [{ rotate: `${progressAngle - 90}deg` }],
            },
          ]}
        />
      </View>
    );

    return (
      <View style={styles.gaugeContainer}>
        {backgroundArc}
        {progressArc}
      </View>
    );
  };

  // Simple approach with segments
  const renderSimpleGauge = () => {
    const segments = 10;
    const anglePerSegment = 180 / segments;
    const currentSegment = Math.floor((percentage / 100) * segments);

    return (
      <View
        style={[
          styles.simpleGaugeContainer,
          { width: size, height: size / 2 + 30 },
        ]}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const angle = index * anglePerSegment - 90;
          const isActive = index <= currentSegment;
          const segmentColor = isActive ? getColor() : "#E5E7EB";

          return (
            <View
              key={index}
              style={[
                styles.gaugeSegment,
                {
                  position: "absolute",
                  width: thickness,
                  height: 40,
                  backgroundColor: segmentColor,
                  left: size / 2 - thickness / 2,
                  top: 10,
                  transformOrigin: `${thickness / 2}px ${size / 2 - 10}px`,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Center circle */}
        <View
          style={[
            styles.centerCircle,
            {
              width: 20,
              height: 20,
              position: "absolute",
              left: size / 2 - 10,
              top: size / 2 - 10,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <View style={styles.chartWrapper}>
        {renderSimpleGauge()}

        {/* Value display */}
        <View style={styles.valueContainer}>
          <Text style={[styles.valueText, { color: getColor() }]}>
            {Math.round(clampedValue)}
          </Text>
          <Text style={styles.maxValueText}>/ {maxValue}</Text>
        </View>

        {/* Status indicator */}
        <View style={[styles.statusContainer, { backgroundColor: getColor() }]}>
          <Text style={styles.statusText}>{getStatus()}</Text>
        </View>
      </View>

      {/* Scale indicators */}
      <View style={styles.scaleContainer}>
        <View style={styles.scaleItem}>
          <View style={[styles.scaleDot, { backgroundColor: colors.low }]} />
          <Text style={styles.scaleText}>Thấp (0-33)</Text>
        </View>
        <View style={styles.scaleItem}>
          <View style={[styles.scaleDot, { backgroundColor: colors.medium }]} />
          <Text style={styles.scaleText}>Trung bình (34-66)</Text>
        </View>
        <View style={styles.scaleItem}>
          <View style={[styles.scaleDot, { backgroundColor: colors.high }]} />
          <Text style={styles.scaleText}>Cao (67-100)</Text>
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
  chartWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
  },
  gaugeArc: {
    position: "absolute",
  },
  progressContainer: {
    position: "absolute",
    overflow: "hidden",
  },
  progressArc: {
    position: "absolute",
  },
  simpleGaugeContainer: {
    position: "relative",
    alignItems: "center",
  },
  gaugeSegment: {
    borderRadius: 4,
  },
  centerCircle: {
    backgroundColor: "#374151",
    borderRadius: 10,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 20,
  },
  valueText: {
    fontSize: 48,
    fontWeight: "700",
  },
  maxValueText: {
    fontSize: 24,
    color: "#9CA3AF",
    fontWeight: "500",
    marginLeft: 4,
  },
  statusContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  scaleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  scaleItem: {
    alignItems: "center",
    flex: 1,
  },
  scaleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  scaleText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
});

export default GaugeChart;

import React, { useState, useRef } from "react";
import { StyleSheet, View, ScrollView, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const CHART_WIDTH = screenWidth - 40; // Full width minus padding
const CHART_MARGIN = 20;
const SNAP_INTERVAL = CHART_WIDTH + CHART_MARGIN;

const HorizontalChartCarousel = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  const childrenArray = React.Children.toArray(children);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        contentInset={{ left: 0, right: 0 }}
        style={styles.scrollView}
      >
        {childrenArray.map((child, index) => (
          <View
            key={index}
            style={[
              styles.chartItem,
              childrenArray.length === index + 1 && { marginRight: 0 },
            ]}
          >
            {child}
          </View>
        ))}
      </ScrollView>

      {/* Chart Indicators */}
      {childrenArray.length > 1 && (
        <View style={styles.indicatorContainer}>
          {childrenArray.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === activeIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    // paddingHorizontal: 10,
  },
  scrollView: {
    borderRadius: 12,
  },
  scrollContent: {
    paddingRight: 0,
  },
  chartItem: {
    width: CHART_WIDTH,
    marginRight: CHART_MARGIN,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
    paddingVertical: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D1D5DB",
    transition: "all 0.3s ease",
  },
  activeIndicator: {
    backgroundColor: "#3B82F6",
    width: 28,
    height: 10,
    borderRadius: 5,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default HorizontalChartCarousel;

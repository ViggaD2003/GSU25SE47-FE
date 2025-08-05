import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

const Loading = ({ text, style }) => {
  return (
    <View style={[styles.loadingContainer, style]}>
      <ActivityIndicator size="large" color="#059669" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "500",
  },
});

export default Loading;

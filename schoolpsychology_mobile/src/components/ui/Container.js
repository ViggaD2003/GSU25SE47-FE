import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";

export default function Container({ children }) {
  return <SafeAreaView style={styles.container}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

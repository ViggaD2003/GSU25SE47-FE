import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../../contexts";

const ProtectedRoute = ({ children, requiredRole = null, fallback = null }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#004B48" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      fallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Authentication required</Text>
        </View>
      )
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      fallback || (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Insufficient permissions</Text>
        </View>
      )
    );
  }

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ProtectedRoute;

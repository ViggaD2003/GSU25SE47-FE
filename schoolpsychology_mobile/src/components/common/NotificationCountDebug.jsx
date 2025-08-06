import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRealTime } from "../../contexts/RealTimeContext";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationCountDebug = () => {
  const { notificationCount: realTimeCount } = useRealTime();
  const { unreadCount: hookCount } = useNotifications();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Count Debug</Text>
      <View style={styles.row}>
        <Text style={styles.label}>RealTimeContext:</Text>
        <Text style={styles.value}>{realTimeCount}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>useNotifications:</Text>
        <Text style={styles.value}>{hookCount}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Status:</Text>
        <Text
          style={[
            styles.value,
            realTimeCount === hookCount ? styles.synced : styles.notSynced,
          ]}
        >
          {realTimeCount === hookCount ? "✅ Synced" : "❌ Not Synced"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  label: {
    fontSize: 14,
    color: "#6c757d",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  synced: {
    color: "#28a745",
  },
  notSynced: {
    color: "#dc3545",
  },
});

export default NotificationCountDebug;

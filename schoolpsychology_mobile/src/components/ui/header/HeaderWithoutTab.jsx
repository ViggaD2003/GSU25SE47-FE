import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LanguageSwitcher from "../../common/LanguageSwitcher";

const HeaderWithoutTab = ({
  title,
  onBackPress,
  showRefreshButton = false,
  onRefresh,
  refreshing,
  rightComponent,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerRight}>
          <LanguageSwitcher />
        </View>
      </View>
      {/* Refresh Button */}
      {showRefreshButton && (
        <TouchableOpacity
          style={[
            styles.refreshButtonStyle,
            refreshing && styles.refreshButtonStyleDisabled,
          ]}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <MaterialIcons
            name="refresh"
            size={22}
            color={refreshing ? "#ccc" : "#007AFF"}
          />
        </TouchableOpacity>
      )}
      {rightComponent && rightComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingRight: 20,
    paddingLeft: 20,
    paddingVertical: 16,
  },
  header: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  headerSpacer: {
    width: 40,
  },
  headerRight: {
    width: 60,
    alignItems: "flex-end",
  },
  refreshButtonStyle: {},
  refreshButtonStyleDisabled: {
    opacity: 0.5,
  },
});

export default HeaderWithoutTab;

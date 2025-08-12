import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CompactChildSelector } from "../../common";
import { useChildren, useAuth } from "../../../contexts";

const HeaderWithoutTab = ({
  title,
  onBackPress,
  showRefreshButton = false,
  onRefresh,
  refreshing,
  rightComponent,
  showChildSelector = false,
  onChildSelect,
}) => {
  const { children } = useChildren();
  const { user } = useAuth();
  const hasMultipleChildren = children && children.length > 1;

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {showChildSelector &&
            user?.role === "PARENTS" &&
            hasMultipleChildren && (
              <View style={styles.childSelectorContainer}>
                <CompactChildSelector
                  onChildSelect={onChildSelect}
                  style={styles.headerChildSelector}
                />
              </View>
            )}
        </View>

        <View style={styles.rightContainer}>
          {showRefreshButton && (
            <TouchableOpacity
              style={[
                styles.refreshButton,
                refreshing && styles.refreshButtonDisabled,
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 8,
  },
  childSelectorContainer: {
    alignItems: "center",
    marginTop: 4,
  },
  headerChildSelector: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 44,
  },
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    marginRight: 8,
  },
  refreshButtonDisabled: {
    opacity: 0.5,
  },
});

export default HeaderWithoutTab;

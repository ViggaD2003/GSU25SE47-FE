import { StyleSheet, Text, View } from "react-native";
import { CompactChildSelector } from "../../common";
import { useChildren, useAuth } from "../../../contexts";

const HeaderWithTab = ({
  title,
  subtitle,
  showChildSelector = false,
  onChildSelect,
}) => {
  const { children } = useChildren();
  const { user } = useAuth();
  const hasMultipleChildren = children && children.length > 1;

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 12,
  },
  childSelectorContainer: {
    alignItems: "center",
    marginTop: 8,
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
});

export default HeaderWithTab;

import { Container } from "@/components";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import HeaderWithTab from "@/components/ui/header/HeaderWithTab";

const DashboardScreen = () => {
  const { t } = useTranslation();
  return (
    <Container>
      {/* Header */}
      <HeaderWithTab
        title={t("tabs.dashboard")}
        subtitle={t("dashboard.mobileSubtitle")}
      />

      {/* Content */}
      <View style={styles.content}></View>
    </Container>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#181A3D",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
});

export default DashboardScreen;

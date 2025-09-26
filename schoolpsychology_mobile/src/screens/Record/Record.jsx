import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Container } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";
import { useTranslation } from "react-i18next";

const Record = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const navigateToSurveyRecord = () => {
    navigation.navigate("Survey", { screen: "SurveyRecord" });
  };

  const navigateToAppointmentRecord = () => {
    navigation.navigate("Appointment", { screen: "AppointmentRecord" });
  };

  const navigateToProgramRecord = () => {
    navigation.navigate("Program", { screen: "ProgramRecord" });
  };

  const navigateToClosedCases = () => {
    navigation.navigate("Case", { screen: "ClosedCases" });
  };

  return (
    <Container edges={["top", "bottom"]}>
      {/* Header */}
      <HeaderWithoutTab
        title={t("record.title")}
        onBackPress={() => navigation.goBack()}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.cardContainer}>
          {/* Survey Record Card */}
          <TouchableOpacity
            style={[styles.recordCard, styles.surveyCard]}
            onPress={navigateToSurveyRecord}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#E1F5FE" }]}
              >
                <Ionicons name="analytics-outline" size={32} color="#0277BD" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t("record.survey.title")}</Text>
              <Text style={styles.cardDescription}>
                {t("record.survey.description")}
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {/* Appointment Record Card */}
          <TouchableOpacity
            style={[styles.recordCard, styles.appointmentCard]}
            onPress={navigateToAppointmentRecord}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#F3E5F5" }]}
              >
                <Ionicons name="calendar-outline" size={32} color="#7B1FA2" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {t("record.appointment.title")}
              </Text>
              <Text style={styles.cardDescription}>
                {t("record.appointment.description")}
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {/* Program Record Card */}
          <TouchableOpacity
            style={[styles.recordCard, styles.programCard]}
            onPress={navigateToProgramRecord}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#E8F5E8" }]}
              >
                <Ionicons name="easel-outline" size={32} color="#2E7D32" />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{t("record.program.title")}</Text>
              <Text style={styles.cardDescription}>
                {t("record.program.description")}
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          {/* Closed Cases Card */}
          <TouchableOpacity
            style={[styles.recordCard, styles.closedCasesCard]}
            onPress={navigateToClosedCases}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <View
                style={[styles.iconBackground, { backgroundColor: "#FFE5E5" }]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color="#FF6A6A"
                />
              </View>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>
                {t("record.closedCases.title")}
              </Text>
              <Text style={styles.cardDescription}>
                {t("record.closedCases.description")}
              </Text>
            </View>
            <View style={styles.cardArrow}>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
  cardContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#181A3D",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  cardArrow: {
    marginLeft: 12,
  },
  surveyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#0277BD",
  },
  appointmentCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#7B1FA2",
  },
  programCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2E7D32",
  },
  closedCasesCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#FD4C4CFF",
  },
});

export default Record;

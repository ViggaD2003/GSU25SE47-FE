import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Container } from "../../components";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import HeaderWithoutTab from "@/components/ui/header/HeaderWithoutTab";

const Record = () => {
  const navigation = useNavigation();

  const navigateToSurveyRecord = () => {
    navigation.navigate("Survey", { screen: "SurveyRecord" });
  };

  const navigateToAppointmentRecord = () => {
    navigation.navigate("Appointment", { screen: "AppointmentRecord" });
  };

  const navigateToProgramRecord = () => {
    navigation.navigate("Program", { screen: "ProgramRecord" });
  };

  return (
    <Container>
      {/* Header */}
      <HeaderWithoutTab
        title="History"
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
              <Text style={styles.cardTitle}>Survey Records</Text>
              <Text style={styles.cardDescription}>
                View your survey responses and psychological assessments
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
              <Text style={styles.cardTitle}>Appointment History</Text>
              <Text style={styles.cardDescription}>
                Track your counseling sessions and appointment history
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
              <Text style={styles.cardTitle}>Completed Programs</Text>
              <Text style={styles.cardDescription}>
                Monitor your participation in support programs and activities
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
});

export default Record;

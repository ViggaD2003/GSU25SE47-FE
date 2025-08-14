import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import StatisticsCard from "./StatisticsCard";
import MentalHealthChart from "../charts/MentalHealthChart";
import CombinedChart from "../charts/CombinedChart";
import { Ionicons } from "@expo/vector-icons";

const MentalHealthSection = ({ mentalStatistic = {} }) => {
  const { t } = useTranslation();

  // Safety check for translation function
  if (!t || typeof t !== "function") {
    console.error("Translation function not available");
    return (
      <View
        style={{
          padding: 20,
          backgroundColor: "#fef2f2",
          margin: 20,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#dc2626", textAlign: "center" }}>
          Translation system not available
        </Text>
      </View>
    );
  }

  // Safety check for mentalStatistic prop
  if (!mentalStatistic || typeof mentalStatistic !== "object") {
    console.error("Invalid mentalStatistic prop:", mentalStatistic);
    return (
      <View
        style={{
          padding: 20,
          backgroundColor: "#fef2f2",
          margin: 20,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#dc2626", textAlign: "center" }}>
          Invalid data provided
        </Text>
      </View>
    );
  }

  const formatNumber = (num) => {
    console.log(num);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getProgressPercentage = (active, completed) => {
    const total = active + completed;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getAbsentPercentage = (total, absent) => {
    if (total === 0) return 0;
    return Math.round((absent / total) * 100);
  };

  const surveyStats = [
    {
      key: "active",
      title: t("dashboard.mentalHealth.survey.active"),
      value: formatNumber(mentalStatistic.survey?.activeSurveys || 0),
      subtitle: t("dashboard.mentalHealth.survey.activeSubtitle"),
      icon: "play-circle-outline",
      color: "#059669",
      trend: "up",
      percentage: getProgressPercentage(
        mentalStatistic.survey?.activeSurveys || 0,
        mentalStatistic.survey?.completedSurveys || 0
      ),
    },
    {
      key: "completed",
      title: t("dashboard.mentalHealth.survey.completed"),
      value: formatNumber(mentalStatistic.survey?.completedSurveys || 0),
      subtitle: t("dashboard.mentalHealth.survey.completedSubtitle"),
      icon: "checkmark-circle-outline",
      color: "#10B981",
    },
    {
      key: "skips",
      title: t("dashboard.mentalHealth.survey.skips"),
      value: formatNumber(mentalStatistic.survey?.numberOfSkips || 0),
      subtitle: t("dashboard.mentalHealth.survey.skipsSubtitle"),
      icon: "close-circle-outline",
      color: "#EF4444",
      trend: "down",
      percentage: getAbsentPercentage(
        mentalStatistic.survey?.completedSurveys || 0,
        mentalStatistic.survey?.numberOfSkips || 0
      ),
    },
  ];

  const appointmentStats = [
    {
      key: "active",
      title: t("dashboard.mentalHealth.appointment.active"),
      value: formatNumber(mentalStatistic.appointment?.activeAppointments || 0),
      subtitle: t("dashboard.mentalHealth.appointment.activeSubtitle"),
      icon: "calendar-outline",
      color: "#3B82F6",
      trend: "up",
      percentage: getProgressPercentage(
        mentalStatistic.appointment?.activeAppointments || 0,
        mentalStatistic.appointment?.completedAppointments || 0
      ),
    },
    {
      key: "completed",
      title: t("dashboard.mentalHealth.appointment.completed"),
      value: formatNumber(
        mentalStatistic.appointment?.completedAppointments || 0
      ),
      subtitle: t("dashboard.mentalHealth.appointment.completedSubtitle"),
      icon: "checkmark-circle-outline",
      color: "#10B981",
    },
    {
      key: "absent",
      title: t("dashboard.mentalHealth.appointment.absent"),
      value: formatNumber(mentalStatistic.appointment?.numOfAbsent || 0),
      subtitle: t("dashboard.mentalHealth.appointment.absentSubtitle"),
      icon: "close-circle-outline",
      color: "#EF4444",
      trend: "down",
      percentage: getAbsentPercentage(
        mentalStatistic.appointment?.completedAppointments || 0,
        mentalStatistic.appointment?.numOfAbsent || 0
      ),
    },
  ];

  const programStats = [
    {
      key: "active",
      title: t("dashboard.mentalHealth.program.active"),
      value: formatNumber(mentalStatistic.program?.activePrograms || 0),
      subtitle: t("dashboard.mentalHealth.program.activeSubtitle"),
      icon: "school-outline",
      color: "#F59E0B",
      trend: "up",
      percentage: getProgressPercentage(
        mentalStatistic.program?.activePrograms || 0,
        mentalStatistic.program?.completedPrograms || 0
      ),
    },
    {
      key: "completed",
      title: t("dashboard.mentalHealth.program.completed"),
      value: formatNumber(mentalStatistic.program?.completedPrograms || 0),
      subtitle: t("dashboard.mentalHealth.program.completedSubtitle"),
      icon: "checkmark-circle-outline",
      color: "#10B981",
    },
    {
      key: "absent",
      title: t("dashboard.mentalHealth.program.absent"),
      value: formatNumber(mentalStatistic.program?.numOfAbsent || 0),
      subtitle: t("dashboard.mentalHealth.program.absentSubtitle"),
      icon: "close-circle-outline",
      color: "#EF4444",
      trend: "down",
      percentage: getAbsentPercentage(
        mentalStatistic.program?.completedPrograms || 0,
        mentalStatistic.program?.numOfAbsent || 0
      ),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Combined Chart Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="analytics-outline" size={20} color="#6B7280" />
            </View>
            <Text style={styles.sectionTitle}>
              {t("dashboard.mentalHealth.combined.title")}
            </Text>
          </View>
        </View>

        <CombinedChart
          t={t}
          appointmentData={mentalStatistic.appointment?.dataSet || []}
          programData={mentalStatistic.program?.dataSet || []}
          surveyData={mentalStatistic.survey?.dataSet || []}
          title={t("dashboard.mentalHealth.combined.chartTitle")}
        />
      </View>

      {/* Survey Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: "#ECFDF5" }]}>
              <Ionicons name="clipboard-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.sectionTitle}>
              {t("dashboard.mentalHealth.survey.title")}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          {surveyStats.map((stat) => (
            <View key={stat.key} style={styles.statWrapper}>
              <StatisticsCard
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.color}
                valueColor={stat.color}
                size="small"
                trend={stat.trend}
                percentage={stat.percentage}
              />
            </View>
          ))}
        </ScrollView>

        <MentalHealthChart
          data={mentalStatistic.survey?.dataSet || []}
          title={t("dashboard.mentalHealth.survey.chartTitle")}
          type="survey"
          emptyMessage={t("dashboard.mentalHealth.survey.noData")}
        />
      </View>

      {/* Appointment Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: "#EFF6FF" }]}>
              <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.sectionTitle}>
              {t("dashboard.mentalHealth.appointment.title")}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          {appointmentStats.map((stat) => (
            <View key={stat.key} style={styles.statWrapper}>
              <StatisticsCard
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.color}
                valueColor={stat.color}
                size="small"
                trend={stat.trend}
                percentage={stat.percentage}
              />
            </View>
          ))}
        </ScrollView>

        <MentalHealthChart
          data={mentalStatistic.appointment?.dataSet || []}
          title={t("dashboard.mentalHealth.appointment.chartTitle")}
          type="appointment"
          emptyMessage={t("dashboard.mentalHealth.appointment.noData")}
        />
      </View>

      {/* Program Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <View style={[styles.sectionIcon, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="school-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.sectionTitle}>
              {t("dashboard.mentalHealth.program.title")}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          {programStats.map((stat) => (
            <View key={stat.key} style={styles.statWrapper}>
              <StatisticsCard
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
                icon={stat.icon}
                iconColor={stat.color}
                valueColor={stat.color}
                size="small"
                trend={stat.trend}
                percentage={stat.percentage}
              />
            </View>
          ))}
        </ScrollView>

        <MentalHealthChart
          data={mentalStatistic.program?.dataSet || []}
          title={t("dashboard.mentalHealth.program.chartTitle")}
          type="program"
          emptyMessage={t("dashboard.mentalHealth.program.noData")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statWrapper: {
    minWidth: 180,
  },
});

export default MentalHealthSection;

import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import StatisticsCard from "./StatisticsCard";
import { Ionicons } from "@expo/vector-icons";

const DashboardOverview = ({ overview = {} }) => {
  const { t } = useTranslation();

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getStatIcon = (type) => {
    switch (type) {
      case "surveys":
        return "clipboard-outline";
      case "programs":
        return "school-outline";
      case "appointments":
        return "calendar-outline";
      case "cases":
        return "folder-outline";
      default:
        return "analytics-outline";
    }
  };

  const getStatColor = (type) => {
    switch (type) {
      case "surveys":
        return "#059669";
      case "programs":
        return "#F59E0B";
      case "appointments":
        return "#3B82F6";
      case "cases":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const stats = [
    {
      key: "surveys",
      title: t("dashboard.overview.surveys"),
      value: formatNumber(overview.totalSurveys || 0),
      subtitle: t("dashboard.overview.surveysSubtitle"),
      icon: getStatIcon("surveys"),
      color: getStatColor("surveys"),
    },
    {
      key: "programs",
      title: t("dashboard.overview.programs"),
      value: formatNumber(overview.totalPrograms || 0),
      subtitle: t("dashboard.overview.programsSubtitle"),
      icon: getStatIcon("programs"),
      color: getStatColor("programs"),
    },
    {
      key: "appointments",
      title: t("dashboard.overview.appointments"),
      value: formatNumber(overview.totalAppointments || 0),
      subtitle: t("dashboard.overview.appointmentsSubtitle"),
      icon: getStatIcon("appointments"),
      color: getStatColor("appointments"),
    },
    {
      key: "cases",
      title: t("dashboard.overview.cases"),
      value: formatNumber(overview.totalCases || 0),
      subtitle: t("dashboard.overview.casesSubtitle"),
      icon: getStatIcon("cases"),
      color: getStatColor("cases"),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="analytics" size={24} color="#059669" />
            </View>
            <Text style={styles.title}>{t("dashboard.overview.title")}</Text>
          </View>
          <Text style={styles.subtitle}>
            {t("dashboard.overview.subtitle")}
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
        style={styles.statsScrollView}
      >
        {stats.map((stat, index) => (
          <View key={stat.key} style={styles.statWrapper}>
            <StatisticsCard
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              iconColor={stat.color}
              valueColor={stat.color}
              size="medium"
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    // backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerContent: {
    gap: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginLeft: 52,
  },
  statsScrollView: {
    // maxHeight: 100,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  statWrapper: {
    // minWidth: 200,
    // minHeight: 230,
  },
});

export default DashboardOverview;

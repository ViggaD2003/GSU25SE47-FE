import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import Container from "../../components/Container";
import { getPublishedSurveys } from "../../utils/SurveyService";
import { surveyData } from "../../constants/survey";
import Loading from "../../components/common/Loading";
import SurveyCard from "../../components/common/SurveyCard";

const { width } = Dimensions.get("window");
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;
// const isLargeDevice = width >= 414;

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);

  const fetchSurveys = async () => {
    try {
      const response = await getPublishedSurveys();
      // setSurveys(Array.isArray(response) ? response : response.data || []);
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );

      setData(publishedSurveys);
    } catch (error) {
      console.error("Lỗi khi tải surveys:", error);
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );

      setData(publishedSurveys);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setData([]);
    } catch (error) {
      console.error("Lỗi khi tải appointments:", error);
    }
  };

  const fetchPrograms = async () => {
    try {
      setData([]);
    } catch (error) {
      console.error("Lỗi khi tải programs:", error);
    }
  };

  const onPress = useCallback((type) => {
    setActiveTab(type);
    switch (type) {
      case "survey":
        fetchSurveys();
        break;
      case "appointment":
        fetchAppointments();
      case "program":
        fetchPrograms();
        break;
    }
  }, []);

  useEffect(() => {
    onPress("survey");
  }, []);

  return (
    <Container>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
      >
        {/* Stress Alert */}
        <View style={styles.alertSection}>
          <View style={styles.alertBox}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.alertTitle}>High Stress Level Detected</Text>
            </View>
            <Text style={styles.alertDesc}>
              Based on your recent assessments, we recommend taking action to
              manage your stress levels.
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity style={styles.alertBtn}>
                <Text style={styles.alertBtnText}>Book Counseling Session</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.alertBtnOutline}>
                <Text style={styles.alertBtnOutlineText}>
                  Join Mindfulness Workshop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Featured Programs */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Programs</Text>
            <TouchableOpacity style={styles.sectionLinkContainer}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.featuredCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
              }}
              style={styles.featuredImg}
              resizeMode="cover"
            />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTag}>SUPPORT PROGRAM</Text>
                <Text style={styles.featuredTitle}>
                  Career Development Workshop
                </Text>
                <Text style={styles.featuredTime}>
                  May 25, 2025 • 13:00 - 15:30
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Check & Connect */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Check & Connect</Text>
          </View>
          <View style={styles.connectRow}>
            <TouchableOpacity style={styles.connectBox}>
              <View style={styles.connectIconContainer}>
                <Text style={styles.connectIcon}>💬</Text>
              </View>
              <Text style={styles.connectTitle}>Talk to Expert</Text>
              <Text style={styles.connectDesc}>
                Schedule a session with our mental health professionals
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.connectBox}>
              <View style={styles.connectIconContainer}>
                <Text style={styles.connectIcon}>📄</Text>
              </View>
              <Text style={styles.connectTitle}>Take Assessment</Text>
              <Text style={styles.connectDesc}>
                Complete surveys to track your mental wellbeing
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Events */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Events</Text>
          </View>
          <View style={styles.eventTabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventTabsScrollContent}
            >
              <TouchableOpacity
                style={
                  activeTab === "survey"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => onPress("survey")}
              >
                <Text
                  style={
                    activeTab === "survey"
                      ? styles.eventTabTextActive
                      : styles.eventTabText
                  }
                >
                  Survey
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  activeTab === "appointment"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => onPress("appointment")}
              >
                <Text
                  style={
                    activeTab === "appointment"
                      ? styles.eventTabTextActive
                      : styles.eventTabText
                  }
                >
                  Appointments
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  activeTab === "program"
                    ? styles.eventTabActive
                    : styles.eventTab
                }
                onPress={() => onPress("program")}
              >
                <Text
                  style={
                    activeTab === "program"
                      ? styles.eventTabTextActive
                      : styles.eventTabText
                  }
                >
                  Support Programs
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
          <View style={styles.requiredSurveys}>
            {/* <View style={styles.requiredTitleRow}>
              <Text style={styles.requiredTitle}>Required Surveys</Text>
              <Badge>{data.length} </Badge>
            </View> */}
            {loading ? (
              <Loading text={`Loading ${activeTab}s...`} />
            ) : data.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>No available {activeTab}</Text>
              </View>
            ) : activeTab === "survey" ? (
              data.map((data, index) => (
                <SurveyCard survey={data} key={index} navigation={navigation} />
              ))
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingTop: 0,
  },
  alertSection: {
    marginTop: 10,
    marginBottom: 32,
  },
  alertBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
    padding: isSmallDevice ? 20 : 24,
    borderLeftWidth: 5,
    borderLeftColor: "#EF4444",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  alertIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  alertTitle: {
    fontWeight: "700",
    color: "#DC2626",
    fontSize: isSmallDevice ? 16 : 17,
    flex: 1,
  },
  alertDesc: {
    color: "#7F1D1D",
    fontSize: isSmallDevice ? 14 : 15,
    marginBottom: 20,
    lineHeight: 22,
  },
  alertActions: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  alertBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    minWidth: 150,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  alertBtnText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  alertBtnOutline: {
    borderWidth: 2,
    borderColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    minWidth: 150,
    backgroundColor: "#fff",
  },
  alertBtnOutlineText: {
    color: "#DC2626",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : isMediumDevice ? 22 : 24,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sectionLinkContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  sectionLink: {
    color: "#3B82F6",
    fontWeight: "600",
    fontSize: 14,
  },
  featuredCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  featuredImg: {
    width: "100%",
    height: isSmallDevice ? 180 : isMediumDevice ? 200 : 220,
  },
  featuredOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  featuredContent: {
    padding: isSmallDevice ? 20 : 24,
  },
  featuredTag: {
    color: "#FBBF24",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.8,
  },
  featuredTitle: {
    color: "#fff",
    fontSize: isSmallDevice ? 18 : isMediumDevice ? 20 : 22,
    fontWeight: "700",
    marginBottom: 6,
    lineHeight: isSmallDevice ? 22 : isMediumDevice ? 24 : 26,
  },
  featuredTime: {
    color: "#E5E7EB",
    fontSize: isSmallDevice ? 13 : 14,
    fontWeight: "500",
  },
  connectRow: {
    flexDirection: "row",
    gap: isSmallDevice ? 16 : 20,
  },
  connectBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    alignItems: "center",
    padding: isSmallDevice ? 20 : 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  connectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  connectIcon: {
    fontSize: isSmallDevice ? 28 : 32,
  },
  connectTitle: {
    fontSize: isSmallDevice ? 17 : 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    textAlign: "center",
  },
  connectDesc: {
    color: "#64748B",
    textAlign: "center",
    fontSize: isSmallDevice ? 14 : 15,
    lineHeight: 20,
  },
  eventTabsContainer: {
    marginBottom: 20,
    // backgroundColor: "#F8FAFC",
    borderRadius: 20,
  },
  eventTabsScrollContent: {
    paddingRight: 4,
  },
  eventTab: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 18 : 20,
    marginHorizontal: 2,
    minWidth: isSmallDevice ? 120 : 140,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTabActive: {
    backgroundColor: "#059669",
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 14 : 16,
    paddingHorizontal: isSmallDevice ? 18 : 20,
    marginHorizontal: 2,
    minWidth: isSmallDevice ? 120 : 140,
    alignItems: "center",
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTabText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
  },
  eventTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: isSmallDevice ? 13 : 14,
    textAlign: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 17,
    fontWeight: "500",
  },
});

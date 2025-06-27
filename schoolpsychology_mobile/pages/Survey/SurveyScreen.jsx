import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Container from "../../components/Container";
import SurveyCard from "../../components/common/SurveyCard";
import Loading from "../../components/common/Loading";
import { getPublishedSurveys } from "../../utils/SurveyService";
import { surveyData } from "../../constants/survey";

const SurveyScreen = ({ navigation }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSurveys = async () => {
    try {
      const response = await getPublishedSurveys();
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );
      setSurveys(publishedSurveys);
    } catch (error) {
      console.error("Error loading surveys:", error);
      const publishedSurveys = surveyData.filter(
        (survey) => survey.status === "PUBLISHED"
      );
      setSurveys(publishedSurveys);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Container>
        <View style={styles.header}>
          <Text style={styles.title}>Surveys</Text>
          <Text style={styles.subtitle}>
            Complete surveys to track your mental wellbeing
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {surveys.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No surveys available</Text>
              <Text style={styles.emptySubtext}>
                Check back later for new surveys
              </Text>
            </View>
          ) : (
            surveys.map((survey, index) => (
              <SurveyCard
                survey={survey}
                key={survey.surveyId || index}
                navigation={navigation}
              />
            ))
          )}
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});

export default SurveyScreen;

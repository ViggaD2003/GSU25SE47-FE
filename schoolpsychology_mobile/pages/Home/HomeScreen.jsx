import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import Container from "../../components/Container";
import { getPublishedSurveys } from "../../utils/SurveyService";
export default function HomeScreen() {

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAllSurveys = async () => {
      try {
        const response = await getPublishedSurveys();
        // Nếu response là mảng thì set luôn, nếu response có dạng {data: [...]}, thì set response.data
        setSurveys(Array.isArray(response) ? response : response.data || []);
      } catch (error) {
        console.error("Lỗi khi tải surveys:", error);
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSurveys();
  }, []);


  return (
    <Container>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header User Info */}
        <View style={styles.headerRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>Nguyen Hoang Khanh Uyen</Text>
            <Text style={styles.userRole}>Student</Text>
          </View>
        </View>

        {/* Stress Alert */}
        <View style={styles.alertBox}>
          <View style={styles.alertRow}>
            <Text style={styles.alertIcon}>⚠️</Text>
            <Text style={styles.alertTitle}>High Stress Level Detected</Text>
          </View>
          <Text style={styles.alertDesc}>
            Based on your recent assessments, we recommend taking action to manage your stress levels.
          </Text>
          <View style={styles.alertActions}>
            <TouchableOpacity style={styles.alertBtn}><Text style={styles.alertBtnText}>Book Counseling Session</Text></TouchableOpacity>
            <TouchableOpacity style={styles.alertBtnOutline}><Text style={styles.alertBtnOutlineText}>Join Mindfulness Workshop</Text></TouchableOpacity>
          </View>
        </View>

        {/* Featured Programs */}
        <View style={{ marginTop: 24 }}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Featured Programs</Text>
            <TouchableOpacity><Text style={styles.sectionLink}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.featuredCard}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2' }} style={styles.featuredImg} />
            <View style={styles.featuredOverlay}>
              <Text style={styles.featuredTag}>SUPPORT PROGRAM</Text>
              <Text style={styles.featuredTitle}>Career Development Workshop</Text>
              <Text style={styles.featuredTime}>May 25,2025  •  13:00 - 15:30</Text>
            </View>
          </View>
        </View>

        {/* Check & Connect */}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Check & Connect</Text>
          <View style={styles.connectRow}>
            <View style={styles.connectBox}>
              <Text style={styles.connectIcon}>💬</Text>
              <Text style={styles.connectTitle}>Talk to Expert</Text>
              <Text style={styles.connectDesc}>Schedule a session with our mental health professionals</Text>
            </View>
            <View style={styles.connectBox}>
              <Text style={styles.connectIcon}>📄</Text>
              <Text style={styles.connectTitle}>Take Assessment</Text>
              <Text style={styles.connectDesc}>Complete surveys to track your mental wellbeing</Text>
            </View>
          </View>
        </View>

        {/* My Events */}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>My Events</Text>
          <View style={styles.eventTabs}>
            <TouchableOpacity style={styles.eventTabActive}><Text style={styles.eventTabTextActive}>Survey</Text></TouchableOpacity>
            <TouchableOpacity style={styles.eventTab}><Text style={styles.eventTabText}>Appointments</Text></TouchableOpacity>
            <TouchableOpacity style={styles.eventTab}><Text style={styles.eventTabText}>Support Programs</Text></TouchableOpacity>
          </View>
          <View style={styles.requiredSurveys}>
            <Text style={styles.requiredTitle}>Required Surveys <Text style={styles.pendingBadge}>{surveys.length} pending</Text></Text>
            {loading ? (
              <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#2E7D32" />
            ) : (
              surveys.map(survey => (
                <View style={styles.surveyCard} key={survey.surveyId}>
                  <View style={styles.surveyCardRow}>
                    <Text style={styles.surveyCardTitle}>{survey.name}</Text>
                    {survey.isRequired && <Text style={styles.surveyUrgent}>Required</Text>}
                  </View>
                  <Text style={styles.surveyCardDesc}>{survey.description}</Text>
                  <Text style={styles.surveyCardDue}>
                    {survey.startDate && survey.endDate
                      ? `From: ${new Date(survey.startDate).toLocaleDateString()} - To: ${new Date(survey.endDate).toLocaleDateString()}`
                      : ""}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                    {survey.isRecurring
                      ? `Recurring: ${survey.recurringCycle === "MONTHLY" ? "Monthly" : survey.recurringCycle}`
                      : "Not recurring"}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 12, marginBottom: 4 }}>
                    Status: {survey.status === "PUBLISHED" ? "Published" : survey.status}
                  </Text>
                  <TouchableOpacity>
                    <Text style={styles.surveyStart}>Start Survey</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatarBox: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  avatarIcon: { fontSize: 32 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  userRole: { fontSize: 16, color: '#888', marginTop: 2 },
  alertBox: { backgroundColor: '#FFECEC', borderRadius: 12, padding: 16, marginBottom: 16 },
  alertRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  alertIcon: { fontSize: 18, color: '#E53935', marginRight: 6 },
  alertTitle: { fontWeight: 'bold', color: '#E53935', fontSize: 16 },
  alertDesc: { color: '#E53935', fontSize: 13, marginBottom: 10 },
  alertActions: { flexDirection: 'row', gap: 10 },
  alertBtn: { backgroundColor: '#E53935', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, marginRight: 8 },
  alertBtnText: { color: '#fff', fontWeight: 'bold' },
  alertBtnOutline: { borderWidth: 1, borderColor: '#E53935', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  alertBtnOutlineText: { color: '#E53935', fontWeight: 'bold' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  sectionLink: { color: '#5B5BFF', fontWeight: 'bold' },
  featuredCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 8 },
  featuredImg: { width: '100%', height: 180 },
  featuredOverlay: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
  featuredTag: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 2 },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 2 },
  featuredTime: { color: '#fff', fontSize: 14 },
  connectRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  connectBox: { flex: 1, backgroundColor: '#F7F7FF', borderRadius: 16, alignItems: 'center', padding: 18 },
  connectIcon: { fontSize: 32, marginBottom: 8 },
  connectTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  connectDesc: { color: '#888', textAlign: 'center', fontSize: 15 },
  eventTabs: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 12 },
  eventTab: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingVertical: 10, alignItems: 'center', elevation: 2 },
  eventTabActive: { flex: 1, backgroundColor: '#2E7D32', borderRadius: 10, paddingVertical: 10, alignItems: 'center', elevation: 2 },
  eventTabText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  eventTabTextActive: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  requiredSurveys: { marginTop: 8 },
  requiredTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  pendingBadge: { backgroundColor: '#FFD600', color: '#fff', borderRadius: 8, paddingHorizontal: 8, fontSize: 12, marginLeft: 4 },
  surveyCard: { backgroundColor: '#FFFDF6', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  surveyCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  surveyCardTitle: { fontWeight: 'bold', fontSize: 16, color: '#222' },
  surveyUrgent: { color: '#E53935', fontWeight: 'bold', fontSize: 13 },
  surveyCardDesc: { color: '#444', fontSize: 14, marginBottom: 2 },
  surveyCardDue: { color: '#888', fontSize: 12, marginBottom: 8 },
  surveyProgressBar: { height: 6, backgroundColor: '#EEE', borderRadius: 4, marginBottom: 8 },
  surveyProgress: { width: '0%', height: 6, backgroundColor: '#FFD600', borderRadius: 4 },
  surveyStart: { color: '#E53935', fontWeight: 'bold', textAlign: 'center', marginTop: 2 },
});

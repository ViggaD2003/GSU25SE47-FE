import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GlobalStyles } from "../../constants";

const SurveyCard = ({ survey, navigation }) => {
  const onPress = () => {
    if (navigation) {
      navigation.navigate("Survey", {
        screen: "SurveyInfo",
        params: { survey },
      });
    }
  };

  return (
    <TouchableOpacity
      key={survey?.surveyId}
      onPress={onPress}
      style={styles.surveyCard}
    >
      <View style={styles.surveyCardHeader}>
        <Text style={styles.surveyCardTitle} numberOfLines={2}>
          {survey?.name}
        </Text>
        {survey?.isRequired && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredBadgeText}>Required</Text>
          </View>
        )}
      </View>
      <Text style={styles.surveyCardDesc} numberOfLines={1}>
        {survey.description}
      </Text>
      <View style={styles.surveyCardInfoContainer}>
        <View style={styles.surveyCardInfo}>
          <Text style={styles.surveyCardDue}>
            {survey.startDate && survey.endDate
              ? `Due: ${new Date(
                  survey.startDate
                ).toLocaleDateString()} - ${new Date(
                  survey.endDate
                ).toLocaleDateString()}`
              : ""}
          </Text>
          <Text style={styles.surveyMetaText}>
            {survey.isRecurring
              ? `Recurring: ${
                  survey.recurringCycle === "MONTHLY"
                    ? "Monthly"
                    : survey.recurringCycle
                }`
              : "Not recurring"}
          </Text>
        </View>
        <Ionicons
          name="play-circle-outline"
          size={26}
          color={GlobalStyles.colors.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  surveyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  surveyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  surveyCardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1A1A1A",
    flex: 1,
    marginRight: 12,
    lineHeight: 22,
  },
  requiredBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  requiredBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  surveyCardDesc: {
    color: "#374151",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  surveyCardInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  surveyCardInfo: {
    gap: 4,
  },
  surveyCardDue: {
    color: "#6B7280",
    fontSize: 12,
    marginBottom: 8,
    fontWeight: "500",
  },
  surveyMetaText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  // surveyStartButton: {
  //   backgroundColor: "#EF4444",
  //   borderRadius: 12,
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   alignItems: "center",
  //   shadowColor: "#EF4444",
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 4,
  //   elevation: 3,
  // },
  // surveyStartText: {
  //   color: "#fff",
  //   fontWeight: "600",
  //   fontSize: 15,
  // },
});

export default SurveyCard;

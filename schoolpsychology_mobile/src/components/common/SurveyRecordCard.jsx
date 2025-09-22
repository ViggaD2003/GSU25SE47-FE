import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getLevelConfig, GlobalStyles } from "../../constants";
import { formatDate } from "../../utils/helpers";
import { useTranslation } from "react-i18next";

const SurveyRecordCard = ({ record, onPress, showIntervention = true }) => {
  const isSkipped = record?.isSkipped || false;
  const levelConfig = getLevelConfig(
    record?.level?.code || record?.level?.levelType
  );
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.recordCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordIcon}>
          <Ionicons name="document-text" size={24} color="#3B82F6" />
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>
            {record?.survey?.title || t("survey.record.title")}
          </Text>
          <Text style={styles.recordDate}>
            {isSkipped
              ? t("survey.record.skippedAt")
              : t("survey.record.completedAt")}
            : {formatDate(record?.completedAt)}
          </Text>
          {record?.survey?.surveyType && (
            <Text style={styles.surveyType}>
              {record.survey.surveyType === "SCREENING"
                ? t("survey.record.screening")
                : record.survey.surveyType === "FOLLOWUP"
                ? t("survey.record.followup")
                : record.survey.surveyType}
            </Text>
          )}
        </View>
        <View style={styles.scoreContainer}>
          <View
            style={[
              styles.scoreCircle,
              {
                borderColor: isSkipped ? "#6B7280" : levelConfig?.color,
                backgroundColor: isSkipped ? "#F3F4F6" : "#FAFAFA",
              },
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                {
                  color: isSkipped ? "#6B7280" : levelConfig?.color,
                },
              ]}
            >
              {isSkipped ? t("survey.record.skipped") : record?.totalScore}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordDetails}>
        {!isSkipped && levelConfig && (
          <View style={styles.scoreInfo}>
            <Ionicons
              name={levelConfig?.icon}
              size={20}
              color={levelConfig?.color}
            />
            <Text style={[styles.scoreLevel, { color: levelConfig?.color }]}>
              {levelConfig?.label}
            </Text>
          </View>
        )}

        {isSkipped && (
          <View style={styles.skippedInfo}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
            <Text style={styles.skippedText}>{t("survey.record.skipped")}</Text>
          </View>
        )}

        {showIntervention &&
          !isSkipped &&
          levelConfig &&
          levelConfig?.interventionRequired && (
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestionText} numberOfLines={2}>
                {levelConfig?.interventionRequired}
              </Text>
            </View>
          )}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.viewResultText}>
          {t("survey.record.viewResult")}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 2,
  },
  surveyType: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "500",
  },
  scoreContainer: {
    marginLeft: 12,
  },
  scoreCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 12,
    fontWeight: "700",
  },
  recordDetails: {
    marginBottom: 16,
  },
  scoreInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scoreLevel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  skippedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  skippedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginLeft: 8,
  },
  suggestionContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
  },
  suggestionText: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16,
  },
  recordFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  viewResultText: {
    fontSize: 14,
    color: GlobalStyles.colors.primary,
    fontWeight: "600",
  },
});

export default SurveyRecordCard;

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

//Filter survey types
export const filterSurveyTypes = ({
  allowedTypes = ["SCREENING", "FOLLOWUP", "PROGRAM"],
  surveyType,
}) => {
  return allowedTypes.includes(surveyType);
};

export const getScoreColor = (levelConfig) => {
  if (!levelConfig) return "#6B7280";

  // Handle both string and object level config
  const level =
    typeof levelConfig === "string"
      ? levelConfig.toLowerCase()
      : levelConfig?.label?.toLowerCase();

  switch (level) {
    case "low":
      return "#10B981"; // Green
    case "medium":
    case "mid":
      return "#F59E0B"; // Yellow
    case "high":
      return "#EF4444"; // Red
    case "critical":
      return "#DC2626"; // Dark red
    default:
      return "#6B7280";
  }
};

export const getScoreLevel = (levelConfig) => {
  if (!levelConfig) return "Không xác định";

  // Handle both string and object level config
  if (typeof levelConfig === "string") {
    return levelConfig;
  }

  return levelConfig?.label || "Không xác định";
};

export const getScoreIcon = (levelConfig) => {
  if (!levelConfig) return "help-circle";

  // Handle both string and object level config
  const level =
    typeof levelConfig === "string"
      ? levelConfig.toLowerCase()
      : levelConfig?.label?.toLowerCase();

  switch (level) {
    case "low":
      return "happy";
    case "medium":
    case "mid":
      return "help-circle";
    case "high":
    case "critical":
      return "sad";
    default:
      return "help-circle";
  }
};

// Helper function to get level description
export const getLevelDescription = (levelConfig) => {
  if (!levelConfig) return "";

  if (typeof levelConfig === "string") {
    return "";
  }

  return levelConfig?.description || "";
};

// Helper function to get intervention required
export const getInterventionRequired = (levelConfig) => {
  if (!levelConfig) return "";

  if (typeof levelConfig === "string") {
    return "";
  }

  return levelConfig?.interventionRequired || "";
};

// Helper function to get symptoms description
export const getSymptomsDescription = (levelConfig) => {
  if (!levelConfig) return "";

  if (typeof levelConfig === "string") {
    return "";
  }

  return levelConfig?.symptomsDescription || "";
};

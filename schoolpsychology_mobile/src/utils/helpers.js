export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getScoreColor = (levelConfig) => {
  if (!levelConfig) return "#6B7280";

  switch (levelConfig) {
    case "low":
      return "#10B981"; // Green
    case "medium":
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
  return levelConfig;
};

export const getScoreIcon = (levelConfig) => {
  if (!levelConfig) return "help-circle";

  switch (levelConfig) {
    case "low":
      return "happy";
    case "medium":
      return "help-circle";
    case "high":
    case "critical":
      return "sad";
    default:
      return "help-circle";
  }
};

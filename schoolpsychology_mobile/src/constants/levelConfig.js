export const LEVEL_CONFIG = {
  LOW: {
    icon: "checkmark-circle",
    color: "#10B981", // Green
    textColor: "#FFFFFF",
    backgroundColor: "#D1FAE5",
    borderColor: "#10B981",
    gradient: ["#10B981", "#059669"],
    label: "Thấp",
    description: "Mức độ nhẹ, không cần can thiệp đặc biệt",
  },
  MID: {
    icon: "information-circle",
    color: "#3B82F6", // Blue
    textColor: "#FFFFFF",
    backgroundColor: "#DBEAFE",
    borderColor: "#3B82F6",
    gradient: ["#3B82F6", "#1D4ED8"],
    label: "Trung bình",
    description: "Mức độ trung bình, cần theo dõi",
  },
  MODERATE: {
    icon: "warning",
    color: "#F59E0B", // Orange
    textColor: "#FFFFFF",
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
    gradient: ["#F59E0B", "#D97706"],
    label: "Vừa phải",
    description: "Mức độ vừa phải, cần can thiệp nhẹ",
  },
  SEVERE: {
    icon: "alert-circle",
    color: "#EF4444", // Red
    textColor: "#FFFFFF",
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    gradient: ["#EF4444", "#DC2626"],
    label: "Cao",
    description: "Mức độ nghiêm trọng, cần can thiệp ngay",
  },
  HIGH: {
    icon: "alert-circle",
    color: "#EF4444", // Red
    textColor: "#FFFFFF",
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    gradient: ["#EF4444", "#DC2626"],
    label: "Cao",
    description: "Mức độ cao, cần can thiệp ngay",
  },
  CRITICAL: {
    icon: "close-circle",
    color: "#7C2D12", // Dark Red
    textColor: "#FFFFFF",
    backgroundColor: "#FED7D7",
    borderColor: "#7C2D12",
    gradient: ["#7C2D12", "#991B1B"],
    label: "Nguy hiểm",
    description: "Mức độ nguy hiểm, cần can thiệp khẩn cấp",
  },
};

// Helper function to get level config
export const getLevelConfig = (level) => {
  if (!level) return;
  const upperLevel = level?.toUpperCase();
  return LEVEL_CONFIG[upperLevel] || LEVEL_CONFIG.MID; // Default to MID if level not found
};

// Helper function to get level by score
export const getLevelByScore = (score, maxScore = 100) => {
  const percentage = (score / maxScore) * 100;

  if (percentage <= 20) return "LOW";
  if (percentage <= 40) return "MID";
  if (percentage <= 60) return "MODERATE";
  if (percentage <= 80) return "SEVERE";
  return "CRITICAL";
};

// Helper function to get all levels
export const getAllLevels = () => {
  return Object.keys(LEVEL_CONFIG);
};

// Helper function to get level colors
export const getLevelColors = () => {
  return Object.entries(LEVEL_CONFIG).reduce((acc, [key, config]) => {
    acc[key] = {
      color: config.color,
      backgroundColor: config.backgroundColor,
      borderColor: config.borderColor,
      textColor: config.textColor,
    };
    return acc;
  }, {});
};

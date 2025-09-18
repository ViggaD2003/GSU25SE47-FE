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

//NEW
export const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;


export function maskEmail(email) {
  if (typeof email !== "string" || !email) return "";
  const at = email.indexOf("@");
  if (at <= 0 || at === email.length - 1) return email;
  const name = email.slice(0, at);
  const domain = email.slice(at + 1);
  const masked = name.length <= 2 ? name[0] + "*" : name[0] + "*".repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${masked}@${domain}`;
}


export async function apiSendOtp(email) {
  console.log("Email Verify", email);
  
  const respnse = await api.post(`/api/v1/auth/verify-email?email=${email}`);
  console.log("respnse", respnse);

  return respnse;
}


export async function apiVerifyOtp(email, otp) {
  const response = await api.post(`/api/v1/auth/activate-email?token=${otp}`);
  return response;
}


export async function apiResetPassword(email, password, confirm) {
  const response = await api.post(`/api/v1/auth/change-forgot-password?email=${email}`, { newPassword: password, confirmNewPassword: confirm });
  return response;
}


export function getPasswordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(4, score);
}


import { api } from "@/services";
// ---------- src/components/StrengthBar.jsx
import React from "react";
import { View, Text } from "react-native";


export default function StrengthBar({ score, color }) {
  const pct = (score / 4) * 100;
  return (
    <View style={{ marginTop: 8 }}>
      <View style={{ height: 8, width: "100%", backgroundColor: "#E5E7EB", borderRadius: 6, overflow: "hidden" }}>
        <View style={{ height: 8, width: `${pct}%`, backgroundColor: color, borderRadius: 6 }} />
      </View>
      <Text style={{ marginTop: 6, fontSize: 12, color: "#6B7280" }}>
        {["Too weak", "Weak", "Fair", "Good", "Strong"][score]}
      </Text>
    </View>
  );
}

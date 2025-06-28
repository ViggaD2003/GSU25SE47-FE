import api from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const getPublishedSurveys = async () => {
  try {
    const response = await api.get("/api/v1/survey/published");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy survey đã publish:", err);
    throw err;
  }
};

// Save survey progress
export const saveSurveyProgress = async (surveyId, answers) => {
  try {
    const key = `survey_progress_${surveyId}`;
    const progressData = {
      surveyId,
      answers,
      timestamp: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(progressData));
    console.log("Survey progress saved:", surveyId);
    return true;
  } catch (error) {
    console.error("Error saving survey progress:", error);
    return false;
  }
};

// Load survey progress
export const loadSurveyProgress = async (surveyId) => {
  try {
    const key = `survey_progress_${surveyId}`;
    const progressData = await AsyncStorage.getItem(key);
    if (progressData) {
      const parsed = JSON.parse(progressData);
      console.log("Survey progress loaded:", surveyId);
      return parsed.answers;
    }
    return null;
  } catch (error) {
    console.error("Error loading survey progress:", error);
    return null;
  }
};

// Clear survey progress
export const clearSurveyProgress = async (surveyId) => {
  try {
    const key = `survey_progress_${surveyId}`;
    await AsyncStorage.removeItem(key);
    console.log("Survey progress cleared:", surveyId);
    return true;
  } catch (error) {
    console.error("Error clearing survey progress:", error);
    return false;
  }
};

// Get all saved survey progress
export const getAllSurveyProgress = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const surveyKeys = keys.filter((key) => key.startsWith("survey_progress_"));
    const progressData = await AsyncStorage.multiGet(surveyKeys);
    return progressData.map(([key, value]) => JSON.parse(value));
  } catch (error) {
    console.error("Error getting all survey progress:", error);
    return [];
  }
};

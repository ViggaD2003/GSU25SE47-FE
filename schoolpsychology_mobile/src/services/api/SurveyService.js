import api from "./axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser } from "../auth/AuthService";

export const getPublishedSurveys = async () => {
  try {
    const response = await api.get("/api/v1/survey/published");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy survey đã publish:", err);
    throw err;
  }
};

//Get survey records
export const getSurveyRecords = async () => {
  try {
    const response = await api.get("/api/v1/survey-records");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu khảo sát:", error);
    throw error;
  }
};

// Post survey result
export const postSurveyResult = async (result) => {
  try {
    const response = await api.post("/api/v1/survey-records", result);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi gửi kết quả khảo sát:", error);
    throw error;
  }
};

// Save survey progress with user info
export const saveSurveyProgress = async (surveyId, answers) => {
  try {
    const key = `survey_progress_${surveyId}`;

    // Get current user info
    const currentUser = await getCurrentUser();
    const userInfo = currentUser
      ? {
          userId: currentUser.userId,
          email: currentUser.email,
        }
      : null;

    const progressData = {
      surveyId,
      answers,
      userId: userInfo?.userId,
      email: userInfo?.email,
      timestamp: new Date().toISOString(),
    };

    await AsyncStorage.setItem(key, JSON.stringify(progressData));
    console.log(
      "Survey progress saved:",
      surveyId,
      "for user:",
      userInfo?.email
    );
    return true;
  } catch (error) {
    console.error("Error saving survey progress:", error);
    return false;
  }
};

// Load survey progress for current user
export const loadSurveyProgress = async (surveyId) => {
  try {
    const key = `survey_progress_${surveyId}`;
    const progressData = await AsyncStorage.getItem(key);

    if (progressData) {
      const parsed = JSON.parse(progressData);

      // Get current user info
      const currentUser = await getCurrentUser();

      const currentUserId = currentUser?.userId;
      const currentEmail = currentUser?.email;

      // Check if the saved progress belongs to current user
      if (parsed.userId === currentUserId && parsed.email === currentEmail) {
        // console.log("Survey progress loaded for user:", currentEmail);
        return parsed.answers;
      } else {
        console.log(
          "Survey progress found but belongs to different user, clearing..."
        );
        // Clear progress that doesn't belong to current user
        await AsyncStorage.removeItem(key);
        return null;
      }
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

// Get all saved survey progress for current user
export const getAllSurveyProgress = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const surveyKeys = keys.filter((key) => key.startsWith("survey_progress_"));
    const progressData = await AsyncStorage.multiGet(surveyKeys);

    // Get current user info
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.userId;
    const currentEmail = currentUser?.email;

    // Filter progress data for current user only
    const userProgressData = progressData
      .map(([key, value]) => {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.error("Error parsing progress data:", error);
          return null;
        }
      })
      .filter(
        (data) =>
          data && data.userId === currentUserId && data.email === currentEmail
      );

    return userProgressData;
  } catch (error) {
    console.error("Error getting all survey progress:", error);
    return [];
  }
};

// Clear survey progress from other users
export const clearOtherUsersProgress = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const surveyKeys = keys.filter((key) => key.startsWith("survey_progress_"));
    const progressData = await AsyncStorage.multiGet(surveyKeys);

    // Get current user info
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.userId;
    const currentEmail = currentUser?.email;

    // Find keys to remove (progress from other users)
    const keysToRemove = [];
    progressData.forEach(([key, value]) => {
      try {
        const parsed = JSON.parse(value);
        if (
          parsed &&
          (parsed.userId !== currentUserId || parsed.email !== currentEmail)
        ) {
          keysToRemove.push(key);
        }
      } catch (error) {
        console.error("Error parsing progress data:", error);
        // Remove corrupted data
        keysToRemove.push(key);
      }
    });

    // Remove progress from other users
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(
        "Cleared progress from other users:",
        keysToRemove.length,
        "items"
      );
    }

    return keysToRemove.length;
  } catch (error) {
    console.error("Error clearing other users progress:", error);
    return 0;
  }
};

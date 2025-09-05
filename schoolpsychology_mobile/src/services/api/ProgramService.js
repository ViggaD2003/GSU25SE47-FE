import api from "./axios";

// Get all recommended programs
export const fetchAllRecommendedPrograms = async (studentId) => {
  try {
    if (!studentId) {
      throw new Error("Student ID is required");
    }
    const response = await api.get(
      `/api/v1/support-programs/recommend?studentId=${studentId}`
    );
    return response.data || [];
  } catch (error) {
    console.warn("Error fetching recommended programs:", error);
    throw error;
  }
};

export const fetchActivePrograms = async () => {
  try {
    const response = await api.get(`/api/v1/support-programs/active-program`);
    return response.data || [];
  } catch (error) {
    console.warn("Error fetching recommended programs:", error);
    throw error;
  }
};

// Get program details by ID
export const fetchProgramDetails = async (programId, studentId) => {
  try {
    if (!programId) {
      throw new Error("Program ID is required");
    }
    if (!studentId) {
      throw new Error("Student ID is required");
    }
    const response = await api.get(
      `/api/v1/support-programs/participant-program-detail?programId=${programId}&studentId=${studentId}`
    );
    return response.data;
  } catch (error) {
    console.warn("Error fetching program details:", error);
    throw error;
  }
};

// Join a program
export const joinProgram = async (programId) => {
  try {
    if (!programId) {
      throw new Error("Program ID is required");
    }
    const response = await api.post(
      `/api/v1/support-programs/participants/register?programId=${programId}`
    );
    return response.data;
  } catch (error) {
    console.warn("Error joining program:", error);
    throw error;
  }
};

// Leave a program
export const leaveProgram = async (programId, studentId) => {
  try {
    if (!programId) {
      throw new Error("Program ID is required");
    }
    const response = await api.post(
      `/api/v1/support-programs/participants/unregister?supportProgramId=${programId}&studentId=${studentId}`
    );
    return response.data;
  } catch (error) {
    console.warn("Error leaving program:", error);
    throw error;
  }
};

//save program survey result
export const saveProgramSurveyResult = async (surveyResult) => {
  try {
    const response = await api.post(
      `/api/v1/support-programs/save-survey-record`,
      surveyResult
    );
    return response.data;
  } catch (error) {
    console.warn("Error saving program survey result:", error);
    throw error;
  }
};

// Get All Programs Reocord
export const getAllProgramsRecord = async (studentId) => {
  try {
    const response = await api.get(
      `/api/v1/support-programs/participants?studentId=${studentId}`
    );
    console.log("response", response.data);

    return response.data;
  } catch (error) {
    console.warn("Error fetching all programs record:", error);
    throw error;
  }
};

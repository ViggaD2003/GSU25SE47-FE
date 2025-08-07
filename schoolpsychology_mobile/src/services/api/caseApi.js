import api from "./axios";

export const getCaseByCaseId = async (caseId) => {
  try {
    if (!caseId) {
      throw new Error("Case ID is required");
    }
    const response = await api.get(`/api/v1/cases/${caseId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching case by caseId:", error);
    throw error;
  }
};

export const getClosedCases = async () => {
  try {
    const response = await api.get("/api/v1/cases?statusCase=CLOSED");
    return response.data;
  } catch (error) {
    console.error("Error fetching closed cases:", error);
    throw error;
  }
};

import api from "./axios";

export const getCaseByCaseId = async (caseId) => {
  try {
    console.log("caseId", caseId);

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

export const getClosedCases = async (accountId) => {
  try {
    const statusCase = ["CLOSED"];
    const response = await api.get(
      `/api/v1/cases?accountId=${accountId}&statusCase=${statusCase.join(",")}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching closed cases:", error);
    throw error;
  }
};

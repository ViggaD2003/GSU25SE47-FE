import api from "./axios";

// Get parent dashboard data for a specific child
export const getChildSurveyRecords = async (accountId) => {
  try {
    const response = await api.get(
      `/api/v1/survey-records/accounts/${accountId}`
    );
    const data = response.data.data || [];
    return data.filter((item) => item.status === "COMPLETED");
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    throw error;
  }
};

// Get appointment records for a specific child
export const getChildAppointmentRecords = async (accountId) => {
  try {
    // const response = await api.get(
    //   `/api/v1/appointment-records/accounts/${accountId}`
    // );
    // return response.data;
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy appointment records:", error);
    throw error;
  }
};

// Get support program records for a specific child
export const getChildSupportProgramRecords = async (accountId) => {
  try {
    // const response = await api.get(
    //   `/api/v1/support-program-records/accounts/${accountId}`
    // );
    // return response.data;
    return [];
  } catch (error) {
    console.error("Lỗi khi lấy support program records:", error);
    throw error;
  }
};

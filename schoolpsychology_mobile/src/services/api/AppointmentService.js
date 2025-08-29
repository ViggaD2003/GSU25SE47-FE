import api from "./axios";

//Create Appointment
export const createAppointment = async (appointment) => {
  if (!appointment) {
    throw new Error("Appointment data is required");
  }
  try {
    const response = await api.post("/api/v1/appointments", appointment);

    return response.data;
  } catch (err) {
    console.warn("Lỗi khi tạo lịch hẹn:", err);
    throw err;
  }
};

//get appointment by id
export const getAppointmentById = async (appointmentId) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }
  try {
    const response = await api.get(`/api/v1/appointments/${appointmentId}`);
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi lấy chi tiết lịch hẹn:", err);
    throw err;
  }
};

// update appointment
// export const updateAppointment = async (appointmentId, appointmentData) => {
//   if (!appointmentData) {
//     throw new Error("Appointment data is required");
//   }
//   if (!appointmentId) {
//     throw new Error("Appointment ID is required");
//   }
//   try {
//     const requestBody = {
//       caseId: appointmentData.caseId || null,
//       sessionNotes: appointmentData.sessionNotes || "",
//       noteSummary: appointmentData.noteSummary || "",
//       noteSuggestion: appointmentData.noteSuggestion || "",
//       sessionFlow: appointmentData.sessionFlow || "LOW",
//       studentCoopLevel: appointmentData.studentCoopLevel || "LOW",
//       assessmentScores: appointmentData.assessmentScores || [],
//     };
//     const response = await api.patch(
//       `/api/v1/appointments/${appointmentId}`,
//       requestBody
//     );
//     return response.data;
//   } catch (err) {
//     console.warn("Lỗi khi cập nhật lịch hẹn:", err);
//     throw err;
//   }
// };

// update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  if (!status) {
    throw new Error("Status is required");
  }
  if (!["CONFIRMED"].includes(status)) {
    throw new Error("Status is not allowed, only CONFIRMED are allowed");
  }
  try {
    const response = await api.patch(
      `/api/v1/appointments/${appointmentId}/status?status=${status}`
    );
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi cập nhật trạng thái lịch hẹn:", err);
    throw err;
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId, reasonCancel) => {
  if (!appointmentId) {
    throw new Error("Appointment ID is required");
  }
  if (!reasonCancel) {
    throw new Error("Reason cancel is required");
  }
  try {
    const response = await api.patch(
      `/api/v1/appointments/cancel/${appointmentId}?reasonCancel=${reasonCancel}`
    );
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi hủy lịch hẹn:", err);
    throw err;
  }
};

// get active appointments
export const getActiveAppointments = async (accountId) => {
  if (!accountId) {
    throw new Error("Account ID is required");
  }
  try {
    const response = await api.get(
      `/api/v1/appointments/account/${accountId}/active`
    );
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi lấy lịch hẹn hoạt động:", err);
    throw err;
  }
};

// get past appointments
export const getPastAppointments = async (accountId) => {
  if (!accountId) {
    throw new Error("Account ID is required");
  }
  try {
    const response = await api.get(
      `/api/v1/appointments/account/${accountId}/past`
    );
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi lấy lịch hẹn quá khứ:", err);
    throw err;
  }
};

// get all counselors
export const getAllCounselors = async () => {
  try {
    const response = await api.get("/api/v1/account/view-counselor");
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi lấy danh sách cán bộ tư vấn:", err);
    throw err;
  }
};

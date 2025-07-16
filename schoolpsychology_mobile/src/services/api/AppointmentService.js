import api from "./axios";

//Create Appointment
export const createAppointment = async (appointment) => {
  try {
    const response = await api.post("/api/v1/appointment", appointment);

    return response.data;
  } catch (err) {
    console.error("Lỗi khi tạo lịch hẹn:", err);
    throw err;
  }
};

//Get Appointment Record
export const getAppointmentRecord = async () => {
  try {
    const response = await api.get(
      "/api/v1/appointment-records?field=totalScore&direction=desc"
    );
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách lịch sử cuộc hẹn:", err);
    throw err;
  }
};

//Get Appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await api.get(`/api/v1/appointment/${appointmentId}`);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết lịch hẹn:", err);
    throw err;
  }
};

//Get All Counselors
export const getAllCounselors = async () => {
  try {
    const response = await api.get("/api/v1/account/view-counselor");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tư vấn viên:", err);
    throw err;
  }
};

//Cancel Appointment
export const cancelAppointment = async (appointmentId, reasonCancel) => {
  try {
    const response = await api.patch(
      `/api/v1/appointment/cancel/${appointmentId}?reasonCancel=${reasonCancel}`
    );
    return response.data;
  } catch (err) {
    console.error("Lỗi khi hủy lịch hẹn:", err);
    throw err;
  }
};

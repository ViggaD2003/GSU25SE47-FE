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

//Get Appointment Records
export const getAppointmentRecords = async () => {
  try {
    const response = await api.get("/api/v1/appointment/show-history");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách lịch sử cuộc hẹn:", err);
    throw err;
  }
};

//Get All Counselors
export const getAllCounselors = async () => {
  try {
    const response = await api.get("/api/v1/counselor");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tư vấn viên:", err);
    throw err;
  }
};

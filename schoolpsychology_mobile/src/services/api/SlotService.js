import api from "./axios";

//Get Slots for Student
export const getSlotsForStudent = async () => {
  try {
    const response = await api.get("/api/v1/slots");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của giáo viên:", err);
    throw err;
  }
};

//Get Slots with hostById
export const getSlotsWithHostById = async (hostById) => {
  try {
    const response = await api.get(`/api/v1/slots?hostById=${hostById}`);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của cán bộ tư vấn:", err);
    throw err;
  }
};

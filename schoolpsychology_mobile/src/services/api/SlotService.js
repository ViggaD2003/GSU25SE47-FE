import api from "./axios";

//Get Slots for Student
export const getSlotsForStudent = async () => {
  try {
    const response = await api.get("/api/v1/slot");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của giáo viên:", err);
    throw err;
  }
};

//Get Slots with hostById
export const getSlotsWithHostById = async (counselorId) => {
  try {
    const response = await api.get(`/api/v1/slot?hostById=${counselorId}`);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của cán bộ tư vấn:", err);
    throw err;
  }
};

import api from "./axios";

//Get Slots Of Teacher
export const getSlotsOfTeacher = async () => {
  try {
    const response = await api.get("/api/v1/slot");
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của giáo viên:", err);
    throw err;
  }
};

//Get Slots Of Counselor
export const getSlotsOfCounselor = async (counselorId) => {
  try {
    const response = await api.get(`/api/v1/slot?hostById=${counselorId}`);
    return response.data;
  } catch (err) {
    console.error("Lỗi khi lấy slot của cán bộ tư vấn:", err);
    throw err;
  }
};

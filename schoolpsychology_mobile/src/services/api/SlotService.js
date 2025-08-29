import api from "./axios";

//Get Slots with hostById
export const getSlotsWithHostById = async (hostById) => {
  try {
    const response = await api.get(`/api/v1/slots?hostById=${hostById}`);
    return response.data;
  } catch (err) {
    console.warn("Lỗi khi lấy slot của cán bộ tư vấn:", err);
    throw err;
  }
};

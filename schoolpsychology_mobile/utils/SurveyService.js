import api from "./axios";

export const getPublishedSurveys = async () => {
    try {
      const response = await api.get("/api/v1/survey/published");
      return response.data;
    } catch (err) {
      console.error("Lỗi khi lấy survey đã publish:", err);
      throw err;
    }
  };


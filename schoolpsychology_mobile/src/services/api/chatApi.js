import api from "./axios";

export const getChatRooms = async (caseId) => {
  const response = await api.get(`/api/v1/chat/chat-room?caseId=${caseId}`);
  //   console.log("[ChatApi] Get chat rooms", response.data);
  return response.data;
};

export const getChatMessages = async (roomId) => {
  const response = await api.get(
    `/api/v1/chat/chat-message?chatRoomId=${roomId}`
  );
  return response.data;
};

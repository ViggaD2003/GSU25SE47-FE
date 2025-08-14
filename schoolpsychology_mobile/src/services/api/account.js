import api from "./axios";

export const updateIsAbleSurvey = async (accountId, isAbleSurvey) => {
  const response = await api.patch(
    `api/v1/account/update-able-survey/${accountId}?isAbleSurvey=${isAbleSurvey}`
  );
  return response.data;
};

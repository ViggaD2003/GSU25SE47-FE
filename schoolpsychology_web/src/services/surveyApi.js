import api from './api'

export const surveyAPI = {
  getAllSurveys: async () => {
    const response = await api.get('/api/v1/survey')
    return response.data
  },

  getSurveyById: async id => {
    const response = await api.get(`/api/v1/survey/${id}?flag=fasle`)
    return response.data
  },

  getSurveyInCase: async () => {
    const response = await api.get(`/api/v1/survey/get-by-account`)
    return response.data
  },

  createSurvey: async surveyData => {
    const response = await api.post('/api/v1/survey', surveyData)
    return response.data
  },

  updateSurvey: async (id, surveyData) => {
    const response = await api.put(`/api/v1/survey/${id}`, surveyData)
    return response.data
  },

  removeCaseFromSurvey: async data => {
    if (!data) return
    const { surveyId, caseId } = data
    const response = await api.delete(
      `/api/v1/survey/${surveyId}/cases/${caseId}`
    )
    return response.data
  },

  removeCaseFromSurveyCaseLink: async data => {
    if (!data) return
    const { surveyId, caseIds } = data
    const response = await api.patch(
      `/api/v1/cases/remove-survey?surveyId=${surveyId}&caseIds=${caseIds}`
    )
    return response.data
  },
}

import api from './api'

export const surveyAPI = {
  getAllSurveys: async () => {
    const response = await api.get('/api/v1/survey')
    return response.data
  },

  getSurveyById: async id => {
    const response = await api.get(`/api/v1/survey/${id}`)
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
}

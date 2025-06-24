import api from './api'

export const surveyAPI = {
  createSurvey: async surveyData => {
    const response = await api.post('/api/v1/survey', surveyData)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/api/v1/categories')
    return response.data
  },
}

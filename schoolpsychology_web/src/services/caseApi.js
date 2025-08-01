import api from './api'

export const caseAPI = {
  getCases: async params => {
    const response = await api.get('/api/v1/cases', {
      params: {
        ...params,
      },
    })
    return response.data
  },

  getCaseById: async caseId => {
    if (!caseId) return
    const response = await api.get(`/api/v1/cases/${caseId}`)
    return response.data
  },

  createCase: async caseData => {
    if (!caseData) return
    const requestBody = {
      title: caseData.title,
      description: caseData.description,
      priority: caseData.priority,
      progressTrend: caseData.progressTrend,
      studentId: caseData.studentId,
      createBy: caseData.createBy,
      currentLevelId: caseData.currentLevelId,
      initialLevelId: caseData.initialLevelId,
    }
    const response = await api.post('/api/v1/cases', requestBody)
    return response.data
  },
}

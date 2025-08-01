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

  assignCase: async data => {
    if (!data) return
    const params = {
      caseId: data.caseId || undefined,
      counselorId: data.counselorId || undefined,
    }
    const response = await api.patch(
      `/api/v1/cases/assign?caseId=${params.caseId}&counselorId=${params.counselorId}`
    )
    return response.data
  },

  updateCase: async (caseId, caseData) => {
    if (!caseId || !caseData) return
    const requestBody = {
      title: caseData.title,
      description: caseData.description,
      priority: caseData.priority,
      progressTrend: caseData.progressTrend,
      studentId: caseData.studentId,
      createBy: caseData.createBy,
      currentLevelId: caseData.currentLevelId,
      initialLevelId: caseData.initialLevelId,
      hostBy: caseData.hostBy,
    }
    const response = await api.put(`/api/v1/cases/${caseId}`, requestBody)
    return response.data
  },
}

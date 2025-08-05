import api from './api'

export const caseAPI = {
  getCases: async data => {
    const statusCase = data?.statusCase || ''
    const surveyId = data?.surveyId || ''
    const response = await api.get(
      `/api/v1/cases?statusCase=${statusCase}${data?.categoryId ? '&categoryId=' + data.categoryId : ''}${surveyId ? '&surveyId=' + surveyId : ''}`
    )
    return response.data
  },

  getCaseById: async caseId => {
    if (!caseId) return
    const response = await api.get(`/api/v1/cases/${caseId}`)
    return response.data
  },

  getCasesByCategoryId: async categoryId => {
    if (!categoryId) return
    const response = await api.get(
      `/api/v1/cases/view-all-by-category?categoryId=${categoryId}`
    )
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

  addCaseToSurvey: async data => {
    if (!data) return
    const params = {
      surveyId: data.surveyId,
      caseIds: data.caseIds,
    }
    const response = await api.post(
      `/api/v1/cases/add-survey?surveyId=${params.surveyId}&caseIds=${params.caseIds}`
    )
    return response.data
  },

  removeCasesFromSurvey: async data => {
    if (!data) return
    const params = {
      surveyId: data.surveyId,
      caseIds: data.caseIds,
    }
    const response = await api.delete(
      `/api/v1/cases/remove-survey?surveyId=${params.surveyId}&caseIds=${params.caseIds}`
    )
    return response.data
  },

  removeAllSurveysFromCases: async (caseIds = []) => {
    if (caseIds.length === 0) return
    const response = await api.delete(
      `/api/v1/cases/remove-all-survey?caseIds=${caseIds.join(',')}`
    )
    return response.data
  },
}

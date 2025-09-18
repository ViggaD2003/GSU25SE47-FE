import api from './api'

export const programAPI = {
  getPrograms: async () => {
    const response = await api.get('/api/v1/support-programs')
    return response.data
  },

  getProgramById: async programId => {
    if (!programId) return null
    try {
      const response = await api.get(`/api/v1/support-programs/${programId}`)
      return response.data
    } catch (error) {
      console.error('Get program by id error:', error)
      throw error
    }
  },

  createProgram: async requestData => {
    const { thumbnail, request } = requestData
    const formData = new FormData()
    formData.append('thumbnail', thumbnail)
    formData.append(
      'request',
      new Blob([JSON.stringify(request)], {
        type: 'application/json',
      })
    )
    console.log(formData)
    const response = await api.post('/api/v1/support-programs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateProgram: async (programId, programData) => {
    const response = await api.put(
      `/api/v1/support-programs/${programId}/update-program`,
      programData
    )
    return response.data
  },

  updateStatus: async (programId, status = 'ON_GOING') => {
    const response = await api.put(
      `/api/v1/support-programs/${programId}?status=${status}`
    )
    return response.data
  },

  openSurvey: async supportProgramId => {
    const response = await api.patch(
      `/api/v1/support-programs/open-survey?supportProgramId=${supportProgramId}`
    )
    return response.data
  },
}

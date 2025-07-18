import api from './api'

export const programAPI = {
  getPrograms: async () => {
    const response = await api.get('/api/v1/support-programs')
    return response.data
  },

  getProgramById: async programId => {
    const response = await api.get(`/api/v1/support-programs/${programId}`)
    return response.data
  },

  createProgram: async programData => {
    const response = await api.post('/api/v1/support-programs', programData)
    return response.data
  },

  updateProgram: async (programId, programData) => {
    const response = await api.put(
      `/api/v1/support-programs/${programId}`,
      programData
    )
    return response.data
  },

  deleteProgram: async programId => {
    const response = await api.delete(`/api/v1/support-programs/${programId}`)
    return response.data
  },
}

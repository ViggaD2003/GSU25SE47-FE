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
      `/api/v1/support-programs/${programId}`,
      programData
    )
    return response.data
  },

  deleteProgram: async programId => {
    const response = await api.delete(`/api/v1/support-programs/${programId}`)
    return response.data
  },

  uploadThumbnail: async thumbnail => {
    try {
      console.log('thumbnail', thumbnail)

      const formData = new FormData()
      formData.append('image', thumbnail) // Thêm file vào FormData
      const response = await api.post('/api/v1/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log(response.data)
      return response.data
    } catch (error) {
      console.error('Upload error:', error)
      throw error // Ném lỗi để component Upload xử lý trạng thái 'error'
    }
  },
  openSurvey: async supportProgramId => {
    const response = await api.patch(
      `/api/v1/support-programs/open-survey?supportProgramId=${supportProgramId}`
    )
    return response.data
  },
}

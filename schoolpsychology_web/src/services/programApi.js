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
    console.log('Creating program with data:', formData)
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

  // Thumbnail management functions
  deleteThumbnail: async (programId, publicId) => {
    const response = await api.delete(
      `/api/v1/support-programs/delete-thumbnail?programId=${programId}&publicId=${publicId}`
    )
    return response.data
  },

  addNewThumbnail: async (thumbnail, programId) => {
    const formData = new FormData()
    formData.append('thumbnail', thumbnail)
    formData.append(
      'programId',
      new Blob([JSON.stringify(programId)], {
        type: 'application/json',
      })
    )

    const response = await api.post(
      '/api/v1/support-programs/add-new-thumbnail',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    )
    return response.data
  },

  // Enhanced update program function
  updateProgramWithThumbnail: async (programId, requestData) => {
    const { thumbnail, request, hasNewThumbnail, existingThumbnail } =
      requestData
    console.log('requestData', requestData)

    try {
      // Step 1: Delete existing thumbnail if new one is provided
      if (hasNewThumbnail && existingThumbnail?.public_id) {
        await programAPI.deleteThumbnail(programId, existingThumbnail.public_id)
      }

      // Step 2: Update program data
      const response = await api.put(
        `/api/v1/support-programs/${programId}/update-program`,
        request
      )

      // Step 3: Add new thumbnail if provided
      if (hasNewThumbnail && thumbnail) {
        await programAPI.addNewThumbnail(thumbnail, programId)
      }

      return response.data
    } catch (error) {
      console.error('Update program with thumbnail error:', error)
      throw error
    }
  },
}

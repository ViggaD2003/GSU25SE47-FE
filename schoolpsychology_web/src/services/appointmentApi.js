import api from './api'

export const appointmentAPI = {
  // create appointment (Counselor)
  createAppointment: async appointment => {
    if (!appointment) {
      throw new Error('Appointment data is required')
    }
    try {
      const response = await api.post('/api/v1/appointments', appointment)

      return response.data
    } catch (err) {
      console.error('Lỗi khi tạo lịch hẹn:', err)
      throw err
    }
  },

  //get appointment by id
  getAppointmentById: async appointmentId => {
    if (!appointmentId) {
      throw new Error('Appointment ID is required')
    }
    try {
      const response = await api.get(`/api/v1/appointments/${appointmentId}`)
      return response.data
    } catch (err) {
      console.error('Lỗi khi lấy chi tiết lịch hẹn:', err)
      throw err
    }
  },

  // update appointment
  updateAppointment: async (appointmentId, appointmentData) => {
    if (!appointmentData) {
      throw new Error('Appointment data is required')
    }
    if (!appointmentId) {
      throw new Error('Appointment ID is required')
    }
    try {
      const requestBody = {
        caseId: appointmentData.caseId || null,
        sessionNotes: appointmentData.sessionNotes || '',
        noteSummary: appointmentData.noteSummary || '',
        noteSuggestion: appointmentData.noteSuggestion || '',
        sessionFlow: appointmentData.sessionFlow || 'LOW',
        studentCoopLevel: appointmentData.studentCoopLevel || 'LOW',
        assessmentScores: appointmentData.assessmentScores || [],
      }
      const response = await api.patch(
        `/api/v1/appointments/${appointmentId}`,
        requestBody
      )
      return response.data
    } catch (err) {
      console.error('Lỗi khi cập nhật lịch hẹn:', err)
      throw err
    }
  },

  // update appointment status
  updateAppointmentStatus: async (appointmentId, status) => {
    if (!status) {
      throw new Error('Status is required')
    }
    if (!['IN_PROGRESS', 'ABSENT'].includes(status)) {
      throw new Error(
        'Status is not allowed, only IN_PROGRESS and ABSENT are allowed'
      )
    }

    try {
      const response = await api.patch(
        `/api/v1/appointments/${appointmentId}/status?status=${status}`
      )
      return response.data
    } catch (err) {
      console.error('Lỗi khi cập nhật trạng thái lịch hẹn:', err)
      throw err
    }
  },

  // get active appointments
  getActiveAppointments: async accountId => {
    if (!accountId) {
      throw new Error('Account ID is required')
    }
    try {
      const response = await api.get(
        `/api/v1/appointments/account/${accountId}/active`
      )
      return response.data
    } catch (err) {
      console.error('Lỗi khi lấy lịch hẹn hoạt động:', err)
      throw err
    }
  },

  // get past appointments
  getPastAppointments: async accountId => {
    if (!accountId) {
      throw new Error('Account ID is required')
    }
    try {
      const response = await api.get(
        `/api/v1/appointments/account/${accountId}/past`
      )
      return response.data
    } catch (err) {
      console.error('Lỗi khi lấy lịch hẹn quá khứ:', err)
      throw err
    }
  },
}

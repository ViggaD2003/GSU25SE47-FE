import api from './api'

export const appointmentAPI = {
  getAppointments: async () => {
    const response = await api.get('/api/v1/appointment/show-appointment')
    return response.data
  },
  updateAppointment: async appointmentData => {
    const response = await api.patch('/api/v1/appointment', appointmentData)
    return response.data
  },
  getAppointmentRecords: async () => {
    const response = await api.get(
      '/api/v1/appointment-records?field=totalScore&direction=desc'
    )
    return response.data
  },
  createAppointmentRecord: async appointmentData => {
    const response = await api.post(
      '/api/v1/appointment-records',
      appointmentData
    )
    return response.data
  },
}

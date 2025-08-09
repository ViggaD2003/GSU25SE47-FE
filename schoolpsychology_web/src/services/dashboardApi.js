import api from './api'

export const dashboardApi = {
  getTeacherDashboard: async () => {
    try {
      const response = await api.get(`/api/v1/dashboard/teacher`)
      return response.data
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error)
      throw error
    }
  },
  getCounselorDashboard: async () => {
    try {
      const response = await api.get(`/api/v1/dashboard/counselor`)
      return response.data
    } catch (error) {
      console.error('Error fetching counselor dashboard:', error)
      throw error
    }
  },
  getManagerDashboard: async () => {
    try {
      const response = await api.get(`/api/v1/dashboard/manager`)
      return response.data
    } catch (error) {
      console.error('Error fetching manager dashboard:', error)
      throw error
    }
  },
}

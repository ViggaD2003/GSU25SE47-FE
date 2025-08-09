import api from './api'

export const systemConfig = {
  getSystemConfig: async () => {
    const response = await api.get(`/api/v1/admin/system/configs`)
    return response.data
  },
  updateSystemConfig: async payload => {
    const response = await api.put(`/api/v1/admin/system/configs`, payload)
    return response.data
  },
}

import api from './api'

export const accountAPI = {
  getAccounts: async data => {
    if (!data) return

    const params = {
      role: data.role || undefined,
      classId: data.classId || undefined,
    }

    const response = await api.get('/api/v1/account/list-all-account', {
      params,
    })
    return response.data
  },
  getAccount: async () => {
    const response = await api.get('/api/v1/account')
    return response.data
  },
}

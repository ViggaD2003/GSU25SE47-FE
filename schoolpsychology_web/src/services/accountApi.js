import api from './api'

export const accountAPI = {
  getAccounts: async data => {
    const params = data || {}

    const response = await api.get('/api/v1/account/list-all-account', {
      params,
    })
    return response.data
  },
  getAllAccounts: async () => {
    const response = await api.get('/api/v1/account/accounts')
    return response.data
  },

  getAccount: async () => {
    const response = await api.get('/api/v1/account')
    return response.data
  },
  createAccount: async data => {
    const response = await api.post('/api/v1/auth/signup', data)
    return response.data
  },
  updateAccount: async (id, data) => {
    const response = await api.put(`/api/v1/account/${id}`, data)
    return response.data
  },
  updateAccountStatus: async (id, status) => {
    const response = await api.post(
      `/api/v1/account/enable-account/${id}?status=${status}`
    )
    return response.data
  },
}

import api from './api'

const accountApi = {
  // get all accounts
  getAccount: async () => {
    const response = await api.get('/api/v1/account/list-all-account')
    return response.data
  },

  //get all counselors
  getCounselors: async () => {
    const response = await api.get('/api/v1/account/view-counselor')
    return response.data
  },

  //get account by accountId
  getAccountById: async accountId => {
    const response = await api.get(
      `/api/v1/account/get-account?accountId=${accountId}`
    )
    return response.data
  },
}

export default accountApi

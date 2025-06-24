import api from './api'

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/v1/auth/login', {
      email,
      password,
    })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/api/v1/auth/logout')
    return response.data
  },

  // Add other auth methods as needed
  refreshToken: async () => {
    const response = await api.post('/api/v1/auth/refresh')
    return response.data
  },
}

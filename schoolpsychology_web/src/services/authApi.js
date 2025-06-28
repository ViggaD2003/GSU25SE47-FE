import api from './api'

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      // Handle 308 PERMANENT_REDIRECT for Google OAuth
      if (error.response?.status === 308) {
        return {
          success: true,
          message: error.response.data.message || "Redirect to Google OAuth",
          data: error.response.data.data
        }
      }
      throw error
    }
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

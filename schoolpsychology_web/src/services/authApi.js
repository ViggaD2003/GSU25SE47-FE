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
          message: error.response.data.message || 'Redirect to Google OAuth',
          data: error.response.data.data,
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
    // Get refresh token from localStorage
    const refreshToken = localStorage.getItem('token')
    console.log(
      '[refreshToken] Refresh token from localStorage:',
      refreshToken ? 'Token exists' : 'No token found'
    )

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      console.log('[refreshToken] Attempting to refresh token...')

      // Try the most common method first: token in body
      const response = await api.post('/api/v1/auth/refresh', {
        token: refreshToken,
      })

      console.log('✅ Refresh token response:', response.data)

      // Handle case where token is still valid (success: false, message: "Access token is still valid")
      if (
        !response.data.success &&
        response.data.message?.includes('still valid')
      ) {
        console.log('ℹ️ Token is still valid, no refresh needed')
        // Return current token as if refresh was successful
        return {
          success: true,
          data: { token: refreshToken },
          message: response.data.message,
        }
      }

      return response.data
    } catch (error) {
      console.error(
        '[refreshToken] Failed:',
        error.response?.status,
        error.response?.data
      )
      throw error
    }
  },
}

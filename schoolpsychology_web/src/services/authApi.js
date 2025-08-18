// Using centralized api instance from api.js
import api from './api'
import { getToken } from '@/utils'

// Auth API methods
export const authAPI = {
  login: async (email, password) => {
    try {
      api.defaults.headers.common.Authorization = null

      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
      })

      // Handle 308 PERMANENT_REDIRECT for Google OAuth (Manager role)
      if (response.status === 308) {
        console.log(
          '🔄 308 redirect detected - Manager role, Google OAuth required'
        )
        return {
          success: true,
          message: response.data.message || 'Redirect to Google OAuth',
          data: response.data.data || response.data.redirectUrl,
        }
      }

      // Normal successful response (Counselor/Teacher role)
      if (response.status === 200) {
        console.log('✅ Normal login successful - Counselor/Teacher role')
        return response.data
      }

      // Handle other status codes
      console.log('⚠️ Unexpected status code:', response.status)
      return response.data
    } catch (error) {
      console.error('❌ Login API error:', error)

      // Handle 308 (PERMANENT_REDIRECT) - Google OAuth redirect
      if (error.response?.status === 308) {
        console.log(
          '🔄 308 error response - Manager role, Google OAuth required'
        )
        return {
          success: true,
          message: error.response.data.message || 'Redirect to Google OAuth',
          data: error.response.data.data || error.response.data.redirectUrl,
        }
      }

      // Handle HTTP 500 (Internal Server Error)
      if (error.response?.status === 500) {
        console.error('🔥 HTTP 500 - Internal Server Error detected')
        const serverError = {
          success: false,
          error: 'Internal Server Error',
          message:
            'The server encountered an internal error. Please try again later.',
          status: 500,
          isServerError: true,
          details:
            error.response.data ||
            'Server error occurred during authentication',
        }
        throw serverError
      }

      // Handle HTTP 502, 503, 504 (Bad Gateway, Service Unavailable, Gateway Timeout)
      if ([502, 503, 504].includes(error.response?.status)) {
        console.error(`🔥 HTTP ${error.response.status} - Service unavailable`)
        const serviceError = {
          success: false,
          error: 'Service Unavailable',
          message:
            'The authentication service is temporarily unavailable. Please try again later.',
          status: error.response.status,
          isServiceError: true,
          details: error.response.data || 'Service temporarily unavailable',
        }
        throw serviceError
      }

      // Handle HTTP 400 (Bad Request)
      if (error.response?.status === 400) {
        console.error('🔥 HTTP 400 - Bad Request')
        const badRequestError = {
          success: false,
          error: 'Bad Request',
          message:
            'Invalid request data. Please check your credentials and try again.',
          status: 400,
          isClientError: true,
          details: error.response.data || 'Invalid request format',
        }
        throw badRequestError
      }

      // Handle HTTP 401 (Unauthorized)
      if (error.response?.status === 401) {
        console.error('🔥 HTTP 401 - Unauthorized')
        const unauthorizedError = {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid credentials. Please check your email and password.',
          status: 401,
          isAuthError: true,
          details: error.response.data || 'Authentication failed',
        }
        throw unauthorizedError
      }

      // Handle HTTP 403 (Forbidden)
      if (error.response?.status === 403) {
        console.error('🔥 HTTP 403 - Forbidden')
        const forbiddenError = {
          success: false,
          error: 'Access Denied',
          message: 'You do not have permission to access this service.',
          status: 403,
          isAuthError: true,
          details: error.response.data || 'Access denied',
        }
        throw forbiddenError
      }

      // Handle network errors (no response)
      if (!error.response) {
        console.error('🔥 Network Error - No response from server')
        const networkError = {
          success: false,
          error: 'Network Error',
          message:
            'Unable to connect to the server. Please check your internet connection.',
          status: 0,
          isNetworkError: true,
          details: 'No response from server',
        }
        throw networkError
      }

      // Handle other HTTP errors
      if (error.response?.status >= 400) {
        console.error(`🔥 HTTP ${error.response.status} - Client/Server Error`)
        const httpError = {
          success: false,
          error: `HTTP ${error.response.status}`,
          message: 'An error occurred during authentication. Please try again.',
          status: error.response.status,
          isHttpError: true,
          details: error.response.data || `HTTP ${error.response.status} error`,
        }
        throw httpError
      }

      // Re-throw unknown errors
      throw error
    }
  },

  logout: async () => {
    try {
      console.log('🚪 Making logout request...')
      const token = getToken()
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.post('/api/v1/auth/logout')
      console.log('✅ Logout successful')
      return response.data
    } catch (error) {
      console.error('❌ Logout API error:', error)

      // Handle HTTP 500 and other server errors
      if (error.response?.status >= 500) {
        console.error(
          `🔥 HTTP ${error.response.status} - Server error during logout`
        )
        const serverError = {
          success: false,
          error: 'Server Error',
          message:
            'Server error occurred during logout. You may need to clear your browser data.',
          status: error.response.status,
          isServerError: true,
        }
        throw serverError
      }

      throw new Error('Logout API error')
    }
  },

  // Refresh token method - IMPROVED with better error handling
  refreshToken: async refreshToken => {
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    console.log('[authAPI] Attempting to refresh token...')
    api.defaults.headers.common.Authorization = null
    try {
      // Send refresh token in request body
      const response = await api.post('/api/v1/auth/refresh', {
        token: refreshToken,
      })

      console.log('✅ Token refresh successful')
      return {
        status: 200,
        success: true,
        newToken: response.data.data.token,
        message: 'Token refreshed successfully',
      }
    } catch (error) {
      console.error('❌ Refresh token API error:', error)

      // Handle HTTP 500 and server errors
      if (error.response?.status >= 500) {
        console.error(
          `🔥 HTTP ${error.response.status} - Server error during token refresh`
        )
        const serverError = {
          status: error.response.status,
          success: false,
          message: 'Server error occurred during token refresh',
          data: null,
          isServerError: true,
        }
        return serverError
      }

      // Handle HTTP 401 (Unauthorized - token expired/invalid)
      if (error.response?.status === 401) {
        console.error('🔥 HTTP 401 - Token refresh unauthorized')
        return {
          status: 401,
          success: false,
          message: 'Token refresh failed - authentication required',
          data: null,
          isAuthError: true,
        }
      }

      // Handle network errors
      if (!error.response) {
        console.error('🔥 Network Error - No response during token refresh')
        return {
          status: 0,
          success: false,
          message: 'Network error during token refresh',
          data: null,
          isNetworkError: true,
        }
      }

      // Handle other HTTP errors
      return {
        status: error.response.status,
        success: false,
        message: error.response.data?.message || 'Token refresh failed',
        data: null,
        isHttpError: true,
      }
    }
  },
}

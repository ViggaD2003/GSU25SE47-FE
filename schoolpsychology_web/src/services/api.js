import axios from 'axios'
import { store } from '../store'
import {
  forceLogout,
  refreshToken as refreshTokenAction,
} from '../store/actions/authActions'
import notificationService from './notificationService'
import { isTokenExpired } from '../utils'
import { getToken, updateToken } from '../utils/authHelpers'

// Utility function to handle server errors
const handleServerError = (error, showNotification = true) => {
  const { status } = error.response || {}

  switch (status) {
    case 502:
      console.error('❌ Response: 502 Bad Gateway error detected')
      if (showNotification) {
        notificationService.error({
          message: 'Lỗi kết nối server',
          description:
            'Server hiện tại không khả dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
          duration: 5,
        })
      }
      return new Error('Server temporarily unavailable')

    case 503:
      console.error('❌ Response: 503 Service Unavailable error detected')
      if (showNotification) {
        notificationService.error({
          message: 'Dịch vụ tạm thời không khả dụng',
          description: 'Server đang bảo trì. Vui lòng thử lại sau.',
          duration: 4,
        })
      }
      return new Error('Service temporarily unavailable')

    case 504:
      console.error('❌ Response: 504 Gateway Timeout error detected')
      if (showNotification) {
        notificationService.error({
          message: 'Lỗi timeout',
          description: 'Server phản hồi quá chậm. Vui lòng thử lại sau.',
          duration: 4,
        })
      }
      return new Error('Gateway timeout')

    default:
      return error
  }
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Centralized token refresh logic with improved error handling
const handleTokenRefresh = async () => {
  try {
    console.log('🔄 Attempting to refresh token...')

    const result = await store.dispatch(refreshTokenAction()).unwrap()
    const newToken = result?.data?.token

    if (newToken) {
      console.log('[API_REQUEST] ✅ Token refreshed successfully', newToken)

      // Update both axios defaults and localStorage using authHelpers
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`

      // Update stored auth data with new token using centralized function
      updateToken(newToken)

      return newToken
    } else {
      throw new Error('Token refresh failed - no token returned')
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error)
    // If refresh fails, logout user
    store.dispatch(forceLogout())
    notificationService.error({
      message: 'Quyền truy cập bị từ chối',
      description: 'Bạn không có quyền thực hiện hành động này.',
      duration: 4,
    })
    throw error
  }
}

// Request interceptor with improved token management
api.interceptors.request.use(
  async config => {
    // Skip auth for login and refresh endpoints
    const excludedPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/refresh',
      '/api/v1/auth/google/callback',
    ]

    const isExcludedPath = excludedPaths.some(path => config.url.includes(path))
    const token = getToken()

    if (isExcludedPath || !token) {
      config.headers.Authorization = ''
      return config
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      try {
        // console.log('[API_REQUEST] Token Expired, attempting to refresh...')

        const newToken = await handleTokenRefresh()
        config.headers.Authorization = `Bearer ${newToken}`
      } catch {
        console.error('❌ Request: Token refresh failed, request will fail')
        store.dispatch(forceLogout())
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`
    }

    // console.log('config', config.headers.Authorization)
    return config
  },
  error => {
    console.log('❌ Request: Interceptor error:', error)
    store.dispatch(forceLogout())
    return Promise.reject(error)
  }
)

// Response interceptor with improved error handling
api.interceptors.response.use(
  response => {
    // Handle 308 PERMANENT_REDIRECT as success for Google OAuth
    if (response.status === 308) {
      return response
    }
    return response
  },
  async error => {
    const originalRequest = error.config
    const excludedPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/refresh',
      '/api/v1/auth/google/callback',
    ]

    // Handle 308 (PERMANENT_REDIRECT) - Google OAuth redirect
    if (error.response?.status === 308) {
      return Promise.resolve({
        data: error.response.data,
        status: 308,
        success: true,
      })
    }

    // Handle server errors (502, 503, 504)
    if (error.response?.status >= 502 && error.response?.status <= 504) {
      const serverError = handleServerError(error, true)
      store.dispatch(forceLogout())
      return Promise.reject(serverError)
    }

    // Handle 401 (Unauthorized) - token expired or invalid
    if (
      error.response?.status === 401 &&
      !originalRequest._retry401 &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      store.dispatch(forceLogout())
    }

    // Handle 403 (Forbidden) - access denied
    if (
      error.response?.status === 403 &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      console.log('⚠️ Response: 403 Forbidden - access denied')

      // Check if token is still valid but getting 403 - might be invalidated on server
      const currentToken = getToken()
      if (currentToken && !isTokenExpired(currentToken)) {
        console.log(
          '⚠️ 403 with valid token - token might be invalidated on server'
        )

        // Clear storage and force logout user without API call
        store.dispatch(forceLogout())

        // Show notification about session termination
        notificationService.error({
          message: 'Phiên làm việc đã kết thúc',
          description:
            'Tài khoản của bạn đã bị vô hiệu hóa hoặc thay đổi quyền. Vui lòng đăng nhập lại.',
          duration: 6,
        })
      } else {
        await handleTokenRefresh()
        // Normal 403 - just show error
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

// Function to manually update auth headers (useful after login/logout)
export const updateAuthHeaders = () => {
  const token = getToken()
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
    return true
  } else {
    delete api.defaults.headers.common.Authorization
    return false
  }
}

// Initialize auth headers on module load
updateAuthHeaders()

export default api

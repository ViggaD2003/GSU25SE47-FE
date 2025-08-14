import axios from 'axios'
import { store } from '../store'
import {
  forceLogout,
  logoutUser,
  refreshToken as refreshTokenAction,
} from '../store/actions/authActions'
import notificationService from './notificationService'
import { isTokenExpired, shouldRefreshToken } from '../utils'
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

// Flag to prevent multiple refresh requests
let isRefreshing = false

// Queue for failed requests during refresh
const failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue.length = 0
}

// Centralized token refresh logic with improved error handling
const handleTokenRefresh = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    })
  }

  isRefreshing = true

  try {
    console.log('🔄 Attempting to refresh token...')

    const result = await store.dispatch(refreshTokenAction()).unwrap()
    const newToken = result?.data?.token

    if (newToken) {
      console.log('✅ Token refreshed successfully')

      // Update both axios defaults and localStorage using authHelpers
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`

      // Update stored auth data with new token using centralized function
      updateToken(newToken)

      processQueue(null, newToken)
      return newToken
    } else {
      throw new Error('Token refresh failed - no token returned')
    }
  } catch (error) {
    console.error('❌ Token refresh failed:', error)
    processQueue(error, null)

    // If refresh fails, logout user
    store.dispatch(logoutUser())
    throw error
  } finally {
    isRefreshing = false
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

    if (isExcludedPath) {
      console.log('ℹ️ Request: Excluded path, no auth required')
      return config
    }

    // Get token using centralized authHelpers
    const token = getToken()
    if (!token) {
      console.log('ℹ️ Request: No token found')
      return config
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('⚠️ Request: Token expired, attempting refresh...')

      try {
        const newToken = await handleTokenRefresh()
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`
          console.log('✅ Request: Token refreshed and added to request')
        }
      } catch {
        console.error('❌ Request: Token refresh failed, request will fail')
        // Request will fail with 401, let response interceptor handle it
      }
    } else {
      // Check if token needs refresh (expires soon)
      if (shouldRefreshToken(token)) {
        console.log('🔄 Request: Token expires soon, refreshing proactively...')

        try {
          const newToken = await handleTokenRefresh()
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`
            // console.log('✅ Request: Token refreshed proactively')
          }
        } catch {
          console.error(
            '❌ Request: Proactive refresh failed, using current token'
          )
          config.headers.Authorization = `Bearer ${token}`
        }
      } else {
        // Token is valid, add to request
        config.headers.Authorization = `Bearer ${token}`
        // console.log('✅ Request: Adding valid token to request')
      }
    }

    return config
  },
  error => {
    console.log('❌ Request: Interceptor error:', error)
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
      return Promise.reject(serverError)
    }

    // Handle 401 (Unauthorized) - token expired or invalid
    if (
      error.response?.status === 401 &&
      !originalRequest._retry401 &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      console.log(
        '⚠️ Response: 401 error detected, attempting token refresh...'
      )
      originalRequest._retry401 = true

      try {
        const newToken = await handleTokenRefresh()
        if (newToken) {
          // Update API headers and retry request
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          console.log('✅ Token refreshed on 401. Retrying original request...')
          return api(originalRequest)
        }
      } catch {
        console.log('❌ Token refresh failed on 401, user logged out')
        // User is already logged out by handleTokenRefresh
        return Promise.reject(
          new Error('Authentication failed - please login again')
        )
      }
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
        // Normal 403 - just show error
        notificationService.error({
          message: 'Quyền truy cập bị từ chối',
          description: 'Bạn không có quyền thực hiện hành động này.',
          duration: 4,
        })
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

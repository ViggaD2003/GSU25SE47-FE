import axios from 'axios'
import { store } from '../store'
import {
  logoutUser,
  // refreshToken as refreshTokenAction,
} from '../store/actions/authActions'

import notificationService from './notificationService'

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
          duration: 5,
        })
      }
      return new Error('Service temporarily unavailable')

    case 504:
      console.error('❌ Response: 504 Gateway Timeout error detected')
      if (showNotification) {
        notificationService.error({
          message: 'Lỗi timeout',
          description: 'Server phản hồi quá chậm. Vui lòng thử lại sau.',
          duration: 5,
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
// let isRefreshing = false
// let failedQueue = []

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error)
//     } else {
//       prom.resolve(token)
//     }
//   })

//   failedQueue = []
// }

// Centralized token refresh logic
// const handleTokenRefresh = async (showNotification = true) => {
//   // Prevent multiple refresh attempts
//   if (isRefreshing) {
//     return new Promise((resolve, reject) => {
//       failedQueue.push({ resolve, reject })
//     })
//   }

//   isRefreshing = true

//   try {
//     console.log('🔄 Attempting to refresh token...')

//     // Use Redux action to refresh token
//     const result = await store.dispatch(refreshTokenAction()).unwrap()
//     console.log('[handleTokenRefresh] Result:', result)
//     const token = result?.data?.token
//     if (token) {
//       api.defaults.headers.common.Authorization = `Bearer ${token}`

//       processQueue(null, token)

//       if (showNotification) {
//         // Check if token was actually refreshed or just validated
//         const currentToken = localStorage.getItem('token')
//         const resultToken = result?.data?.token

//         if (resultToken && resultToken !== currentToken) {
//           notificationService.success({
//             message: 'Phiên làm việc đã được gia hạn',
//             description: 'Token đã được làm mới thành công',
//             duration: 2,
//           })
//         } else {
//           notificationService.info({
//             message: 'Phiên làm việc vẫn hợp lệ',
//             description: 'Token chưa hết hạn, không cần làm mới',
//             duration: 2,
//           })
//         }
//       }

//       console.log('✅ Token refreshed successfully')
//       return token
//     } else {
//       throw new Error('Token refresh failed - no token returned')
//     }
//   } catch (refreshError) {
//     processQueue(refreshError, null)

//     if (showNotification) {
//       notificationService.error({
//         message: 'Phiên làm việc đã hết hạn',
//         description: 'Vui lòng đăng nhập lại',
//         duration: 3,
//       })
//     }

//     console.log('❌ Token refresh failed, logging out user')
//     store.dispatch(logoutUser())
//     throw refreshError
//   } finally {
//     isRefreshing = false
//   }
// }

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Add auth token or other headers here if needed
    const token = localStorage.getItem('token')
    if (token) {
      // Only add token to request, don't check expiration here
      // Let the response interceptor handle 401 errors
      console.log('✅ Request: Adding token to request')
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.log('ℹ️ Request: No token found, proceeding without auth')
    }
    return config
  },
  error => {
    console.log('❌ Request: Interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
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
    const excludedPaths = ['/api/v1/auth/login', '/api/v1/auth/forgot-password']

    // Handle 308 (PERMANENT_REDIRECT) - Google OAuth redirect
    if (error.response?.status === 308) {
      // Return the response data as success for Google OAuth redirect
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

    // Handle 401 (Unauthorized) - token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      console.log('⚠️ Response: 401 error detected, logging out user...')
      originalRequest._retry = true

      // Comment out refresh token logic - just logout directly
      // try {
      //   // Use centralized refresh logic (with notification for response interceptor)
      //   const newToken = await handleTokenRefresh(true)
      //   originalRequest.headers.Authorization = `Bearer ${newToken}`
      //   return api(originalRequest)
      // } catch (refreshError) {
      //   console.log('❌ Response: Token refresh failed for 401:', refreshError)
      // If refresh fails, logout the user
      //   store.dispatch(logoutUser())
      //   return Promise.reject(refreshError)
      // }

      // Direct logout without refresh attempt
      store.dispatch(logoutUser())
      return Promise.reject(
        new Error('Authentication failed - please login again')
      )
    }

    // Handle 403 (Forbidden) - insufficient permissions
    if (error.response?.status === 403 && !originalRequest._retryFor403) {
      console.log('403 error, showing AccessFail page')
      originalRequest._retryFor403 = true

      // Comment out refresh token logic for 403 errors
      // try {
      //   // Try to refresh token first (no standard notification)
      //   const newToken = await handleTokenRefresh(false)

      //   originalRequest.headers.Authorization = `Bearer ${newToken}`

      //   notificationService.info({
      //     message: 'Session refreshed',
      //     description: 'Retrying your request with updated permissions',
      //     duration: 2,
      //   })

      //   // Retry the original request with new token
      //   return api(originalRequest)
      // } catch (refreshError) {
      //   console.error('Token refresh failed for 403 error:', refreshError)

      // Show AccessFail page instead of immediate logout
      notificationService.error({
        message: 'Access Denied',
        description:
          'You do not have permission to access this resource. Redirecting to access denied page.',
        duration: 4,
      })

      // Redirect to AccessFail page
      const currentPath = window.location.pathname
      if (currentPath !== '/access-fail') {
        window.history.pushState(null, '', '/access-fail')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }

      //   return Promise.reject(
      //     new Error('Access forbidden: Insufficient permissions')
      //   )
      // }

      // Direct access fail without refresh attempt
      notificationService.error({
        message: 'Access Denied',
        description:
          'You do not have permission to access this resource. Redirecting to access denied page.',
        duration: 4,
      })

      // Redirect to AccessFail page
      const currentPathFor403 = window.location.pathname
      if (currentPathFor403 !== '/access-fail') {
        window.history.pushState(null, '', '/access-fail')
        window.dispatchEvent(new PopStateEvent('popstate'))
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api

import axios from 'axios'
import { store } from '../store'
import { logoutUser } from '../store/actions/authActions'
import { logout as logoutAction } from '../store/slices/authSlice'
import { authAPI } from './authApi'
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
let isRefreshing = false
let refreshPromise = null

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
    const excludedPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/forgot-password',
      '/api/v1/auth/refresh',
    ]

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

    // Handle 401 (Unauthorized) - do not refresh, just logout
    if (
      error.response?.status === 401 &&
      !originalRequest._retry401 &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      console.log('⚠️ Response: 401 error detected, logging out user...')
      originalRequest._retry401 = true
      notificationService.error({
        message: 'Phiên đăng nhập hết hạn',
        description: 'Bạn đã bị đăng xuất. Vui lòng đăng nhập lại.',
        duration: 4,
      })
      store.dispatch(logoutUser())
      return Promise.reject(
        new Error('Authentication failed - please login again')
      )
    }

    // Handle 403 (Forbidden) - try refresh token ONCE, otherwise logout
    if (
      error.response?.status === 403 &&
      !originalRequest._retry403 &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      console.log('⚠️ Response: 403 detected, attempting token refresh...')
      originalRequest._retry403 = true

      try {
        // Ensure only one refresh call is in-flight
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = (async () => {
            const currentToken = localStorage.getItem('token')
            const refreshResponse = await authAPI.refreshToken(currentToken)
            const refreshedToken = refreshResponse?.data?.token || currentToken
            if (!refreshedToken) {
              throw new Error('No token returned from refresh')
            }
            // Save and apply new token
            localStorage.setItem('token', refreshedToken)
            api.defaults.headers.common.Authorization = `Bearer ${refreshedToken}`
            return refreshedToken
          })()
            .catch(err => {
              throw err
            })
            .finally(() => {
              isRefreshing = false
            })
        }

        const newToken = await refreshPromise
        // Retry original request with the (possibly) new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('✅ Token refreshed on 403. Retrying original request...')
        return api(originalRequest)
      } catch (refreshError) {
        console.error(
          '❌ Refresh on 403 failed. Logging out locally...',
          refreshError
        )
        // Only show this notification if the refresh endpoint itself returned 403
        if (refreshError?.response?.status === 403) {
          notificationService.error({
            message: 'Tài khoản vừa được đăng nhập ở nơi khác',
            description: 'Bạn đã bị đăng xuất khỏi phiên hiện tại.',
            duration: 4,
          })
        }

        // Perform local logout ONLY (do not call logout service)
        try {
          localStorage.removeItem('auth')
          localStorage.removeItem('token')
        } catch (storageError) {
          console.warn(
            'Failed to clear local storage during logout:',
            storageError
          )
        }
        store.dispatch(logoutAction())

        return Promise.reject(
          new Error('Access forbidden - logged out locally')
        )
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api

import axios from 'axios'
import { store } from '../store'
import {
  logoutUser,
  refreshToken as refreshTokenAction,
} from '../store/actions/authActions'
import { isTokenExpired } from '../utils'
import notificationService from './notificationService'

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
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request interceptor
api.interceptors.request.use(
  config => {
    // Add auth token or other headers here if needed
    const token = localStorage.getItem('token')
    if (token) {
      // Check if token is expired before making the request
      if (isTokenExpired(token)) {
        console.log('Token is expired, logging out user')
        store.dispatch(logoutUser())
        return Promise.reject(new Error('Token expired'))
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
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

    // Handle 401 (Unauthorized) - token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !excludedPaths?.some(path => originalRequest.url.includes(path))
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Use Redux action to refresh token
        const result = await store.dispatch(refreshTokenAction()).unwrap()

        if (result?.token) {
          api.defaults.headers.common.Authorization = `Bearer ${result.token}`
          originalRequest.headers.Authorization = `Bearer ${result.token}`

          processQueue(null, result.token)
          notificationService.success({
            message: 'Token refreshed successfully',
            description: 'Your session has been extended',
            duration: 2,
          })
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        notificationService.error({
          message: 'Session expired',
          description: 'Please login again',
          duration: 3,
        })
        // Dispatch logout action for 401 errors
        store.dispatch(logoutUser())
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 (Forbidden) - insufficient permissions
    if (error.response?.status === 403 && !originalRequest._retryFor403) {
      console.log(
        '403 error, attempting token refresh before showing AccessFail'
      )
      originalRequest._retryFor403 = true

      try {
        // Try to refresh token first
        const result = await store.dispatch(refreshTokenAction()).unwrap()

        if (result?.token) {
          api.defaults.headers.common.Authorization = `Bearer ${result.token}`
          originalRequest.headers.Authorization = `Bearer ${result.token}`

          notificationService.info({
            message: 'Session refreshed',
            description: 'Retrying your request with updated permissions',
            duration: 2,
          })

          // Retry the original request with new token
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        console.error('Token refresh failed for 403 error:', refreshError)

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

        return Promise.reject(
          new Error('Access forbidden: Insufficient permissions')
        )
      }
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api

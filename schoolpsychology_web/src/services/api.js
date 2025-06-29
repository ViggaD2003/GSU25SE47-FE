import axios from 'axios'
import { store } from '../store'
import { logoutUser } from '../store/actions/authActions'
import { isTokenExpired } from '../utils'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/",
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
        success: true
      })
    }

    // Handle 401 (Unauthorized) - token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !excludedPaths.some(path => originalRequest.url.includes(path))
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
        // Import authAPI dynamically to avoid circular dependency
        const { authAPI } = await import('./authApi')
        const response = await authAPI.refreshToken()

        if (response.success && response.data?.token) {
          const newToken = response.data.token
          localStorage.setItem('token', newToken)
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`
          originalRequest.headers.Authorization = `Bearer ${newToken}`

          processQueue(null, newToken)
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Dispatch logout action for 401 errors
        store.dispatch(logoutUser())
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle 403 (Forbidden) - insufficient permissions
    if (error.response?.status === 403) {
      console.error('Access forbidden: Insufficient permissions')
      // Dispatch logout action for 403 errors
      store.dispatch(logoutUser())
      return Promise.reject(
        new Error('Access forbidden: Insufficient permissions')
      )
    }

    // Handle other errors
    return Promise.reject(error)
  }
)

export default api

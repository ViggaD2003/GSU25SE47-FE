import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
// import { store } from '../store'
// import { logoutUser } from '../store/actions/authActions'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8080', // đổi sang IP thật nếu chạy trên device
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Lỗi lấy token từ AsyncStorage:', error.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// // Response interceptor
// api.interceptors.response.use(
//   response => {
//     return response
//   },
//   async error => {
//     const originalRequest = error.config
//     const excludedPaths = ['/api/v1/auth/login', '/api/v1/auth/forgot-password']

//     // Handle 401 (Unauthorized) - token expired
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !excludedPaths.some(path => originalRequest.url.includes(path))
//     ) {
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject })
//         })
//           .then(token => {
//             originalRequest.headers.Authorization = `Bearer ${token}`
//             return api(originalRequest)
//           })
//           .catch(err => {
//             return Promise.reject(err)
//           })
//       }

//       originalRequest._retry = true
//       isRefreshing = true

//       try {
//         // Import authAPI dynamically to avoid circular dependency
//         const { authAPI } = await import('./authApi')
//         const response = await authAPI.refreshToken()

//         if (response.success && response.data?.token) {
//           const newToken = response.data.token
//           localStorage.setItem('token', newToken)
//           api.defaults.headers.common.Authorization = `Bearer ${newToken}`
//           originalRequest.headers.Authorization = `Bearer ${newToken}`

//           processQueue(null, newToken)
//           return api(originalRequest)
//         } else {
//           throw new Error('Token refresh failed')
//         }
//       } catch (refreshError) {
//         processQueue(refreshError, null)
//         // Dispatch logout action for 401 errors
//         store.dispatch(logoutUser())
//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     // Handle 403 (Forbidden) - insufficient permissions
//     if (error.response?.status === 403) {
//       console.error('Access forbidden: Insufficient permissions')
//       // Dispatch logout action for 403 errors
//       store.dispatch(logoutUser())
//       return Promise.reject(
//         new Error('Access forbidden: Insufficient permissions')
//       )
//     }

//     // Handle other errors
//     return Promise.reject(error)
//   }
// )

export default api
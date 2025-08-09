import { createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/authApi'
import { decodeJWT } from '../../utils'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  initializeAuth,
} from '../slices/authSlice'

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await authAPI.login(
        credentials.email,
        credentials.password
      )

      // console.log(response)

      if (response.success) {
        const isGoogleOAuthUrl =
          typeof response.data === 'string' &&
          response.data.includes('https://accounts.google.com/o/oauth2/auth')

        // ✅ Nếu là MANAGER thì redirect thẳng
        if (isGoogleOAuthUrl) {
          window.location.href = response.data // chuyển trình duyệt
          return
        }

        // ✅ Nếu là USER thường thì lưu token và login
        localStorage.setItem('token', response.data.token)

        const decodedToken = decodeJWT(response.data.token)
        const user = {
          ...decodedToken,
          id: decodedToken['user-id'] || decodedToken?.userId || 1,
          fullName:
            decodedToken?.name ||
            decodedToken?.fullName ||
            credentials.email.split('@')[0],
          email: decodedToken?.sub || decodedToken?.email || credentials.email,
          role: decodedToken?.role
            ? String(decodedToken.role).toLowerCase()
            : null,
        }

        const authData = { user, token: response.data.token }
        localStorage.setItem('auth', JSON.stringify(authData))
        dispatch(loginSuccess(authData))
        return authData
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      dispatch(loginFailure())
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Async thunk for refresh token - DISABLED
// export const refreshToken = createAsyncThunk(
//   'auth/refreshToken',
//   async (_, { dispatch, rejectWithValue }) => {
//     try {
//       console.log('[refreshToken] Running...')

//       const response = await authAPI.refreshToken()
//       console.log('[refreshToken] Response:', response)

//       if (response.success && response.data?.token) {
//         const newToken = response.data.token

//         // Only update localStorage if we got a new token
//         if (newToken !== localStorage.getItem('token')) {
//           localStorage.setItem('token', newToken)

//           // Decode the new token to get updated user information
//           const decodedToken = decodeJWT(newToken)

//           // Update the stored auth data with new token and user info
//           const savedAuth = localStorage.getItem('auth')
//           if (savedAuth) {
//             const authData = JSON.parse(savedAuth)
//             authData.token = newToken

//             // Update user data from decoded token if available
//             if (decodedToken) {
//               authData.user = {
//                 ...decodedToken,
//                 ...authData.user,
//                 id:
//                   decodedToken['user-id'] ||
//                   decodedToken.userId ||
//                   authData.user.id,
//                 fullName:
//                   decodedToken.name ||
//                   decodedToken.fullName ||
//                   authData.user.fullName,
//                 email:
//                   decodedToken.email || decodedToken.sub || authData.user.email,
//                 role: decodedToken.role
//                   ? String(decodedToken.role).toLowerCase()
//                   : null,
//               }
//             }

//             localStorage.setItem('auth', JSON.stringify(authData))
//             // Use loginSuccess to ensure isRestoredFromStorage is set to false
//             dispatch(loginSuccess(authData))
//           }
//         }

//         return { data: { token: newToken } }
//       } else {
//         throw new Error('Token refresh failed - invalid response')
//       }
//     } catch (error) {
//       console.log('[refreshToken] Error:', error)
//       // If refresh fails, logout the user
//       dispatch(logoutUser())
//       return rejectWithValue(error.response?.data?.message || error.message)
//     }
//   }
// )

// Flag to prevent multiple logout calls
let isLoggingOut = false

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Prevent multiple logout calls
    if (isLoggingOut) {
      console.log('Logout already in progress, skipping...')
      return
    }

    isLoggingOut = true

    try {
      console.log('🔄 Starting logout process...')
      // Call logout API if available

      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth')
      localStorage.removeItem('token')

      dispatch(logoutAction())
      console.log('✅ Logout completed')
      isLoggingOut = false
    }
  }
)

// Async thunk for Google OAuth login
export const loginWithGoogleToken = createAsyncThunk(
  'auth/loginWithGoogleToken',
  async (token, { dispatch, rejectWithValue }) => {
    try {
      if (!token) {
        throw new Error('No authentication token provided')
      }

      // Decode token để lấy thông tin user
      const decodedToken = decodeJWT(token)
      if (!decodedToken) {
        throw new Error('Invalid authentication token')
      }

      // Tạo object user từ decoded token
      const user = {
        ...decodedToken,
        id: decodedToken?.userId || decodedToken['user-id'] || 1,
        fullName: decodedToken?.name || decodedToken?.fullName || 'Google User',
        email: decodedToken?.email || decodedToken?.sub || '',
        role: decodedToken?.role
          ? String(decodedToken.role).toLowerCase()
          : null,
      }

      // Kiểm tra quyền truy cập
      const authorizedRoles = ['manager', 'teacher', 'counselor']
      if (!authorizedRoles.includes(user.role?.toLowerCase())) {
        throw new Error(
          `Your role (${user.role || 'undefined'}) is not authorized to access this application. Only managers, teachers, and counselors are allowed.`
        )
      }

      // Tạo auth data object
      const authData = { user, token }

      // Lưu vào localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('auth', JSON.stringify(authData))

      // Dispatch loginSuccess để cập nhật Redux state
      dispatch(loginSuccess(authData))

      return authData
    } catch (error) {
      dispatch(loginFailure())
      return rejectWithValue(error.message || 'Google authentication failed')
    }
  }
)

// Initialize auth from localStorage
export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeAuthFromStorage',
  async (_, { dispatch }) => {
    try {
      const savedAuth = localStorage.getItem('auth')
      const token = localStorage.getItem('token')

      if (savedAuth && token) {
        // Check if token is expired

        // Comment out refresh token logic - just clear auth data
        // try {
        //   // Try to refresh the token
        //   const refreshResult = await dispatch(refreshToken()).unwrap()
        //   console.log('Token refreshed successfully:', refreshResult)

        //   // Get the updated auth data after refresh
        //   const updatedAuth = localStorage.getItem('auth')
        //   const updatedToken = localStorage.getItem('token')

        //   if (updatedAuth && updatedToken) {
        //     const authData = JSON.parse(updatedAuth)
        //     dispatch(initializeAuth(authData))
        //     return authData
        //   } else {
        //     throw new Error('Failed to get updated auth data after refresh')
        //   }
        // } catch (refreshError) {
        //   console.log(
        //     'Token refresh failed during initialization:',
        //     refreshError
        //   )
        // If refresh fails, clear auth data
        //   localStorage.removeItem('auth')
        //   localStorage.removeItem('token')
        //   dispatch(initializeAuth(null))
        //   return null
        // }

        // Direct clear auth data without refresh attempt
        // localStorage.removeItem('auth')
        // localStorage.removeItem('token')
        // dispatch(initializeAuth(null))
        // return null

        const authData = JSON.parse(savedAuth)

        // Decode token to verify and potentially update user data
        const decodedToken = decodeJWT(token)
        if (decodedToken) {
          // Update user data with fresh data from token
          authData.user = {
            ...decodedToken,
            ...authData.user,
            id:
              decodedToken['user-id'] ||
              decodedToken.userId ||
              authData.user.id,
            fullName:
              decodedToken.name ||
              decodedToken.fullName ||
              authData.user.fullName,
            email:
              decodedToken.email || decodedToken.sub || authData.user.email,
            role: decodedToken.role
              ? String(decodedToken.role).toLowerCase()
              : null,
          }

          // Save updated auth data
          localStorage.setItem('auth', JSON.stringify(authData))
        }

        dispatch(initializeAuth(authData))
        return authData
      } else {
        dispatch(initializeAuth(null))
        return null
      }
    } catch (error) {
      console.error('Error initializing auth from storage:', error)
      localStorage.removeItem('auth')
      localStorage.removeItem('token')
      dispatch(initializeAuth(null))
      return null
    }
  }
)

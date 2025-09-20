import { createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/authApi'
import { decodeJWT, isTokenExpired } from '../../utils'
import {
  saveAuthData,
  clearAuthData,
  getToken,
  createStandardizedUser,
  isAuthorizedRole,
  updateAuthUser,
  getAuthUser,
} from '../../utils/authHelpers'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  initializeAuth,
} from '../slices/authSlice'
import { accountAPI } from '@/services/accountApi'

// Flag to prevent multiple refresh calls
let isRefreshing = false

export const loadAccount = createAsyncThunk('auth/loadAccount', async () => {
  try {
    const authUser = getAuthUser()
    if (authUser?.role.toLowerCase() === 'manager') {
      return authUser
    }
    const response = await accountAPI.getAccount()
    const user = createStandardizedUser(response)
    updateAuthUser(user)
    return user
  } catch (error) {
    console.error('Error loading account:', error)
    return null
  }
})

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(forceLogout())
      dispatch(loginStart())

      const response = await authAPI.login(
        credentials.email,
        credentials.password
      )

      if (response.success) {
        // Check if response contains Google OAuth URL (for MANAGER role)
        const isGoogleOAuthUrl =
          typeof response.data === 'string' &&
          response.data.includes('https://accounts.google.com/o/oauth2/auth')

        if (isGoogleOAuthUrl) {
          // For MANAGER role: redirect to Google OAuth
          window.location.href = response.data
          return {
            success: true,
            isOAuthRedirect: true,
            oauthUrl: response.data,
          }
        }

        // For COUNSELOR/TEACHER role: normal login with token
        // console.log('👤 Counselor/Teacher detected, processing normal login...')

        if (!response.data || !response.data.token) {
          throw new Error('Invalid response: missing token data')
        }

        const decodedToken = decodeJWT(response.data.token)
        if (!decodedToken) {
          throw new Error('Invalid token: failed to decode JWT')
        }

        const user = createStandardizedUser(decodedToken)

        // Save both access token and refresh token
        const authData = {
          user,
          token: response.data.token,
        }

        saveAuthData(response.data.token, user)

        authData.user = await dispatch(loadAccount()).unwrap()

        dispatch(loginSuccess(authData))

        return authData
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('❌ Login failed:', error)
      dispatch(loginFailure())
      return rejectWithValue(error)
    }
  }
)

// Async thunk for refresh token - IMPROVED with better error handling
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { dispatch }) => {
    // Prevent multiple refresh calls
    if (isRefreshing) {
      return { data: { token: null } }
    }

    isRefreshing = true

    // Get refresh token using centralized helpers
    const currentToken = getToken()

    if (!currentToken) {
      throw new Error('No auth data found in storage')
    }

    // Check if current token is still valid
    if (!isTokenExpired(currentToken)) {
      // console.log(
      //   '[refreshToken] Current token is still valid, no refresh needed'
      // )
      return { data: { token: currentToken } }
    }

    // Try to refresh the token using refresh token
    const response = await authAPI.refreshToken(currentToken)

    if (response.status === 200 && response.success && response.newToken) {
      // console.log(
      //   '[authActions] ✅ Token refreshed successfully',
      //   response.newToken
      // )
      isRefreshing = false
      return { data: { token: response.newToken } }
    } else {
      dispatch(forceLogout())
      isRefreshing = false
      return { data: { token: null } }
    }
  }
)

// Flag to prevent multiple logout calls
let isLoggingOut = false

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Prevent multiple logout calls
    if (isLoggingOut) {
      return
    }
    const token = getToken()
    if (isTokenExpired(token)) {
      dispatch(forceLogout())
    }

    isLoggingOut = true

    try {
      // Call logout API if available
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage using centralized helpers
      clearAuthData()
      dispatch(logoutAction())
      isLoggingOut = false
    }
  }
)

// Force logout without API call - for cases like 403 with valid token
export const forceLogout = createAsyncThunk(
  'auth/forceLogout',
  async (_, { dispatch }) => {
    // Clear localStorage using centralized helpers
    clearAuthData()

    // Update Redux state
    dispatch(logoutAction())

    return true
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

      // Tạo standardized user object
      const user = createStandardizedUser(decodedToken)

      // Kiểm tra quyền truy cập
      if (!isAuthorizedRole(user.role)) {
        throw new Error(
          `Your role (${user.role || 'undefined'}) is not authorized to access this application. Only managers, teachers, and counselors are allowed.`
        )
      }

      // Tạo auth data object với refresh token
      const authData = {
        user,
        token,
      }

      // Lưu vào localStorage sử dụng centralized helpers
      saveAuthData(token, user)

      // Dispatch loginSuccess để cập nhật Redux state
      dispatch(loginSuccess(authData))

      return authData
    } catch (error) {
      dispatch(loginFailure())
      return rejectWithValue(error.message || 'Google authentication failed')
    }
  }
)

// Initialize auth from localStorage - IMPROVED with better error handling
export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeAuthFromStorage',
  async (_, { dispatch }) => {
    try {
      const savedAuth = localStorage.getItem('auth')

      if (!savedAuth) {
        dispatch(initializeAuth(null))
        return null
      }

      const authData = JSON.parse(savedAuth)
      const token = authData.token

      if (!token) {
        clearAuthData()
        dispatch(initializeAuth(null))
        return null
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log(
          '[initializeAuthFromStorage] Token expired, attempting refresh...'
        )

        try {
          // Try to refresh the token
          await dispatch(refreshToken()).unwrap()

          // Get the updated auth data after refresh
          const updatedAuth = localStorage.getItem('auth')
          if (updatedAuth) {
            const updatedAuthData = JSON.parse(updatedAuth)
            dispatch(initializeAuth(updatedAuthData))
            return updatedAuthData
          } else {
            throw new Error('Failed to get updated auth data after refresh')
          }
        } catch (refreshError) {
          console.log(
            'Token refresh failed during initialization:',
            refreshError
          )
          // If refresh fails, clear auth data
          clearAuthData()
          dispatch(initializeAuth(null))
          return null
        }
      } else {
        // Decode token to verify and potentially update user data
        const decodedToken = decodeJWT(token)
        if (decodedToken) {
          // Update user data with fresh data from token
          authData.user = createStandardizedUser(decodedToken)

          // Save updated auth data
          saveAuthData(token, authData.user)
        }

        authData.user = await dispatch(loadAccount()).unwrap()

        dispatch(initializeAuth(authData))

        return authData
      }
    } catch (error) {
      console.error('Error initializing auth from storage:', error)
      clearAuthData()
      dispatch(initializeAuth(null))
      return null
    }
  }
)

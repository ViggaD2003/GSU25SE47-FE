import { createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/authApi'
import { decodeJWT, isTokenExpired } from '../../utils'
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

      if (response.success) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token)

        // Decode the JWT token to extract user information
        const decodedToken = decodeJWT(response.data.token)

        // Create user object from decoded token or fallback to mock data
        const user = {
          id: decodedToken?.sub || decodedToken?.userId || 1,
          fullName:
            decodedToken?.name ||
            decodedToken?.fullName ||
            credentials.email.split('@')[0],
          email: decodedToken?.email || credentials.email,
          role: decodedToken?.role
            ? String(decodedToken.role).toLowerCase()
            : null,
        }

        const authData = {
          user,
          token: response.data.token,
        }

        // Save to localStorage
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

// Async thunk for refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await authAPI.refreshToken()

      if (response.success && response.data?.token) {
        const newToken = response.data.token
        localStorage.setItem('token', newToken)

        // Decode the new token to get updated user information
        const decodedToken = decodeJWT(newToken)

        // Update the stored auth data with new token and user info
        const savedAuth = localStorage.getItem('auth')
        if (savedAuth) {
          const authData = JSON.parse(savedAuth)
          authData.token = newToken

          // Update user data from decoded token if available
          if (decodedToken) {
            authData.user = {
              ...authData.user,
              id: decodedToken.sub || decodedToken.userId || authData.user.id,
              fullName:
                decodedToken.name ||
                decodedToken.fullName ||
                authData.user.fullName,
              email: decodedToken.email || authData.user.email,
              role: decodedToken.role
                ? String(decodedToken.role).toLowerCase()
                : null,
            }
          }

          localStorage.setItem('auth', JSON.stringify(authData))
          // Use loginSuccess to ensure isRestoredFromStorage is set to false
          dispatch(loginSuccess(authData))
        }

        return { token: newToken }
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (error) {
      // If refresh fails, logout the user
      dispatch(logoutUser())
      return rejectWithValue(error.response?.data?.message || error.message)
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      // Call logout API if available
      await authAPI.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth')
      localStorage.removeItem('token')

      dispatch(logoutAction())
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
        if (isTokenExpired(token)) {
          console.log('Token is expired, clearing auth data')
          localStorage.removeItem('auth')
          localStorage.removeItem('token')
          dispatch(initializeAuth(null))
          return null
        }

        const authData = JSON.parse(savedAuth)

        // Decode token to verify and potentially update user data
        const decodedToken = decodeJWT(token)
        if (decodedToken) {
          // Update user data with fresh data from token
          authData.user = {
            ...authData.user,
            id: decodedToken.sub || decodedToken.userId || authData.user.id,
            fullName:
              decodedToken.name ||
              decodedToken.fullName ||
              authData.user.fullName,
            email: decodedToken.email || authData.user.email,
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

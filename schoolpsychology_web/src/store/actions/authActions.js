import { createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/authApi'
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

        // For now, we'll create a mock user object since the API doesn't return user data
        // In a real scenario, you might want to make another API call to get user details
        const user = {
          id: 1,
          fullName: credentials.email.split('@')[0],
          role: 'manager',
          email: credentials.email,
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

        // Update the stored auth data with new token
        const savedAuth = localStorage.getItem('auth')
        if (savedAuth) {
          const authData = JSON.parse(savedAuth)
          authData.token = newToken
          localStorage.setItem('auth', JSON.stringify(authData))
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
        const authData = JSON.parse(savedAuth)
        dispatch(initializeAuth(authData))
        return authData
      } else {
        dispatch(initializeAuth(null))
        return null
      }
    } catch {
      localStorage.removeItem('auth')
      localStorage.removeItem('token')
      dispatch(initializeAuth(null))
      return null
    }
  }
)

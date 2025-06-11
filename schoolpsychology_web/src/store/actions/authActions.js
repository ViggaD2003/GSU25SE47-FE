import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  initializeAuth,
} from '../slices/authSlice'

// Mock API call - replace with real API
const mockApiLogin = async credentials => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock user data with roles
  const mockUsers = [
    {
      id: 1,
      username: 'manager',
      fullName: 'Manager User',
      role: 'manager',
      email: 'manager@school.edu',
    },
    {
      id: 2,
      username: 'teacher',
      fullName: 'Teacher User',
      role: 'teacher',
      email: 'teacher@school.edu',
    },
    {
      id: 3,
      username: 'counselor',
      fullName: 'Counselor User',
      role: 'counselor',
      email: 'counselor@school.edu',
    },
  ]

  const user = mockUsers.find(user => user.email === credentials.email)
  console.log(user)

  if (user && credentials.password === 'password') {
    return {
      user,
      token: `mock-jwt-token-${user.role}-${Date.now()}`,
    }
  }

  throw new Error('Invalid credentials')
}

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart())
      const response = await mockApiLogin(credentials)

      // Save to localStorage
      localStorage.setItem('auth', JSON.stringify(response))

      dispatch(loginSuccess(response))
      return response
    } catch (error) {
      dispatch(loginFailure())
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    // Clear localStorage
    localStorage.removeItem('auth')

    dispatch(logoutAction())
  }
)

// Initialize auth from localStorage
export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeAuthFromStorage',
  async (_, { dispatch }) => {
    try {
      const savedAuth = localStorage.getItem('auth')
      if (savedAuth) {
        const authData = JSON.parse(savedAuth)
        dispatch(initializeAuth(authData))
        return authData
      } else {
        dispatch(initializeAuth(null))
        return null
      }
    } catch (error) {
      localStorage.removeItem('auth')
      dispatch(initializeAuth(null))
      return null
    }
  }
)

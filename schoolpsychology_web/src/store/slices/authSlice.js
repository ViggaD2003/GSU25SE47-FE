import { createSlice } from '@reduxjs/toolkit'
import { ROLE_PERMISSIONS } from '@/constants/routeConfig'

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  token: null,
  isRestoredFromStorage: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: state => {
      state.loading = true
    },
    loginSuccess: (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.isRestoredFromStorage = false
    },
    loginFailure: state => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.isRestoredFromStorage = false
    },
    logout: state => {
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.loading = false
      state.isRestoredFromStorage = false
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    initializeAuth: (state, action) => {
      state.loading = false
      if (action.payload) {
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.isRestoredFromStorage = true
      } else {
        state.isRestoredFromStorage = false
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setLoading,
  initializeAuth,
} = authSlice.actions

// Selectors
export const selectAuth = state => state.auth
export const selectUser = state => state.auth.user
export const selectIsAuthenticated = state => state.auth.isAuthenticated
export const selectUserRole = state => state.auth.user?.role
export const selectLoading = state => state.auth.loading
export const selectIsRestoredFromStorage = state =>
  state.auth.isRestoredFromStorage

// Helper function to check if user has access to a route
export const hasRouteAccess = (userRole, path) => {
  if (!userRole || !ROLE_PERMISSIONS[userRole]) {
    return false
  }
  return ROLE_PERMISSIONS[userRole].includes(path)
}

export default authSlice.reducer

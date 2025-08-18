import { createSlice } from '@reduxjs/toolkit'
import { ROLE_PERMISSIONS } from '@/constants/routeConfig'
import { STORAGE_KEYS } from '@/utils'

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
    setUser: (state, action) => {
      state.user = action.payload
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
  setUser,
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

  // Check for exact match first
  if (ROLE_PERMISSIONS[userRole].includes(path)) {
    return true
  }

  // Check for dynamic routes (paths ending with /:id or containing dynamic segments)
  return ROLE_PERMISSIONS[userRole].some(route => {
    // If the route ends with /:id, check if the path starts with the base route
    if (route.endsWith('/:id')) {
      const baseRoute = route.replace('/:id', '')
      return path.startsWith(baseRoute + '/') && path !== baseRoute
    }

    // If the route contains /:id in the middle, create a regex pattern
    if (route.includes('/:id/')) {
      const regexPattern = route
        .replace(/\/:id\//g, '/[^/]+/')
        .replace('/:id', '/[^/]+')
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(path)
    }

    // If the route ends with /:id, create a regex pattern
    if (route.endsWith('/:id')) {
      const regexPattern = route.replace('/:id', '/[^/]+')
      const regex = new RegExp(`^${regexPattern}$`)
      return regex.test(path)
    }

    // Handle routes that start with /:id
    if (route.startsWith('/:id/')) {
      const regexPattern = route.replace('/:id/', '/[^/]+/')
      const regex = new RegExp(`^${regexPattern}`)
      return regex.test(path)
    }

    // Handle routes that are just /:id
    if (route === '/:id') {
      const regex = /^\/[^/]+$/
      return regex.test(path)
    }

    return false
  })
}

export default authSlice.reducer

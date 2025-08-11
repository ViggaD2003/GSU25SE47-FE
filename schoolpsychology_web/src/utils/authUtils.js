import { getTokenInfo, isTokenExpired } from './index'
import {
  getAuthData,
  getToken,
  getRefreshToken,
  isAuthenticated as isAuthFromHelpers,
  saveAuthData as saveAuthDataFromHelpers,
  clearAuthData as clearAuthDataFromHelpers,
  updateToken as updateTokenFromHelpers,
} from './authHelpers'

// Re-export functions from authHelpers to maintain backward compatibility
export const getStoredToken = getToken
export const getStoredRefreshToken = getRefreshToken
export const getStoredUser = () => {
  const authData = getAuthData()
  return authData?.user || null
}

// Token validation utilities
export const isTokenValid = token => {
  if (!token) return false
  return !isTokenExpired(token)
}

export const shouldRefreshToken = (token, bufferMinutes = 5) => {
  if (!token) return false

  try {
    const tokenInfo = getTokenInfo(token)
    if (!tokenInfo || !tokenInfo.expiresIn) return false

    // Refresh if token expires within buffer minutes
    const bufferSeconds = bufferMinutes * 60
    return tokenInfo.expiresIn <= bufferSeconds
  } catch (error) {
    console.error('Error checking if token should be refreshed:', error)
    return false
  }
}

// Auth state utilities - use centralized helpers
export const isAuthenticated = isAuthFromHelpers

export const getAuthStatus = () => {
  const token = getStoredToken()

  if (!token) {
    return { isAuthenticated: false, needsRefresh: false, isExpired: false }
  }

  const isExpired = isTokenExpired(token)
  const needsRefresh = shouldRefreshToken(token)

  return {
    isAuthenticated: !isExpired,
    needsRefresh,
    isExpired,
    tokenInfo: getTokenInfo(token),
  }
}

// Storage utilities - use centralized helpers
export const saveAuthData = saveAuthDataFromHelpers
export const clearAuthData = clearAuthDataFromHelpers
export const updateToken = updateTokenFromHelpers

// Synchronize authentication state across the application
export const syncAuthState = () => {
  try {
    const authData = getAuthData()
    if (!authData) return null

    const token = authData?.token

    if (!token) {
      clearAuthData()
      return null
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      console.log('[syncAuthState] Token expired, clearing auth data')
      clearAuthData()
      return null
    }

    return authData
  } catch (error) {
    console.error('Error syncing auth state:', error)
    clearAuthData()
    return null
  }
}

// Validate and clean up auth data
export const validateAuthData = () => {
  try {
    const authData = getAuthData()
    if (!authData) return false

    // Check required fields
    if (!authData.token || !authData.user) {
      console.log('[validateAuthData] Missing required fields, clearing data')
      clearAuthData()
      return false
    }

    // Check token validity
    if (isTokenExpired(authData.token)) {
      console.log('[validateAuthData] Token expired, clearing data')
      clearAuthData()
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating auth data:', error)
    clearAuthData()
    return false
  }
}

// Get auth data with validation
export const getValidAuthData = () => {
  if (!validateAuthData()) {
    return null
  }
  return getStoredUser() ? getAuthData() : null
}

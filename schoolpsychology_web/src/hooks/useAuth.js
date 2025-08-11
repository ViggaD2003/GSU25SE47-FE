import { useEffect, useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectUser,
  selectIsAuthenticated,
  selectLoading,
} from '../store/slices/authSlice'
import {
  loginUser,
  logoutUser,
  refreshToken as refreshTokenAction,
} from '../store/actions/authActions'
import {
  getAuthStatus,
  validateAuthData,
  syncAuthState,
} from '../utils/authUtils'
import { NAVIGATION_PATHS, NOTIFICATION_DURATIONS } from '../utils/authHelpers'
import notificationService from '../services/notificationService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)

  // Refs to prevent stale closures
  const refreshTimeoutRef = useRef(null)
  const authCheckIntervalRef = useRef(null)

  // Check authentication status
  const checkAuthStatus = useCallback(() => {
    const authStatus = getAuthStatus()

    if (authStatus.isExpired) {
      console.log('Token expired, attempting refresh...')
      handleRefreshToken()
    } else if (authStatus.needsRefresh) {
      console.log('Token needs refresh, scheduling...')
      scheduleTokenRefresh(authStatus.tokenInfo?.expiresIn || 300)
    }
  }, [])

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback(expiresInSeconds => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    // Refresh 5 minutes before expiration
    const refreshTime = Math.max((expiresInSeconds - 300) * 1000, 0)

    refreshTimeoutRef.current = setTimeout(() => {
      handleRefreshToken()
    }, refreshTime)
  }, [])

  // Handle token refresh
  const handleRefreshToken = useCallback(async () => {
    try {
      const result = await dispatch(refreshTokenAction()).unwrap()
      const token = result?.data?.token

      if (token) {
        console.log('Token refreshed successfully')
        notificationService.success({
          message: 'Session Refreshed',
          description: 'Your session has been refreshed successfully.',
          duration: NOTIFICATION_DURATIONS.SUCCESS,
        })

        // Schedule next refresh
        const authStatus = getAuthStatus()
        if (authStatus.tokenInfo?.expiresIn) {
          scheduleTokenRefresh(authStatus.tokenInfo.expiresIn)
        }

        return { success: true, data: { token } }
      } else {
        throw new Error('Failed to refresh token')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      await handleLogout()
      return { success: false, error: error.message || 'Unknown error' }
    }
  }, [dispatch, scheduleTokenRefresh])

  // Handle login
  const handleLogin = useCallback(
    async (email, password) => {
      try {
        const result = await dispatch(loginUser({ email, password })).unwrap()

        if (result?.user?.role) {
          // Schedule token refresh
          const authStatus = getAuthStatus()
          if (authStatus.tokenInfo?.expiresIn) {
            scheduleTokenRefresh(authStatus.tokenInfo.expiresIn)
          }

          notificationService.success({
            message: 'Login Successful',
            description: `Welcome back, ${result.user.fullName || email}!`,
            duration: NOTIFICATION_DURATIONS.SUCCESS,
          })

          return { success: true, data: result }
        } else {
          throw new Error('Invalid user data received')
        }
      } catch (error) {
        notificationService.error({
          message: 'Login Failed',
          description:
            error?.message || error || 'Invalid credentials. Please try again.',
          duration: NOTIFICATION_DURATIONS.ERROR,
        })

        return { success: false, error: error?.message || error }
      }
    },
    [dispatch, scheduleTokenRefresh]
  )

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      // Clear timeouts
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current)
      }

      await dispatch(logoutUser()).unwrap()

      notificationService.info({
        message: 'Logged Out',
        description: 'You have been logged out successfully.',
        duration: NOTIFICATION_DURATIONS.INFO,
      })

      navigate(NAVIGATION_PATHS.LOGIN, { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [dispatch, navigate])

  // Validate authentication data
  const validateAuth = useCallback(() => {
    return validateAuthData()
  }, [])

  // Synchronize authentication state
  const syncAuth = useCallback(() => {
    return syncAuthState()
  }, [])

  // Setup authentication monitoring
  useEffect(() => {
    if (!isAuthenticated) return

    // Check auth status every 5 minutes
    authCheckIntervalRef.current = setInterval(checkAuthStatus, 5 * 60 * 1000)

    // Initial check
    checkAuthStatus()

    return () => {
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current)
      }
    }
  }, [isAuthenticated, checkAuthStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current)
      }
    }
  }, [])

  return {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    checkAuthStatus,
    validateAuth,
    syncAuth,
    userRole: user?.role,
  }
}

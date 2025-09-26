import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import notificationService from '../services/notificationService'
import { decodeJWT } from '../utils'
import {
  isAuthorizedRole,
  saveAuthData,
  clearAuthData,
  createStandardizedUser,
  NAVIGATION_PATHS,
  NOTIFICATION_DURATIONS,
} from '../utils/authHelpers'
import {
  selectUser,
  selectIsAuthenticated,
  selectLoading,
  loginSuccess,
  loginFailure,
} from '../store/slices/authSlice'
import {
  loginUser,
  logoutUser,
  initializeAuthFromStorage,
} from '../store/actions/authActions'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)
  const navigate = useNavigate()

  // Use refs to prevent stale closures and ensure state consistency
  const hasProcessedGoogleCallback = useRef(false)
  const notificationShown = useRef(false)
  const isProcessingAuth = useRef(false)

  useEffect(() => {
    // Initialize auth from localStorage on app start
    dispatch(initializeAuthFromStorage())
  }, [dispatch])

  // Helper function to show notification only once
  const showNotificationOnce = useCallback((type, config) => {
    if (!notificationShown.current) {
      notificationShown.current = true
      notificationService[type](config)
    }
  }, [])

  // Handle Google OAuth callback with improved state management
  const handleGoogleCallback = useCallback(
    async token => {
      try {
        if (hasProcessedGoogleCallback.current || isProcessingAuth.current) {
          // console.log('Google callback already processed or in progress')
          return { success: false, error: 'Already processed' }
        }

        isProcessingAuth.current = true
        hasProcessedGoogleCallback.current = true

        if (!token) {
          showNotificationOnce('error', {
            message: 'Authentication Failed',
            description:
              'No authentication token was provided. Please try logging in again.',
            duration: NOTIFICATION_DURATIONS.ERROR,
          })

          setTimeout(() => navigate(NAVIGATION_PATHS.LOGIN), 3000)
          return { success: false, error: 'No token provided' }
        }

        // Check if token contains error information (backend error response)
        if (
          token.includes('error') ||
          token.includes('duplicate') ||
          token.includes('Query did not return a unique result')
        ) {
          // console.error('Backend error detected in token:', token)

          let errorMessage = 'Authentication failed due to a backend error.'
          let description = 'Please contact support or try again later.'

          if (token.includes('Query did not return a unique result')) {
            errorMessage = 'Duplicate User Account Detected'
            description =
              'Multiple accounts found with the same email. Please contact support to resolve this issue.'
          } else if (token.includes('duplicate')) {
            errorMessage = 'Account Already Exists'
            description =
              'An account with this email already exists. Please use a different email or contact support.'
          }

          showNotificationOnce('error', {
            message: errorMessage,
            description: description,
            duration: NOTIFICATION_DURATIONS.ERROR,
          })

          // Reset state and redirect to login
          hasProcessedGoogleCallback.current = false
          notificationShown.current = false
          setTimeout(() => navigate(NAVIGATION_PATHS.LOGIN), 5000)
          return { success: false, error: errorMessage }
        }

        // Try to decode token - if it fails, it might be an error message
        let decodedToken
        try {
          decodedToken = decodeJWT(token)
        } catch (decodeError) {
          console.error('Token decode failed:', decodeError)

          if (
            token.length < 50 ||
            token.includes('error') ||
            token.includes('duplicate')
          ) {
            showNotificationOnce('error', {
              message: 'Authentication Failed',
              description:
                'Invalid authentication response. Please try again or contact support.',
              duration: NOTIFICATION_DURATIONS.ERROR,
            })

            hasProcessedGoogleCallback.current = false
            notificationShown.current = false
            setTimeout(() => navigate(NAVIGATION_PATHS.LOGIN), 3000)
            return { success: false, error: 'Invalid token format' }
          }

          // If token is long but decode fails, it might be malformed
          throw new Error('Token decode failed')
        }

        if (!decodedToken) {
          showNotificationOnce('error', {
            message: 'Authentication Failed',
            description:
              'The authentication token is invalid. Please try logging in again.',
            duration: NOTIFICATION_DURATIONS.ERROR,
          })

          setTimeout(() => navigate(NAVIGATION_PATHS.LOGIN), 3000)
          return { success: false, error: 'Invalid token' }
        }

        // Tạo standardized user object
        const userData = createStandardizedUser(decodedToken)

        // Kiểm tra quyền truy cập
        if (!isAuthorizedRole(userData.role)) {
          showNotificationOnce('error', {
            message: 'Access Denied',
            description: `Your role (${userData.role || 'undefined'}) is not authorized to access this application. Only managers, teachers, and counselors are allowed.`,
            duration: NOTIFICATION_DURATIONS.WARNING,
          })

          // Clear any existing auth data
          clearAuthData()
          hasProcessedGoogleCallback.current = false
          notificationShown.current = false

          setTimeout(() => navigate(NAVIGATION_PATHS.LOGIN), 3000)
          return { success: false, error: 'Unauthorized role' }
        }

        const authData = saveAuthData(token, userData)

        dispatch(loginSuccess(authData))

        // Show success notification
        notificationService.success({
          message: 'Google Login Successful',
          description: `Welcome back, ${userData.fullName}!`,
          duration: NOTIFICATION_DURATIONS.SUCCESS,
        })

        return { success: true, data: authData }
      } catch (error) {
        // Check if it's a backend error
        if (
          error.message &&
          (error.message.includes('Query did not return a unique result') ||
            error.message.includes('duplicate') ||
            error.message.includes('multiple accounts'))
        ) {
          showNotificationOnce('error', {
            message: 'Duplicate Account Issue',
            description:
              'Multiple accounts found with the same email. Please contact support to resolve this issue.',
            duration: NOTIFICATION_DURATIONS.ERROR,
          })
        } else {
          showNotificationOnce('error', {
            message: 'Authentication Error',
            description:
              'An unexpected error occurred while processing your login. Please try again.',
            duration: NOTIFICATION_DURATIONS.ERROR,
          })
        }

        // Reset state on error
        hasProcessedGoogleCallback.current = false
        notificationShown.current = false

        return { success: false, error: error.message || 'Unknown error' }
      } finally {
        isProcessingAuth.current = false
      }
    },
    [dispatch, navigate, showNotificationOnce]
  )

  const logout = useCallback(() => {
    dispatch(logoutUser())
    hasProcessedGoogleCallback.current = false
    notificationShown.current = false

    notificationService.info({
      message: 'Logged Out',
      description: 'You have been logged out successfully.',
      duration: NOTIFICATION_DURATIONS.INFO,
    })
  }, [dispatch])

  const login = useCallback(
    async (email, password) => {
      try {
        const result = await dispatch(loginUser({ email, password })).unwrap()

        // Check if this was an OAuth redirect (Manager role)
        if (result?.isOAuthRedirect) {
          // console.log('🔐 Manager role detected, OAuth redirect initiated')
          return {
            success: true,
            isOAuthRedirect: true,
            message: 'Redirecting to Google OAuth...',
          }
        }

        // Normal login (Counselor/Teacher role)
        if (result?.user?.role) {
          // Validate role authorization
          if (!isAuthorizedRole(result.user.role)) {
            dispatch(logoutUser())
            // notificationService.error({
            //   message: 'Login Failed',
            //   description: 'You are not authorized to access this application.',
            //   duration: NOTIFICATION_DURATIONS.ERROR,
            // })
            navigate(NAVIGATION_PATHS.LOGIN, { replace: true })
            return {
              success: false,
              error: 'You are not authorized to access this application.',
            }
          }

          // Show success notification
          notificationService.success({
            message: 'Login Successful',
            description: `Welcome back, ${result?.user?.fullName || email}!`,
            duration: NOTIFICATION_DURATIONS.SUCCESS,
          })

          return { success: true, data: result }
        } else {
          throw new Error('Invalid login response: missing user data')
        }
      } catch (error) {
        dispatch(loginFailure())

        // Navigate to login if needed
        if (error) {
          setTimeout(() => {
            navigate(NAVIGATION_PATHS.LOGIN, { replace: true })
          }, 3000) // Wait 3 seconds before redirecting
        }
        // Show success notification
        notificationService.error({
          message: 'Login Failed',
          description:
            error.message ||
            'An unexpected error occurred while processing your login. Please try again.',
          duration: NOTIFICATION_DURATIONS.ERROR,
        })

        return { success: false, error: error }
      }
    },
    [dispatch, navigate, clearAuthData]
  )
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    userRole: user?.role || null,
    handleGoogleCallback,
    hasProcessedGoogleCallback: hasProcessedGoogleCallback.current,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

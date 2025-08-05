import React, { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import notificationService from '../services/notificationService'
import {
  //   selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectLoading,
} from '../store/slices/authSlice'
import {
  loginUser,
  logoutUser,
  initializeAuthFromStorage,
  refreshToken as refreshTokenAction,
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
  //   const auth = useSelector(selectAuth)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)
  const navigate = useNavigate()

  useEffect(() => {
    // Initialize auth from localStorage on app start
    dispatch(initializeAuthFromStorage())
  }, [dispatch])

  const logout = () => {
    dispatch(logoutUser())
    notificationService.info({
      message: 'Logged Out',
      description: 'You have been logged out successfully.',
      duration: 3,
    })
  }

  const refreshToken = async () => {
    try {
      const result = await dispatch(refreshTokenAction()).unwrap()
      if (result?.token) {
        notificationService.success({
          message: 'Session Refreshed',
          description:
            'Your session has been refreshed. You can now try accessing the page again.',
          duration: 3,
        })
        return { success: true, data: result }
      } else {
        dispatch(logoutUser())
        notificationService.error({
          message: 'Session Expired',
          description: 'Please login again.',
          duration: 3,
        })
        return { success: false, error: 'Failed to refresh token' }
      }
    } catch (error) {
      return { success: false, error }
    }
  }

  const checkUserRole = role => {
    if (['manager', 'teacher', 'counselor'].includes(role)) {
      return true
    }
    return false
  }

  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap()

      if (!checkUserRole(result.user.role)) {
        dispatch(logoutUser())
        notificationService.error({
          message: 'Login Failed',
          description: 'You are not authorized to access this application.',
          duration: 4,
        })
        navigate('/login', { replace: true })
        return {
          success: false,
          error: 'You are not authorized to access this application.',
        }
      } else {
        // Show success notification
        notificationService.success({
          message: 'Login Successful',
          description: `Welcome back, ${result?.user?.fullName || email}!`,
          duration: 3,
        })

        return { success: true, data: result }
      }
    } catch (error) {
      // Show error notification
      notificationService.error({
        message: 'Login Failed',
        description: error || 'Invalid credentials. Please try again.',
        duration: 4,
      })

      return { success: false, error }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    refreshToken,
    userRole: user?.role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

import React, { createContext, useContext, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
} from '../store/actions/authActions'

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

  useEffect(() => {
    // Initialize auth from localStorage on app start
    dispatch(initializeAuthFromStorage())
  }, [dispatch])

  const login = async (email, password) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }

  const logout = () => {
    dispatch(logoutUser())
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    userRole: user?.role,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

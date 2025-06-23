import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice'

const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default GuestRoute

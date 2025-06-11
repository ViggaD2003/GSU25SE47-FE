import React from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectLoading } from '../store/slices/authSlice'

const GuestRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default GuestRoute

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectLoading } from '../../store/slices/authSlice'
import { useAuth } from '@/hooks'

const GuestRoute = ({ children }) => {
  const { user } = useAuth()
  const loading = useSelector(selectLoading)

  // Show loading spinner while auth is being initialized
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Only redirect if user is authenticated and this is NOT restored from storage (i.e., fresh login)
  if (user) {
    return <Navigate to={'/dashboard'} replace />
  }

  return children
}

export default GuestRoute

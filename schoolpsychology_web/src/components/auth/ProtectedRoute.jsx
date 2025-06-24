import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectUserRole,
  selectLoading,
  hasRouteAccess,
} from '../../store/slices/authSlice'
import AccessFail from '../../pages/AccessFail'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userRole = useSelector(selectUserRole)
  const loading = useSelector(selectLoading)
  const location = useLocation()

  // Show loading spinner while auth is being initialized
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If specific roles are required, check them
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <AccessFail isCurrentPath={false} userRole={userRole} />
  }

  // Check route-based permissions using the current path
  if (!hasRouteAccess(userRole, location.pathname)) {
    return <AccessFail isCurrentPath={true} userRole={userRole} />
  }

  return children
}

export default ProtectedRoute

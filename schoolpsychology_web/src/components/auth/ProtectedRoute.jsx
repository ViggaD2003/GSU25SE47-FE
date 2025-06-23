import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectUserRole,
  hasRouteAccess,
} from '../../store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const userRole = useSelector(selectUserRole)
  const location = useLocation()

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

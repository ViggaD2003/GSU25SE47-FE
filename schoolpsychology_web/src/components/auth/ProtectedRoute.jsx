import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectLoading,
  selectUserRole,
  hasRouteAccess,
} from '../../store/slices/authSlice'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const loading = useSelector(selectLoading)
  const userRole = useSelector(selectUserRole)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log(location)

  // If specific roles are required, check them
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    )
  }

  // Check route-based permissions using the current path
  if (!hasRouteAccess(userRole, location.pathname)) {
    return (
      <Result
        status="403"
        title="Access Denied"
        subTitle={`Your role (${userRole}) does not have permission to access this page.`}
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    )
  }

  return children
}

export default ProtectedRoute

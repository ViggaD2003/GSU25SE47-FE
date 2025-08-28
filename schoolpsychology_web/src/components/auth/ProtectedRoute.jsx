import React, { Suspense } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectLoading, hasRouteAccess } from '../../store/slices/authSlice'
import AccessFail from '../../pages/AccessFail'
import { useAuth } from '@/hooks'

// Helper function to normalize dynamic routes for permission checking
const normalizeRouteForPermission = pathname => {
  // Remove leading slash if present
  let path = pathname.startsWith('/') ? pathname.slice(1) : pathname

  // Check if this is a dynamic route (contains numeric segments that could be IDs)
  const segments = path.split('/')
  const normalizedSegments = segments.map(segment => {
    // If segment is numeric or looks like an ID, replace with :id
    if (/^\d+$/.test(segment) || /^[a-f0-9-]+$/i.test(segment)) {
      return ':id'
    }
    return segment
  })

  return '/' + normalizedSegments.join('/')
}

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
)

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { userRole, user } = useAuth()
  const loading = useSelector(selectLoading)
  const location = useLocation()

  // Show loading spinner while auth is being initialized
  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to={'/login'} replace />
  }
  // If specific roles are required, check them
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <AccessFail isCurrentPath={false} userRole={userRole} />
  }

  // Check route-based permissions using the current path
  // First try exact match, then try normalized dynamic route
  const normalizedPath = normalizeRouteForPermission(location.pathname)
  if (
    !hasRouteAccess(userRole, location.pathname) &&
    !hasRouteAccess(userRole, normalizedPath)
  ) {
    return <AccessFail isCurrentPath={true} userRole={userRole} />
  }

  return children
}

export default ProtectedRoute

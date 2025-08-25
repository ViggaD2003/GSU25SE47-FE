import { Route, Routes, Navigate } from 'react-router-dom'
import {
  Layout,
  AnonymousLayout as AnonymousLayoutComponent,
  GuestRoute,
  ProtectedRoute,
} from '../components'
import React, { lazy, Suspense, useMemo } from 'react'
import { ROUTE_CONFIG } from '@/constants/routeConfig'
import GoogleCallBack from '@/pages/auth/GoogleCallBack'

// Enhanced loading component
const LoadingFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center">
    {error ? (
      <div className="text-center">
        <div className="text-red-500 mb-4">Error loading page</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )}
  </div>
)

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true }
  }

  componentDidCatch(_error, errorInfo) {
    console.error('Route loading error:', _error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <LoadingFallback error={true} />
    }

    return this.props.children
  }
}

// Lazy loaded components with better error handling
const createLazyComponent = (importFunc, componentName) => {
  return lazy(() =>
    importFunc().catch(error => {
      console.error(`Error loading ${componentName}:`, error)
      // Return a fallback component
      return {
        default: () => (
          <div className="p-6 text-center">
            <h2>Error loading {componentName}</h2>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        ),
      }
    })
  )
}

// Component mapping - tối ưu hóa với object literal
const COMPONENT_MAP = {
  Dashboard: createLazyComponent(
    () => import('../pages/main/DashboardHome'),
    'Dashboard'
  ),
  Login: createLazyComponent(() => import('../pages/auth/Login'), 'Login'),
  ForgotPassword: createLazyComponent(
    () => import('../pages/auth/ForgotPassword'),
    'ForgotPassword'
  ),
  ClientManagement: createLazyComponent(
    () => import('@/pages/main/AccountManagement/ClientManagement'),
    'ClientManagement'
  ),
  StaffManagement: createLazyComponent(
    () => import('@/pages/main/AccountManagement/StaffManagement'),
    'StaffManagement'
  ),
  UserDetail: createLazyComponent(
    () => import('@/pages/main/AccountManagement/UserDetail'),
    'UserDetail'),
  AppointmentManagement: createLazyComponent(
    () => import('@/pages/main/AppointmentManagement/AppointmentManagement'),
    'AppointmentManagement'
  ),
  SurveyManagement: createLazyComponent(
    () => import('@/pages/main/SurveyManagement/SurveyManagement'),
    'SurveyManagement'
  ),
  CaseManagement: createLazyComponent(
    () => import('@/pages/main/CaseManagement/CaseManagement'),
    'CaseManagement'
  ),
  CaseDetails: createLazyComponent(
    () => import('@/pages/main/CaseManagement/Details'),
    'CaseDetails'
  ),
  ProgramManagement: createLazyComponent(
    () => import('@/pages/main/ProgramManagement/ProgramManagement'),
    'ProgramManagement'
  ),
  ProgramDetails: createLazyComponent(
    () => import('@/pages/main/ProgramManagement/Details'),
    'ProgramDetails'
  ),
  SlotManagement: createLazyComponent(
    () => import('@/pages/main/SlotManagement/SlotManagement'),
    'SlotManagement'
  ),
  SystemConfigManagement: createLazyComponent(
    () => import('@/pages/main/SystemConfigManagement'),
    'SystemConfigManagement'
  ),
  ChatManagement: createLazyComponent(
    () => import('@/pages/main/ChatManagement'),
    'ChatManagement'
  ),
  AppointmentDetails: createLazyComponent(
    () => import('@/pages/main/AppointmentManagement/AppointmentDetails'),
    'AppointmentDetails'
  ),
  ClassManagement: createLazyComponent(
    () => import('@/pages/main/ClassManagement/ClassManagement'),
    'ClassManagement'
  ),
  CreateClass: createLazyComponent(
    () => import('@/pages/main/ClassManagement/CreateClass'),
    'CreateClass'
  ),
  CategoryManagement: createLazyComponent(
    () => import('@/pages/main/CategoryManagement/CategoryManagement'),
    'CategoryManagement'
  ),
  AccessFail: createLazyComponent(
    () => import('../pages/AccessFail'),
    'AccessFail'
  ),
  NotFound: createLazyComponent(() => import('../pages/NotFound'), 'NotFound'),
}

// Fallback component khi component chính bị lỗi
const FallbackComponent = ({ componentName }) => (
  <div className="p-6 text-center">
    <h2 className="text-red-600 mb-4">Component Error</h2>
    <p className="mb-4">Failed to load: {componentName}</p>
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Reload Page
    </button>
  </div>
)

// Validation function để kiểm tra component có tồn tại không
const validateComponent = (componentName, component) => {
  if (!component) {
    console.error(`Component ${componentName} is undefined or null`)
    return false
  }
  return true
}

// Safe component getter với fallback
const getSafeComponent = componentName => {
  const component = COMPONENT_MAP[componentName]
  if (validateComponent(componentName, component)) {
    return component
  }
  console.warn(`Using fallback component for: ${componentName}`)
  return () => <FallbackComponent componentName={componentName} />
}

// Custom hook để xử lý routes - tối ưu hóa performance
const useFlattenedRoutes = () => {
  return useMemo(() => {
    const flattened = []

    const processRoute = route => {
      if (route.children) {
        // Xử lý nested children với recursion tối ưu
        route.children.forEach(child => {
          if (child.children) {
            // Xử lý 3 cấp nested
            child.children.forEach(grandChild => {
              if (grandChild.element) {
                flattened.push({
                  ...grandChild,
                  path: grandChild.key.replace(/^\//, ''),
                  element: getSafeComponent(grandChild.element),
                  allowedRoles: grandChild.allowedRoles,
                })
              }
            })
          } else if (child.element) {
            // Xử lý 2 cấp nested
            flattened.push({
              ...child,
              path: child.key.replace(/^\//, ''),
              element: getSafeComponent(child.element),
              allowedRoles: child.allowedRoles,
            })
          }
        })
      } else if (route.element) {
        // Xử lý route đơn lẻ
        flattened.push({
          ...route,
          path: route.key.replace(/^\//, ''),
          element: getSafeComponent(route.element),
          allowedRoles: route.allowedRoles,
        })
      }
    }

    ROUTE_CONFIG.forEach(processRoute)
    return flattened
  }, [])
}

const AppRouter = () => {
  const flattenRoutes = useFlattenedRoutes()

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <GuestRoute>
                <AnonymousLayoutComponent />
              </GuestRoute>
            }
          >
            <Route index element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<COMPONENT_MAP.Login />} />
            <Route
              path="/forgot-password"
              element={<COMPONENT_MAP.ForgotPassword />}
            />
            <Route path="login-success" element={<GoogleCallBack />} />
          </Route>

          {/* Access Fail route - accessible without authentication */}
          <Route path="/access-fail" element={<COMPONENT_MAP.AccessFail />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {flattenRoutes.map(route => {
              return (
                <Route
                  key={route.key}
                  path={route.path}
                  element={
                    <ProtectedRoute allowedRoles={route?.allowedRoles}>
                      <route.element />
                    </ProtectedRoute>
                  }
                />
              )
            })}
          </Route>

          {/* 404 route */}
          <Route path="*" element={<COMPONENT_MAP.NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default AppRouter

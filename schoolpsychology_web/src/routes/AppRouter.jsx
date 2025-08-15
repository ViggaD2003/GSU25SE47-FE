import { Route, Routes, Navigate } from 'react-router-dom'
import {
  Layout,
  AnonymousLayout as AnonymousLayoutComponent,
  GuestRoute,
  ProtectedRoute,
} from '../components'
import React, { lazy, Suspense } from 'react'
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

// Sử dụng React.lazy cho các trang với error handling
const NotFound = createLazyComponent(
  () => import('../pages/NotFound'),
  'NotFound'
)
const Login = createLazyComponent(() => import('../pages/auth/Login'), 'Login')
const Dashboard = createLazyComponent(
  () => import('../pages/main/DashboardHome'),
  'Dashboard'
)
const ForgotPassword = createLazyComponent(
  () => import('../pages/auth/ForgotPassword'),
  'ForgotPassword'
)
const ClientManagement = createLazyComponent(
  () => import('@/pages/main/AccountManagement/ClientManagement'),
  'ClientManagement'
)
const StaffManagement = createLazyComponent(
  () => import('@/pages/main/AccountManagement/StaffManagement'),
  'StaffManagement'
)
const AppointmentManagement = createLazyComponent(
  () => import('@/pages/main/AppointmentManagement/AppointmentManagement'),
  'AppointmentManagement'
)
const SurveyManagement = createLazyComponent(
  () => import('@/pages/main/SurveyManagement/SurveyManagement'),
  'SurveyManagement'
)
const CaseManagement = createLazyComponent(
  () => import('@/pages/main/CaseManagement/CaseManagement'),
  'CaseManagement'
)
const CaseDetails = createLazyComponent(
  () => import('@/pages/main/CaseManagement/Details'),
  'CaseDetails'
)
const ProgramManagement = createLazyComponent(
  () => import('@/pages/main/ProgramManagement/ProgramManagement'),
  'ProgramManagement'
)
const ProgramDetails = createLazyComponent(
  () => import('@/pages/main/ProgramManagement/Details'),
  'ProgramDetails'
)
const SlotManagement = createLazyComponent(
  () => import('@/pages/main/SlotManagement/SlotManagement'),
  'SlotManagement'
)
const SystemConfigManagement = createLazyComponent(
  () => import('@/pages/main/SystemConfigManagement'),
  'SystemConfigManagement'
)
const AppointmentDetails = createLazyComponent(
  () => import('@/pages/main/AppointmentManagement/AppointmentDetails'),
  'AppointmentDetails'
)
const ClassManagement = createLazyComponent(
  () => import('@/pages/main/ClassManagement/ClassManagement'),
  'ClassManagement'
)
const CreateClass = createLazyComponent(
  () => import('@/pages/main/ClassManagement/CreateClass'),
  'CreateClass'
)
const CategoryManagement = createLazyComponent(
  () => import('@/pages/main/CategoryManagement/CategoryManagement'),
  'CategoryManagement'
)
const AccessFail = createLazyComponent(
  () => import('@/pages/AccessFail'),
  'AccessFail'
)

const AppRouter = () => {
  const elementMap = {
    Dashboard,
    ClientManagement,
    StaffManagement,
    AppointmentManagement,
    SurveyManagement,
    CaseManagement,
    ProgramManagement,
    ProgramDetails,
    SlotManagement,
    SystemConfigManagement,
    AppointmentDetails,
    ClassManagement,
    CreateClass,
    CategoryManagement,
    CaseDetails,
  }

  return (
    <ErrorBoundary>
      {/* <Suspense fallback={<LoadingFallback />}> */}
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
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="login-success" element={<GoogleCallBack />} />
          {/* Test route for debugging GoogleCallback */}
          <Route path="test-google-callback" element={<GoogleCallBack />} />
        </Route>

        {/* Access Fail route - accessible without authentication */}
        <Route path="/access-fail" element={<AccessFail />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {ROUTE_CONFIG.map(route => {
            if (route.children) {
              return route.children.map(child => (
                <Route
                  key={child.key}
                  path={child.key.replace(/^\//, '')}
                  element={
                    <ProtectedRoute allowedRoles={route.allowedRoles}>
                      {/* <Suspense fallback={<LoadingFallback />}> */}
                      {elementMap[child.element]
                        ? React.createElement(elementMap[child.element])
                        : null}
                      {/* </Suspense> */}
                    </ProtectedRoute>
                  }
                />
              ))
            }

            // Handle routes with or without parameters, including hidden routes
            const path = route.key.replace(/^\//, '')
            const Component = elementMap[route.element]

            return (
              <Route
                key={route.key}
                path={path}
                element={
                  <ProtectedRoute allowedRoles={route.allowedRoles}>
                    {/* <Suspense fallback={<LoadingFallback />}> */}
                    {Component ? React.createElement(Component) : null}
                    {/* </Suspense> */}
                  </ProtectedRoute>
                }
              />
            )
          })}
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* </Suspense> */}
    </ErrorBoundary>
  )
}

export default AppRouter

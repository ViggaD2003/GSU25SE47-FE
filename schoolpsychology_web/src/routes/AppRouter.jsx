import { Route, Routes, Navigate } from 'react-router-dom'
import {
  Layout,
  AnonymousLayout as AnonymousLayoutComponent,
  GuestRoute,
  ProtectedRoute,
} from '../components'
import React, { lazy } from 'react'
import { ROUTE_CONFIG } from '@/constants/routeConfig'

// Sử dụng React.lazy cho các trang
const NotFound = lazy(() => import('../pages/NotFound'))
const Login = lazy(() => import('../pages/auth/Login'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'))
const ClientManagement = lazy(
  () => import('@/pages/manager/AccountManagement/ClientManagement')
)
const StaffManagement = lazy(
  () => import('@/pages/manager/AccountManagement/StaffManagement')
)
const AppointmentManagement = lazy(
  () => import('@/pages/manager/AppointmentManagement')
)
const SurveyManagement = lazy(
  () => import('@/pages/manager/SurveyManagement/SurveyManagement')
)
const CaseManagement = lazy(() => import('@/pages/manager/CaseManagement'))
const ProgramManagement = lazy(
  () => import('@/pages/manager/ProgramManagement')
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
  }

  return (
    // <React.Suspense
    //   fallback={
    //     <div className="min-h-screen flex items-center justify-center">
    //       <Spin size="large" />
    //     </div>
    //   }
    // >
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
      </Route>

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
                    {elementMap[child.element]
                      ? React.createElement(elementMap[child.element])
                      : null}
                  </ProtectedRoute>
                }
              />
            ))
          }
          return (
            <Route
              key={route.key}
              path={route.key.replace(/^\//, '')}
              element={
                <ProtectedRoute allowedRoles={route.allowedRoles}>
                  {elementMap[route.element]
                    ? React.createElement(elementMap[route.element])
                    : null}
                </ProtectedRoute>
              }
            />
          )
        })}
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    // </React.Suspense>
  )
}

export default AppRouter

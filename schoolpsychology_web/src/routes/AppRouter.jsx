import { Route, Routes, Navigate } from 'react-router-dom'
import {
  Layout,
  AnonymousLayout as AnonymousLayoutComponent,
  GuestRoute,
  ProtectedRoute,
} from '../components'
import NotFound from '../pages/NotFound'
import Login from '../pages/auth/Login'
import Dashboard from '../pages/Dashboard'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ClientManagement from '@/pages/manager/AccountManagement/ClientManagement'
import StaffManagement from '@/pages/manager/AccountManagement/StaffManagement'

const AppRouter = () => {
  return (
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
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="client-management"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <ClientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff-management"
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <StaffManagement />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter

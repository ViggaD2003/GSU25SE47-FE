import { Route, Routes, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import NotFound from '../pages/NotFound'
import Login from '../pages/auth/Login'
import Dashboard from '../pages/Dashboard'
import GuestRoute from '../components/GuestRoute'
import ProtectedRoute from '../components/ProtectedRoute'
import AnonymousLayoutComponent from '../components/AnonymousLayout'
import ForgotPassword from '../pages/auth/ForgotPassword'

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

      {/* Protected routes with Layout as parent */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Nested routes - these will render inside Layout's <Outlet /> */}
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter

import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { decodeJWT } from '../../utils'
import { useAuth } from '@/contexts/AuthContext'
import notificationService from '../../services/notificationService'
import { loginSuccess } from '@/store/slices/authSlice'
import { useDispatch } from 'react-redux'

const GoogleCallBack = () => {
  const navigate = useNavigate()
  const [hasProcessed, setHasProcessed] = useState(false)
  const [notificationShown, setNotificationShown] = useState(false)
  const dispatch = useDispatch()
  const { logout } = useAuth()

  // Function to check if user role is authorized
  const checkUserRole = useCallback(role => {
    const authorizedRoles = ['manager', 'teacher', 'counselor']
    return authorizedRoles.includes(role?.toLowerCase())
  }, [])

  // Helper function to show notification only once
  const showNotificationOnce = useCallback(
    (type, config) => {
      if (!notificationShown) {
        setNotificationShown(true)
        notificationService[type](config)
      }
    },
    [notificationShown]
  )

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed) {
      return
    }

    const handleGoogleCallback = async () => {
      try {
        setHasProcessed(true)

        // Lấy token từ URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
          showNotificationOnce('error', {
            message: 'Authentication Failed',
            description:
              'No authentication token was provided. Please try logging in again.',
            duration: 4,
          })

          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Decode token để lấy thông tin user
        const decodedToken = decodeJWT(token)
        if (!decodedToken) {
          showNotificationOnce('error', {
            message: 'Authentication Failed',
            description:
              'The authentication token is invalid. Please try logging in again.',
            duration: 4,
          })

          setTimeout(() => navigate('/login'), 3000)
          return
        }

        // Tạo object user từ decoded token
        const user = {
          ...decodedToken,
          id: decodedToken?.userId || decodedToken['user-id'] || 1,
          fullName:
            decodedToken?.name || decodedToken?.fullName || 'Google User',
          email: decodedToken?.email || decodedToken?.sub || '',
          role: decodedToken?.role
            ? String(decodedToken.role).toLowerCase()
            : null,
        }

        // Kiểm tra quyền truy cập
        if (!checkUserRole(user.role)) {
          showNotificationOnce('error', {
            message: 'Access Denied',
            description: `Your role (${user.role || 'undefined'}) is not authorized to access this application. Only managers, teachers, and counselors are allowed.`,
            duration: 5,
          })

          logout()
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        // Tạo auth data object
        const authData = { user, token }

        // Lưu vào localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('auth', JSON.stringify(authData))

        // Sử dụng loginSuccess từ Redux store để cập nhật state
        dispatch(loginSuccess(authData))

        // Hiển thị thông báo thành công
        showNotificationOnce('success', {
          message: 'Login Successful',
          description: `Welcome back, ${user.fullName}! You have successfully logged in via Google.`,
          duration: 3,
        })

        // Redirect đến dashboard
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1500)
      } catch (error) {
        console.error('Error processing Google callback:', error)
        showNotificationOnce('error', {
          message: 'Authentication Error',
          description:
            'An unexpected error occurred while processing your login. Please try again.',
          duration: 4,
        })

        setTimeout(() => navigate('/login'), 3000)
      }
    }

    handleGoogleCallback()
  }, [
    hasProcessed,
    dispatch,
    navigate,
    logout,
    checkUserRole,
    showNotificationOnce,
  ])

  // Success state - show success message before redirect
  // if (isSuccess) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
  //       <div className="max-w-md w-full space-y-8 p-8">
  //         <div className="text-center">
  //           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
  //             <svg
  //               className="h-8 w-8 text-green-600"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2}
  //                 d="M5 13l4 4L19 7"
  //               />
  //             </svg>
  //           </div>
  //           <h2 className="text-3xl font-bold text-gray-900 mb-4">
  //             Welcome Back!
  //           </h2>
  //           <p className="text-gray-600 mb-6">
  //             Google authentication successful. Redirecting you to the
  //             dashboard...
  //           </p>

  //           <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
  //             <div className="flex items-center justify-center space-x-2">
  //               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
  //               <span className="text-green-700 font-medium">
  //                 Redirecting...
  //               </span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
  //       <div className="max-w-md w-full space-y-8 p-8">
  //         <div className="text-center">
  //           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
  //             <svg
  //               className="h-8 w-8 text-red-600"
  //               fill="none"
  //               viewBox="0 0 24 24"
  //               stroke="currentColor"
  //             >
  //               <path
  //                 strokeLinecap="round"
  //                 strokeLinejoin="round"
  //                 strokeWidth={2}
  //                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
  //               />
  //             </svg>
  //           </div>
  //           <h2 className="text-3xl font-bold text-gray-900 mb-4">
  //             Authentication Failed
  //           </h2>
  //           <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200 mb-6">
  //             <p className="text-red-800 font-medium">{error}</p>
  //           </div>
  //           <div className="space-y-3">
  //             <button
  //               onClick={() => navigate('/login')}
  //               className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
  //             >
  //               Return to Login
  //             </button>
  //             <button
  //               onClick={() => window.location.reload()}
  //               className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
  //             >
  //               Try Again
  //             </button>
  //           </div>
  //           <p className="text-gray-500 text-sm mt-6">
  //             Auto-redirecting to login page in a few seconds...
  //           </p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (isProcessing) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
  //       <div className="max-w-md w-full space-y-8 p-8">
  //         <div className="text-center">
  //           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
  //             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //           </div>
  //           <h2 className="text-3xl font-bold text-gray-900 mb-4">
  //             Processing Google Login
  //           </h2>
  //           <p className="text-gray-600 mb-6">
  //             Please wait while we verify your authentication...
  //           </p>

  //           <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
  //             <div className="flex items-center justify-center space-x-2">
  //               <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
  //               <div
  //                 className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"
  //                 style={{ animationDelay: '0.2s' }}
  //               ></div>
  //               <div
  //                 className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"
  //                 style={{ animationDelay: '0.4s' }}
  //               ></div>
  //             </div>
  //             <p className="text-sm text-gray-500 mt-2">
  //               Validating credentials...
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return null
}

export default GoogleCallBack

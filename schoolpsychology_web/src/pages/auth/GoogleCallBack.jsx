import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const GoogleCallBack = () => {
  const { handleGoogleCallback } = useAuth()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('Google callback already processed')
      return
    }

    const processCallback = async () => {
      try {
        setStatus('processing')
        console.log('Starting Google callback processing...')

        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')
        const error = urlParams.get('error')

        console.log('URL parameters:', {
          token: token ? 'Present' : 'Missing',
          error,
        })

        // Handle error case
        if (error) {
          console.error('Google OAuth error:', error)
          hasProcessed.current = true
          setStatus('error')
          navigate('/login?error=oauth_failed', { replace: true })
          return
        }

        if (token) {
          hasProcessed.current = true
          setStatus('processing')

          // Check if token contains error information
          if (
            token.includes('error') ||
            token.includes('duplicate') ||
            token.includes('Query did not return a unique result')
          ) {
            console.error('Backend error detected in token:', token)
            setStatus('error')

            // Log the specific error type for debugging
            if (token.includes('Query did not return a unique result')) {
              console.error('Duplicate account error detected')
            } else if (token.includes('duplicate')) {
              console.error('Duplicate email error detected')
            }

            // Show error for longer time since this is a critical issue
            setTimeout(() => {
              navigate('/login?error=backend_error', { replace: true })
            }, 8000)
            return
          }

          const result = await handleGoogleCallback(token)
          console.log('Google callback result:', result)

          if (result.success) {
            setStatus('success')
            console.log('Google callback completed successfully')
            // Navigation will be handled by AuthContext
          } else {
            setStatus('error')
            console.error('Google callback failed:', result.error)

            // Handle specific error types
            if (result.error && result.error.includes('Duplicate')) {
              // Show error for longer time for duplicate account issues
              setTimeout(() => {
                navigate('/login?error=duplicate_account', { replace: true })
              }, 8000)
            } else if (result.error && result.error.includes('Server Error')) {
              // Handle server errors (500, 502, 503, 504)
              setTimeout(() => {
                navigate('/login?error=server_error', { replace: true })
              }, 5000)
            } else if (result.error && result.error.includes('Network Error')) {
              // Handle network errors
              setTimeout(() => {
                navigate('/login?error=network_error', { replace: true })
              }, 5000)
            } else {
              setTimeout(() => {
                navigate('/login?error=callback_failed', { replace: true })
              }, 5000)
            }
          }
        } else {
          console.error('No token found in URL parameters')
          hasProcessed.current = true
          setStatus('error')
          navigate('/login?error=no_token', { replace: true })
        }
      } catch (error) {
        console.error('Error in Google callback processing:', error)
        hasProcessed.current = true
        setStatus('error')

        // Handle specific error types
        if (
          error.message &&
          error.message.includes('Query did not return a unique result')
        ) {
          // Show error for longer time for duplicate account issues
          setTimeout(() => {
            navigate('/login?error=duplicate_account', { replace: true })
          }, 8000)
        } else if (error.message && error.message.includes('Server Error')) {
          // Handle server errors
          setTimeout(() => {
            navigate('/login?error=server_error', { replace: true })
          }, 5000)
        } else if (error.message && error.message.includes('Network Error')) {
          // Handle network errors
          setTimeout(() => {
            navigate('/login?error=network_error', { replace: true })
          }, 5000)
        } else {
          setTimeout(() => {
            navigate('/login?error=callback_failed', { replace: true })
          }, 5000)
        }
      }
    }
    processCallback()
  }, [handleGoogleCallback, navigate])

  // Show loading state while processing
  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processing Google Login
            </h2>
            <p className="text-gray-600 mb-6">
              Please wait while we verify your authentication...
            </p>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"></div>
                <div
                  className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="animate-pulse h-2 w-2 bg-blue-600 rounded-full"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Validating credentials...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state if something went wrong
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Authentication Failed
            </h2>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200 mb-6">
              <p className="text-red-800 font-medium">
                Something went wrong during authentication
              </p>
              <p className="text-red-600 text-sm mt-2">This could be due to:</p>
              <ul className="text-red-600 text-sm mt-2 list-disc list-inside space-y-1">
                <li>Server errors (500, 502, 503, 504) - Backend issues</li>
                <li>Network connectivity problems</li>
                <li>Duplicate user accounts with the same email</li>
                <li>Invalid or expired authentication token</li>
                <li>Backend service temporarily unavailable</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  // Clear any stored auth data and redirect
                  localStorage.clear()
                  navigate('/login', { replace: true })
                }}
                className="w-full flex justify-center py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Clear Data & Retry
              </button>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Need Help?</strong> If the problem persists, please
                contact support with the following information:
              </p>
              <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside space-y-1">
                <li>Error occurred at: {new Date().toLocaleString()}</li>
                <li>
                  Browser: {navigator.userAgent.split(' ').slice(-2).join(' ')}
                </li>
                <li>URL: {window.location.href}</li>
              </ul>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              Auto-redirecting to login page in a few seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Return null for successful authentication (AuthContext handles navigation)
  return null
}

export default GoogleCallBack

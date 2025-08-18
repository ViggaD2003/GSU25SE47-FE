import React, { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const GoogleCallBack = () => {
  const { handleGoogleCallback } = useAuth()
  const navigate = useNavigate()
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('Google callback already processed')
      return
    }

    const processCallback = async () => {
      try {
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
          navigate('/login', { replace: true })
          return
        }

        if (token) {
          hasProcessed.current = true

          // Check if token contains error information
          if (
            token.includes('error') ||
            token.includes('duplicate') ||
            token.includes('Query did not return a unique result')
          ) {
            console.error('Backend error detected in token:', token)

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
            console.log('Google callback completed successfully')
            // Navigation will be handled by AuthContext
          } else {
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
          navigate('/login?error=no_token', { replace: true })
        }
      } catch (error) {
        console.error('Error in Google callback processing:', error)
        hasProcessed.current = true

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

  // Return null for successful authentication (AuthContext handles navigation)
  return null
}

export default GoogleCallBack

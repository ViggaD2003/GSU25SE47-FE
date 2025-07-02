import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { decodeJWT } from '../../utils'
import { loginSuccess } from '../../store/slices/authSlice'

const GoogleCallBack = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Lấy token từ URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
          setError('Không tìm thấy token trong URL')
          setIsProcessing(false)
          return
        }

        // Decode token để lấy thông tin user
        const decodedToken = decodeJWT(token)
        if (!decodedToken) {
          setError('Token không hợp lệ')
          setIsProcessing(false)
          return
        }

        // Tạo object user từ decoded token
        const user = {
          id: decodedToken?.sub || decodedToken?.userId || 1,
          fullName:
            decodedToken?.name || decodedToken?.fullname || 'Google User',
          email: decodedToken?.email || '',
          role: decodedToken?.role
            ? String(decodedToken.role).toLowerCase()
            : null,
        }

        // Tạo auth data object
        const authData = { user, token }

        // Lưu vào localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('auth', JSON.stringify(authData))

        // Dispatch action để cập nhật Redux store
        dispatch(loginSuccess(authData))

        // Redirect đến dashboard
        navigate('/', { replace: true })
      } catch (error) {
        console.error('Error processing Google callback:', error)
        setError('Có lỗi xảy ra khi xử lý đăng nhập Google')
        setIsProcessing(false)
      }
    }

    handleGoogleCallback()
  }, [navigate, dispatch])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đăng nhập thất bại
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Quay lại trang đăng nhập
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đang xử lý đăng nhập...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default GoogleCallBack

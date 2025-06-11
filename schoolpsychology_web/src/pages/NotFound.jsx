import React from 'react'
import { Result, Button, Space, Typography } from 'antd'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const { Text } = Typography

const NotFound = () => {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const handleGoHome = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-8">
        <Result
          status="404"
          title={
            <div className="space-y-2">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                404
              </div>
              <div className="text-2xl font-semibold text-gray-800">
                Page Not Found
              </div>
            </div>
          }
          subTitle={
            <div className="space-y-4">
              <Text className="text-lg text-gray-600">
                Oops! The page you're looking for doesn't exist or you don't
                have permission to access it.
              </Text>
            </div>
          }
          extra={
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={handleGoHome}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 hover:from-blue-600 hover:to-purple-700"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
              </Button>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
              >
                Go Back
              </Button>
            </Space>
          }
        />

        {/* Decorative elements */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-150"></div>
          </div>
          <Text className="block mt-4 text-sm text-gray-500">
            Lost? Don't worry, it happens to the best of us.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default NotFound

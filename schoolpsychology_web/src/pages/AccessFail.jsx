import React, { useState } from 'react'
import { Result, Button, Space } from 'antd'
import {
  HomeOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const AccessFail = ({ userRole: propUserRole }) => {
  const navigate = useNavigate()
  const { logout, userRole, refreshToken, checkUserRole } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const currentUserRole = propUserRole || userRole

  const handleRefreshAndRetry = async () => {
    setIsRefreshing(true)
    const result = await refreshToken()

    if (result?.success) {
      // Go back to the previous page after successful refresh
      setTimeout(() => {
        window.history.back()
      }, 1000)
    } else {
      handleLogout()
    }
    setIsRefreshing(false)
  }

  const handleLogout = () => {
    try {
      logout()
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleGoHome = () => {
    if (checkUserRole(currentUserRole)) {
      navigate('/dashboard')
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-8">
        <Result
          status="403"
          title="Access Denied"
          subTitle={
            currentUserRole
              ? `Your role (${currentUserRole}) does not have permission to access this resource.`
              : 'You are not authorized to access this resource.'
          }
          extra={
            <Space direction="vertical" size="middle">
              <Space wrap>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshAndRetry}
                  loading={isRefreshing}
                >
                  Refresh Session & Retry
                </Button>
                <Button icon={<HomeOutlined />} onClick={handleGoHome}>
                  Go to Dashboard
                </Button>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </Space>
              <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout & Login Again
              </Button>
            </Space>
          }
        />
      </div>
    </div>
  )
}

export default AccessFail

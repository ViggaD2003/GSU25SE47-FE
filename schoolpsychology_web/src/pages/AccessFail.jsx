import React from 'react'
import { Result, Button, Space, Typography } from 'antd'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const AccessFail = ({ isCurrentPath, userRole }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-8">
        {isCurrentPath ? (
          <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={
              <Button type="primary" onClick={() => window.history.back()}>
                Go Back
              </Button>
            }
          />
        ) : (
          <Result
            status="403"
            title="Access Denied"
            subTitle={`Your role (${userRole}) does not have permission to access this page.`}
          />
        )}
      </div>
    </div>
  )
}

export default AccessFail

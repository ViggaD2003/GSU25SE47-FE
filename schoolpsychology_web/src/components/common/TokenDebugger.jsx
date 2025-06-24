import React, { useState } from 'react'
import { Card, Button, Descriptions, Tag, Space } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useSelector } from 'react-redux'
import { selectAuth } from '../../store/slices/authSlice'
import { getTokenInfo, decodeJWT } from '../../utils'

const TokenDebugger = () => {
  const { token } = useSelector(selectAuth)
  const [showToken, setShowToken] = useState(false)
  const [showDecoded, setShowDecoded] = useState(false)

  if (!token) {
    return (
      <Card title="JWT Token Debugger" size="small">
        <p>No token available</p>
      </Card>
    )
  }

  const tokenInfo = getTokenInfo(token)
  const decodedToken = decodeJWT(token)

  return (
    <Card title="JWT Token Debugger" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Token Display */}
        <div>
          <Space>
            <strong>Token:</strong>
            <Button
              type="text"
              size="small"
              icon={showToken ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => setShowToken(!showToken)}
            >
              {showToken ? 'Hide' : 'Show'} Token
            </Button>
          </Space>
          {showToken && (
            <div
              style={{
                wordBreak: 'break-all',
                fontSize: '10px',
                backgroundColor: '#f5f5f5',
                padding: '8px',
                marginTop: '4px',
                borderRadius: '4px',
              }}
            >
              {token}
            </div>
          )}
        </div>

        {/* Token Info */}
        {tokenInfo && (
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Token Type">
              <Tag color="blue">{tokenInfo.tokenType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Algorithm">
              <Tag color="green">{tokenInfo.algorithm}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={tokenInfo.isExpired ? 'red' : 'green'}>
                {tokenInfo.isExpired ? 'Expired' : 'Valid'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Issued At">
              {tokenInfo.issuedAt ? tokenInfo.issuedAt.toLocaleString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Expires At">
              {tokenInfo.expirationTime
                ? tokenInfo.expirationTime.toLocaleString()
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Expires In">
              {tokenInfo.expiresIn ? `${tokenInfo.expiresIn} seconds` : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}

        {/* Decoded Token */}
        {decodedToken && (
          <div>
            <Space>
              <strong>Decoded Token:</strong>
              <Button
                type="text"
                size="small"
                icon={showDecoded ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setShowDecoded(!showDecoded)}
              >
                {showDecoded ? 'Hide' : 'Show'} Decoded
              </Button>
            </Space>
            {showDecoded && (
              <pre
                style={{
                  fontSize: '10px',
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  marginTop: '4px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '200px',
                }}
              >
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            )}
          </div>
        )}
      </Space>
    </Card>
  )
}

export default TokenDebugger

import React, { useState } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

const Login = () => {
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onFinish = async values => {
    setLoading(true)
    setError('')

    try {
      const result = await login(values.email, values.password)
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error || t('auth.login.error'))
      }
    } catch (err) {
      setError(t('auth.login.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="w-full md:w-5/6 flex flex-col gap-10">
        {/* Login Card */}

        <div>
          <h2 className="text-xl font-semibold">{t('auth.login.title')}</h2>
        </div>
        {error && (
          <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError('')}
            className="mb-4"
          />
        )}

        <Form name="login" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            label={t('auth.login.email')}
            rules={[
              {
                required: true,
                message: t('auth.login.required'),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              type="email"
              placeholder={t('auth.login.email')}
            />
          </Form.Item>

          <div>
            <Form.Item
              name="password"
              label={t('auth.login.password')}
              rules={[
                {
                  required: true,
                  message: t('auth.login.required'),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth.login.password')}
              />
            </Form.Item>

            <div className="text-end mb-8">
              <Link to="/forgot-password">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  {t('auth.login.forgotPassword')}
                </p>
              </Link>
            </div>
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full"
            >
              {t('auth.login.submit')}
            </Button>
          </Form.Item>
        </Form>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">
            Demo Credentials:
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Email:{' '}
            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
              manager@school.edu
            </code>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Password:{' '}
            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
              password
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

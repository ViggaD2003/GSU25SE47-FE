import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const { login } = useAuth()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const onFinish = async values => {
    setLoading(true)
    try {
      await login(values.email, values.password)
    } catch (error) {
      console.error('❌ Login error:', error)
      // Error notification is already shown by the login function
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
  }

  return (
    <>
      <div className="flex flex-col">
        <div className="w-full md:w-5/6 flex flex-col gap-10">
          {/* Login Card */}

          <div>
            <h2 className="text-xl font-semibold">{t('auth.login.title')}</h2>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            onSubmit={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label={t('auth.login.email')}
              rules={[
                {
                  required: true,
                  message: t('auth.login.required'),
                },
                {
                  type: 'email',
                  message: t('auth.login.invalidEmail'),
                },
                {
                  whitespace: true,
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
                  {
                    whitespace: true,
                    message: t('auth.login.required'),
                  },
                  {
                    min: 1,
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
        </div>
      </div>
    </>
  )
}

export default Login

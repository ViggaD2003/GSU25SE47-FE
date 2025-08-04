import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Layout,
  Avatar,
  Dropdown,
  Image,
  Typography,
  Flex,
  Button,
  Badge,
  message,
} from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { useNavigate, Outlet } from 'react-router-dom'
import ThemeSwitcher from '../../components/common/ThemeSwitcher'
import LanguageSwitcher from '../../components/common/LanguageSwitcher'
import Navigation from '../../components/layout/Navigation'
import { useAuth } from '@/contexts/AuthContext'
import NotificationBell from '@/components/common/NotificationBell'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { getNotifications } from '@/services/notiApi'

const { Header, Content, Sider } = Layout

// Memoized components for better performance
const MemoizedNavigation = React.memo(Navigation)
const MemoizedThemeSwitcher = React.memo(ThemeSwitcher)
const MemoizedLanguageSwitcher = React.memo(LanguageSwitcher)

const LayoutComponent = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const [collapsed, setCollapsed] = useState(false)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const { notifications, setNotifications } = useWebSocket()

  const fetchNotifications = useCallback(async () => {
    const notifications = await getNotifications(user.id || user.userId)
    setNotifications(notifications)
  }, [])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  useEffect(() => {
    // Chỉ hiển thị thông báo khi có thông báo mới và không phải lần đầu load
    if (
      notifications.length > 0 &&
      lastNotificationCount > 0 &&
      notifications.length > lastNotificationCount
    ) {
      const newNotificationCount = notifications.length - lastNotificationCount
      messageApi.success(
        t('notification.newNotification', { count: newNotificationCount })
      )
    }
    // Cập nhật số lượng thông báo hiện tại
    setLastNotificationCount(notifications.length)
  }, [notifications, lastNotificationCount, t, messageApi])

  const handleLogout = useCallback(() => {
    logout()
    navigate('/login')
  }, [logout, navigate])

  const userMenuItems = useMemo(
    () => [
      {
        key: 'logout',
        icon: <LogoutOutlined style={{ color: 'red' }} />,
        label: <span className="text-red-500 ">{t('navigation.logout')}</span>,
        onClick: handleLogout,
        className: 'logout-menu-item',
      },
    ],
    [t, handleLogout]
  )

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  // Memoize style objects to prevent unnecessary re-renders
  const siderStyle = useMemo(
    () => ({
      borderRight: 0,
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 100,
    }),
    []
  )

  const layoutStyle = useMemo(
    () => ({
      marginLeft: collapsed ? 80 : 256,
      transition: 'margin-left 0.2s',
    }),
    [collapsed]
  )

  const headerStyle = useMemo(
    () => ({
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      padding: '0 24px',
      height: '64px',
      lineHeight: '64px',
    }),
    [isDarkMode]
  )

  const contentStyle = useMemo(
    () => ({
      minHeight: 'calc(100vh - 64px)',
      padding: '24px',
    }),
    []
  )

  // Memoize class names to prevent string concatenation on every render
  const siderClassName = useMemo(
    () =>
      `${isDarkMode ? 'bg-gray-900' : 'bg-white'} border-r transition-all duration-200 shadow-lg`,
    [isDarkMode]
  )

  const logoSectionClassName = useMemo(
    () =>
      `flex items-center justify-center py-4 px-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,
    [isDarkMode]
  )

  const headerClassName = useMemo(
    () =>
      `${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-50`,
    [isDarkMode]
  )

  const contentClassName = useMemo(
    () => `${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`,
    [isDarkMode]
  )

  const contentInnerClassName = useMemo(
    () =>
      `${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 min-h-full`,
    [isDarkMode]
  )

  return (
    <Layout className="min-h-screen">
      {contextHolder}
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={256}
        collapsedWidth={80}
        className={siderClassName}
        style={siderStyle}
      >
        {/* Logo section */}
        <div className={logoSectionClassName}>
          {!collapsed ? (
            <Flex align="center" justify="center" gap={12}>
              <Image
                src="/logo.svg"
                alt="logo"
                width={32}
                height={32}
                preview={false}
              />
              <Typography.Title
                level={5}
                className={`m-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}
              >
                {t('app.title')}
              </Typography.Title>
            </Flex>
          ) : (
            <Image
              src="/logo.svg"
              alt="logo"
              width={32}
              height={32}
              preview={false}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4">
          <MemoizedNavigation collapsed={collapsed} />
        </div>

        {/* User info in sidebar (when not collapsed) */}
        {!collapsed && (
          <div
            className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <Avatar size="small" icon={<UserOutlined />} />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.fullName || user?.username}
                </p>
                <p
                  className={`text-xs truncate ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </Sider>

      {/* Main Content */}
      <Layout style={layoutStyle}>
        {/* Header */}
        <Header className={headerClassName} style={headerStyle}>
          <div className="flex justify-between items-center h-full">
            {/* Left side - Collapse button */}
            <div className="flex items-center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleSidebar}
                className={`${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              />
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Test notification button */}
              {/* <Button
                onClick={() => {
                  sendMessage()
                }}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Test notification
              </Button> */}

              {/* Notifications */}
              <NotificationBell />

              {/* Theme switcher */}
              <MemoizedThemeSwitcher />

              {/* Language switcher */}
              <MemoizedLanguageSwitcher />

              {/* User menu */}
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={['click']}
                className="h-12 px-3"
              >
                <div
                  className={`flex items-center gap-3 cursor-pointer rounded-lg transition-colors ${
                    isDarkMode
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <Avatar icon={<UserOutlined />} size="small" />
                  <span className="hidden md:inline-block">
                    {user?.fullName || user?.username}
                  </span>
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content className={contentClassName} style={contentStyle}>
          <div className={contentInnerClassName}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default React.memo(LayoutComponent)

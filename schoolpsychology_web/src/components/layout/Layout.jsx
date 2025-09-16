import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  lazy,
  useRef,
  useTransition,
} from 'react'
import {
  Layout,
  Avatar,
  Dropdown,
  Image,
  Typography,
  Flex,
  Button,
  message,
} from 'antd'
import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { getNotifications } from '@/services/notiApi'

// Lazy load non-critical components for better performance with error handling
const ThemeSwitcher = lazy(() =>
  import('../../components/common/ThemeSwitcher').catch(error => {
    console.error('Failed to load ThemeSwitcher:', error)
    return { default: () => <div>Failed to load</div> }
  })
)

const LanguageSwitcher = lazy(() =>
  import('../../components/common/LanguageSwitcher').catch(error => {
    console.error('Failed to load LanguageSwitcher:', error)
    return { default: () => <div>Failed to load</div> }
  })
)

// Import Navigation directly for better sider performance
import Navigation from '../../components/layout/Navigation'

const NotificationBell = lazy(() =>
  import('@/components/common/NotificationBell').catch(error => {
    console.error('Failed to load NotificationBell:', error)
    return { default: () => <div>Failed to load</div> }
  })
)

const { Header, Content, Sider } = Layout

// Cache for notifications to avoid unnecessary API calls
const notificationCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Promise-based debouncing utility
const createDebouncer = delay => {
  let timeoutId
  let resolvePromise
  let rejectPromise

  return fn => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId)

      if (resolvePromise) {
        resolvePromise = resolve
        rejectPromise = reject
      } else {
        resolvePromise = resolve
        rejectPromise = reject
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn()
          resolvePromise(result)
          resolvePromise = null
          rejectPromise = null
        } catch (error) {
          rejectPromise(error)
          resolvePromise = null
          rejectPromise = null
        }
      }, delay)
    })
  }
}

const LayoutComponent = () => {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()
  const [collapsed, setCollapsed] = useState(false)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const { notifications, setNotifications, sendMessage } = useWebSocket()

  // Refs for managing async operations
  const notificationFetchRef = useRef(null)
  const debouncerRef = useRef(createDebouncer(300))

  // Promise-based notification fetching with caching
  const fetchNotifications = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id && !user?.userId) return Promise.resolve([])

      const userId = user.id || user.userId
      const cacheKey = `notifications_${userId}`
      const now = Date.now()

      // Check cache first
      if (!forceRefresh && notificationCache.has(cacheKey)) {
        const { data, timestamp } = notificationCache.get(cacheKey)
        if (now - timestamp < CACHE_DURATION) {
          setNotifications(data)
          return Promise.resolve(data)
        }
      }

      // Cancel previous request if still pending
      if (notificationFetchRef.current) {
        notificationFetchRef.current.cancel?.()
      }

      // Create cancellable promise
      const fetchPromise = new Promise((resolve, reject) => {
        const executeAsync = async () => {
          try {
            const response = await getNotifications(userId)

            // Cache the result
            notificationCache.set(cacheKey, {
              data: response,
              timestamp: now,
            })

            setNotifications(response)
            resolve(response)
          } catch (error) {
            reject(error)
          }
        }

        executeAsync()
      })

      notificationFetchRef.current = fetchPromise
      return fetchPromise
    },
    [user, setNotifications]
  )

  // Debounced notification fetching
  const debouncedFetchNotifications = useCallback(
    (forceRefresh = false) => {
      return debouncerRef.current(() => fetchNotifications(forceRefresh))
    },
    [fetchNotifications]
  )

  useEffect(() => {
    if (user) {
      debouncedFetchNotifications().catch(error => {
        console.error('Failed to fetch notifications:', error)
        messageApi.error(t('notification.fetchError'))
      })
    }

    // Cleanup on unmount
    return () => {
      if (notificationFetchRef.current?.cancel) {
        notificationFetchRef.current.cancel()
      }
    }
  }, [user, debouncedFetchNotifications, messageApi, t])

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
    return new Promise((resolve, reject) => {
      const executeAsync = async () => {
        try {
          // Cancel any pending operations
          if (notificationFetchRef.current?.cancel) {
            notificationFetchRef.current.cancel()
          }

          // Clear cache
          notificationCache.clear()

          await logout()
          resolve()
        } catch (error) {
          console.error('Logout error:', error)
          reject(error)
        }
      }

      executeAsync()
    })
  }, [logout])

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

  // Optimized toggle with useTransition for smooth animations
  const toggleSidebar = useCallback(() => {
    startTransition(() => {
      setCollapsed(prev => !prev)
    })
  }, [])

  // Optimized sider styles with CSS transforms for better performance
  const siderStyle = useMemo(
    () => ({
      zIndex: 100,
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '256px',
      transform: `translateX(${collapsed ? '-256px' : '0'})`,
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      willChange: 'transform',
      borderRight: 0,
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      boxShadow: collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.1)',
    }),
    [collapsed, isDarkMode]
  )

  const layoutStyle = useMemo(
    () => ({
      width: collapsed ? '100%' : 'calc(100% - 256px)',
      marginLeft: collapsed ? '0' : '256px',
      transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }),
    [collapsed]
  )

  const headerStyle = useMemo(
    () => ({
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      padding: '0 24px',
      height: '64px',
      lineHeight: '64px',
      borderBottom: isDarkMode ? '1px solid #27303f' : '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      zIndex: 100,
    }),
    [isDarkMode]
  )

  const contentStyle = useMemo(
    () => ({
      minHeight: 'calc(100vh - 64px)',
      padding: '24px',
      overflow: 'auto',
      backgroundColor: isDarkMode ? '#1f2937' : '#f5f5f5',
      transition: 'background-color 0.3s ease',
    }),
    [isDarkMode]
  )

  const logoSectionClassName = useMemo(
    () =>
      `flex items-center justify-center py-4 px-6 border-b transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`,
    [isDarkMode]
  )

  const contentInnerClassName = useMemo(
    () =>
      `${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 min-h-full`,
    [isDarkMode]
  )

  return (
    <Layout className="h-screen" style={{ overflow: 'hidden' }}>
      {contextHolder}
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={false}
        width={256}
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
                loading="eager"
              />
              <Typography.Title
                level={5}
                className={`m-0 transition-opacity duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                } ${isPending ? 'opacity-50' : 'opacity-100'}`}
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
              loading="eager"
            />
          )}
        </div>

        {/* Navigation - Direct import for better performance */}
        <div className="flex-1 py-4 overflow-hidden">
          <Navigation collapsed={collapsed} />
        </div>

        {/* User info with smooth height transition */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden ${
            collapsed ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
          }`}
        >
          <div
            className={`p-4 border-t transition-colors duration-200 ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar size="small" icon={<UserOutlined />} />
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate transition-colors duration-200 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user?.fullName || user?.username}
                </p>
                <p
                  className={`text-xs truncate transition-colors duration-200 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout style={layoutStyle}>
        {/* Header */}
        <Header style={headerStyle}>
          <div className="flex justify-between items-center h-full">
            {/* Left side - Collapse button */}
            <div className="flex items-center">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleSidebar}
                className={`transition-all duration-200 ${
                  isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              />
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Test notification button */}
              {/* <Button onClick={() => sendMessage()}>Test</Button> */}

              {/* Notifications */}
              <NotificationBell />

              {/* Theme switcher */}
              <ThemeSwitcher />

              {/* Language switcher */}
              <LanguageSwitcher />

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
        <Content style={contentStyle}>
          <div className={contentInnerClassName}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default React.memo(LayoutComponent)

import React, { useState, useCallback } from 'react'
import { Badge, Button, Dropdown, List, Typography, Space, Switch } from 'antd'
import { BellOutlined, ReloadOutlined } from '@ant-design/icons'
import { useWebSocket } from '@/contexts/WebSocketContext'
import {
  markNotificationAsRead as markNotiRead,
  getNotifications as fetchNotifications,
} from '@/services/notiApi'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/hooks'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const NAVIGATION_PATHS = {
  TEACHER: {
    APPOINTMENT: '/appointment-management/details/:id',
    CASE: '/case-management/details/:id',
    CLASS: '/student-management',
  },
  COUNSELOR: {
    APPOINTMENT: '/appointment-management/details/:id',
    CASE: '/case-management/details/:id',
    PROGRAM: '/program-management/details/:id',
  },
  MANAGER: {
    APPOINTMENT: '/appointment-management/details/:id',
    CASE: '/case-management/details/:id',
    PROGRAM: '/program-management/details/:id',
  },
}

const NotificationBell = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [dropdownVisible, setDropdownVisible] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    getUnreadCount,
    getRecentNotifications,
    markNotificationAsRead,
    setNotifications,
  } = useWebSocket()

  const unreadCount = getUnreadCount()
  const recentNotifications = getRecentNotifications(10) // Lấy 10 thông báo gần nhất

  const handleNotificationClick = useCallback(
    async notification => {
      try {
        if (!notification.isRead && notification.id) {
          await markNotiRead(notification.id)
          markNotificationAsRead(notification.id)
        }
        if (!notification.notificationType) return
        const notificationType = notification.notificationType.includes('_')
          ? notification.notificationType.split('_')[0]
          : notification.notificationType
        if (!notificationType || !notificationType.trim()) return

        // Xử lý điều hướng nếu cần
        if (user.role === 'teacher') {
          navigate(
            NAVIGATION_PATHS.TEACHER[notificationType].replace(
              ':id',
              notification.relatedEntityId
            )
          )
        } else if (user.role === 'counselor') {
          navigate(
            NAVIGATION_PATHS.COUNSELOR[notificationType].replace(
              ':id',
              notification.relatedEntityId
            )
          )
        } else if (user.role === 'manager') {
          navigate(
            NAVIGATION_PATHS.MANAGER[notificationType].replace(
              ':id',
              notification.relatedEntityId
            )
          )
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    [markNotificationAsRead]
  )

  const handleRefresh = useCallback(async () => {
    try {
      const accountId = user?.id || user?.userId
      if (!accountId) return
      const list = await fetchNotifications(accountId)
      const normalized = Array.isArray(list)
        ? list.map(n => ({ ...n, isRead: n.isRead ?? n.read ?? false }))
        : []
      if (typeof setNotifications === 'function') {
        setNotifications(normalized)
      }
    } catch (e) {
      console.error('Failed to refresh notifications', e)
    }
  }, [user, setNotifications])

  // const handleClearAll = useCallback(() => {
  //   setDropdownVisible(false)
  // }, [])

  const getNotificationType = useCallback(
    notification => {
      const type = (notification?.notificationType || '')
        .toString()
        .toUpperCase()
      let variant = 'INFO'
      if (
        type.includes('DANGER') ||
        type.includes('ERROR') ||
        type.includes('CRITICAL')
      ) {
        variant = 'DANGER'
      } else if (type.includes('WARNING') || type.includes('WARN')) {
        variant = 'WARNING'
      } else if (type.includes('INFO')) {
        variant = 'INFO'
      }

      const styles = {
        INFO: {
          unreadContainer: isDarkMode
            ? 'bg-blue-900/20 border-l-4 border-blue-500'
            : 'bg-blue-50 border-l-4 border-blue-500',
          titleUnread: 'text-blue-600 dark:text-blue-400',
        },
        WARNING: {
          unreadContainer: isDarkMode
            ? 'bg-amber-900/20 border-l-4 border-amber-500'
            : 'bg-amber-50 border-l-4 border-amber-500',
          titleUnread: 'text-amber-600 dark:text-amber-400',
        },
        DANGER: {
          unreadContainer: isDarkMode
            ? 'bg-red-900/20 border-l-4 border-red-500'
            : 'bg-red-50 border-l-4 border-red-500',
          titleUnread: 'text-red-600 dark:text-red-400',
        },
      }

      return {
        variant,
        ...styles[variant],
        readHover: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
      }
    },
    [isDarkMode]
  )

  const notificationItems = recentNotifications.map((notification, index) => ({
    key: notification.id || index,
    label: (
      <div
        className={`p-3 cursor-pointer transition-colors ${
          !notification.isRead
            ? getNotificationType(notification).unreadContainer
            : getNotificationType(notification).readHover
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex flex-col space-y-1">
          <Text
            strong
            className={`${
              !notification.isRead
                ? getNotificationType(notification).titleUnread
                : isDarkMode
                  ? 'text-white'
                  : 'text-gray-900'
            }`}
          >
            {notification.title || t('notification.newNotification')}
          </Text>
          <Text
            className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {notification.content ||
              notification.message ||
              t('notification.content')}
          </Text>
          <Text
            className={`text-xs ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {new Date(notification.createdAt || Date.now()).toLocaleString(
              'vi-VN'
            )}
          </Text>
        </div>
      </div>
    ),
  }))

  const dropdownMenu = {
    items: [
      // Header với controls
      {
        key: 'header',
        label: (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <Text
                strong
                className={isDarkMode ? 'text-white' : 'text-gray-900'}
              >
                {t('notification.title')} ({recentNotifications.length})
              </Text>
              <Space>
                <Button
                  size="small"
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                ></Button>
              </Space>
            </div>
          </div>
        ),
      },
      {
        key: 'divider',
        type: 'divider',
      },
      // Notifications list
      ...notificationItems,
      // Empty state
      ...(recentNotifications.length === 0
        ? [
            {
              key: 'empty',
              label: (
                <div className="p-8 text-center">
                  <BellOutlined
                    className={`text-4xl mb-2 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-300'
                    }`}
                  />
                  <Text
                    className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                  >
                    {t('notification.noNotifications')}
                  </Text>
                </div>
              ),
            },
          ]
        : []),
    ],
    style: {
      width: 350,
      maxHeight: 400,
      overflow: 'auto',
    },
  }

  return (
    <Dropdown
      menu={dropdownMenu}
      open={dropdownVisible}
      onOpenChange={setDropdownVisible}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button
        type="text"
        icon={
          <Badge count={unreadCount} size="small" offset={[-2, 2]}>
            <BellOutlined style={{ fontSize: 18, color: '#5C5C5CFF' }} />
          </Badge>
        }
        className={`${
          isDarkMode
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      />
    </Dropdown>
  )
}

export default NotificationBell

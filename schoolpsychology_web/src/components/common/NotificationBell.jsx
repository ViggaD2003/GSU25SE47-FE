import React, { useState, useCallback } from 'react'
import { Badge, Button, Dropdown, List, Typography, Space, Switch } from 'antd'
import { BellOutlined, SoundOutlined, DeleteOutlined } from '@ant-design/icons'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const { Text } = Typography

const NotificationBell = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [dropdownVisible, setDropdownVisible] = useState(false)

  const {
    notifications,
    getUnreadCount,
    markNotificationAsRead,
    clearNotifications,
  } = useWebSocket()

  const unreadCount = getUnreadCount()

  const handleNotificationClick = useCallback(
    notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id)
      }
      // Xử lý click vào thông báo (có thể navigate đến trang liên quan)
      console.log('Clicked notification:', notification)
    },
    [markNotificationAsRead]
  )

  const handleClearAll = useCallback(() => {
    clearNotifications()
    setDropdownVisible(false)
  }, [clearNotifications])

  const notificationItems = notifications.map((notification, index) => ({
    key: notification.id || index,
    label: (
      <div
        className={`p-3 cursor-pointer transition-colors ${
          !notification.read
            ? isDarkMode
              ? 'bg-blue-900/20 border-l-4 border-blue-500'
              : 'bg-blue-50 border-l-4 border-blue-500'
            : isDarkMode
              ? 'hover:bg-gray-700'
              : 'hover:bg-gray-50'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex flex-col space-y-1">
          <Text
            strong
            className={`${
              !notification.read
                ? 'text-blue-600 dark:text-blue-400'
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
                {t('notification.title')} ({notifications.length})
              </Text>
              <Space>
                <Button
                  size="small"
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={handleClearAll}
                  className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                />
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
      ...(notifications.length === 0
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

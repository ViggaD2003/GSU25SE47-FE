import React, { useEffect } from 'react'
import { App } from 'antd'
import notificationService from '../services/notificationService'

/**
 * NotificationProvider component that initializes the global notification service
 * This component uses Ant Design's useApp hook to access the notification API
 * and makes it available globally for use in non-React contexts
 */
const NotificationProvider = ({ children }) => {
  const { notification } = App.useApp()

  useEffect(() => {
    // Initialize the global notification service with the Ant Design notification API
    if (notification && typeof notification.error === 'function') {
      notificationService.init(notification)
    } else {
      console.warn('Notification API not available or invalid')
    }

    return () => {
      // Cleanup on unmount
      notificationService.init(null)
    }
  }, [notification])

  return children
}

export default NotificationProvider

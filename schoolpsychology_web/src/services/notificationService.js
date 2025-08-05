/**
 * Global notification service
 * This service provides a way to show notifications from non-React contexts like API interceptors
 */
class NotificationService {
  constructor() {
    this.notificationApi = null
  }

  /**
   * Initialize the notification API
   * This should be called from App component after Ant Design App is mounted
   */
  init(notificationApi) {
    this.notificationApi = notificationApi
  }

  /**
   * Show success notification
   */
  success(config) {
    if (this.notificationApi) {
      this.notificationApi.success(config)
    } else {
      console.warn('Notification API not initialized')
    }
  }

  /**
   * Show error notification
   */
  error(config) {
    if (this.notificationApi) {
      this.notificationApi.error(config)
    } else {
      console.warn('Notification API not initialized')
    }
  }

  /**
   * Show info notification
   */
  info(config) {
    if (this.notificationApi) {
      this.notificationApi.info(config)
    } else {
      console.warn('Notification API not initialized')
    }
  }

  /**
   * Show warning notification
   */
  warning(config) {
    if (this.notificationApi) {
      this.notificationApi.warning(config)
    } else {
      console.warn('Notification API not initialized')
    }
  }

  /**
   * Show custom notification
   */
  open(config) {
    if (this.notificationApi) {
      this.notificationApi.open(config)
    } else {
      console.warn('Notification API not initialized')
    }
  }

  /**
   * Destroy all notifications
   */
  destroy() {
    if (this.notificationApi) {
      this.notificationApi.destroy()
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService

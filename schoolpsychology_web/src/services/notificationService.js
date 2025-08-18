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
    if (
      this.notificationApi &&
      typeof this.notificationApi.success === 'function'
    ) {
      this.notificationApi.success(config)
    } else {
      console.warn(
        'Notification API not initialized or success method not available'
      )
    }
  }

  /**
   * Show error notification
   */
  error(config) {
    if (
      this.notificationApi &&
      typeof this.notificationApi.error === 'function'
    ) {
      this.notificationApi.error(config)
    } else {
      console.warn(
        'Notification API not initialized or error method not available'
      )
      // Fallback to console.error for debugging
      console.error('Notification error:', config)
    }
  }

  /**
   * Show info notification
   */
  info(config) {
    if (
      this.notificationApi &&
      typeof this.notificationApi.info === 'function'
    ) {
      this.notificationApi.info(config)
    } else {
      console.warn(
        'Notification API not initialized or info method not available'
      )
    }
  }

  /**
   * Show warning notification
   */
  warning(config) {
    if (
      this.notificationApi &&
      typeof this.notificationApi.warning === 'function'
    ) {
      this.notificationApi.warning(config)
    } else {
      console.warn(
        'Notification API not initialized or warning method not available'
      )
    }
  }

  /**
   * Show custom notification
   */
  open(config) {
    if (
      this.notificationApi &&
      typeof this.notificationApi.open === 'function'
    ) {
      this.notificationApi.open(config)
    } else {
      console.warn(
        'Notification API not initialized or open method not available'
      )
    }
  }

  /**
   * Destroy all notifications
   */
  destroy() {
    if (
      this.notificationApi &&
      typeof this.notificationApi.destroy === 'function'
    ) {
      this.notificationApi.destroy()
    }
  }
}

// Create and export singleton instance
const notificationService = new NotificationService()
export default notificationService

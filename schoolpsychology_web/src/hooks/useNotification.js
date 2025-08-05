import { App } from 'antd'

/**
 * Custom hook to use Ant Design notification API
 * This hook provides access to notification methods that work with the App component context
 */
export const useNotification = () => {
  const { notification } = App.useApp()

  return {
    success: notification.success,
    error: notification.error,
    info: notification.info,
    warning: notification.warning,
    open: notification.open,
    destroy: notification.destroy,
  }
}

export default useNotification

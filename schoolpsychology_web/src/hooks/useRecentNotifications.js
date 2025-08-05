import { useState, useEffect, useCallback } from 'react'
import { getRecentNotifications } from '@/services/notiApi'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Custom hook để lấy thông báo gần đây
 * @param {number} limit - Số lượng thông báo cần lấy (mặc định: 10)
 * @param {boolean} autoFetch - Tự động fetch khi component mount (mặc định: true)
 * @returns {Object} Object chứa notifications, loading state và hàm refresh
 */
export const useRecentNotifications = (limit = 10, autoFetch = true) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getRecentNotifications(user.id, limit)
      setNotifications(data)
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải thông báo')
      console.error('Error fetching recent notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id, limit])

  // Auto fetch on mount and when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications()
    }
  }, [autoFetch, fetchNotifications])

  const refresh = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    refresh,
    fetchNotifications,
  }
}

export default useRecentNotifications

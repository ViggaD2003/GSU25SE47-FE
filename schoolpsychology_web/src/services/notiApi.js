import api from './api'

export const getNotifications = async accountId => {
  if (!accountId) return []
  try {
    const response = await api.get(`/api/v1/noti/${accountId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export const getRecentNotifications = async (accountId, limit = 10) => {
  if (!accountId) return []
  try {
    const response = await api.get(`/api/v1/noti/${accountId}`)
    const notifications = response.data

    // Sắp xếp theo thời gian tạo (mới nhất trước) và lấy số lượng giới hạn
    return notifications
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.updatedAt || 0) -
          new Date(a.createdAt || a.updatedAt || 0)
      )
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent notifications:', error)
    return []
  }
}

export const markNotificationAsRead = async notiId => {
  if (!notiId) return null
  try {
    const response = await api.patch(`/api/v1/noti/read/${notiId}`)
    return response.data
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

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

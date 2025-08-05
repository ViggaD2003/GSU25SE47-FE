import api from './api'

export const slotAPI = {
  // Get slots by host ID
  getSlots: async hostById => {
    try {
      const response = await api.get(`/api/v1/slots?hostById=${hostById}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  // Create multiple slots
  createSlots: async slots => {
    try {
      // console.log('slots', slots)
      const response = await api.post('/api/v1/slots', slots)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        conflicts: error.response?.data?.conflicts,
      }
    }
  },

  // Publish slot
  publishSlot: async slotId => {
    try {
      const response = await api.patch(`/api/v1/slot/${slotId}/status`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },

  // Get users by role (for manager to select host)
  getUsersByRole: async role => {
    try {
      const response = await api.get(`/api/v1/users?role=${role}`)
      return {
        success: true,
        data: response.data,
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  },
}

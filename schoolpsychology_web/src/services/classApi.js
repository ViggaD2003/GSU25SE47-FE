import api from './api'

export const classAPI = {
  getClasses: async () => {
    const response = await api.get('/api/v1/classes')
    return response.data
  },
  getClassesByCode: async code => {
    const response = await api.get(`/api/v1/classes/${code}`)
    return response.data
  },
  createClass: async data => {
    const response = await api.post('/api/v1/classes', data)
    return response.data
  },
  updateClass: async (code, data) => {
    const response = await api.patch(`/api/v1/classes/update/${code}`, data)
    return response.data
  },
  deleteClass: async code => {
    const response = await api.delete(`/api/classes/${code}`)
    return response.data
  },
}

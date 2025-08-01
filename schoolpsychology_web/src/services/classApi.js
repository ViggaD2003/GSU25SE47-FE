import api from './api'

export const classAPI = {
  getClasses: async () => {
    const response = await api.get('/api/v1/classes')
    return response.data
  },
  getClassesByCode: async code => {
    if (!code) return
    const response = await api.get(`/api/v1/classes/code/${code}`)
    return response.data
  },
  getClassById: async id => {
    if (!id) return
    const response = await api.get(`/api/v1/classes/${id}`)
    return response.data
  },
  createClass: async data => {
    const requestBody = Array.isArray(data) ? data : [data]
    const response = await api.post('/api/v1/classes', requestBody)
    return response.data
  },
  enrollClass: async data => {
    if (!data) return
    const requestBody = {
      classId: data.classId,
      studentIds: data.studentIds || [],
    }
    const response = await api.post('/api/v1/classes/enrollments', requestBody)
    return response.data
  },
}

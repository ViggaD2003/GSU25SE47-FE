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
    const response = await api.post('/api/v1/classes', data)
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
  // getStudentWithInactiveClass: async query => {
  //   const cleanQuery = Object.fromEntries(
  //     Object.entries(query).filter(([_, v]) => v != null)
  //   )
  //   const response = await api.get(
  //     '/api/v1/account/students-without-or-inactive-class',
  //     { params: cleanQuery }
  //   )
  //   return response.data
  // },

  getStudentWithInactiveClass: async () => {
    const query = {
      role: 'STUDENT',
    }
    const cleanQuery = Object.fromEntries(
      Object.entries(query).filter(([_, v]) => v != null)
    )
    const response = await api.get('/api/v1/account/list-all-account', {
      params: cleanQuery,
    })
    return response.data
  },
}

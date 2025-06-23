import api from './api'

export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get('/api/v1/categories')
    return response.data
  },
  createCategories: async categoriesData => {
    const response = await api.post('/api/v1/categories', categoriesData)
    return response.data
  },
}

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

  getCategoryLevels: async id => {
    const response = await api.get(`/api/v1/categories/level?categoryId=${id}`)
    return response.data
  },

  updateStatus: async (categoryId, status = false) => {
    if (!categoryId) throw new Error('Category ID is required')
    const response = await api.put(
      `/api/v1/categories/update-status?id=${categoryId}&status=${status}`
    )
    return response.data
  },

  updateCategories: async (id, categoryData) => {
    if (!id || !categoryData) return
    const requestBody = {
      name: categoryData.name,
      code: categoryData.code,
      description: categoryData.description,
      isSum: categoryData.isSum,
      isLimited: categoryData.isLimited,
      questionLength: categoryData.questionLength,
      severityWeight: categoryData.severityWeight,
      maxScore: categoryData.maxScore,
      minScore: categoryData.minScore,
    }
    const response = await api.put(`/api/v1/categories/${id}`, requestBody)
    return response.data
  },
}

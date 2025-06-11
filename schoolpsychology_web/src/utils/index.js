// Format utilities
export const formatDate = (date, locale = 'vi-VN') => {
  return new Date(date).toLocaleDateString(locale)
}

export const formatCurrency = (amount, locale = 'vi-VN', currency = 'VND') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Validation utilities
export const isEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isPhoneNumber = phone => {
  const phoneRegex = /^(\+84|84|0)([3|5|7|8|9])+([0-9]{8})$/
  return phoneRegex.test(phone)
}

// Storage utilities
export const getFromStorage = key => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error('Error getting from storage:', error)
    return null
  }
}

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to storage:', error)
  }
}

export const removeFromStorage = key => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from storage:', error)
  }
}

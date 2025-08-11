import dayjs from 'dayjs'

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

// Auth storage utilities
export const getAuthData = () => {
  try {
    const authData = localStorage.getItem('auth')
    return authData ? JSON.parse(authData) : null
  } catch (error) {
    console.error('Error getting auth data:', error)
    return null
  }
}

export const saveAuthData = authData => {
  try {
    localStorage.setItem('auth', JSON.stringify(authData))
  } catch (error) {
    console.error('Error saving auth data:', error)
  }
}

export const clearAuthData = () => {
  try {
    localStorage.removeItem('auth')
    localStorage.removeItem('token') // Remove legacy token if exists
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

export const getToken = () => {
  try {
    const authData = getAuthData()
    return authData?.token || null
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

// JWT Token utilities
export const decodeJWT = token => {
  try {
    if (!token) return null

    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format')
    }

    // Decode the payload (second part)
    const payload = parts[1]
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decodedPayload = atob(
      paddedPayload.replace(/-/g, '+').replace(/_/g, '/')
    )

    return JSON.parse(decodedPayload)
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return null
  }
}

export const isTokenExpired = token => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return true

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(dayjs().unix())
    const isExpired = decoded.exp < currentTime

    // console.log(
    //   `[Token Check] Expires at: ${dayjs(decoded.exp * 1000).format(
    //     'DD/MM/YYYY HH:mm:ss'
    //   )}, Current: ${dayjs(currentTime * 1000).format('DD/MM/YYYY HH:mm:ss')}, Expired: ${isExpired}`
    // )

    return isExpired
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

export const getTokenExpirationTime = token => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded || !decoded.exp) return null

    // Convert seconds to milliseconds
    return new Date(decoded.exp * 1000)
  } catch (error) {
    console.error('Error getting token expiration time:', error)
    return null
  }
}

export const getTokenInfo = token => {
  try {
    const decoded = decodeJWT(token)
    if (!decoded) return null

    const expirationTime = getTokenExpirationTime(token)
    const isExpired = isTokenExpired(token)

    return {
      decoded,
      expirationTime,
      isExpired,
      issuedAt: decoded.iat ? new Date(decoded.iat * 1000) : null,
      expiresIn: decoded.exp
        ? Math.floor((decoded.exp * 1000 - Date.now()) / 1000)
        : null, // seconds
      tokenType: 'JWT',
      algorithm: decoded.alg || 'unknown',
    }
  } catch (error) {
    console.error('Error getting token info:', error)
    return null
  }
}

// Token refresh utilities
export const shouldRefreshToken = (token, bufferMinutes = 5) => {
  try {
    if (!token) return false

    const tokenInfo = getTokenInfo(token)
    if (!tokenInfo || !tokenInfo.expiresIn) return false

    // Refresh if token expires within buffer minutes
    const bufferSeconds = bufferMinutes * 60
    return tokenInfo.expiresIn <= bufferSeconds
  } catch (error) {
    console.error('Error checking if token should be refreshed:', error)
    return false
  }
}

export const isTokenValid = token => {
  try {
    if (!token) return false
    return !isTokenExpired(token)
  } catch (error) {
    console.error('Error checking token validity:', error)
    return false
  }
}

// Re-export auth utilities
export * from './authUtils'

// Auth helper functions
export * from './authHelpers'

/**
 * Authentication Helper Functions
 * Centralized utilities for authentication-related operations
 * This file serves as the single source of truth for auth utilities
 */

// Constants for authorized roles
export const AUTHORIZED_ROLES = ['manager', 'teacher', 'counselor']

// Constants for localStorage keys
export const STORAGE_KEYS = {
  AUTH: 'auth',
  LEGACY_TOKEN: 'token', // For backward compatibility
}

// Constants for navigation paths
export const NAVIGATION_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ACCESS_FAIL: '/access-fail',
}

// Constants for notification durations
export const NOTIFICATION_DURATIONS = {
  SUCCESS: 3,
  ERROR: 4,
  WARNING: 5,
  INFO: 3,
}

/**
 * Check if user role is authorized
 * @param {string} role - User role to check
 * @returns {boolean} - True if role is authorized
 */
export const isAuthorizedRole = role => {
  if (!role) return false
  return AUTHORIZED_ROLES.includes(role.toLowerCase())
}

/**
 * Save authentication data to localStorage with refresh token support
 * @param {string} token - Authentication token
 * @param {object} userData - User data object
 * @param {string} refreshToken - Refresh token (optional, defaults to token)
 * @returns {object} - Auth data object
 */
export const saveAuthData = (token, userData, refreshToken = null) => {
  const authData = {
    user: userData,
    token,
    refreshToken: refreshToken || token, // Fallback to token if no refresh token
    timestamp: Date.now(),
  }

  // Store in single auth object for consistency
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))

  // Remove legacy token for cleanup
  localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN)

  return authData
}

/**
 * Clear authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH)
  localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN)
}

/**
 * Get authentication data from localStorage
 * @returns {object|null} - Auth data object or null if not found
 */
export const getAuthData = () => {
  try {
    const authData = localStorage.getItem(STORAGE_KEYS.AUTH)
    if (!authData) return null

    const parsed = JSON.parse(authData)

    // Validate required fields
    if (!parsed.token || !parsed.user) {
      console.warn('Invalid auth data structure, clearing...')
      clearAuthData()
      return null
    }

    return parsed
  } catch (error) {
    console.error('Error parsing auth data from localStorage:', error)
    clearAuthData()
    return null
  }
}

/**
 * Get token from localStorage (from auth object)
 * @returns {string|null} - Token string or null if not found
 */
export const getToken = () => {
  const authData = getAuthData()
  return authData?.token || null
}

/**
 * Get refresh token from localStorage
 * @returns {string|null} - Refresh token string or null if not found
 */
export const getRefreshToken = () => {
  const authData = getAuthData()
  return authData?.refreshToken || null
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  const authData = getAuthData()
  return !!(authData?.token && authData?.user)
}

/**
 * Validate user data structure
 * @param {object} userData - User data to validate
 * @returns {object} - Validation result with isValid and errors
 */
export const validateUserData = userData => {
  const errors = []

  if (!userData) {
    errors.push('User data is required')
    return { isValid: false, errors }
  }

  if (!userData.id) {
    errors.push('User ID is required')
  }

  if (!userData.email) {
    errors.push('User email is required')
  }

  if (!userData.role) {
    errors.push('User role is required')
  }

  if (!userData.fullName) {
    errors.push('User full name is required')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Format user role for display
 * @param {string} role - Raw role string
 * @returns {string} - Formatted role string
 */
export const formatUserRole = role => {
  if (!role) return 'Unknown'
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

/**
 * Create standardized user object from various sources
 * @param {object} sourceData - Source data (JWT payload, API response, etc.)
 * @returns {object} - Standardized user object
 */
export const createStandardizedUser = sourceData => {
  if (!sourceData) {
    throw new Error('Source data is required to create standardized user')
  }

  return {
    ...sourceData,
    id: sourceData?.userId || sourceData['user-id'] || sourceData?.id || 1,
    fullName: sourceData?.name || sourceData?.fullname || 'Unknown User',
    email: sourceData?.email || '',
    role: sourceData?.role ? String(sourceData.role).toLowerCase() : null,
  }
}

/**
 * Get user permissions based on role
 * @param {string} role - User role
 * @returns {object} - Permissions object
 */
export const getUserPermissions = role => {
  const rolePermissions = {
    manager: {
      canManageUsers: true,
      canManagePrograms: true,
      canViewAllData: true,
      canManageSystem: true,
      canManageStaff: true,
      canManageClients: true,
    },
    teacher: {
      canManageUsers: false,
      canManagePrograms: false,
      canViewAllData: false,
      canManageSystem: false,
      canManageStaff: false,
      canManageClients: false,
    },
    counselor: {
      canManageUsers: false,
      canManagePrograms: false,
      canViewAllData: false,
      canManageSystem: false,
      canManageStaff: false,
      canManageClients: false,
    },
  }

  return rolePermissions[role?.toLowerCase()] || {}
}

/**
 * Check if auth data needs refresh
 * @param {number} bufferMinutes - Buffer time before expiration (default: 5)
 * @returns {boolean} - True if refresh is needed
 */
export const needsTokenRefresh = (bufferMinutes = 5) => {
  const authData = getAuthData()
  if (!authData?.timestamp) return false

  // Check if data is older than buffer time
  const bufferMs = bufferMinutes * 60 * 1000
  const now = Date.now()

  return now - authData.timestamp > bufferMs
}

/**
 * Update token in existing auth data
 * @param {string} newToken - New token to update
 * @returns {boolean} - True if update was successful
 */
export const updateToken = newToken => {
  try {
    const authData = getAuthData()
    if (!authData) return false

    authData.token = newToken
    authData.timestamp = Date.now()

    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))
    return true
  } catch (error) {
    console.error('Error updating token:', error)
    return false
  }
}

/**
 * Migrate legacy token format to new format
 * @returns {boolean} - True if migration was performed
 */
export const migrateLegacyToken = () => {
  try {
    const legacyToken = localStorage.getItem(STORAGE_KEYS.LEGACY_TOKEN)
    if (!legacyToken) return false

    // Create basic auth data structure
    const authData = {
      token: legacyToken,
      user: { id: 1, fullName: 'Legacy User', email: '', role: 'unknown' },
      refreshToken: legacyToken,
      timestamp: Date.now(),
    }

    // Save in new format
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData))

    // Remove legacy token
    localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN)

    console.log('Legacy token migrated successfully')
    return true
  } catch (error) {
    console.error('Error migrating legacy token:', error)
    return false
  }
}

/**
 * Initialize authentication system
 * @returns {object|null} - Initialized auth data or null
 */
export const initializeAuth = () => {
  try {
    // Try to migrate legacy token first
    migrateLegacyToken()

    // Get current auth data
    const authData = getAuthData()

    if (authData) {
      // console.log('Auth system initialized with existing data')
      return authData
    } else {
      // console.log('Auth system initialized with no existing data')
      return null
    }
  } catch (error) {
    console.error('Error initializing auth system:', error)
    clearAuthData()
    return null
  }
}

/**
 * Test function for debugging GoogleCallback
 * @param {string} testToken - Test token to simulate Google OAuth
 * @returns {object} - Test result
 */
export const testGoogleCallback = (testToken = 'test.jwt.token') => {
  try {
    console.log('🧪 Testing GoogleCallback with token:', testToken)

    // Simulate the callback flow
    const authData = getAuthData()
    console.log('Current auth data:', authData)

    // Test token decoding - import decodeJWT from utils/index
    // const decodedToken = decodeJWT(testToken)
    // console.log('Decoded test token:', decodedToken)

    // Test user creation
    const userData = createStandardizedUser({
      role: 'manager',
      name: 'Test User',
      email: 'test@example.com',
    })
    console.log('Standardized user data:', userData)

    // Test role validation
    const isAuthorized = isAuthorizedRole(userData.role)
    console.log('Role authorization:', { role: userData.role, isAuthorized })

    return {
      success: true,
      decodedToken: null, // decodeJWT not available here
      userData,
      isAuthorized,
      currentAuthData: authData,
    }
  } catch (error) {
    console.error('❌ Test GoogleCallback failed:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Debug authentication state
 * @returns {object} - Debug information
 */
export const debugAuthState = () => {
  try {
    const authData = getAuthData()
    const token = getToken()
    const refreshToken = getRefreshToken()
    const isAuth = isAuthenticated()

    console.log('🔍 Debug Auth State:', {
      hasAuthData: !!authData,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: isAuth,
      authDataKeys: authData ? Object.keys(authData) : null,
      tokenLength: token ? token.length : 0,
      refreshTokenLength: refreshToken ? refreshToken.length : 0,
    })

    return {
      hasAuthData: !!authData,
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: isAuth,
      authDataKeys: authData ? Object.keys(authData) : null,
    }
  } catch (error) {
    console.error('❌ Debug auth state failed:', error)
    return { error: error.message }
  }
}

/**
 * Test different login scenarios
 * @returns {object} - Test results
 */
export const testLoginScenarios = () => {
  try {
    console.log('🧪 Testing different login scenarios...')

    // Test 1: Manager role response (Google OAuth)
    const managerResponse = {
      success: true,
      message: 'Redirect to Google OAuth',
      data: 'https://accounts.google.com/o/oauth2/auth?client_id=8847167776-i3ps6geklh7537d3put0lu05prtlb802.apps.googleusercontent.com&redirect_uri=https://spmss-api.ocgi.space/api/v1/auth/oauth/callback&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent&state=danhkvtse172932@fpt.edu.vn',
    }

    const isManagerOAuth =
      typeof managerResponse.data === 'string' &&
      managerResponse.data.includes('https://accounts.google.com/o/oauth2/auth')

    console.log('🔐 Manager OAuth test:', {
      isOAuthUrl: isManagerOAuth,
      urlLength: managerResponse.data.length,
      containsGoogle: managerResponse.data.includes('accounts.google.com'),
    })

    // Test 2: Counselor/Teacher role response (normal token)
    const counselorResponse = {
      success: true,
      data: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token',
        refreshToken: 'refresh.token.here',
        user: {
          id: 1,
          fullName: 'Test Counselor',
          email: 'counselor@test.com',
          role: 'counselor',
        },
      },
    }

    const isNormalLogin =
      counselorResponse.data &&
      counselorResponse.data.token &&
      counselorResponse.data.user

    console.log('👤 Counselor/Teacher login test:', {
      hasToken: !!counselorResponse.data?.token,
      hasUser: !!counselorResponse.data?.user,
      userRole: counselorResponse.data?.user?.role,
      isNormalLogin,
    })

    // Test 3: Role validation
    const testRoles = [
      'manager',
      'teacher',
      'counselor',
      'student',
      'admin',
      null,
      undefined,
    ]
    const roleValidationResults = testRoles.map(role => ({
      role,
      isAuthorized: isAuthorizedRole(role),
    }))

    console.log('🔒 Role validation test:', roleValidationResults)

    return {
      managerOAuth: {
        success: isManagerOAuth,
        response: managerResponse,
      },
      counselorLogin: {
        success: isNormalLogin,
        response: counselorResponse,
      },
      roleValidation: roleValidationResults,
    }
  } catch (error) {
    console.error('❌ Test login scenarios failed:', error)
    return { error: error.message }
  }
}

/**
 * Test Google OAuth callback error scenarios
 * @returns {object} - Test results for error cases
 */
export const testGoogleOAuthErrors = () => {
  try {
    console.log('🧪 Testing Google OAuth error scenarios...')

    // Test 1: Duplicate user error
    const duplicateUserError =
      'Query did not return a unique result: 2 results were returned'
    const isDuplicateError = duplicateUserError.includes(
      'Query did not return a unique result'
    )

    console.log('❌ Duplicate user error test:', {
      error: duplicateUserError,
      isDuplicateError,
      containsDuplicate: duplicateUserError.includes('duplicate'),
      containsQueryError: duplicateUserError.includes(
        'Query did not return a unique result'
      ),
    })

    // Test 2: Other common errors
    const commonErrors = [
      'error: duplicate key value violates unique constraint',
      'error: user already exists',
      'error: email already registered',
      'error: authentication failed',
      'error: invalid token',
    ]

    const errorTests = commonErrors.map(error => ({
      error,
      isDuplicate: error.includes('duplicate'),
      isAlreadyExists:
        error.includes('already exists') ||
        error.includes('already registered'),
      isAuthError:
        error.includes('authentication failed') ||
        error.includes('invalid token'),
    }))

    console.log('🔍 Common error tests:', errorTests)

    // Test 3: Error detection logic
    const testErrorDetection = token => {
      const hasError =
        token.includes('error') ||
        token.includes('duplicate') ||
        token.includes('Query did not return a unique result')

      const isShortToken = token.length < 50
      const isLikelyError = hasError || isShortToken

      return {
        token,
        hasError,
        isShortToken,
        isLikelyError,
        shouldShowError: isLikelyError,
      }
    }

    const errorDetectionTests = [
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid.jwt.token',
      'error: duplicate user',
      'Query did not return a unique result: 2 results were returned',
      'invalid',
      'duplicate',
    ].map(testErrorDetection)

    console.log('🔍 Error detection logic tests:', errorDetectionTests)

    return {
      duplicateUserError: {
        success: isDuplicateError,
        error: duplicateUserError,
      },
      commonErrors: errorTests,
      errorDetection: errorDetectionTests,
    }
  } catch (error) {
    console.error('❌ Test Google OAuth errors failed:', error)
    return { error: error.message }
  }
}

/**
 * Test HTTP error handling scenarios
 * @returns {object} - Test results for HTTP errors
 */
export const testHttpErrorHandling = () => {
  try {
    console.log('🧪 Testing HTTP error handling scenarios...')

    // Test 1: Server errors (500, 502, 503, 504)
    const serverErrors = [
      { status: 500, message: 'Internal Server Error' },
      { status: 502, message: 'Bad Gateway' },
      { status: 503, message: 'Service Unavailable' },
      { status: 504, message: 'Gateway Timeout' },
    ]

    const serverErrorTests = serverErrors.map(error => ({
      ...error,
      isServerError: true,
      shouldNavigateToLogin: true,
      userMessage: 'Server is experiencing issues. Please try again later.',
      action: 'Wait and retry, or contact support',
    }))

    console.log('🔥 Server error tests:', serverErrorTests)

    // Test 2: Client errors (400, 401, 403)
    const clientErrors = [
      { status: 400, message: 'Bad Request' },
      { status: 401, message: 'Unauthorized' },
      { status: 403, message: 'Forbidden' },
      { status: 404, message: 'Not Found' },
    ]

    const clientErrorTests = clientErrors.map(error => ({
      ...error,
      isClientError: error.status === 400,
      isAuthError: [401, 403].includes(error.status),
      shouldNavigateToLogin: false, // Let user retry
      userMessage:
        error.status === 400
          ? 'Invalid request data'
          : error.status === 401
            ? 'Invalid credentials'
            : error.status === 403
              ? 'Access denied'
              : 'Resource not found',
      action: 'Check input and retry',
    }))

    console.log('🔥 Client error tests:', clientErrorTests)

    // Test 3: Network errors
    const networkErrors = [
      { type: 'Network Error', status: 0, message: 'No response from server' },
      { type: 'Timeout', status: 0, message: 'Request timed out' },
      { type: 'Connection Failed', status: 0, message: 'Failed to connect' },
    ]

    const networkErrorTests = networkErrors.map(error => ({
      ...error,
      isNetworkError: true,
      shouldNavigateToLogin: true,
      userMessage: 'Unable to connect to server. Check internet connection.',
      action: 'Check network and retry',
    }))

    console.log('🔥 Network error tests:', networkErrorTests)

    // Test 4: Error classification logic
    const testErrorClassification = error => {
      const classification = {
        isServerError: error.status >= 500,
        isClientError: error.status >= 400 && error.status < 500,
        isNetworkError: error.status === 0,
        shouldNavigateToLogin: error.status >= 500 || error.status === 0,
        severity:
          error.status >= 500 ? 'HIGH' : error.status >= 400 ? 'MEDIUM' : 'LOW',
      }

      return {
        error,
        classification,
      }
    }

    const classificationTests = [
      { status: 500, message: 'Internal Server Error' },
      { status: 400, message: 'Bad Request' },
      { status: 0, message: 'Network Error' },
      { status: 200, message: 'Success' },
    ].map(testErrorClassification)

    console.log('🔍 Error classification tests:', classificationTests)

    return {
      serverErrors: serverErrorTests,
      clientErrors: clientErrorTests,
      networkErrors: networkErrorTests,
      classification: classificationTests,
    }
  } catch (error) {
    console.error('❌ Test HTTP error handling failed:', error)
    return { error: error.message }
  }
}

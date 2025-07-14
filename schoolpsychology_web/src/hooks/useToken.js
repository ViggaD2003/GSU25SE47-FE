import { useSelector } from 'react-redux'
import { selectAuth } from '../store/slices/authSlice'
import { decodeJWT, isTokenExpired, getTokenInfo } from '../utils'

export const useToken = () => {
  const { token } = useSelector(selectAuth)

  const decodedToken = token ? decodeJWT(token) : null
  const tokenInfo = token ? getTokenInfo(token) : null
  const expired = token ? isTokenExpired(token) : true

  return {
    token,
    decodedToken,
    tokenInfo,
    expired,
    hasToken: !!token,
    // Helper methods
    getUserInfo: () =>
      decodedToken
        ? {
            id: decodedToken.userId || decodedToken['user-id'],
            email: decodedToken.sub || decodedToken.email,
            name: decodedToken.name || decodedToken.fullName,
            role: decodedToken.role
              ? String(decodedToken.role).toLowerCase()
              : 'user',
            ...decodedToken,
          }
        : null,
    getExpirationTime: () => tokenInfo?.expirationTime,
    getExpiresIn: () => tokenInfo?.expiresIn,
    isExpired: () => expired,
  }
}

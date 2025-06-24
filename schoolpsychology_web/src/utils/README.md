# JWT Token Decoding Utilities

This module provides utilities for decoding and managing JWT tokens in the application.

## Functions

### `decodeJWT(token)`

Decodes a JWT token and returns the payload.

**Parameters:**

- `token` (string): The JWT token to decode

**Returns:**

- `object|null`: The decoded token payload or null if invalid

**Example:**

```javascript
import { decodeJWT } from '../utils'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const decoded = decodeJWT(token)
console.log(decoded)
// {
//   sub: "123",
//   email: "user@example.com",
//   role: "admin",
//   exp: 1640995200,
//   iat: 1640908800
// }
```

### `isTokenExpired(token)`

Checks if a JWT token is expired.

**Parameters:**

- `token` (string): The JWT token to check

**Returns:**

- `boolean`: true if token is expired, false otherwise

**Example:**

```javascript
import { isTokenExpired } from '../utils'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const expired = isTokenExpired(token)
console.log(expired) // true or false
```

### `getTokenExpirationTime(token)`

Gets the expiration time of a JWT token.

**Parameters:**

- `token` (string): The JWT token

**Returns:**

- `Date|null`: The expiration date or null if invalid

**Example:**

```javascript
import { getTokenExpirationTime } from '../utils'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const expirationTime = getTokenExpirationTime(token)
console.log(expirationTime) // 2022-01-01T00:00:00.000Z
```

### `getTokenInfo(token)`

Gets comprehensive information about a JWT token.

**Parameters:**

- `token` (string): The JWT token

**Returns:**

- `object|null`: Token information object or null if invalid

**Example:**

```javascript
import { getTokenInfo } from '../utils'

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const info = getTokenInfo(token)
console.log(info)
// {
//   decoded: { sub: "123", email: "user@example.com", ... },
//   expirationTime: 2022-01-01T00:00:00.000Z,
//   isExpired: false,
//   issuedAt: 2021-12-31T00:00:00.000Z,
//   expiresIn: 86400,
//   tokenType: "JWT",
//   algorithm: "HS256"
// }
```

## Hook

### `useToken()`

A React hook that provides easy access to token information.

**Returns:**

- `object`: Token information and helper methods

**Example:**

```javascript
import { useToken } from '../hooks/useToken'

const MyComponent = () => {
  const {
    token,
    decodedToken,
    tokenInfo,
    expired,
    hasToken,
    getUserInfo,
    getExpirationTime,
    getExpiresIn,
    isExpired,
  } = useToken()

  if (!hasToken) {
    return <div>No token available</div>
  }

  const userInfo = getUserInfo()

  return (
    <div>
      <p>User: {userInfo.name}</p>
      <p>Role: {userInfo.role}</p>
      <p>Expires in: {getExpiresIn()} seconds</p>
      <p>Expired: {isExpired() ? 'Yes' : 'No'}</p>
    </div>
  )
}
```

## Component

### `TokenDebugger`

A debug component that displays token information (only in development mode).

**Usage:**

```javascript
import { TokenDebugger } from '../components/common'

const MyComponent = () => {
  return (
    <div>
      <h1>My App</h1>
      {import.meta.env.DEV && <TokenDebugger />}
    </div>
  )
}
```

## Integration with Authentication

The JWT decoding utilities are automatically integrated with the authentication system:

1. **Login**: When a user logs in, the token is automatically decoded and user information is extracted
2. **Token Refresh**: When refreshing tokens, the new token is decoded and user information is updated
3. **Initialization**: When the app starts, stored tokens are validated and decoded
4. **API Requests**: Before making API requests, tokens are checked for expiration

## Error Handling

All functions include proper error handling:

- Invalid tokens return `null`
- Expired tokens are automatically detected
- Console errors are logged for debugging
- Graceful fallbacks are provided

## Security Notes

- These utilities only decode tokens, they don't verify signatures
- Token validation should be done on the server side
- Never store sensitive information in JWT tokens
- Always use HTTPS in production

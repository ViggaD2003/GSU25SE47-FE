// Test file để kiểm tra logic xử lý Google OAuth
const mockResponse = {
  success: true,
  message: "Redirect to Google OAuth",
  data: "https://accounts.google.com/o/oauth2/auth?client_id=123&redirect_uri=..."
}

// Logic kiểm tra Google OAuth URL
const isGoogleOAuthUrl = typeof mockResponse.data === 'string' &&
  mockResponse.data.includes('https://accounts.google.com/o/oauth2/auth')

console.log('Is Google OAuth URL:', isGoogleOAuthUrl)
console.log('Response data:', mockResponse.data)

if (isGoogleOAuthUrl) {
  console.log('✅ Sẽ redirect đến Google OAuth')
} else {
  console.log('❌ Không phải Google OAuth URL')
} 
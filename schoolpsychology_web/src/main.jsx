import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import { initializeAuth } from './utils/authHelpers'
import './i18n'
import './index.css'
import App from './App.jsx'

// Initialize and validate authentication state before rendering
const initializeApp = () => {
  try {
    // Initialize authentication system
    const authData = initializeAuth()

    // Log app initialization
    console.log('🚀 Application initializing...')
    if (authData) {
      console.log('✅ Auth system initialized with existing data')
    } else {
      console.log('ℹ️ Auth system initialized with no existing data')
    }

    return true
  } catch (error) {
    console.error('❌ Error during app initialization:', error)
    return false
  }
}

// Initialize the app
if (initializeApp()) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  )
} else {
  // Fallback rendering if initialization fails
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </StrictMode>
  )
}

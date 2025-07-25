import React from 'react'
import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './routes/AppRouter'
import store from './store'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// Extend dayjs with timezone plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Set default timezone to Vietnam
dayjs.tz.setDefault('Asia/Ho_Chi_Minh')
// Create a separate component that uses the theme hook inside ThemeProvider
const AppContent = () => {
  const { antdTheme } = useTheme()

  return (
    <LanguageProvider>
      <ConfigProvider theme={antdTheme}>
        <AppRouter />
      </ConfigProvider>
    </LanguageProvider>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}

export default App

import React from 'react'
import { ConfigProvider, App as AntdApp } from 'antd'
import { Provider } from 'react-redux'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './routes/AppRouter'
import store from './store'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { SystemConfigProvider } from '@/contexts/SystemConfigContext'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import NotificationProvider from './contexts/NotificationProvider'

// Extend dayjs with timezone plugins
dayjs.extend(utc)
dayjs.extend(timezone)

// Set default timezone to Vietnam
dayjs.tz.setDefault('Asia/Ho_Chi_Minh')

// Create a separate component that uses the theme hook inside ThemeProvider
const AppContent = () => {
  const { antdTheme } = useTheme()
  const notiConfig = {
    placement: 'topRight',
    bottom: 50,
    duration: 3,
    rtl: true,
    showProgress: true,
  }

  return (
    <LanguageProvider>
      <ConfigProvider theme={antdTheme} notification={notiConfig}>
        <AntdApp>
          <AppRouter />
        </AntdApp>
      </ConfigProvider>
    </LanguageProvider>
  )
}

function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <AuthProvider>
          <WebSocketProvider>
            <ThemeProvider>
              <SystemConfigProvider>
                <AppContent />
              </SystemConfigProvider>
            </ThemeProvider>
          </WebSocketProvider>
        </AuthProvider>
      </NotificationProvider>
    </Provider>
  )
}

export default App

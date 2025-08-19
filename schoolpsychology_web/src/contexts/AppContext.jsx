import { LanguageProvider } from '@/hooks/useLanguage'
import { ThemeProvider } from '@/hooks/useTheme'
import React from 'react'
import { AuthProvider } from './AuthContext'

const AppProvider = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default AppProvider

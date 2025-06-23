import { AuthProvider } from '@/hooks/useAuth'
import { LanguageProvider } from '@/hooks/useLanguage'
import { ThemeProvider } from '@/hooks/useTheme'
import React from 'react'

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

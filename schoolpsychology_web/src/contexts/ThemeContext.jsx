import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { theme } from 'antd'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement

    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')

      // Apply theme to document for Tailwind
      if (isDarkMode) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    })
  }, [isDarkMode])

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const antdTheme = useMemo(
    () => ({
      algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        // Optimize token updates for better performance
        colorBgContainer: isDarkMode ? '#1f2937' : '#ffffff',
        colorBgElevated: isDarkMode ? '#374151' : '#ffffff',
        colorBorder: isDarkMode ? '#4b5563' : '#d9d9d9',
        colorText: isDarkMode ? '#f9fafb' : '#000000d9',
        colorTextSecondary: isDarkMode ? '#d1d5db' : '#00000073',
        colorBgLayout: isDarkMode ? '#111827' : '#f5f5f5',
      },
      components: {
        Layout: {
          bodyBg: isDarkMode ? '#111827' : '#f5f5f5',
          siderBg: isDarkMode ? '#1f2937' : '#ffffff',
          headerBg: isDarkMode ? '#374151' : '#ffffff',
        },
        Menu: {
          itemBg: 'transparent',
          itemSelectedBg: '#1890ff',
          itemSelectedColor: '#ffffff',
          itemHoverBg: isDarkMode ? '#374151' : '#f5f5f5',
          itemColor: isDarkMode ? '#d1d5db' : '#000000d9',
        },
        Card: {
          colorBgContainer: isDarkMode ? '#1f2937' : '#ffffff',
          colorBorder: isDarkMode ? '#374151' : '#d9d9d9',
        },
      },
    }),
    [isDarkMode]
  )

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
      antdTheme,
    }),
    [isDarkMode, toggleTheme, antdTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

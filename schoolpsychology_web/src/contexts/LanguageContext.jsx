import React, { createContext, useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'vi'
  })

  useEffect(() => {
    i18n.changeLanguage(currentLanguage)
    localStorage.setItem('language', currentLanguage)
  }, [currentLanguage, i18n])

  const changeLanguage = lang => {
    setCurrentLanguage(lang)
  }

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'vi' ? 'en' : 'vi'
    changeLanguage(newLang)
  }

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

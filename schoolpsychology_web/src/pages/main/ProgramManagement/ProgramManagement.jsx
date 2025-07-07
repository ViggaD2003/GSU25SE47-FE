import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../../contexts/ThemeContext'

const ProgramManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      <h1>{t('programManagement.title')}</h1>
    </div>
  )
}

export default ProgramManagement

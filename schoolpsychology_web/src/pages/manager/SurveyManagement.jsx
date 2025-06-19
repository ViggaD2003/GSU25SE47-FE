import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'

const SurveyManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      <h1>{t('surveyManagement.title')}</h1>
    </div>
  )
}

export default SurveyManagement

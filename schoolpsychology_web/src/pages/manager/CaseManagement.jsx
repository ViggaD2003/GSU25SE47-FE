import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeContext'

const CaseManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      <h1>{t('caseManagement.title')}</h1>
    </div>
  )
}

CaseManagement.propTypes = {}

export default CaseManagement

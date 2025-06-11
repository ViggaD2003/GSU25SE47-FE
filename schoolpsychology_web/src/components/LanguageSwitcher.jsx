import React, { memo, useMemo } from 'react'
import { Select, Tooltip } from 'antd'
import { GlobalOutlined } from '@ant-design/icons'
import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from 'react-i18next'

const { Option } = Select

const LanguageSwitcher = memo(() => {
  const { currentLanguage, changeLanguage } = useLanguage()
  const { t } = useTranslation()

  const languageOptions = useMemo(
    () => [
      { value: 'vi', label: t('language.vietnamese'), flag: '🇻🇳' },
      { value: 'en', label: t('language.english'), flag: '🇺🇸' },
    ],
    [t]
  )

  return (
    <Tooltip title={t('language.switch')} placement="bottom">
      <div className="flex items-center space-x-2">
        {/* <GlobalOutlined className="text-blue-500" /> */}
        <Select
          value={currentLanguage}
          onChange={changeLanguage}
          className="min-w-[60px] theme-transition"
          size="middle"
          dropdownMatchSelectWidth={false}
          suffixIcon={null}
          optionLabelProp="flag"
        >
          {languageOptions.map(option => (
            <Option key={option.value} value={option.value} flag={option.flag}>
              <span className="flex items-center space-x-2">
                <span className="text-lg">{option.flag}</span>
                <span>{option.label}</span>
              </span>
            </Option>
          ))}
        </Select>
      </div>
    </Tooltip>
  )
})

LanguageSwitcher.displayName = 'LanguageSwitcher'

export default LanguageSwitcher

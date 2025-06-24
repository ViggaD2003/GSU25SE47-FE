import React, { memo } from 'react'
import { Switch, Tooltip } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from '../../contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

const ThemeSwitcher = memo(() => {
  const { isDarkMode, toggleTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <Tooltip title={t('theme.switch')} placement="bottom">
      <div className="flex items-center space-x-2">
        {/* <SunOutlined className="text-yellow-500" /> */}
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          className="theme-transition"
        />
        {/* <MoonOutlined className="text-blue-500" /> */}
      </div>
    </Tooltip>
  )
})

ThemeSwitcher.displayName = 'ThemeSwitcher'

export default ThemeSwitcher

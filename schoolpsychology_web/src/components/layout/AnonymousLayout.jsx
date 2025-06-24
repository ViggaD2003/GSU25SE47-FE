import React from 'react'
import { Layout } from 'antd'

import { Outlet } from 'react-router-dom'
import { ThemeSwitcher, LanguageSwitcher } from '../common'
import { useTheme } from '../../contexts/ThemeContext'

const { Content } = Layout

const AnonymousLayoutComponent = () => {
  const { isDarkMode } = useTheme()

  return (
    <Layout className="h-screen w-screen">
      <div className="flex h-full w-full">
        {/* Left side - Content */}
        <Content
          className="px-16 py-14 backdrop-blur-sm border-r w-1/2"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            borderColor: isDarkMode ? '#374151' : '#e5e7eb',
          }}
        >
          <div className="flex items-center gap-5 mb-10">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
          <Outlet />
        </Content>

        {/* Right side - Logo */}
        <div
          className="flex-2/3 flex items-center justify-center"
          style={{
            backgroundColor: isDarkMode ? '#111827' : '#f3f4f6',
            color: '#2BA56A',
          }}
        >
          <div className="text-center">
            <img
              src="/logo.svg"
              alt="Logo"
              className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-2xl"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-md">
                MindfulCare
              </h1>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AnonymousLayoutComponent

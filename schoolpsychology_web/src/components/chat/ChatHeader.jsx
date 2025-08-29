import { UserOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ChatHeader = ({ student, caseId: _caseId = null, t }) => {
  const { isDarkMode } = useTheme()
  const online = student?.isOnline

  return (
    <div
      className={`flex-1 p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
          >
            <UserOutlined
              className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
            />
          </div>
        </div>
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
          >
            {student.email || t('chat.unknownUser')}{' '}
          </h3>
          <div
            className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <span
              className={
                online
                  ? 'text-green-500'
                  : isDarkMode
                    ? 'text-gray-500'
                    : 'text-gray-400'
              }
            >
              {online ? t('chat.online') : t('chat.offline')}
            </span>
            <span>•</span>
            <span>{dayjs().format('DD/MM/YYYY HH:mm')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader

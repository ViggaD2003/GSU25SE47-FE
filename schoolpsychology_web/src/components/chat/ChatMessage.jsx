import React from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ChatMessage = ({ message, isOwn, t }) => {
  const { isDarkMode } = useTheme()
  const formatTime = timeString => {
    if (!timeString) return ''
    try {
      // Nếu đã có Z thì parse trực tiếp
      const date = new Date(timeString)

      if (isNaN(date.getTime())) return timeString

      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch (e) {
      console.error('Invalid timestamp:', timeString, e)
      return timeString
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwn
            ? 'bg-blue-500 text-white rounded-br-none'
            : `border rounded-bl-none ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-200 border-gray-600'
                  : 'bg-white text-gray-800 border-gray-200'
              }`
        }`}
      >
        <p className="text-sm">{message?.message || t('chat.noMessage')}</p>
        <div
          className={`text-xs mt-1 ${
            isOwn
              ? 'text-blue-100'
              : isDarkMode
                ? 'text-gray-400'
                : 'text-gray-500'
          }`}
        >
          {formatTime(message?.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

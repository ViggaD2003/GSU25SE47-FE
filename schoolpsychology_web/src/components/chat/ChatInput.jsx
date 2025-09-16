import React, { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const ChatInput = ({
  onSendMessage,
  t,
  isConnectionReady = false,
  disabled,
}) => {
  const { isDarkMode } = useTheme()
  const [message, setMessage] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <div
      className={`w-full p-4 border-t ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <form className="flex items-start space-x-3" onSubmit={handleSubmit}>
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={e => {
              setMessage(e.target.value)
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.shiftKey) {
                setMessage(message + '\n')
              } else if (e.key === 'Enter') {
                handleSubmit(e)
              }
            }}
            placeholder={t('chat.sendMessagePlaceholder')}
            className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              isDarkMode
                ? 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-400'
                : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
            } ${!isConnectionReady || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            rows={1}
            disabled={!isConnectionReady || disabled}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || !isConnectionReady || disabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
      <div
        className={`mt-2 text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
      >
        {t('chat.hint')}
      </div>
    </div>
  )
}

export default ChatInput

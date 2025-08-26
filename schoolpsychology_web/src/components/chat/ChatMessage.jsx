import React from 'react'

const ChatMessage = ({ message, isOwn }) => {
  const formatTime = timeString => {
    if (!timeString) return ''
    try {
      // Nếu đã có Z thì parse trực tiếp
      const date = timeString.endsWith('Z')
        ? new Date(timeString)
        : new Date(timeString + 'Z')

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
            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message?.content}</p>
        <div
          className={`text-xs mt-1 ${
            isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {formatTime(message?.timestamp)}
        </div>
      </div>
    </div>
  )
}

export default ChatMessage

import dayjs from 'dayjs'
import React from 'react'

const ChatHeader = ({ student, caseId: _caseId = null, t }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl">
            {student.avatar}
          </div>
          {student.online && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {student.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span
              className={student.online ? 'text-green-500' : 'text-gray-400'}
            >
              {student.online ? t('chat.online') : t('chat.offline')}
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

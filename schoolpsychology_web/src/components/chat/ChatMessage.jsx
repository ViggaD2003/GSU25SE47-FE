import React from 'react';

const ChatMessage = ({ message, isOwn }) => {
    const formatTime = (date) => {
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn
                ? 'bg-blue-500 text-white rounded-br-none'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-bl-none'
                }`}>
                <p className="text-sm">{message.text}</p>
                <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                    {formatTime(message.timestamp)}
                </div>
            </div>
        </div>
    );
};

export default ChatMessage; 
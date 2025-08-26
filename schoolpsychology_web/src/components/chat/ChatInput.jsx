import React, { useState } from 'react';

const ChatInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        console.log("Submitting message:", message);
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
            <form onSubmit={(e) => handleSubmit(e)} className="flex items-end space-x-3">
                <div className="flex-1">
                    <textarea
                        value={message}
                        onChange={(e) => {
                            console.log(e.target.value);
                         setMessage(e.target.value)
                        }
                    }
                        placeholder="Nhập tin nhắn..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                </button>
            </form>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Nhấn Enter để gửi, Shift + Enter để xuống dòng
            </div>
        </div>
    );
};

export default ChatInput; 
import React from 'react';
import ChatInterface from '../../components/chat/ChatInterface';

const ChatManagement = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quản lý Chat</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Giao tiếp với học sinh thông qua hệ thống chat
                        </p>
                    </div>
                </div>
            </div>
            <ChatInterface />
        </div>
    );
};

export default ChatManagement; 
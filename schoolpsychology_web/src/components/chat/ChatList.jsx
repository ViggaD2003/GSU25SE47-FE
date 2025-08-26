import React from 'react';

const ChatList = ({ students, selectedStudent, onStudentSelect }) => {
    return (
        <div className="flex-1 overflow-y-auto">
            {students.map((student) => (
                <div
                    key={student.id}
                    onClick={() => onStudentSelect(student)}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedStudent?.id === student.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''
                        }`}
                >
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl">
                                {student.avatar}
                            </div>
                            {student.online && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {student.name}
                                </h4>
                                {student.unread > 0 && (
                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                        {student.unread}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {student.lastMessage}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatList; 
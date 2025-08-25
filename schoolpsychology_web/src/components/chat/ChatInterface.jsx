import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatList from './ChatList';
import TypingIndicator from './TypingIndicator';

const ChatInterface = () => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [students, setStudents] = useState([
        { id: 1, name: 'Nguyễn Văn A', avatar: '👨‍🎓', lastMessage: 'Em chào cô ạ', unread: 2, online: true },
        { id: 2, name: 'Trần Thị B', avatar: '👩‍🎓', lastMessage: 'Em muốn hỏi về bài tập', unread: 0, online: false },
        { id: 3, name: 'Lê Văn C', avatar: '👨‍🎓', lastMessage: 'Cảm ơn cô đã giúp em', unread: 1, online: true },
    ]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (message) => {
        if (message.trim() && selectedStudent) {
            const newMessage = {
                id: Date.now(),
                text: message,
                sender: 'counselor',
                timestamp: new Date(),
                studentId: selectedStudent.id
            };
            setMessages(prev => [...prev, newMessage]);

            // Update last message in students list
            setStudents(prev => prev.map(student =>
                student.id === selectedStudent.id
                    ? { ...student, lastMessage: message }
                    : student
            ));
        }
    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        // Load messages for selected student (in real app, this would fetch from API)
        setMessages([
            {
                id: 1,
                text: 'Em chào cô ạ',
                sender: 'student',
                timestamp: new Date(Date.now() - 60000),
                studentId: student.id
            },
            {
                id: 2,
                text: 'Chào em, cô có thể giúp gì cho em không?',
                sender: 'counselor',
                timestamp: new Date(Date.now() - 30000),
                studentId: student.id
            }
        ]);

        // Simulate student typing
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Left sidebar - Student list */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Danh sách học sinh</h2>
                </div>
                <ChatList
                    students={students}
                    selectedStudent={selectedStudent}
                    onStudentSelect={handleStudentSelect}
                />
            </div>

            {/* Right side - Chat area */}
            <div className="flex-1 flex flex-col">
                {selectedStudent ? (
                    <>
                        <ChatHeader student={selectedStudent} />
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                            {messages.map((message) => (
                                <ChatMessage
                                    key={message.id}
                                    message={message}
                                    isOwn={message.sender === 'counselor'}
                                />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>
                        <ChatInput onSendMessage={handleSendMessage} />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-xl font-medium mb-2 text-gray-700 dark:text-gray-200">Chọn học sinh để bắt đầu chat</h3>
                            <p className="text-sm">Chọn một học sinh từ danh sách bên trái để bắt đầu cuộc trò chuyện</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatInterface; 
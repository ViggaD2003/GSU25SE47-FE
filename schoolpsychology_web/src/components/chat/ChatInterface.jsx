import React, { useState, useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatList from './ChatList';
import TypingIndicator from './TypingIndicator';

const ChatInterface = ({ embedded = false, caseId = null }) => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [students, setStudents] = useState([
        { id: 1, name: 'Nguyễn Văn A', avatar: '👨‍🎓', lastMessage: 'Em chào cô ạ', unread: 2, online: true },
        { id: 2, name: 'Trần Thị B', avatar: '👩‍🎓', lastMessage: 'Em muốn hỏi về bài tập', unread: 0, online: false },
        { id: 3, name: 'Lê Văn C', avatar: '👨‍🎓', lastMessage: 'Cảm ơn cô đã giúp em', unread: 1, online: true },
    ]);
    // Room selection for embedded mode: 'student' | 'parent'
    const [selectedRoom, setSelectedRoom] = useState('student');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (message) => {
        if (!message.trim()) return;

        if (embedded) {
            // Send to current room in embedded mode
            const newMessage = {
                id: Date.now(),
                text: message,
                sender: 'counselor',
                timestamp: new Date(),
                roomType: selectedRoom,
                caseId: caseId,
            };
            setMessages(prev => [...prev, newMessage]);
            return;
        }

        if (selectedStudent) {
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
        // Load messages for selected student (in real app, fetch from API)
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

    // Seed demo messages when switching rooms in embedded mode
    useEffect(() => {
        if (!embedded) return;
        // Simple seed per room if there are no messages yet for that room
        const hasRoomMessages = messages.some(m => m.roomType === selectedRoom);
        if (!hasRoomMessages) {
            const seed = selectedRoom === 'student'
                ? [
                    { id: Date.now() - 20000, text: 'Em chào cô ạ', sender: 'student', timestamp: new Date(Date.now() - 20000), roomType: 'student', caseId },
                    { id: Date.now() - 10000, text: 'Chào em, cô sẵn sàng hỗ trợ.', sender: 'counselor', timestamp: new Date(Date.now() - 10000), roomType: 'student', caseId },
                ]
                : [
                    { id: Date.now() - 25000, text: 'Chào cô, tôi là phụ huynh.', sender: 'parent', timestamp: new Date(Date.now() - 25000), roomType: 'parent', caseId },
                    { id: Date.now() - 12000, text: 'Chào anh/chị, tôi có thể hỗ trợ gì ạ?', sender: 'counselor', timestamp: new Date(Date.now() - 12000), roomType: 'parent', caseId },
                ];
            setMessages(prev => [...prev, ...seed]);
            // Simulate typing of the other participant
            setIsTyping(true);
            const to = setTimeout(() => setIsTyping(false), 2000);
            return () => clearTimeout(to);
        }
    }, [embedded, selectedRoom, caseId, messages]);

    // Auto-select first student when not embedded
    useEffect(() => {
        if (!embedded && !selectedStudent && students.length > 0) {
            setSelectedStudent(students[0]);
        }
    }, [embedded, selectedStudent, students]);

    // Prepare participant for header
    const currentParticipant = embedded
        ? (selectedRoom === 'student'
            ? { id: 'room-student', name: 'Học sinh', avatar: '👨‍🎓', online: true }
            : { id: 'room-parent', name: 'Phụ huynh', avatar: '👪', online: true })
        : selectedStudent;

    // Filter messages for display
    const visibleMessages = embedded
        ? messages.filter(m => m.roomType === selectedRoom)
        : messages;

    return (
        <div className={`flex ${embedded ? 'h-full' : 'h-screen'} bg-gray-50 dark:bg-gray-900`}>
            {/* Left sidebar */}
            {embedded ? (
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Phòng chat</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {/* Student room */}
                        <div
                            onClick={() => setSelectedRoom('student')}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRoom === 'student' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl">👨‍🎓</div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Học sinh</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">Trao đổi với học sinh</p>
                                </div>
                            </div>
                        </div>
                        {/* Parent room */}
                        <div
                            onClick={() => setSelectedRoom('parent')}
                            className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedRoom === 'parent' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-2xl">👪</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Phụ huynh</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">Trao đổi với phụ huynh</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
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
            )}

            {/* Right side - Chat area */}
            <div className="flex-1 flex flex-col">
                {currentParticipant ? (
                    <>
                        <ChatHeader student={currentParticipant} caseId={caseId} />
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                            {visibleMessages.map((message) => (
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
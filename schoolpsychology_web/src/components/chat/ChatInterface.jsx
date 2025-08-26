import React, { useState, useEffect } from 'react'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import api from '@/services/api'
import { useWebSocket } from '@/contexts/WebSocketContext'

const ChatInterface = ({ caseId }) => {
  const { subscribeToTopic, sendMessage2 } = useWebSocket()
  const [messages, setMessages] = useState([])
  const [roomChatIds, setRoomChatIds] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)

  // Fetch chat rooms
  const fetchRoomChat = async () => {
    try {
      const res = await api.get(`/api/v1/chat/chat-room?caseId=${caseId}`)
      console.log('data', res.data)
      setRoomChatIds(res.data || [])
      if (res.data.length > 0) {
        setSelectedRoom(res.data[0]) // chọn phòng đầu tiên
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err)
    }
  }

  // Load phòng chat khi có caseId
  useEffect(() => {
    if (!caseId) return
    fetchRoomChat()
  }, [caseId])

  // Subscribe WebSocket khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return

    const unsubscribe = subscribeToTopic(`/topic/chat/${selectedRoom}`, msg => {
      try {
        const payload = JSON.parse(msg.body)
        setMessages(prev => [...prev, payload])
      } catch (err) {
        console.error('Invalid WS message:', msg, err)
      }
    })

    // cleanup
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [selectedRoom, subscribeToTopic])

  // Gửi tin nhắn
  const handleSendMessage = text => {
    console.log(text + ' to ' + selectedRoom)

    if (!text.trim() || !selectedRoom) return

    const newMessage = {
      sender: 'counselor',
      content: text,
      timestamp: new Date().toISOString(),
    }

    sendMessage2(selectedRoom, newMessage)
    setMessages(prev => [...prev, newMessage]) // hiển thị ngay
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: Danh sách phòng */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Phòng chat
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {roomChatIds.map(roomId => (
            <div
              key={roomId}
              onClick={() => setSelectedRoom(roomId)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                ${selectedRoom === roomId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg">
                  💬
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Phòng {roomId}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Trao đổi trong phòng này
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <ChatHeader
              student={{
                name: `Phòng ${selectedRoom}`,
                avatar: '💬',
                online: true,
              }}
              caseId={caseId}
            />
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map((m, idx) => (
                <ChatMessage
                  key={idx}
                  message={m}
                  isOwn={m.sender === 'counselor'}
                />
              ))}
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Chọn một phòng để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface

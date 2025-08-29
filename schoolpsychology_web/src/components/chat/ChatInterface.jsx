import React, { useState, useEffect, useRef, useCallback } from 'react'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import api from '@/services/api'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useAuth } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

const ChatInterface = ({ caseId }) => {
  const { subscribeToTopic, sendMessage2, onlineUsers, isConnectionReady } =
    useWebSocket()
  const [messages, setMessages] = useState([])
  const [roomChatIds, setRoomChatIds] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const { user } = useAuth()
  const { t } = useTranslation()
  const chatRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const { isDarkMode } = useTheme()

  const fetchChatMessages = async roomId => {
    try {
      setIsLoading(true)
      const chatRoomId = roomId || selectedRoom.id
      const res = await api.get(
        `/api/v1/chat/chat-message?chatRoomId=${chatRoomId}`
      )
      setMessages(res.data || [])
    } catch (err) {
      console.error('Error fetching chat messages:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch chat rooms
  const fetchRoomChat = useCallback(async () => {
    try {
      const res = await api.get(`/api/v1/chat/chat-room?caseId=${caseId}`)
      if (res.data.length > 0) {
        console.log('Fetched chat rooms:', res.data)

        setRoomChatIds(res.data || [])

        setSelectedRoom(res.data[0]) // chọn phòng đầu tiên
        await fetchChatMessages(res.data[0].id)
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err)
    }
  }, [caseId])

  // Load phòng chat khi có caseId
  useEffect(() => {
    if (!caseId) return
    fetchRoomChat()
  }, [caseId])

  // Subscribe WebSocket khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return

    console.log(
      '[WebSocket] subscribe to topic',
      `/topic/chat/${selectedRoom.id}`
    )

    const unsubscribe = subscribeToTopic(
      `/topic/chat/${selectedRoom.id}`,
      msg => {
        if (!msg || !msg.sender) return
        if (msg.sender === user.email) return

        setMessages(prev => [...prev, { ...msg, timestamp: new Date() }])
      }
    )

    return () => {
      console.log(
        '[WebSocket] unsubscribe from topic',
        `/topic/chat/${selectedRoom.id}`
      )
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [selectedRoom?.id, user.email, subscribeToTopic])

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        handleScrollToBottom()
      }, 100)
    }
  }, [messages])

  const handleScrollToBottom = () => {
    if (chatRef?.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }

  // Gửi tin nhắn
  const handleSendMessage = async text => {
    console.log(text + ' to ' + selectedRoom)

    if (!text.trim() || !selectedRoom) return

    const newMessage = {
      sender: user.email,
      message: text,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, newMessage]) // hiển thị ngay

    sendMessage2('CHAT', selectedRoom.id, newMessage)

    // Scroll to bottom after message is added
    setTimeout(() => {
      handleScrollToBottom()
    }, 100)
  }

  const handleSelectRoom = async roomId => {
    setSelectedRoom(roomChatIds.find(r => r.id === roomId))
    setMessages([])
    await fetchChatMessages(roomId)
  }

  return (
    <div
      className={`flex w-full h-full ${isDarkMode ? 'bg-gray-900' : ' bg-gray-50'}`}
    >
      {/* Sidebar: Danh sách phòng */}
      <div
        className={`min-w-40 max-w-72 border-r flex flex-col  ${isDarkMode ? 'text-gray-200 border-gray-700 bg-gray-800' : 'bg-white text-gray-800  border-gray-200'}`}
      >
        <div
          className={`p-4 border-b ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className="text-base font-semibold">{t('chat.room')}</h2>
        </div>
        <div className="overflow-y-auto">
          {roomChatIds.map(room => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`p-4 cursor-pointer transition-colors 
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                ${
                  selectedRoom.id === room.id
                    ? isDarkMode
                      ? 'bg-blue-900/20 border-l-4 border-l-blue-500'
                      : 'bg-blue-50 border-l-4 border-l-blue-500'
                    : ''
                }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}
                >
                  💬
                </div>
                <div>
                  <h4
                    className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                  >
                    {t('chat.room')} {room.roleRoom}
                  </h4>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {t('chat.roomDescription')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col h-full w-full">
        {selectedRoom ? (
          <>
            <ChatHeader
              t={t}
              student={{
                ...selectedRoom,
                isOnline: Array(...(onlineUsers || [])).includes(
                  selectedRoom.email
                ),
              }}
              caseId={caseId}
            />
            <div
              ref={chatRef}
              className={`w-full h-full overflow-y-auto overflow-x-hidden p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
            >
              {isLoading || !isConnectionReady ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <ChatMessage
                    t={t}
                    key={idx}
                    message={m}
                    isOwn={m.sender === user.email}
                  />
                ))
              )}
            </div>
            <ChatInput
              onSendMessage={handleSendMessage}
              t={t}
              isConnectionReady={isConnectionReady}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('chat.selectRoom')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface

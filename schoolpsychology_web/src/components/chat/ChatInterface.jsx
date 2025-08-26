import React, { useState, useEffect, useRef, useCallback } from 'react'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import api from '@/services/api'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useAuth } from '@/hooks'
import { useTranslation } from 'react-i18next'

const ChatInterface = ({ caseId }) => {
  const { subscribeToTopic, sendMessage2 } = useWebSocket()
  const [messages, setMessages] = useState([])
  const [roomChatIds, setRoomChatIds] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const { user } = useAuth()
  const { t } = useTranslation()
  const chatRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchChatMessages = async roomId => {
    try {
      setIsLoading(true)
      const chatRoomId = roomId || selectedRoom
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
        setRoomChatIds(res.data || [])
        setSelectedRoom(res.data[0]) // chọn phòng đầu tiên
        await fetchChatMessages(res.data[0])
      }
    } catch (err) {
      console.error('Error fetching chat rooms:', err)
    }
  }, [caseId])

  // Load phòng chat khi có caseId
  useEffect(() => {
    if (!caseId) return
    fetchRoomChat()
  }, [caseId, fetchRoomChat])

  // Subscribe WebSocket khi chọn phòng
  useEffect(() => {
    if (!selectedRoom) return

    const unsubscribe = subscribeToTopic(`/topic/chat/${selectedRoom}`, msg => {
      try {
        if (msg.sender !== user.email) {
          setMessages(prev => [...prev, msg])
        }
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
  }, [selectedRoom, subscribeToTopic, user.email])

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
      timestamp: new Date().toISOString(),
    }

    await sendMessage2(selectedRoom, newMessage)
    setMessages(prev => [...prev, newMessage]) // hiển thị ngay

    // Scroll to bottom after message is added
    setTimeout(() => {
      handleScrollToBottom()
    }, 100)
  }

  const handleSelectRoom = async roomId => {
    setSelectedRoom(roomId)
    setMessages([])
    await fetchChatMessages(roomId)
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar: Danh sách phòng */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            {t('chat.room')}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {roomChatIds.map(roomId => (
            <div
              key={roomId}
              onClick={() => handleSelectRoom(roomId)}
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                ${selectedRoom === roomId ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg">
                  💬
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('chat.room')} {roomId}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('chat.roomDescription')}
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
              t={t}
              student={{
                name: `${t('chat.room')} ${selectedRoom}`,
                avatar: '💬',
                online: true,
              }}
              caseId={caseId}
            />
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
            >
              {isLoading ? (
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
            <ChatInput onSendMessage={handleSendMessage} t={t} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">{t('chat.selectRoom')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatInterface

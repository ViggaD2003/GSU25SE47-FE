import React, { useState, useEffect, useRef, useCallback } from 'react'
import ChatHeader from './ChatHeader'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import api from '@/services/api'
import { useWebSocket } from '@/contexts/WebSocketContext'
import { useAuth } from '@/hooks'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import dayjs from 'dayjs'

const ChatInterface = ({ caseId }) => {
  const { subscribeToTopic, sendMessage2 } = useWebSocket()
  const [messages, setMessages] = useState([])
  const [roomChatIds, setRoomChatIds] = useState([])
  const [selectedRoom, setSelectedRoom] = useState(null)
  const { user } = useAuth()
  const { t } = useTranslation()
  const chatRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
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
        res.data.forEach(room => {
          if (room && room.id) {
            sendMessage2(room.id, {
              sender: user.email,
              timestamp: new Date(),
              messageType: 'JOIN',
            })
          }
        })
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
  }, [caseId, fetchRoomChat])

  const subcribe = useCallback(() => {
    if (!selectedRoom) return

    const unsubscribe = subscribeToTopic(
      `/topic/chat/${selectedRoom.id}`,
      msg => {
        try {
          if (!msg || !msg.sender) return

          if (msg.sender === user.email) return // bỏ qua tin nhắn của chính mình

          if (msg.type === 'CHAT') {
            setMessages(prev => [...prev, msg])
          }

          if (['JOIN', 'LEAVE'].includes(msg.type)) {
            setActiveUsers(prev => {
              const filterUser = prev.find(u => u.sender === msg.sender)

              if (filterUser) {
                filterUser.type = msg.type
                return [
                  ...prev.filter(u => u.sender !== msg.sender),
                  filterUser,
                ]
              }
              return [...prev, msg]
            })
          }
        } catch (err) {
          console.error('Invalid WS message:', msg, err)
        }
      }
    )

    // cleanup
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [selectedRoom, subscribeToTopic, user.email])

  // Subscribe WebSocket khi chọn phòng
  useEffect(() => {
    subcribe()
  }, [subcribe])

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
      timestamp: dayjs(),
    }

    await sendMessage2(selectedRoom.id, newMessage)
    setMessages(prev => [...prev, newMessage]) // hiển thị ngay

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
      className={`flex h-full ${isDarkMode ? 'bg-gray-900' : ' bg-gray-50'}`}
    >
      {/* Sidebar: Danh sách phòng */}
      <div
        className={`w-64  border-r flex flex-col  ${isDarkMode ? 'text-gray-200 border-gray-700 bg-gray-800' : 'bg-white text-gray-800  border-gray-200'}`}
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
        <div className="flex-1 overflow-y-auto">
          {roomChatIds.map(room => (
            <div
              key={room.id}
              onClick={() => handleSelectRoom(room.id)}
              className={`p-4 cursor-pointer transition-colors 
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                ${
                  selectedRoom === room.id
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
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <ChatHeader
              t={t}
              student={{
                ...selectedRoom,
                ...activeUsers.find(u => u.sender === selectedRoom.email),
              }}
              caseId={caseId}
            />
            <div
              ref={chatRef}
              className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}
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

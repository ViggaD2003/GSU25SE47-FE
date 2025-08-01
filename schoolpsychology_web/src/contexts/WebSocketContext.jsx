import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import Stomp from 'stompjs'

const WebSocketContext = createContext(null)

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const jwtToken = localStorage.getItem('token')
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  const stompClientRef = useRef(null)

  // Định nghĩa subscribeToTopic trước khi sử dụng
  const subscribeToTopic = useCallback(
    (topic, callback) => {
      if (stompClientRef.current && isConnected) {
        const subscription = stompClientRef.current.subscribe(
          topic,
          message => {
            try {
              const body = JSON.parse(message.body)
              callback(body)
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error)
            }
          }
        )
        return subscription
      }
      return null
    },
    [isConnected]
  )

  const connectWebSocket = useCallback(() => {
    if (!jwtToken) {
      console.error('[WebSocket] No JWT token available')
      return
    }

    try {
      const socket = new WebSocket('ws://localhost:8080/ws')
      const stompClient = Stomp.over(socket)

      // Tắt debug để giảm log
      stompClient.debug = null

      stompClient.connect(
        {
          Authorization: `Bearer ${jwtToken}`,
        },
        () => {
          console.log('[WebSocket] Connected successfully')
          stompClientRef.current = stompClient
          setIsConnected(true)
        },
        error => {
          console.error('[WebSocket] Connection error:', error)
          setIsConnected(false)
        }
      )
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error)
      setIsConnected(false)
    }
  }, [jwtToken])

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.disconnect(() => {
        console.log('[WebSocket] Disconnected')
        setIsConnected(false)
        stompClientRef.current = null
      })
    }
  }, [])

  const sendMessage = useCallback(
    (
      destination = '/app/send',
      title = 'Hello from client!',
      to = user?.email || 'teacher@school.com'
    ) => {
      if (stompClientRef.current && isConnected) {
        try {
          const body = {
            title,
            content: `${user?.fullName || 'Teacher'} sent you a message`,
            username: to || user?.email || 'teacher@school.com',
          }
          stompClientRef.current.send(destination, {}, JSON.stringify(body))
          console.log('[WebSocket] Message sent to:', destination)
        } catch (error) {
          console.error('[WebSocket] Error sending message:', error)
        }
      } else {
        console.error('[WebSocket] Not connected')
      }
    },
    [isConnected]
  )

  // Kết nối WebSocket khi user đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user && jwtToken) {
      connectWebSocket()
    }

    return () => {
      disconnectWebSocket()
    }
  }, [isAuthenticated, user, jwtToken, connectWebSocket, disconnectWebSocket])

  // Subscribe to notifications khi đã kết nối
  useEffect(() => {
    if (isConnected) {
      const subscription = subscribeToTopic(
        '/user/queue/notifications',
        data => {
          console.log('📩 Thông báo từ server:', data)

          // Thêm timestamp hiện tại cho notification mới với độ chính xác cao
          const currentTime = new Date()

          const notificationWithTimestamp = {
            ...data,
            createdAt: currentTime.toISOString(),
            updatedAt: currentTime.toISOString(),
          }

          setNotifications(prev => [notificationWithTimestamp, ...prev])
        }
      )

      return () => {
        if (subscription) {
          subscription.unsubscribe()
          console.log('🛑 Unsubscribed from /user/queue/notifications')
        }
      }
    }
  }, [isConnected, subscribeToTopic])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const markNotificationAsRead = useCallback(notificationId => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length
  }, [notifications])

  return (
    <WebSocketContext.Provider
      value={{
        stompClient: stompClientRef.current,
        isConnected,
        sendMessage,
        subscribeToTopic,
        notifications,
        clearNotifications,
        markNotificationAsRead,
        getUnreadCount,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

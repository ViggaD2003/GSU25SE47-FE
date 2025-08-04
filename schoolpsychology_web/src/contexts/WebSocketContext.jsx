import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
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
  const [isConnecting, setIsConnecting] = useState(false)

  const stompClientRef = useRef(null)
  const socketRef = useRef(null)
  const subscriptionRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const userRef = useRef(user)

  // Cập nhật userRef khi user thay đổi
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Kiểm tra trạng thái kết nối an toàn
  const isConnectionReady = useCallback(() => {
    return (
      stompClientRef.current &&
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      isConnected
    )
  }, [isConnected])

  // Hàm cleanup an toàn - không cần dependencies
  const safeCleanup = useCallback(() => {
    // Clear timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Unsubscribe
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe()
      } catch (error) {
        console.warn('[WebSocket] Error unsubscribing:', error)
      }
      subscriptionRef.current = null
    }

    // Disconnect STOMP client
    if (stompClientRef.current) {
      try {
        stompClientRef.current.disconnect(() => {
          console.log('[WebSocket] STOMP client disconnected')
        })
      } catch (error) {
        console.warn('[WebSocket] Error disconnecting STOMP client:', error)
      }
      stompClientRef.current = null
    }

    // Close WebSocket
    if (socketRef.current) {
      try {
        socketRef.current.close()
      } catch (error) {
        console.warn('[WebSocket] Error closing WebSocket:', error)
      }
      socketRef.current = null
    }

    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  // Định nghĩa subscribeToTopic với kiểm tra trạng thái
  const subscribeToTopic = useCallback(
    (topic, callback) => {
      if (!isConnectionReady()) {
        console.warn('[WebSocket] Cannot subscribe: connection not ready')
        return null
      }

      try {
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
      } catch (error) {
        console.error('[WebSocket] Error subscribing to topic:', error)
        return null
      }
    },
    [isConnectionReady]
  )

  const connectWebSocket = useCallback(() => {
    if (!jwtToken) {
      console.error('[WebSocket] No JWT token available')
      return
    }

    if (isConnecting || isConnected) {
      console.log('[WebSocket] Already connecting or connected')
      return
    }

    setIsConnecting(true)

    try {
      // Cleanup trước khi tạo kết nối mới
      safeCleanup()

      const socket = new WebSocket('ws://localhost:8080/ws')
      socketRef.current = socket

      const stompClient = Stomp.over(socket)
      stompClient.debug = null

      // Xử lý sự kiện WebSocket
      socket.onopen = () => {
        console.log('[WebSocket] WebSocket opened')
      }

      socket.onclose = event => {
        console.log('[WebSocket] WebSocket closed:', event.code, event.reason)
        setIsConnected(false)
        setIsConnecting(false)
      }

      socket.onerror = error => {
        console.error('[WebSocket] WebSocket error:', error)
        setIsConnected(false)
        setIsConnecting(false)
      }

      // Kết nối STOMP
      stompClient.connect(
        {
          Authorization: `Bearer ${jwtToken}`,
        },
        () => {
          console.log('[WebSocket] STOMP connected successfully')
          stompClientRef.current = stompClient
          setIsConnected(true)
          setIsConnecting(false)
        },
        error => {
          console.error('[WebSocket] STOMP connection error:', error)
          setIsConnected(false)
          setIsConnecting(false)
          safeCleanup()
        }
      )
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error)
      setIsConnected(false)
      setIsConnecting(false)
      safeCleanup()
    }
  }, [jwtToken, isConnecting, isConnected, safeCleanup])

  const sendMessage = useCallback(
    ({
      destination = '/app/send',
      title = 'Hello from client!',
      username = 'teacher@school.com',
      content = `${userRef.current?.fullName || 'User'} sent you a message`,
    }) => {
      if (!isConnectionReady()) {
        console.error('[WebSocket] Cannot send message: not connected')
        throw new Error('Not connected')
      }

      try {
        const body = {
          title,
          content,
          username,
        }
        stompClientRef.current.send(destination, {}, JSON.stringify(body))
        console.log('[WebSocket] Message sent to:', destination)
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error)
        throw new Error('Failed to send message')
      }
    },
    [isConnectionReady]
  )

  // Kết nối WebSocket khi user đã đăng nhập - tối ưu dependencies
  useEffect(() => {
    if (isAuthenticated && user && jwtToken) {
      connectWebSocket()
    } else {
      safeCleanup()
    }

    return () => {
      safeCleanup()
    }
  }, [isAuthenticated, user?.id, jwtToken]) // Chỉ depend vào user.id thay vì toàn bộ user object

  // Subscribe to notifications khi đã kết nối - tối ưu dependencies
  useEffect(() => {
    if (isConnected && isConnectionReady()) {
      subscriptionRef.current = subscribeToTopic(
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
        if (subscriptionRef.current) {
          try {
            subscriptionRef.current.unsubscribe()
            console.log('🛑 Unsubscribed from /user/queue/notifications')
          } catch (error) {
            console.warn('[WebSocket] Error unsubscribing:', error)
          }
          subscriptionRef.current = null
        }
      }
    }
  }, [isConnected]) // Chỉ depend vào isConnected

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

  // Memoize context value để tránh re-render không cần thiết
  const contextValue = useMemo(
    () => ({
      stompClient: stompClientRef.current,
      isConnected,
      isConnecting,
      sendMessage,
      subscribeToTopic,
      notifications,
      clearNotifications,
      markNotificationAsRead,
      getUnreadCount,
      setNotifications,
    }),
    [
      isConnected,
      isConnecting,
      sendMessage,
      subscribeToTopic,
      notifications,
      clearNotifications,
      markNotificationAsRead,
      getUnreadCount,
    ]
  )

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

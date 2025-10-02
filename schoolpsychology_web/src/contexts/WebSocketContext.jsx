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
import { getToken, isTokenExpired } from '@/utils'
import { useDispatch } from 'react-redux'
import { initializeAuthFromStorage } from '@/store/actions'

const WebSocketContext = createContext(null)

export const useWebSocket = () => useContext(WebSocketContext)

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  // Get token from auth context instead of localStorage directly
  const jwtToken = getToken()
  const [notifications, setNotifications] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  const stompClientRef = useRef(null)
  const socketRef = useRef(null)
  const subscriptionRef = useRef(null)
  const subscriptionOnlineUsersRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const heartbeatIntervalRef = useRef(null)
  const userRef = useRef(user)

  const dispatch = useDispatch()

  // Cập nhật userRef khi user thay đổi
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Kiểm tra trạng thái kết nối an toàn
  const isConnectionReady = useCallback(() => {
    return stompClientRef?.current && user && isAuthenticated
  }, [stompClientRef, user, isAuthenticated])

  // Hàm cleanup an toàn - không cần dependencies
  const safeCleanup = useCallback(() => {
    // Clear heartbeat interval
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
      heartbeatIntervalRef.current = null
    }

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

    if (subscriptionOnlineUsersRef.current) {
      try {
        subscriptionOnlineUsersRef.current.unsubscribe()
      } catch (error) {
        console.warn('[WebSocket] Error unsubscribing:', error)
      }
      subscriptionOnlineUsersRef.current = null
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
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }
    heartbeatIntervalRef.current = setInterval(() => {
      if (isConnectionReady()) {
        try {
          sendMessage({
            title: 'Heartbeat',
            content: 'Heartbeat',
            username: '',
            notificationType: 'PING',
            relatedEntityId: '0',
          })
          // console.log('[WebSocket] Heartbeat PING sent')
        } catch (error) {
          console.warn('[WebSocket] Heartbeat failed:', error)
          safeCleanup()
        }
      } else {
        console.warn('[WebSocket] Connection not ready for heartbeat')
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
    }, 30000) // gửi mỗi 30 giây

    console.log('[WebSocket] Heartbeat started')
  }, [isConnectionReady, safeCleanup])

  const subscribeToTopic = useCallback(
    (topic, callback) => {
      if (!isConnectionReady()) {
        console.warn('[WebSocket] Cannot subscribe: connection not ready')
        return null
      }

      try {
        const subscription = stompClientRef.current?.subscribe(
          topic,
          message => {
            try {
              console.log('[WebSocket] 🔍 message from', topic)
              const body = JSON.parse(message.body)
              callback(body)
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error)
            }
          }
        )

        // ✅ Trả về một hàm để hủy đăng ký
        return () => {
          if (subscription) {
            console.log('[WebSocket] ❌ unsubscribe from', topic)
            subscription.unsubscribe()
          }
        }
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

    if (isTokenExpired(jwtToken)) {
      console.error('[WebSocket] Token expired')
      return
    }

    if (isConnecting || isConnected) {
      console.log('[WebSocket] Already connecting or connected')
      return
    }

    setIsConnecting(true)

    try {
      // Cleanup trước khi tạo kết nối mới
      Promise.all([safeCleanup()]).then(() => {
        console.log('[WebSocket] Cleanup completed')
      })

      const socket = new WebSocket(
        import.meta.env.VITE_WS_URL + `?token=${jwtToken}`
        // "ws://localhost:8080/ws" + `?token=${jwtToken}`
      )
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
        safeCleanup()
      }

      // Kết nối STOMP
      stompClient.connect(
        {
          Authorization: `Bearer ${jwtToken}`,
          heartbeat: {
            outgoing: 30000,
            incoming: 30000,
          },
        },
        () => {
          console.log('[WebSocket] STOMP connected successfully')
          stompClientRef.current = stompClient
          setIsConnected(true)
          setIsConnecting(false)

          // Bắt đầu heartbeat để duy trì kết nối
          startHeartbeat()

          // send message to add user
          // Promise.all([sendMessage2('ADD_USER')]).then(() => {
          //   stompClient.subscribe(`/topic/onlineUsers`, msg => {
          //     const data = JSON.parse(msg.body)
          //     console.log('[WebSocket] Online users:', data)
          //     setOnlineUsers(data || [])
          //   })
          // })
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
  }, [jwtToken, isConnecting, isConnected, safeCleanup, startHeartbeat])

  const sendMessage = useCallback(
    (
      body = {
        title: 'Hello from client!',
        content: `${userRef.current?.fullName || 'User'} sent you a message`,
        // username: userRef.current?.email,
        username: 'unguyen8666@gmail.com',
        notificationType: 'TEST_MESSAGE',
        relatedEntityId: '0',
      }
    ) => {
      if (!isConnectionReady()) {
        console.log('[WebSocket] Not connected, connecting...')
        connectWebSocket()
      }

      try {
        // console.log('🔍 sendMessage', body)
        const destination = '/app/send'
        const bodyData = {
          title: body.title,
          content: body.content,
          username: body.username,
          notificationType: body.notificationType,
          relatedEntityId: body.relatedEntityId,
        }
        stompClientRef?.current?.send(destination, {}, JSON.stringify(bodyData))
        // console.log('[WebSocket] Message sent to:', destination)
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error)
        throw new Error('Failed to send message')
      }
    },
    [isConnectionReady]
  )

  const sendRequestNotification = useCallback(
    (
      body = {
        title: 'Hello from client!',
        content: `${userRef.current?.fullName || 'User'} sent you a message`,
        // username: userRef.current?.email,
        username: 'unguyen8666@gmail.com',
        notificationType: 'APPOINTMENT_WARNING',
        relatedEntityId: '0',
        notifyTeacher: false,
        notifyParent: false,
        notifyCounselor: false,
      }
    ) => {
      if (!isConnectionReady()) {
        console.log('[WebSocket] Not connected, connecting...')
        connectWebSocket()
      }
      // console.log('🔍 sendRequestNotification', body)

      try {
        // console.log('🔍 sendMessage', body)
        const destination = '/app/noti-setting'
        const bodyData = {
          title: body.title,
          content: body.content,
          notificationType: body.notificationType,
          notifyTeacher: body.notifyTeacher,
          notifyParent: body.notifyParent,
          notifyCounselor: body.notifyCounselor,
          entityId: body.relatedEntityId,
        }
        stompClientRef?.current?.send(destination, {}, JSON.stringify(bodyData))
        // console.log('[WebSocket] Message sent to:', destination)
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error)
        throw new Error('Failed to send message')
      }
    },
    [isConnectionReady]
  )

  const sendMessage2 = useCallback(
    (type = 'CHAT', roomId = '', body = { sender: user?.email }) => {
      if (!isConnectionReady()) {
        console.log('[WebSocket] Not connected, connecting...')
        connectWebSocket()
      }

      try {
        let destination

        if (type === 'ADD_USER') {
          console.log('[WebSocket_sendMessage2] 🔍 add user', body.sender)

          destination = `/app/chat.addUser`
          stompClientRef?.current?.send(
            destination,
            {},
            JSON.stringify({ username: user?.email })
          )
          return
        } else if (type === 'CHAT' && roomId) {
          destination = `/app/chat/${roomId}`
        }
        const bodyData = {
          sender: body.sender,
          message: body.message || '',
          timestamp: body.timestamp,
        }

        console.log('🔍 sendMessage2', bodyData)
        stompClientRef?.current?.send(destination, {}, JSON.stringify(bodyData))
        console.log('[WebSocket] Message sent to:', destination)
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error)
        throw new Error('Failed to send message')
      }
    },
    [isConnectionReady, user?.email, stompClientRef, connectWebSocket]
  )

  // Kết nối WebSocket khi user đã đăng nhập - tối ưu dependencies
  useEffect(() => {
    if (isAuthenticated && user && jwtToken) {
      connectWebSocket()
    } else {
      safeCleanup()
    }
  }, [isAuthenticated, user, jwtToken, connectWebSocket, safeCleanup]) // Chỉ depend vào user.id thay vì toàn bộ user object

  useEffect(() => {
    if (isConnectionReady()) {
      sendMessage2('ADD_USER')
    }
  }, [isConnectionReady, sendMessage2])

  // Subscribe to notifications khi đã kết nối - tối ưu dependencies
  useEffect(() => {
    if (isConnected && isConnectionReady()) {
      subscriptionRef.current = subscribeToTopic(
        '/user/queue/notifications',
        data => {
          // console.log('[WebSocket] 🔍 data', data)
          if (data.type === 'PING') {
            console.log('[WebSocket] Heartbeat PING received')
            return
          }
          console.log('📩 Thông báo từ server:', data)

          if (user?.role?.toLowerCase() === 'counselor') {
            dispatch(initializeAuthFromStorage())
          }

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

      subscriptionOnlineUsersRef.current = subscribeToTopic(
        `/topic/onlineUsers`,
        data => {
          console.log('[WebSocket] Online users:', data)
          setOnlineUsers(data || [])
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
        if (subscriptionOnlineUsersRef.current) {
          try {
            subscriptionOnlineUsersRef.current.unsubscribe()
            console.log('🛑 Unsubscribed from /topic/onlineUsers')
          } catch (error) {
            console.warn('[WebSocket] Error unsubscribing:', error)
          }
          subscriptionOnlineUsersRef.current = null
        }
      }
    }
  }, [isConnected, isConnectionReady, subscribeToTopic]) // Chỉ depend vào isConnected

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const markNotificationAsRead = useCallback(notificationId => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }, [])

  const getUnreadCount = useCallback(() => {
    // console.log('notifications', notifications)
    return notifications.filter(notification => !notification.isRead).length
  }, [notifications])

  const getRecentNotifications = useCallback(
    (limit = 10) => {
      // Sắp xếp notifications theo thời gian tạo (mới nhất trước) và lấy số lượng giới hạn
      return notifications
        .sort((a, b) => {
          const timeA = new Date(a.createdAt || a.updatedAt || 0)
          const timeB = new Date(b.createdAt || b.updatedAt || 0)
          return timeB - timeA
        })
        .slice(0, limit)
    },
    [notifications]
  )

  // Memoize context value để tránh re-render không cần thiết
  const contextValue = useMemo(
    () => ({
      stompClient: stompClientRef.current,
      isConnected,
      isConnecting,
      sendMessage,
      sendMessage2,
      subscribeToTopic,
      notifications,
      clearNotifications,
      markNotificationAsRead,
      getUnreadCount,
      getRecentNotifications,
      setNotifications,
      safeCleanup,
      onlineUsers,
      isConnectionReady,
      sendRequestNotification,
    }),
    [
      isConnectionReady,
      isConnected,
      isConnecting,
      sendMessage,
      sendMessage2,
      subscribeToTopic,
      notifications,
      clearNotifications,
      markNotificationAsRead,
      getUnreadCount,
      getRecentNotifications,
      safeCleanup,
      onlineUsers,
      sendRequestNotification,
    ]
  )

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}

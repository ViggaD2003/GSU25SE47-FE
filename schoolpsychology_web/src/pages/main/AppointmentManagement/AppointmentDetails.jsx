import React, { useState, useEffect, useCallback, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Button,
  Typography,
  Badge,
  Tag,
  Descriptions,
  Input,
  Select,
  message,
  Spin,
  Alert,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  updateAppointment,
  getAppointments,
} from '../../../store/actions/appointmentActions'
import {
  selectAppointmentLoading,
  selectAppointmentError,
  selectAppointmentById,
} from '../../../store/slices/appointmentSlice'

const { Title, Text } = Typography

// Status configuration - moved outside component to prevent recreation
const STATUS_CONFIG = {
  PENDING: {
    color: 'orange',
    icon: <ExclamationCircleOutlined />,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
  },
  CONFIRMED: {
    color: 'geekblue',
    icon: <CheckCircleOutlined />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  COMPLETED: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
  },
  CANCELLED: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
  },
}

// Host type configuration - moved outside component to prevent recreation
const HOST_TYPE_CONFIG = {
  TEACHER: {
    color: 'purple',
    icon: <UserOutlined />,
  },
  COUNSELOR: {
    color: 'blue',
    icon: <UserOutlined />,
  },
  STUDENT: {
    color: 'green',
    icon: <UserOutlined />,
  },
}

// Memoized components for better performance
const MemoizedStatusBadge = memo(({ status, t }) => {
  const config = STATUS_CONFIG[status]
  return (
    <Badge
      color={config.color}
      text={t(`appointment.status.${status.toLowerCase()}`)}
      className="font-medium"
    />
  )
})

const MemoizedHostTypeTag = memo(({ hostType, t }) => {
  const config = HOST_TYPE_CONFIG[hostType]
  return (
    <Tag color={config.color} icon={config.icon}>
      {t(`appointment.hostType.${hostType.toLowerCase()}`)}
    </Tag>
  )
})

const MemoizedActionButtons = memo(
  ({
    appointment,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onJoinMeeting,
    onStartSession,
    t,
  }) => {
    const isAppointmentToday = useMemo(() => {
      if (!appointment.startDateTime) return false
      const appointmentDate = dayjs(appointment.startDateTime).format(
        'YYYY-MM-DD'
      )
      const today = dayjs().format('YYYY-MM-DD')
      return appointmentDate === today && appointment.status === 'CONFIRMED'
    }, [appointment.startDateTime, appointment.status])

    const getActionButton = useCallback(() => {
      if (!isAppointmentToday) return null

      if (appointment.isOnline) {
        return (
          <Button
            type="primary"
            icon={<VideoCameraOutlined />}
            onClick={onJoinMeeting}
            className="bg-green-600 hover:bg-green-700"
            size="large"
          >
            {t('appointmentDetails.joinMeeting')}
          </Button>
        )
      } else {
        return (
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={onStartSession}
            className="bg-blue-600 hover:bg-blue-700"
            size="large"
          >
            {t('appointmentDetails.startSession')}
          </Button>
        )
      }
    }, [
      isAppointmentToday,
      appointment.isOnline,
      onJoinMeeting,
      onStartSession,
      t,
    ])

    return (
      <div className="flex items-center space-x-3">
        {getActionButton()}
        {appointment.status === 'PENDING' && !isEditing && (
          <Button icon={<EditOutlined />} onClick={onEdit}>
            {t('common.edit')}
          </Button>
        )}
        {isEditing && (
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={onSave}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('common.save')}
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          </>
        )}
      </div>
    )
  }
)

const AppointmentDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useDispatch()

  // Redux selectors
  const appointmentFromId = useSelector(state =>
    selectAppointmentById(state, id)
  )
  const loading = useSelector(selectAppointmentLoading)
  const error = useSelector(selectAppointmentError)

  const [appointment, setAppointment] = useState(appointmentFromId)

  // Local state
  const [isEditing, setIsEditing] = useState(false)
  const [editedAppointment, setEditedAppointment] = useState(appointment)

  // Memoized utility functions
  const formatDateTime = useCallback(dateTime => {
    return dayjs(dateTime).format('dddd, DD/MM/YYYY HH:mm')
  }, [])

  const formatDuration = useCallback((startDateTime, endDateTime) => {
    const start = dayjs(startDateTime)
    const end = dayjs(endDateTime)
    const minutes = end.diff(start, 'minute')
    return minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`
  }, [])

  // Effect to fetch appointments if not loaded or appointment not found
  useEffect(() => {
    if (id) {
      dispatch(getAppointments())
    }
  }, [dispatch, id])

  // Effect to update local appointment when appointment changes
  useEffect(() => {
    if (appointmentFromId) {
      setAppointment(appointmentFromId)
      setEditedAppointment({ ...appointmentFromId })
    }
  }, [appointmentFromId])

  // Memoized handlers
  const handleBack = useCallback(() => {
    React.startTransition(() => {
      setIsEditing(false)
      navigate('/appointment-management')
    })
  }, [navigate])

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setEditedAppointment({ ...appointment })
  }, [appointment])

  const handleSave = useCallback(async () => {
    try {
      await dispatch(updateAppointment(editedAppointment))
      setAppointment(editedAppointment)
      messageApi.success(t('appointmentDetails.updateSuccess'))
      setIsEditing(false)
    } catch (error) {
      console.error('Update error:', error)
      messageApi.error(t('appointmentDetails.updateError'))
    }
  }, [dispatch, editedAppointment, messageApi, t])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedAppointment({ ...appointment })
  }, [appointment])

  const handleLocationChange = useCallback(e => {
    setEditedAppointment(prev => ({
      ...prev,
      location: e.target.value,
    }))
  }, [])

  const handleJoinMeeting = useCallback(() => {
    if (appointment.meetingLink) {
      window.open(appointment.meetingLink, '_blank')
    } else {
      messageApi.info(t('appointmentDetails.noMeetingLink'))
    }
  }, [appointment.meetingLink, messageApi, t])

  const handleStartSession = useCallback(() => {
    messageApi.success(t('appointmentDetails.sessionStarted'))
    // Here you would navigate to session or update status
  }, [messageApi, t])

  // Memoized description styles
  const descriptionStyles = useMemo(
    () => ({
      content: {
        backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb',
      },
      label: {
        backgroundColor: isDarkMode ? '#4b5563' : '#f3f4f6',
        borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
        fontWeight: 'bold',
        width: '140px',
      },
    }),
    [isDarkMode]
  )

  // Show loading spinner while fetching data
  if (loading && !appointment) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  // Show error if appointment not found
  if (!loading && !appointment) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert
          message={t('appointmentDetails.notFound')}
          description={t('appointmentDetails.notFoundDescription')}
          type="error"
          action={
            <Button onClick={handleBack} type="primary">
              {t('common.back')}
            </Button>
          }
        />
      </div>
    )
  }

  // Show error if there's an API error
  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <Alert
          message={t('appointmentDetails.error')}
          description={error}
          type="error"
          action={
            <Button onClick={handleBack} type="primary">
              {t('common.back')}
            </Button>
          }
        />
      </div>
    )
  }

  // Don't render if appointment is not loaded yet
  if (!appointment) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      {contextHolder}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="flex items-center"
          >
            {t('common.back')}
          </Button>
          <div>
            <Title
              level={3}
              className={isDarkMode ? 'text-white' : 'text-gray-900'}
            >
              {t('appointmentDetails.title')} #{appointment?.id}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {appointment?.startDateTime &&
                formatDateTime(appointment.startDateTime)}
            </Text>
          </div>
        </div>
        <MemoizedActionButtons
          appointment={appointment}
          isEditing={isEditing}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          onJoinMeeting={handleJoinMeeting}
          onStartSession={handleStartSession}
          t={t}
        />
      </div>

      {/* Main Information */}
      <div>
        <Card
          className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
          title={
            <div className="flex items-center justify-between">
              <span>{t('appointmentDetails.basicInfo')}</span>
              <MemoizedStatusBadge status={appointment.status} t={t} />
            </div>
          }
        >
          <Descriptions
            column={2}
            layout="horizontal"
            bordered
            size="middle"
            className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}
            styles={descriptionStyles}
          >
            <Descriptions.Item label={t('appointment.table.hostName')}>
              <div className="flex items-center space-x-2">
                <div>
                  <Text strong className="mr-2">
                    {appointment.hostName}
                  </Text>
                  <MemoizedHostTypeTag hostType={appointment.hostType} t={t} />
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointment.table.bookByName')}>
              <div className="flex items-center space-x-2">
                <div>
                  <Text strong>{appointment.bookByName}</Text>
                  {appointment.bookForName && (
                    <Text type="secondary" className="block text-xs">
                      {t('appointment.table.bookForName')}:{' '}
                      {appointment.bookForName}
                    </Text>
                  )}
                </div>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.dateTime')}>
              <div className="flex items-center space-x-2">
                <CalendarOutlined className="text-blue-500" />
                <Text>{formatDateTime(appointment.startDateTime)}</Text>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.duration')}>
              <div className="flex items-center space-x-2">
                <ClockCircleOutlined className="text-green-500" />
                <Text>
                  {formatDuration(
                    appointment.startDateTime,
                    appointment.endDateTime
                  )}
                </Text>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.meetingType')}>
              <div className="flex items-center space-x-2">
                {appointment.isOnline ? (
                  <VideoCameraOutlined className="text-purple-500" />
                ) : (
                  <EnvironmentOutlined className="text-purple-500" />
                )}
                <Text>
                  {appointment.isOnline
                    ? t('appointment.formality.online')
                    : t('appointment.formality.offline')}
                </Text>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.location')}>
              {isEditing ? (
                <Input
                  placeholder={t('appointmentDetails.noLocation')}
                  value={editedAppointment.location}
                  onChange={handleLocationChange}
                />
              ) : (
                <Text>
                  {!appointment.isOnline
                    ? appointment.location || t('appointmentDetails.noLocation')
                    : 'Link Meeting'}
                </Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label={t('appointment.table.reason')} span={2}>
              <Text>{appointment.reason}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </div>
  )
}

// Add display name for debugging
AppointmentDetails.displayName = 'AppointmentDetails'

export default memo(AppointmentDetails)

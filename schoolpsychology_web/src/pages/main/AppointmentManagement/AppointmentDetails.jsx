import React, { useState, useCallback, memo, useMemo } from 'react'
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
  message,
  Alert,
  Row,
  Col,
  Divider,
  Progress,
  Space,
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
  FileTextOutlined,
  BarChartOutlined,
  HeartOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  updateAppointment,
  getAppointments,
} from '../../../store/actions/appointmentActions'
import {
  selectAppointmentById,
  selectSelectedAppointment,
} from '../../../store/slices/appointmentSlice'
import { appointmentAPI } from '../../../services/appointmentApi'
import AssessmentForm from '../../../components/Assessment/AssessmentForm'

const { Title, Text, Paragraph } = Typography

// Status configuration - moved outside component to prevent recreation
const STATUS_CONFIG = {
  PENDING: {
    color: 'orange',
    icon: <ExclamationCircleOutlined />,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  CONFIRMED: {
    color: 'geekblue',
    icon: <CalendarOutlined />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  COMPLETED: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  CANCELLED: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
}

// Assessment status configuration
const ASSESSMENT_STATUS_CONFIG = {
  SUBMITTED: {
    color: 'blue',
    icon: <FileTextOutlined />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
  },
  FINALIZED: {
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
    icon: <UserOutlined />,
    color: 'purple',
  },
  COUNSELOR: {
    icon: <UserOutlined />,
    color: 'blue',
  },
  STUDENT: {
    icon: <UserOutlined />,
    color: 'green',
  },
}

// Memoized components for better performance
const MemoizedStatusBadge = memo(({ status, t, isAssessment = false }) => {
  const config = isAssessment
    ? ASSESSMENT_STATUS_CONFIG[status] || ASSESSMENT_STATUS_CONFIG.SUBMITTED
    : STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  const translationKey = isAssessment
    ? `appointmentRecord.status.${status?.toLowerCase() || 'submitted'}`
    : `appointment.status.${status?.toLowerCase() || 'pending'}`

  return <Badge color={config.color} text={t(translationKey)} />
})

const MemoizedHostTypeTag = memo(({ hostType, t }) => {
  const config = HOST_TYPE_CONFIG[hostType] || HOST_TYPE_CONFIG.TEACHER
  return (
    <Tag color={config.color} icon={config.icon}>
      {t(`appointment.hostType.${hostType?.toLowerCase() || 'teacher'}`)}
    </Tag>
  )
})

// Risk Level Component
const RiskLevelCard = memo(({ score, t, isDarkMode }) => {
  const getRiskConfig = score => {
    if (score >= 7)
      return {
        level: 'high',
        color: 'red',
        percent: 100,
        icon: <ExclamationCircleOutlined />,
      }
    if (score >= 4)
      return {
        level: 'medium',
        color: 'orange',
        percent: 60,
        icon: <ExclamationCircleOutlined />,
      }
    return {
      level: 'low',
      color: 'green',
      percent: 30,
      icon: <CheckCircleOutlined />,
    }
  }

  if (!score && score !== 0) {
    return (
      <Card
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} text-center`}
      >
        <Text type="secondary">{t('appointmentRecord.noScore')}</Text>
      </Card>
    )
  }

  const riskConfig = getRiskConfig(score)

  return (
    <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
      <div className="text-center">
        <Progress
          type="circle"
          percent={riskConfig.percent}
          strokeColor={
            riskConfig.color === 'red'
              ? '#ff4d4f'
              : riskConfig.color === 'orange'
                ? '#faad14'
                : '#52c41a'
          }
          format={() => (
            <div>
              <Title
                level={3}
                color={`text-${riskConfig.color}-600`}
                style={{ margin: 0, padding: 0 }}
              >
                {score}
              </Title>
              <Text type="secondary">{t('appointmentRecord.totalScore')}</Text>
            </div>
          )}
          size={100}
        />
        <div className="mt-3">
          <Tag color={riskConfig.color} className="text-sm">
            {t(`appointmentRecord.riskLevels.${riskConfig.level}`)}
          </Tag>
        </div>
      </div>
    </Card>
  )
})

// Session Information Component for Assessment Records
const SessionInfoCard = memo(({ record, t, isDarkMode }) => {
  const getFlowConfig = flow => {
    const configs = {
      GOOD: { color: 'green', text: t('appointmentRecord.sessionFlow.good') },
      AVERAGE: {
        color: 'orange',
        text: t('appointmentRecord.sessionFlow.average'),
      },
      POOR: { color: 'red', text: t('appointmentRecord.sessionFlow.poor') },
      UNKNOWN: {
        color: 'gray',
        text: t('appointmentRecord.sessionFlow.unknown'),
      },
    }
    return configs[flow] || configs.UNKNOWN
  }

  const getCoopConfig = level => {
    const configs = {
      HIGH: {
        color: 'green',
        text: t('appointmentRecord.cooperationLevel.high'),
      },
      MEDIUM: {
        color: 'orange',
        text: t('appointmentRecord.cooperationLevel.medium'),
      },
      LOW: { color: 'red', text: t('appointmentRecord.cooperationLevel.low') },
      UNKNOWN: {
        color: 'gray',
        text: t('appointmentRecord.cooperationLevel.unknown'),
      },
    }
    return configs[level] || configs.UNKNOWN
  }

  const flowConfig = getFlowConfig(record.sessionFlow)
  const coopConfig = getCoopConfig(record.studentCoopLevel)

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          {t('appointmentRecord.sessionInfo')}
        </div>
      }
      className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
    >
      <Space direction="vertical" size="middle" className="w-full">
        <div>
          <Text strong className="block mb-2">
            {t('appointmentRecord.sessionFlowTitle')}
          </Text>
          <Tag color={flowConfig.color} className="text-sm">
            {flowConfig.text}
          </Tag>
        </div>
        <div>
          <Text strong className="block mb-2">
            {t('appointmentRecord.cooperationLevelTitle')}
          </Text>
          <Tag color={coopConfig.color} className="text-sm">
            {coopConfig.text}
          </Tag>
        </div>
        <div>
          <Text strong className="block mb-2">
            {t('appointmentRecord.statusTitle')}
          </Text>
          <MemoizedStatusBadge
            status={record.status}
            t={t}
            isAssessment={true}
          />
        </div>
      </Space>
    </Card>
  )
})

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
  const selectedItem = useSelector(selectSelectedAppointment)
  // const error = useSelector(selectAppointmentError)

  // Determine if this is an appointment record or regular appointment
  const isAppointmentRecord = useMemo(() => {
    return (
      selectedItem &&
      selectedItem.appointment &&
      selectedItem.sessionFlow !== undefined
    )
  }, [selectedItem])

  const currentData = useMemo(() => {
    if (isAppointmentRecord) {
      return selectedItem
    }
    return appointmentFromId || selectedItem
  }, [isAppointmentRecord, selectedItem, appointmentFromId])

  const appointment = useMemo(() => {
    if (isAppointmentRecord) {
      return currentData.appointment
    }
    return currentData
  }, [isAppointmentRecord, currentData])

  // Local state
  const [isEditing, setIsEditing] = useState(false)
  const [editedAppointment, setEditedAppointment] = useState(appointment)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)

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

  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate('/appointment-management')
  }, [navigate])

  // Assessment form handlers
  const handleAssessmentSubmit = useCallback(
    async data => {
      try {
        setSubmittingAssessment(true)
        const response = await appointmentAPI.createAppointmentRecord(data)

        if (response.success || response.data) {
          messageApi.success(
            t(
              'appointmentRecord.messages.saveSuccess',
              'Assessment saved successfully!'
            )
          )
          setShowAssessmentForm(false)
          dispatch(getAppointments())
        } else {
          throw new Error(response.message || 'Error saving assessment')
        }
      } catch (error) {
        console.error('Error submitting assessment:', error)
        messageApi.error(
          t(
            'appointmentRecord.messages.saveError',
            'Error saving assessment. Please try again!'
          )
        )
      } finally {
        setSubmittingAssessment(false)
      }
    },
    [messageApi, dispatch, t]
  )

  const handleStartSession = useCallback(() => {
    setShowAssessmentForm(true)
  }, [])

  const handleCloseAssessmentForm = useCallback(() => {
    setShowAssessmentForm(false)
  }, [])

  const handleJoinMeeting = useCallback(() => {
    if (appointment?.meetingLink) {
      window.open(appointment.meetingLink, '_blank')
    } else {
      messageApi.info(t('appointmentDetails.noMeetingLink'))
    }
  }, [appointment, messageApi, t])

  // Edit handlers
  const handleEdit = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedAppointment({ ...appointment })
  }, [appointment])

  const handleSave = useCallback(async () => {
    try {
      await dispatch(updateAppointment(editedAppointment)).unwrap()
      setIsEditing(false)
      messageApi.success(t('appointmentDetails.updateSuccess'))
    } catch (error) {
      console.error('Error updating appointment:', error)
      messageApi.error(t('appointmentDetails.updateError'))
    }
  }, [dispatch, editedAppointment, messageApi, t])

  const handleLocationChange = useCallback(e => {
    setEditedAppointment(prev => ({
      ...prev,
      location: e.target.value,
    }))
  }, [])

  // Loading and error states
  if (!currentData) {
    return (
      <div className="p-6">
        <Alert
          message={t('appointmentDetails.notFound')}
          description={t('appointmentDetails.notFoundDesc')}
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              {t('common.back')}
            </Button>
          }
        />
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="p-6">
        <Alert
          message={t('appointmentDetails.error')}
          description={t('appointmentDetails.errorDesc')}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              {t('common.back')}
            </Button>
          }
        />
      </div>
    )
  }

  // Action buttons based on appointment status and type
  const renderActionButtons = () => {
    const isAppointmentToday = dayjs(appointment.startDateTime).isSame(
      dayjs(),
      'day'
    )
    const canTakeAction =
      isAppointmentToday && appointment.status === 'CONFIRMED'

    return (
      <Space size="middle">
        {canTakeAction && !isAppointmentRecord && (
          <>
            {appointment.isOnline ? (
              <Button
                type="primary"
                icon={<VideoCameraOutlined />}
                onClick={handleJoinMeeting}
                className="bg-green-600 hover:bg-green-700"
                size="large"
                disabled={showAssessmentForm}
              >
                {t('appointmentDetails.joinMeeting')}
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                onClick={handleStartSession}
                className="bg-blue-600 hover:bg-blue-700"
                size="large"
                disabled={showAssessmentForm}
              >
                {t('appointmentDetails.startSession')}
              </Button>
            )}
          </>
        )}

        {!isAppointmentRecord &&
          appointment.status === 'PENDING' &&
          !isEditing && (
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              {t('common.edit')}
            </Button>
          )}

        {isEditing && (
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('common.save')}
            </Button>
            <Button icon={<CloseCircleOutlined />} onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
          </>
        )}
      </Space>
    )
  }

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="flex items-center"
          >
            {t('common.back')}
          </Button>
          <div>
            <Title
              level={2}
              className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}
            >
              {isAppointmentRecord
                ? t('appointmentRecord.title')
                : t('appointmentDetails.title')}{' '}
              #{appointment?.id}
            </Title>
            <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {appointment?.startDateTime &&
                formatDateTime(appointment.startDateTime)}
            </Text>
          </div>
        </div>
        {renderActionButtons()}
      </div>

      {/* Main Content */}
      {isAppointmentRecord ? (
        /* Assessment Record Layout - Left: Appointment Info, Right: Assessment Results */
        <Row gutter={[24, 24]}>
          {/* Left Column - Appointment Information */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Basic Appointment Info */}
              <Card
                title={
                  <div className="flex items-center justify-between">
                    <span>{t('appointmentDetails.basicInfo')}</span>
                    <MemoizedStatusBadge status={appointment.status} t={t} />
                  </div>
                }
                className={
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                }
              >
                <Descriptions column={1} size="middle">
                  <Descriptions.Item label={t('appointment.table.hostName')}>
                    <div className="flex items-center gap-2">
                      <Text strong>{appointment.hostName}</Text>
                      <MemoizedHostTypeTag
                        hostType={appointment.hostType}
                        t={t}
                      />
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={t('appointment.table.bookByName')}>
                    <div>
                      <Text strong>{appointment.bookByName}</Text>
                      {appointment.bookForName && (
                        <Text type="secondary" className="block text-xs">
                          {t('appointment.table.bookForName')}:{' '}
                          {appointment.bookForName}
                        </Text>
                      )}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={t('appointmentDetails.dateTime')}>
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-blue-500" />
                      <Text>{formatDateTime(appointment.startDateTime)}</Text>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label={t('appointmentDetails.duration')}>
                    <div className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-green-500" />
                      <Text>
                        {formatDuration(
                          appointment.startDateTime,
                          appointment.endDateTime
                        )}
                      </Text>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item
                    label={t('appointmentDetails.meetingType')}
                  >
                    <div className="flex items-center gap-2">
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
                    <Text>
                      {appointment.isOnline
                        ? 'Online Meeting'
                        : appointment.location ||
                          t('appointmentDetails.noLocation')}
                    </Text>
                  </Descriptions.Item>

                  {appointment.reason && (
                    <Descriptions.Item label={t('appointment.table.reason')}>
                      <Text>{appointment.reason}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* Session Information */}
              <SessionInfoCard
                record={currentData}
                t={t}
                isDarkMode={isDarkMode}
              />
            </Space>
          </Col>

          {/* Right Column - Assessment Results */}
          <Col xs={24} lg={12}>
            <Space direction="vertical" size="large" className="w-full">
              {/* Risk Level */}
              <RiskLevelCard
                score={currentData.totalScore}
                t={t}
                isDarkMode={isDarkMode}
              />

              {/* Assessment Notes */}
              {(currentData.noteSummary || currentData.noteSuggest) && (
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-blue-500" />
                      {t('appointmentRecord.assessmentResults')}
                    </div>
                  }
                  className={
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
                  }
                >
                  <Space direction="vertical" size="large" className="w-full">
                    {currentData.noteSummary && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <HeartOutlined className="text-red-500" />
                          <Text strong>
                            {t('appointmentRecord.noteSummary')}
                          </Text>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <Paragraph className="mb-0">
                            {currentData.noteSummary}
                          </Paragraph>
                        </div>
                      </div>
                    )}

                    {currentData.noteSuggest && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BulbOutlined className="text-yellow-500" />
                          <Text strong>
                            {t('appointmentRecord.noteSuggest')}
                          </Text>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}
                        >
                          <Paragraph className="mb-0">
                            {currentData.noteSuggest}
                          </Paragraph>
                        </div>
                      </div>
                    )}

                    {currentData.reason && (
                      <div>
                        <Text type="secondary" className="block mb-2">
                          {t(
                            'appointmentRecord.additionalNotes',
                            'Additional Notes'
                          )}
                          :
                        </Text>
                        <div
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}
                        >
                          <Text>{currentData.reason}</Text>
                        </div>
                      </div>
                    )}
                  </Space>
                </Card>
              )}
            </Space>
          </Col>
        </Row>
      ) : (
        /* Regular Appointment Layout */
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
          >
            <Descriptions.Item label={t('appointment.table.hostName')}>
              <div className="flex items-center gap-2">
                <Text strong>{appointment.hostName}</Text>
                <MemoizedHostTypeTag hostType={appointment.hostType} t={t} />
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointment.table.bookByName')}>
              <div>
                <Text strong>{appointment.bookByName}</Text>
                {appointment.bookForName && (
                  <Text type="secondary" className="block text-xs">
                    {t('appointment.table.bookForName')}:{' '}
                    {appointment.bookForName}
                  </Text>
                )}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.dateTime')}>
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-blue-500" />
                <Text>{formatDateTime(appointment.startDateTime)}</Text>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label={t('appointmentDetails.duration')}>
              <div className="flex items-center gap-2">
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
              <div className="flex items-center gap-2">
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
                    : 'Online Meeting'}
                </Text>
              )}
            </Descriptions.Item>

            {appointment.reason && (
              <Descriptions.Item label={t('appointment.table.reason')} span={2}>
                <Text>{appointment.reason}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Assessment Form Modal */}
      {showAssessmentForm && (
        <AssessmentForm
          isVisible={showAssessmentForm}
          onClose={handleCloseAssessmentForm}
          onSubmit={handleAssessmentSubmit}
          t={t}
          isDarkMode={isDarkMode}
          appointmentId={appointment.id}
          loading={submittingAssessment}
        />
      )}
    </div>
  )
}

// Add display name for debugging
AppointmentDetails.displayName = 'AppointmentDetails'

export default memo(AppointmentDetails)

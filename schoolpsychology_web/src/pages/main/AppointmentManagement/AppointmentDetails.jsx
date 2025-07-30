import React, { useState, useCallback, memo, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import { useSelector, useDispatch } from 'react-redux'
import {
  Card,
  Button,
  Typography,
  Tag,
  Descriptions,
  Input,
  message,
  Alert,
  Row,
  Col,
  Progress,
  Space,
  Spin,
  Empty,
  Tooltip,
  Timeline,
  Collapse,
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
  PlayCircleOutlined,
  StopOutlined,
  WarningOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyOutlined,
  HeartOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointmentWithAssessment,
} from '../../../store/actions/appointmentActions'
import {
  selectAppointmentDetails,
  selectAppointmentLoading,
  selectAppointmentError,
  clearError,
} from '../../../store/slices/appointmentSlice'
import { selectUserRole } from '../../../store/slices/authSlice'

import AssessmentForm from '../../../components/Assessment/AssessmentForm'
import AssessmentScores from '../../../components/Assessment/AssessmentScores'
import {
  APPOINTMENT_STATUS,
  SESSION_FLOW,
  STUDENT_COOP_LEVEL,
} from '../../../constants/enums'
import {
  IMPROVED_SCORING_SYSTEM,
  calculateCompositeScore,
} from '../../../constants/improvedAssessmentScoring'

const { Title, Text, Paragraph } = Typography

// Enhanced status configuration with better visual hierarchy
const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.PENDING]: {
    color: 'orange',
    icon: <ExclamationCircleOutlined />,
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-50 to-orange-100',
    priority: 1,
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    color: 'geekblue',
    icon: <CalendarOutlined />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-50 to-blue-100',
    priority: 2,
  },
  [APPOINTMENT_STATUS.IN_PROGRESS]: {
    color: 'purple',
    icon: <PlayCircleOutlined />,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    gradient: 'from-purple-50 to-purple-100',
    priority: 3,
    isActive: true,
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    gradient: 'from-green-50 to-green-100',
    priority: 4,
  },
  [APPOINTMENT_STATUS.ABSENT]: {
    color: 'red',
    icon: <StopOutlined />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    gradient: 'from-red-50 to-red-100',
    priority: 5,
  },
  [APPOINTMENT_STATUS.CANCELED]: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    gradient: 'from-red-50 to-red-100',
    priority: 5,
  },
  [APPOINTMENT_STATUS.EXPIRED]: {
    color: 'gray',
    icon: <ExclamationCircleOutlined />,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    gradient: 'from-gray-50 to-gray-100',
    priority: 6,
  },
}

// Enhanced assessment status configuration
const ASSESSMENT_STATUS_CONFIG = {
  SUBMITTED: {
    color: 'blue',
    icon: <FileTextOutlined />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    gradient: 'from-blue-50 to-blue-100',
  },
  FINALIZED: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    gradient: 'from-green-50 to-green-100',
  },
  CANCELLED: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    gradient: 'from-red-50 to-red-100',
  },
}

// Enhanced host type configuration
const HOST_TYPE_CONFIG = {
  TEACHER: {
    icon: <UserOutlined />,
    color: 'purple',
    gradient: 'from-purple-50 to-purple-100',
  },
  COUNSELOR: {
    icon: <UserOutlined />,
    color: 'blue',
    gradient: 'from-blue-50 to-blue-100',
  },
  STUDENT: {
    icon: <UserOutlined />,
    color: 'green',
    gradient: 'from-green-50 to-green-100',
  },
}

// Enhanced memoized components with better performance
const MemoizedStatusBadge = memo(
  ({ status, t, isAssessment = false, showIcon = true }) => {
    const config = isAssessment
      ? ASSESSMENT_STATUS_CONFIG[status] || ASSESSMENT_STATUS_CONFIG.SUBMITTED
      : STATUS_CONFIG[status] || STATUS_CONFIG[APPOINTMENT_STATUS.PENDING]

    const translationKey = isAssessment
      ? `appointmentRecord.status.${status?.toLowerCase() || 'submitted'}`
      : `appointment.status.${status?.toLowerCase() || 'pending'}`

    return (
      <span className={`flex items-center gap-1 ${config.textColor}`}>
        {showIcon && config.icon}
        {t(translationKey)}
      </span>
    )
  }
)

const MemoizedHostTypeTag = memo(({ hostType, t }) => {
  const config = HOST_TYPE_CONFIG[hostType] || HOST_TYPE_CONFIG.TEACHER
  return (
    <Tag
      color={config.color}
      icon={config.icon}
      className={`bg-gradient-to-r ${config.gradient}`}
    >
      {t(`appointment.hostType.${hostType?.toLowerCase() || 'teacher'}`)}
    </Tag>
  )
})

// Enhanced Risk Level Component with improved scoring
const RiskLevelCard = memo(
  ({ score, t, isDarkMode, assessmentScores = [], enhancedScoring = null }) => {
    const getRiskConfig = useCallback(score => {
      if (score >= 7)
        return {
          level: 'high',
          color: 'red',
          percent: 100,
          icon: <ExclamationCircleOutlined />,
          severity: 'critical',
          intervention: 'immediate',
          description:
            IMPROVED_SCORING_SYSTEM.SEVERITY_LEVELS[5]?.description ||
            'Critical risk level',
        }
      if (score >= 4)
        return {
          level: 'medium',
          color: 'orange',
          percent: 60,
          icon: <WarningOutlined />,
          severity: 'moderate',
          intervention: 'urgent',
          description:
            IMPROVED_SCORING_SYSTEM.SEVERITY_LEVELS[4]?.description ||
            'Moderate risk level',
        }
      return {
        level: 'low',
        color: 'green',
        percent: 30,
        icon: <CheckCircleOutlined />,
        severity: 'mild',
        intervention: 'monitoring',
        description:
          IMPROVED_SCORING_SYSTEM.SEVERITY_LEVELS[2]?.description ||
          'Low risk level',
      }
    }, [])

    const calculateEnhancedScore = useCallback(() => {
      // Use enhanced scoring data if available
      if (enhancedScoring && enhancedScoring.compositeScore !== undefined) {
        return enhancedScoring.compositeScore
      }

      if (!assessmentScores || assessmentScores.length === 0) {
        return score || 0
      }

      // Use improved scoring system if available
      let enhancedScore = 0
      assessmentScores.forEach(assessment => {
        const issue =
          IMPROVED_SCORING_SYSTEM.MENTAL_HEALTH_ISSUES[assessment.issueId]
        if (issue) {
          enhancedScore += calculateCompositeScore(
            issue.baseScore,
            assessment.frequency || 2,
            assessment.impairment || 2,
            assessment.duration || 2,
            assessment.comorbidities || [],
            assessment.culturalFactors || {}
          )
        }
      })

      return Math.round(enhancedScore * 10) / 10
    }, [assessmentScores, score, enhancedScoring])

    const enhancedScore = calculateEnhancedScore()

    if (!enhancedScore && enhancedScore !== 0) {
      return (
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} text-center shadow-lg`}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('appointmentRecord.noScore')}
          />
        </Card>
      )
    }

    const riskConfig = getRiskConfig(enhancedScore)

    return (
      <Card
        className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
        title={
          <div className="flex items-center gap-2">
            <SafetyOutlined className="text-blue-500" />
            {t('appointmentRecord.riskAssessment')}
            {enhancedScoring?.scoringSystem && (
              <Tag color="blue" size="small">
                {enhancedScoring.scoringSystem} v{enhancedScoring.version}
              </Tag>
            )}
          </div>
        }
        style={{
          height: '100%',
        }}
      >
        {score !== 0 ? (
          <div className="text-center">
            <Progress
              type="circle"
              percent={riskConfig.percent || 0}
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
                    level={2}
                    style={{
                      margin: 0,
                      padding: 0,
                      color:
                        riskConfig.color === 'red'
                          ? '#ff4d4f'
                          : riskConfig.color === 'orange'
                            ? '#faad14'
                            : '#52c41a',
                    }}
                  >
                    {enhancedScore}
                  </Title>
                  <Text type="secondary" className="text-xs">
                    {t('appointmentRecord.totalScore')}
                  </Text>
                </div>
              )}
              size={120}
            />
            <div className="mt-4 space-y-2">
              <Tag
                color={riskConfig.color}
                className="text-sm font-medium"
                icon={riskConfig.icon}
              >
                {t(`appointmentRecord.riskLevels.${riskConfig.level}`)}
              </Tag>
              <div className="text-xs text-gray-500 mb-2">
                {t(
                  `appointmentRecord.intervention.${riskConfig.intervention || 'noIntervention'}`
                )}
              </div>
              {riskConfig.description && (
                <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                  {riskConfig.description}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t('appointmentRecord.noRiskAssessment')}
            />
          </div>
        )}
      </Card>
    )
  }
)

// Enhanced Session Information Component
const SessionInfoCard = memo(({ record, t, isDarkMode }) => {
  const getFlowConfig = useCallback(
    flow => {
      const configs = {
        [SESSION_FLOW.GOOD]: {
          color: 'green',
          text: t('appointmentRecord.sessionFlow.good'),
          icon: <CheckCircleOutlined />,
        },
        [SESSION_FLOW.AVERAGE]: {
          color: 'orange',
          text: t('appointmentRecord.sessionFlow.average'),
          icon: <WarningOutlined />,
        },
        [SESSION_FLOW.POOR]: {
          color: 'red',
          text: t('appointmentRecord.sessionFlow.poor'),
          icon: <ExclamationCircleOutlined />,
        },
        [SESSION_FLOW.UNKNOWN]: {
          color: 'gray',
          text: t('appointmentRecord.sessionFlow.unknown'),
          icon: <InfoCircleOutlined />,
        },
      }
      return configs[flow] || configs[SESSION_FLOW.UNKNOWN]
    },
    [t]
  )

  const getCoopConfig = useCallback(
    level => {
      const configs = {
        [STUDENT_COOP_LEVEL.HIGH]: {
          color: 'green',
          text: t('appointmentRecord.cooperationLevel.high'),
          icon: <TrophyOutlined />,
        },
        [STUDENT_COOP_LEVEL.MEDIUM]: {
          color: 'orange',
          text: t('appointmentRecord.cooperationLevel.medium'),
          icon: <TeamOutlined />,
        },
        [STUDENT_COOP_LEVEL.LOW]: {
          color: 'red',
          text: t('appointmentRecord.cooperationLevel.low'),
          icon: <ExclamationCircleOutlined />,
        },
        [STUDENT_COOP_LEVEL.UNKNOWN]: {
          color: 'gray',
          text: t('appointmentRecord.cooperationLevel.unknown'),
          icon: <InfoCircleOutlined />,
        },
      }
      return configs[level] || configs[STUDENT_COOP_LEVEL.UNKNOWN]
    },
    [t]
  )

  const flowConfig = getFlowConfig(record.sessionFlow || SESSION_FLOW.UNKNOWN)
  const coopConfig = getCoopConfig(
    record.studentCoopLevel || STUDENT_COOP_LEVEL.UNKNOWN
  )

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          {t('appointmentRecord.sessionInfo')}
        </div>
      }
      className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
      style={{
        height: '100%',
      }}
      styles={{ body: { width: '100%' } }}
    >
      <Space direction="vertical" size="middle" className="w-full">
        <div>
          <Text strong className="block mb-2">
            {t('appointmentRecord.sessionFlowTitle')}
          </Text>
          <Tag
            color={flowConfig.color}
            className="text-sm"
            icon={flowConfig.icon}
          >
            {flowConfig.text}
          </Tag>
        </div>
        <div>
          <Text strong className="block mb-2">
            {t('appointmentRecord.cooperationLevelTitle')}
          </Text>
          <Tag
            color={coopConfig.color}
            className="text-sm"
            icon={coopConfig.icon}
          >
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

// Enhanced Appointment Timeline Component
// const AppointmentTimeline = memo(({ appointment, t, isDarkMode }) => {
//   const timelineItems = useMemo(() => {
//     const items = []

//     if (appointment.createdAt) {
//       items.push({
//         color: 'blue',
//         children: (
//           <div>
//             <Text strong>{t('appointmentRecord.timeline.created')}</Text>
//             <br />
//             <Text type="secondary" className="text-xs">
//               {dayjs(appointment.createdAt).format('DD/MM/YYYY HH:mm')}
//             </Text>
//           </div>
//         ),
//       })
//     }

//     if (appointment.status === APPOINTMENT_STATUS.CONFIRMED) {
//       items.push({
//         color: 'green',
//         children: (
//           <div>
//             <Text strong>{t('appointmentRecord.timeline.confirmed')}</Text>
//             <br />
//             <Text type="secondary" className="text-xs">
//               {dayjs(appointment.startDateTime).format('DD/MM/YYYY HH:mm')}
//             </Text>
//           </div>
//         ),
//       })
//     }

//     if (appointment.status === APPOINTMENT_STATUS.IN_PROGRESS) {
//       items.push({
//         color: 'purple',
//         children: (
//           <div>
//             <Text strong>{t('appointmentRecord.timeline.inProgress')}</Text>
//             <br />
//             <Text type="secondary" className="text-xs">
//               {dayjs().format('DD/MM/YYYY HH:mm')}
//             </Text>
//           </div>
//         ),
//       })
//     }

//     if (appointment.status === APPOINTMENT_STATUS.COMPLETED) {
//       items.push({
//         color: 'green',
//         children: (
//           <div>
//             <Text strong>{t('appointmentRecord.timeline.completed')}</Text>
//             <br />
//             <Text type="secondary" className="text-xs">
//               {dayjs(appointment.endDateTime).format('DD/MM/YYYY HH:mm')}
//             </Text>
//           </div>
//         ),
//       })
//     }

//     return items
//   }, [appointment, t])

//   return (
//     <Card
//       title={
//         <div className="flex items-center gap-2">
//           <ClockCircleOutlined className="text-blue-500" />
//           {t('appointmentRecord.timeline.title')}
//         </div>
//       }
//       className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
//       styles={{ body: { width: '100%' } }}
//     >
//       <Timeline items={timelineItems} />
//     </Card>
//   )
// })

const AppointmentDetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useDispatch()

  // Redux selectors
  const appointmentDetails = useSelector(selectAppointmentDetails)
  const loading = useSelector(selectAppointmentLoading)
  const error = useSelector(selectAppointmentError)
  const userRole = useSelector(selectUserRole)

  // Local state
  const [isEditing, setIsEditing] = useState(false)
  const [editedAppointment, setEditedAppointment] = useState(null)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [submittingAssessment, setSubmittingAssessment] = useState(false)

  // Load appointment details on component mount
  useEffect(() => {
    if (id) {
      dispatch(getAppointmentById(id))
    }
  }, [dispatch, id])

  // Determine if this is an appointment record or regular appointment
  const isAppointmentRecord = useMemo(() => {
    return (
      appointmentDetails &&
      !['IN_PROGRESS', 'PENDING', 'CONFIRMED'].includes(
        appointmentDetails.status
      )
    )
  }, [appointmentDetails])

  const currentData = useMemo(() => {
    return appointmentDetails
  }, [appointmentDetails])

  const appointment = useMemo(() => {
    // console.log('currentData', currentData)
    return currentData
  }, [currentData])

  // Handle error messages
  useEffect(() => {
    if (error) {
      messageApi.error(t('appointmentDetails.error'))
      dispatch(clearError())
    }
  }, [error, t, dispatch, messageApi])

  // Auto-show assessment form when status is IN_PROGRESS
  useEffect(() => {
    if (
      appointment?.status === APPOINTMENT_STATUS.IN_PROGRESS &&
      !isAppointmentRecord
    ) {
      setShowAssessmentForm(true)
    }
  }, [appointment, isAppointmentRecord, appointmentDetails])

  // Check if bookFor and bookBy are the same person
  const isSamePerson = useMemo(() => {
    if (!appointment?.bookedFor || !appointment?.bookedBy) return false
    return appointment.bookedFor.id === appointment.bookedBy.id
  }, [appointment])

  // Enhanced action permissions with better logic
  const canTakeAction = useMemo(() => {
    if (!appointment) return false
    const isAppointmentToday = dayjs(appointment.startDateTime).isSame(
      dayjs(),
      'day'
    )
    const isConfirmed = appointment.status === APPOINTMENT_STATUS.CONFIRMED
    const isInProgress = appointment.status === APPOINTMENT_STATUS.IN_PROGRESS
    const isNotManager = userRole !== 'MANAGER'
    const isNotRecord = !isAppointmentRecord

    return (
      isAppointmentToday &&
      (isConfirmed || isInProgress) &&
      isNotManager &&
      isNotRecord
    )
  }, [appointment, userRole, isAppointmentRecord])

  // Check if user can edit
  const canEdit = useMemo(() => {
    if (!appointment) return false
    const isPending = appointment.status === APPOINTMENT_STATUS.PENDING
    const isNotManager = userRole !== 'MANAGER'
    const isNotRecord = !isAppointmentRecord

    return isPending && isNotManager && isNotRecord
  }, [appointment, userRole, isAppointmentRecord])

  // Enhanced assessment form visibility logic
  const shouldShowAssessmentForm = useMemo(() => {
    if (!appointment) return false
    const isInProgress = appointment.status === APPOINTMENT_STATUS.IN_PROGRESS
    const isNotRecord = !isAppointmentRecord
    const isNotManager = userRole !== 'MANAGER'

    return isInProgress && isNotRecord && isNotManager
  }, [appointment, userRole, isAppointmentRecord])

  // Auto-show assessment form when status is IN_PROGRESS
  useEffect(() => {
    if (shouldShowAssessmentForm && !showAssessmentForm) {
      setShowAssessmentForm(true)
    }
  }, [shouldShowAssessmentForm, showAssessmentForm])

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

  // Enhanced assessment form handlers with improved scoring
  const handleAssessmentSubmit = useCallback(
    async data => {
      try {
        setSubmittingAssessment(true)

        // First update status to IN_PROGRESS if not already
        if (appointment.status !== APPOINTMENT_STATUS.IN_PROGRESS) {
          await dispatch(
            updateAppointmentStatus({
              appointmentId: appointment.id,
              status: APPOINTMENT_STATUS.IN_PROGRESS,
            })
          ).unwrap()
        }

        // Calculate enhanced composite score using improved scoring system
        let compositeScore = 0
        let riskLevel = 'low'
        let interventionLevel = 'monitor'

        if (data.assessmentScores && data.assessmentScores.length > 0) {
          const scores = data.assessmentScores.map(assessment => {
            const issue =
              IMPROVED_SCORING_SYSTEM.MENTAL_HEALTH_ISSUES[assessment.issueId]
            if (issue) {
              return calculateCompositeScore(
                issue.baseScore,
                assessment.frequency || 2,
                assessment.impairment || 2,
                assessment.duration || 2,
                assessment.comorbidities || [],
                assessment.culturalFactors || {}
              )
            }
            return 0
          })

          compositeScore =
            Math.round(scores.reduce((sum, score) => sum + score, 0) * 10) / 10

          // Determine risk level based on composite score
          if (compositeScore >= 7) {
            riskLevel = 'high'
            interventionLevel = 'immediate'
          } else if (compositeScore >= 4) {
            riskLevel = 'medium'
            interventionLevel = 'urgent'
          }
        }

        // Enhanced assessment data with improved scoring
        const assessmentData = {
          appointmentId: appointment.id,
          caseId: data.caseId || null,
          sessionNotes: data.sessionNotes || '',
          noteSummary: data.noteSummary || '',
          noteSuggestion: data.noteSuggestion || '',
          sessionFlow: data.sessionFlow || SESSION_FLOW.GOOD,
          studentCoopLevel: data.studentCoopLevel || STUDENT_COOP_LEVEL.HIGH,
          assessmentScores: data.assessmentScores || [],
          // Add enhanced scoring data
          enhancedScoring: {
            compositeScore,
            riskLevel,
            interventionLevel,
            culturalFactors: data.culturalFactors || {},
            comorbidities: data.comorbidities || [],
            scoringSystem: 'IMPROVED_SCORING_SYSTEM',
            version: '2.0',
          },
        }

        await dispatch(updateAppointmentWithAssessment(assessmentData)).unwrap()

        messageApi.success(
          t(
            'appointmentRecord.messages.saveSuccess',
            'Assessment saved successfully with enhanced scoring!'
          )
        )
        setShowAssessmentForm(false)

        // Refresh appointment details
        dispatch(getAppointmentById(appointment.id))
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
    [messageApi, dispatch, t, appointment]
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
    setEditedAppointment({ ...appointment })
  }, [appointment])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
    setEditedAppointment(null)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      await dispatch(
        updateAppointmentWithAssessment(editedAppointment)
      ).unwrap()
      setIsEditing(false)
      setEditedAppointment(null)
      messageApi.success(t('appointmentDetails.updateSuccess'))

      // Refresh appointment details
      dispatch(getAppointmentById(appointment.id))
    } catch (error) {
      console.error('Error updating appointment:', error)
      messageApi.error(t('appointmentDetails.updateError'))
    }
  }, [dispatch, editedAppointment, messageApi, t, appointment])

  const handleLocationChange = useCallback(e => {
    setEditedAppointment(prev => ({
      ...prev,
      location: e.target.value,
    }))
  }, [])

  // Loading state with better UI
  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
            size="large"
          />
          <Text className="mt-6 block text-lg">{t('common.loading')}</Text>
          <Text type="secondary" className="mt-2 block">
            {t('appointmentDetails.loadingDescription')}
          </Text>
        </div>
      </div>
    )
  }

  // Error state with better UI
  if (!currentData) {
    return (
      <div className="p-6">
        <Alert
          message={t('appointmentDetails.notFound')}
          description={t('appointmentDetails.notFoundDescription')}
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

  // Enhanced action buttons with better visual hierarchy
  const renderActionButtons = () => {
    return (
      <Space size="middle">
        {canTakeAction && (
          <>
            {appointment.isOnline ? (
              <Tooltip title={t('appointmentDetails.joinMeetingTooltip')}>
                <Button
                  type="primary"
                  icon={<VideoCameraOutlined />}
                  onClick={handleJoinMeeting}
                  className="bg-green-600 hover:bg-green-700 shadow-lg"
                  size="large"
                  disabled={showAssessmentForm}
                >
                  {t('appointmentDetails.joinMeeting')}
                </Button>
              </Tooltip>
            ) : (
              <Tooltip title={t('appointmentDetails.startSessionTooltip')}>
                <Button
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={handleStartSession}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg"
                  size="large"
                  disabled={showAssessmentForm}
                >
                  {t('appointmentDetails.startSession')}
                </Button>
              </Tooltip>
            )}
          </>
        )}

        {canEdit && !isEditing && (
          <Tooltip title={t('appointmentDetails.editTooltip')}>
            <Button
              icon={<EditOutlined />}
              onClick={handleEdit}
              className="shadow-md"
            >
              {t('common.edit')}
            </Button>
          </Tooltip>
        )}

        {isEditing && (
          <>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 shadow-lg"
            >
              {t('common.save')}
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={handleCancel}
              className="shadow-md"
            >
              {t('common.cancel')}
            </Button>
          </>
        )}
      </Space>
    )
  }

  // console.log('isAppointmentRecord', isAppointmentRecord)

  return (
    <div className="p-6">
      {contextHolder}

      {/* Enhanced Header */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-start space-x-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="flex items-center shadow-md"
          >
            {t('common.back')}
          </Button>
          <div>
            <Title
              level={2}
              className={`${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}
            >
              {isAppointmentRecord
                ? t('appointmentRecord.title')
                : t('appointmentDetails.title')}{' '}
              <span className="text-blue-600">#{appointment?.id}</span>
            </Title>
            <div className="flex items-center gap-4">
              <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {appointment?.startDateTime &&
                  formatDateTime(appointment.startDateTime)}
              </Text>
              <MemoizedStatusBadge
                status={appointment.status}
                t={t}
                showIcon={false}
              />
            </div>
          </div>
        </div>
        {renderActionButtons()}
      </div>

      {/* Manager View Only Notice */}
      {userRole === 'MANAGER' && !isAppointmentRecord && (
        <Alert
          message={t('appointment.manager.viewOnly')}
          description={t('appointment.manager.viewOnlyDescription')}
          type="info"
          showIcon
          className="mb-10"
        />
      )}

      {/* Status-specific alerts */}
      {appointment.status === APPOINTMENT_STATUS.IN_PROGRESS &&
        !isAppointmentRecord && (
          <Alert
            message={t('appointmentDetails.sessionInProgress')}
            description={t('appointmentDetails.sessionInProgressDescription')}
            type="warning"
            showIcon
            style={{ marginBottom: '6px' }}
            // action={
            //   <Button
            //     size="small"
            //     type="primary"
            //     onClick={() => setShowAssessmentForm(true)}
            //   >
            //     {t('appointmentDetails.continueAssessment')}
            //   </Button>
            // }
          />
        )}

      {/* Main Content */}
      {isAppointmentRecord ? (
        /* Enhanced Assessment Record Layout */
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={24}>
            {/* Enhanced Basic Appointment Info */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {t('appointmentDetails.basicInfo')}
                  </span>
                  <MemoizedStatusBadge status={appointment.status} t={t} />
                </div>
              }
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
            >
              <Descriptions column={1} size="middle">
                <Descriptions.Item label={t('appointment.table.hostName')}>
                  <div className="flex items-center gap-2">
                    <Text strong>{appointment.hostedBy?.fullName}</Text>
                    <MemoizedHostTypeTag
                      hostType={appointment.hostType}
                      t={t}
                    />
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    isSamePerson
                      ? t('appointment.table.bookByName')
                      : t('appointment.table.bookForName')
                  }
                >
                  <div>
                    <Text strong>
                      {isSamePerson
                        ? appointment.bookedBy?.fullName
                        : appointment.bookedFor?.fullName}
                    </Text>
                    {!isSamePerson && (
                      <Text type="secondary" className="block text-xs">
                        {t('appointment.table.bookByName')}:{' '}
                        {appointment.bookedBy?.fullName}
                        {appointment.bookedBy?.roleName &&
                          ` (${appointment.bookedBy?.roleName.toLowerCase()})`}
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
                  <Text>
                    {appointment.isOnline
                      ? 'Online Meeting'
                      : appointment.location ||
                        t('appointmentDetails.noLocation')}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label={t('appointment.table.reason')}>
                  <Text>
                    {appointment.reasonBooking
                      ? appointment.reasonBooking
                      : t('appointmentDetails.noReason')}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          {appointment.status === APPOINTMENT_STATUS.COMPLETED && (
            <>
              {/* Enhanced Risk Level Card */}
              <Col xs={24} lg={12}>
                {/* Enhanced Risk Level Card */}
                <RiskLevelCard
                  score={currentData.totalScore || 0}
                  t={t}
                  isDarkMode={isDarkMode}
                  assessmentScores={currentData.assessmentScores || []}
                  enhancedScoring={currentData.enhancedScoring || []}
                />
              </Col>

              {/* Enhanced Session Information */}
              <Col xs={24} lg={12}>
                <SessionInfoCard
                  record={currentData}
                  t={t}
                  isDarkMode={isDarkMode}
                />
              </Col>

              {/* Enhanced Assessment Notes */}
              <Col xs={24} lg={24}>
                <Card
                  title={
                    <div className="flex items-center gap-2">
                      <FileTextOutlined className="text-blue-500" />
                      {t('appointmentRecord.assessmentResults')}
                    </div>
                  }
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
                >
                  <div className="space-y-4 mb-4">
                    {/* Session Notes Card */}
                    <div
                      className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}
                    >
                      <div
                        className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          <FileTextOutlined className="text-blue-500 text-lg" />
                          <Text strong className="text-lg">
                            {t('appointmentRecord.sessionNotes')}
                          </Text>
                        </div>
                      </div>
                      <div className="p-4">
                        <div
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}
                        >
                          <Text>
                            {currentData.sessionNotes ||
                              t('appointmentRecord.noSessionNotes')}
                          </Text>
                        </div>
                      </div>
                    </div>

                    {/* Note Summary Card */}
                    <div
                      className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}
                    >
                      <div
                        className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          <HeartOutlined className="text-red-500 text-lg" />
                          <Text strong className="text-lg">
                            {t('appointmentRecord.noteSummary')}
                          </Text>
                        </div>
                      </div>
                      <div className="p-4">
                        <div
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                        >
                          <Paragraph className="mb-0">
                            {currentData.noteSummary ||
                              t('appointmentRecord.noNoteSummary')}
                          </Paragraph>
                        </div>
                      </div>
                    </div>

                    {/* Note Suggestion Card */}
                    <div
                      className={`rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} shadow-sm`}
                    >
                      <div
                        className={`p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}
                      >
                        <div className="flex items-center gap-2">
                          <BulbOutlined className="text-yellow-500 text-lg" />
                          <Text strong className="text-lg">
                            {t('appointmentRecord.noteSuggest')}
                          </Text>
                        </div>
                      </div>
                      <div className="p-4">
                        <div
                          className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-green-50'}`}
                        >
                          <Paragraph className="mb-0">
                            {currentData.noteSuggestion ||
                              t('appointmentRecord.noNoteSuggestion')}
                          </Paragraph>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>

              {/* Enhanced Assessment Scores */}
              <Col xs={24} lg={24}>
                <AssessmentScores
                  assessmentScores={currentData.assessmentScores || []}
                  isDarkMode={isDarkMode}
                  t={t}
                />
              </Col>

              {/* Enhanced Timeline */}
              {/* <Col xs={24} lg={24}>
                <AppointmentTimeline
                  appointment={appointment}
                  t={t}
                  isDarkMode={isDarkMode}
                />
              </Col> */}
            </>
          )}

          {appointment.status === APPOINTMENT_STATUS.CANCELED && (
            <Col xs={24} lg={24}>
              <Card
                title={t('appointmentRecord.reasonCanceled')}
                className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
              >
                <Text>
                  {currentData.reasonCancel ||
                    t('appointmentRecord.noReasonCanceled')}
                </Text>
              </Card>
            </Col>
          )}
        </Row>
      ) : (
        /* Enhanced Regular Appointment Layout */
        <Row gutter={[24, 24]}>
          {/* Left Column - Basic Info */}
          <Col xs={24} lg={24} style={{ marginBottom: '10px' }}>
            <Card
              className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
              title={
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">
                    {t('appointmentDetails.basicInfo')}
                  </span>
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
                    <Text strong>{appointment.hostedBy?.fullName}</Text>
                    <MemoizedHostTypeTag
                      hostType={appointment.hostType}
                      t={t}
                    />
                  </div>
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    isSamePerson
                      ? t('appointment.table.bookByName')
                      : t('appointment.table.bookForName')
                  }
                >
                  <div>
                    <Text strong>
                      {isSamePerson
                        ? appointment.bookedBy?.fullName
                        : appointment.bookedFor?.fullName}
                    </Text>
                    {!isSamePerson && (
                      <Text type="secondary" className="block text-xs">
                        {t('appointment.table.bookByName')}:{' '}
                        {appointment.bookedBy?.fullName}
                        {appointment.bookedBy?.roleName &&
                          ` (${appointment.bookedBy?.roleName.toLowerCase()})`}
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
                      value={editedAppointment?.location}
                      onChange={handleLocationChange}
                    />
                  ) : (
                    <Text>
                      {!appointment.isOnline
                        ? appointment.location ||
                          t('appointmentDetails.noLocation')
                        : 'Online Meeting'}
                    </Text>
                  )}
                </Descriptions.Item>

                {appointment.reasonBooking && (
                  <Descriptions.Item
                    label={t('appointment.table.reason')}
                    span={2}
                  >
                    <Text>{appointment.reasonBooking}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* Right Column - Assessment Scores if available */}
          {/* <Col xs={24} lg={8}>
            {appointment.assessmentScores &&
              appointment.assessmentScores.length > 0 && (
                <AssessmentScores
                  assessmentScores={appointment.assessmentScores}
                  isDarkMode={isDarkMode}
                  t={t}
                />
              )}
          </Col> */}
        </Row>
      )}

      {/* Enhanced Assessment Form Modal */}
      {showAssessmentForm && (
        <AssessmentForm
          isVisible={showAssessmentForm}
          onClose={handleCloseAssessmentForm}
          onSubmit={handleAssessmentSubmit}
          t={t}
          isDarkMode={isDarkMode}
          appointmentId={appointment.id}
          loading={submittingAssessment}
          // Pass enhanced scoring system data
          enhancedScoring={IMPROVED_SCORING_SYSTEM}
          // Pass current appointment data for pre-filling
          appointmentData={appointment}
          // Pass assessment status for better UX
          assessmentStatus={appointment.status}
        />
      )}
    </div>
  )
}

// Add display name for debugging
AppointmentDetails.displayName = 'AppointmentDetails'

export default memo(AppointmentDetails)

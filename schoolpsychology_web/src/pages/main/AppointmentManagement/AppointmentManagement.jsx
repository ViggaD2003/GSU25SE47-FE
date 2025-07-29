import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import {
  Card,
  Button,
  Input,
  Table,
  Badge,
  message,
  Row,
  Col,
  Typography,
  Tabs,
  Space,
  Tag,
  Tooltip,
  DatePicker,
  Select,
} from 'antd'
import {
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EnvironmentOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  getAppointments,
  getAppointmentRecords,
} from '../../../store/actions/appointmentActions'
import {
  selectAppointments,
  selectAppointmentRecords,
  selectAppointmentLoading,
  selectAppointmentError,
  clearError,
  setSelectedAppointment,
  clearSelectedAppointment,
} from '../../../store/slices/appointmentSlice'

const { Search } = Input
const { Title, Text } = Typography

// Status configuration - moved outside component to prevent recreation
const STATUS_CONFIG = {
  PENDING: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  CONFIRMED: {
    color: 'geekblue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  COMPLETED: {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  CANCELLED: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
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
const MemoizedStatusBadge = memo(({ status, t }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING
  return (
    <Badge
      color={config.color}
      text={t(`appointment.status.${status?.toLowerCase() || 'pending'}`)}
    />
  )
})

const MemoizedHostTypeTag = memo(({ hostType, t }) => {
  const config = HOST_TYPE_CONFIG[hostType] || HOST_TYPE_CONFIG.TEACHER
  return (
    <Tag color={config.color} icon={config.icon}>
      {t(`appointment.hostType.${hostType?.toLowerCase() || 'teacher'}`)}
    </Tag>
  )
})

const MemoizedAppointmentRow = memo(
  ({ appointment, _t, onViewDetails, _formatDateTime, _calculateDuration }) => {
    const handleViewDetails = useCallback(() => {
      onViewDetails(appointment)
    }, [appointment, onViewDetails])

    return {
      key: appointment.id,
      ...appointment,
      actions: (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={handleViewDetails}
              className="text-blue-600 hover:text-blue-800"
            />
          </Tooltip>
        </Space>
      ),
    }
  }
)

const AppointmentManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  // Redux selectors
  const appointments = useSelector(selectAppointments)
  const appointmentRecords = useSelector(selectAppointmentRecords)
  const loading = useSelector(selectAppointmentLoading)
  const error = useSelector(selectAppointmentError)

  // Local state
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Memoized utility functions
  const formatDateTime = useCallback(dateTime => {
    return dayjs(dateTime).format('DD/MM/YYYY HH:mm')
  }, [])

  const calculateDuration = useCallback((startDateTime, endDateTime) => {
    const start = dayjs(startDateTime)
    const end = dayjs(endDateTime)
    const minutes = end.diff(start, 'minute')
    return minutes >= 60
      ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
      : `${minutes}m`
  }, [])

  // Load appointments on component mount
  useEffect(() => {
    dispatch(clearSelectedAppointment())
    dispatch(getAppointments())
  }, [dispatch])

  // Load appointment records when switching to completed tab
  useEffect(() => {
    if (activeTab === 'completed') {
      dispatch(getAppointmentRecords())
    }
  }, [dispatch, activeTab])

  // Handle error messages
  useEffect(() => {
    if (error) {
      messageApi.error(t('appointment.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, dispatch, messageApi])

  // Memoized filtered appointments with debounced search
  const filteredAppointments = useMemo(() => {
    if (!searchText.trim()) return appointments

    const searchLower = searchText.toLowerCase()
    return appointments.filter(appointment => {
      return (
        appointment.hostName?.toLowerCase().includes(searchLower) ||
        appointment.bookByName?.toLowerCase().includes(searchLower) ||
        appointment.bookForName?.toLowerCase().includes(searchLower) ||
        appointment.reason?.toLowerCase().includes(searchLower)
      )
    })
  }, [appointments, searchText])

  // Memoized filtered appointment records with debounced search
  const filteredAppointmentRecords = useMemo(() => {
    if (!searchText.trim()) return appointmentRecords

    const searchLower = searchText.toLowerCase()
    return appointmentRecords.filter(record => {
      const appointment = record.appointment
      return (
        appointment?.hostName?.toLowerCase().includes(searchLower) ||
        appointment?.bookByName?.toLowerCase().includes(searchLower) ||
        appointment?.bookForName?.toLowerCase().includes(searchLower) ||
        appointment?.reason?.toLowerCase().includes(searchLower) ||
        record.noteSummary?.toLowerCase().includes(searchLower) ||
        record.noteSuggest?.toLowerCase().includes(searchLower)
      )
    })
  }, [appointmentRecords, searchText])

  // Separate appointments by tab with memoization
  const { activeAppointments, completedAppointments } = useMemo(() => {
    const active = filteredAppointments.filter(appointment =>
      ['PENDING', 'CONFIRMED'].includes(appointment.status)
    )
    // For completed tab, we'll use appointment records instead
    const completed = filteredAppointmentRecords
    return { activeAppointments: active, completedAppointments: completed }
  }, [filteredAppointments, filteredAppointmentRecords])

  // Get current tab data
  const currentTabData = useMemo(() => {
    return activeTab === 'active' ? activeAppointments : completedAppointments
  }, [activeTab, activeAppointments, completedAppointments])

  // Memoized handlers
  const handleRefresh = useCallback(() => {
    if (activeTab === 'active') {
      dispatch(getAppointments())
    } else if (activeTab === 'completed') {
      dispatch(getAppointmentRecords())
    }
  }, [dispatch, activeTab])

  const handleSearch = useCallback(value => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  const handleViewDetails = useCallback(
    item => {
      // Use startTransition for smooth navigation
      React.startTransition(() => {
        // Handle both appointment and appointment record objects
        const appointment = item.appointment || item
        const appointmentId = appointment.id || item.id

        dispatch(setSelectedAppointment(item))
        navigate(`/appointment-management/details/${appointmentId}`)
      })
    },
    [navigate, dispatch]
  )

  const handleTabChange = useCallback(key => {
    React.startTransition(() => {
      setActiveTab(key)
      setPagination(prev => ({ ...prev, current: 1 }))
    })
  }, [])

  const handlePaginationChange = useCallback(
    (page, pageSize) => {
      setPagination({
        current: page,
        pageSize,
        total: currentTabData.length,
      })
    },
    [currentTabData.length]
  )

  // Memoized table columns for appointments
  const appointmentColumns = useMemo(
    () => [
      {
        title: t('appointment.table.hostName'),
        dataIndex: 'hostName',
        key: 'hostName',
        render: (text, record) => (
          <div className="flex flex-col">
            <Text strong>{text}</Text>
            <Text type="secondary" className="text-xs">
              <MemoizedHostTypeTag hostType={record.hostType} t={t} />
            </Text>
          </div>
        ),
        sorter: (a, b) => a.hostName.localeCompare(b.hostName),
      },
      {
        title: t('appointment.table.bookByName'),
        dataIndex: 'bookByName',
        key: 'bookByName',
        render: (text, record) => (
          <div className="flex flex-col">
            <Text>{text}</Text>
            {record.bookForName && (
              <Text type="secondary" className="text-xs">
                {t('appointment.table.bookForName')}: {record.bookForName}
              </Text>
            )}
          </div>
        ),
      },
      {
        title: t('appointment.table.time'),
        dataIndex: 'startDateTime',
        key: 'startDateTime',
        render: (text, record) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <CalendarOutlined className="text-gray-400" />
              <Text>{formatDateTime(text)}</Text>
            </div>
            <div className="flex items-center gap-1">
              <ClockCircleOutlined className="text-gray-400" />
              <Text className="text-xs text-gray-500">
                {calculateDuration(record.startDateTime, record.endDateTime)}
              </Text>
            </div>
          </div>
        ),
        sorter: (a, b) =>
          dayjs(a.startDateTime).unix() - dayjs(b.startDateTime).unix(),
      },
      {
        title: t('appointment.table.type'),
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => (
          <Tag color={record.isOnline ? 'blue' : 'green'}>
            {record.isOnline ? (
              <VideoCameraOutlined />
            ) : (
              <EnvironmentOutlined />
            )}
            <Text>
              {record.isOnline
                ? t('appointment.formality.online')
                : text || t('appointment.formality.offline')}
            </Text>
          </Tag>
        ),
        filters: [
          { text: t('appointment.formality.online'), value: true },
          { text: t('appointment.formality.offline'), value: false },
        ],
        onFilter: (value, record) => record.isOnline === value,
      },
      {
        title: t('appointment.table.location'),
        dataIndex: 'location',
        key: 'location',
        render: text => (
          <Text ellipsis className="max-w-[200px]">
            {text || 'Chưa cập nhật'}
          </Text>
        ),
      },
      {
        title: t('appointment.status.label'),
        dataIndex: 'status',
        key: 'status',
        render: status => <MemoizedStatusBadge status={status} t={t} />,
        filters: [
          { text: t('appointment.status.pending'), value: 'PENDING' },
          { text: t('appointment.status.confirmed'), value: 'CONFIRMED' },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        key: 'actions',
        width: 80,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                className="text-blue-600 hover:text-blue-800"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [t, formatDateTime, calculateDuration, handleViewDetails]
  )

  // Memoized table columns for appointment records
  const appointmentRecordColumns = useMemo(
    () => [
      {
        title: t('appointment.table.hostName'),
        key: 'hostName',
        render: (_, record) => {
          const appointment = record.appointment
          return (
            <div className="flex flex-col">
              <Text strong>{appointment?.hostName}</Text>
              <Text type="secondary" className="text-xs">
                <MemoizedHostTypeTag hostType={appointment?.hostType} t={t} />
              </Text>
            </div>
          )
        },
        sorter: (a, b) =>
          (a.appointment?.hostName || '').localeCompare(
            b.appointment?.hostName || ''
          ),
      },
      {
        title: t('appointment.table.bookByName'),
        key: 'bookByName',
        render: (_, record) => {
          const appointment = record.appointment
          return (
            <div className="flex flex-col">
              <Text>{appointment?.bookByName}</Text>
              {appointment?.bookForName && (
                <Text type="secondary" className="text-xs">
                  {t('appointment.table.bookForName')}:{' '}
                  {appointment?.bookForName}
                </Text>
              )}
            </div>
          )
        },
      },
      {
        title: t('appointment.table.time'),
        key: 'time',
        render: (_, record) => {
          const appointment = record.appointment
          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <CalendarOutlined className="text-gray-400" />
                <Text>{formatDateTime(appointment?.startDateTime)}</Text>
              </div>
              <div className="flex items-center gap-1">
                <ClockCircleOutlined className="text-gray-400" />
                <Text className="text-xs text-gray-500">
                  {calculateDuration(
                    appointment?.startDateTime,
                    appointment?.endDateTime
                  )}
                </Text>
              </div>
            </div>
          )
        },
        sorter: (a, b) =>
          dayjs(a.appointment?.startDateTime || 0).unix() -
          dayjs(b.appointment?.startDateTime || 0).unix(),
      },
      {
        title: t('appointmentRecord.sessionFlowTitle'),
        dataIndex: 'sessionFlow',
        key: 'sessionFlow',
        render: sessionFlow => {
          const config = {
            GOOD: {
              color: 'green',
              text: t('appointmentRecord.sessionFlow.good', 'Good'),
            },
            AVERAGE: {
              color: 'orange',
              text: t('appointmentRecord.sessionFlow.average', 'Average'),
            },
            POOR: {
              color: 'red',
              text: t('appointmentRecord.sessionFlow.poor', 'Poor'),
            },
            UNKNOWN: {
              color: 'gray',
              text: t('appointmentRecord.sessionFlow.unknown', 'Unknown'),
            },
          }
          const flow = config[sessionFlow] || config.UNKNOWN
          return <Tag color={flow.color}>{flow.text}</Tag>
        },
        filters: [
          {
            text: t('appointmentRecord.sessionFlow.good', 'Good'),
            value: 'GOOD',
          },
          {
            text: t('appointmentRecord.sessionFlow.average', 'Average'),
            value: 'AVERAGE',
          },
          {
            text: t('appointmentRecord.sessionFlow.poor', 'Poor'),
            value: 'POOR',
          },
          {
            text: t('appointmentRecord.sessionFlow.unknown', 'Unknown'),
            value: 'UNKNOWN',
          },
        ],
        onFilter: (value, record) => record.sessionFlow === value,
      },
      {
        title: t('appointmentRecord.cooperationLevelTitle'),
        dataIndex: 'studentCoopLevel',
        key: 'studentCoopLevel',
        render: level => {
          const config = {
            HIGH: {
              color: 'green',
              text: t('appointmentRecord.cooperationLevel.high', 'High'),
            },
            MEDIUM: {
              color: 'orange',
              text: t('appointmentRecord.cooperationLevel.medium', 'Medium'),
            },
            LOW: {
              color: 'red',
              text: t('appointmentRecord.cooperationLevel.low', 'Low'),
            },
            UNKNOWN: {
              color: 'gray',
              text: t('appointmentRecord.cooperationLevel.unknown', 'Unknown'),
            },
          }
          const coop = config[level] || config.UNKNOWN
          return <Tag color={coop.color}>{coop.text}</Tag>
        },
        filters: [
          {
            text: t('appointmentRecord.cooperationLevel.high', 'High'),
            value: 'HIGH',
          },
          {
            text: t('appointmentRecord.cooperationLevel.medium', 'Medium'),
            value: 'MEDIUM',
          },
          {
            text: t('appointmentRecord.cooperationLevel.low', 'Low'),
            value: 'LOW',
          },
          {
            text: t('appointmentRecord.cooperationLevel.unknown', 'Unknown'),
            value: 'UNKNOWN',
          },
        ],
        onFilter: (value, record) => record.studentCoopLevel === value,
      },
      {
        title: t('appointmentRecord.totalScore'),
        dataIndex: 'totalScore',
        key: 'totalScore',
        render: score => (
          <div className="flex items-center">
            <Text
              strong
              className={
                score >= 7
                  ? 'text-red-600'
                  : score >= 4
                    ? 'text-orange-600'
                    : 'text-green-600'
              }
            >
              {score || t('appointmentRecord.noScore', 'N/A')}
            </Text>
          </div>
        ),
        sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
      },
      {
        title: t('appointmentRecord.statusTitle'),
        dataIndex: 'status',
        key: 'recordStatus',
        render: status => {
          const config = {
            SUBMITTED: {
              color: 'blue',
              text: t('appointmentRecord.status.submitted', 'Submitted'),
            },
            FINALIZED: {
              color: 'green',
              text: t('appointmentRecord.status.finalized', 'Finalized'),
            },
            CANCELLED: {
              color: 'red',
              text: t('appointmentRecord.status.cancelled', 'Cancelled'),
            },
          }
          const statusInfo = config[status] || config.SUBMITTED
          return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
        },
        filters: [
          {
            text: t('appointmentRecord.status.submitted', 'Submitted'),
            value: 'SUBMITTED',
          },
          {
            text: t('appointmentRecord.status.finalized', 'Finalized'),
            value: 'FINALIZED',
          },
          {
            text: t('appointmentRecord.status.cancelled', 'Cancelled'),
            value: 'CANCELLED',
          },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        key: 'actions',
        width: 80,
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title={t('appointmentRecord.viewRecord')}>
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                className="text-blue-600 hover:text-blue-800"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [t, formatDateTime, calculateDuration, handleViewDetails]
  )

  // Memoized tab items
  const tabItems = useMemo(
    () => [
      {
        key: 'active',
        label: (
          <span className="flex items-center gap-2">
            {t('appointment.tabs.active')}
            <Badge
              count={activeAppointments.length}
              style={{ backgroundColor: '#1890ff' }}
            />
          </span>
        ),
        children: (
          <Table
            columns={appointmentColumns}
            dataSource={currentTabData}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: currentTabData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: handlePaginationChange,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        ),
      },
      {
        key: 'completed',
        label: (
          <span className="flex items-center gap-2">
            {t('appointmentRecord.title')}
            <Badge
              count={completedAppointments.length}
              style={{ backgroundColor: '#52c41a' }}
            />
          </span>
        ),
        children: (
          <Table
            columns={appointmentRecordColumns}
            dataSource={currentTabData}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: currentTabData.length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              onChange: handlePaginationChange,
            }}
            scroll={{ x: 1200 }}
            size="middle"
          />
        ),
      },
    ],
    [
      t,
      activeAppointments.length,
      completedAppointments.length,
      appointmentColumns,
      appointmentRecordColumns,
      currentTabData,
      loading,
      pagination,
      handlePaginationChange,
    ]
  )

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('appointment.title')}
          </Title>
          <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('appointment.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('appointment.refresh')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder={t('appointment.searchStudent')}
              allowClear
              onSearch={handleSearch}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
          items={tabItems}
        />
      </Card>
    </div>
  )
}

// Add display name for debugging
AppointmentManagement.displayName = 'AppointmentManagement'

export default memo(AppointmentManagement)

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
  PlayCircleOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import CreateAppointmentModal from './CreateAppointmentModal'
import dayjs from 'dayjs'
import {
  getActiveAppointments,
  getPastAppointments,
} from '../../../store/actions/appointmentActions'
import {
  selectActiveAppointments,
  selectPastAppointments,
  selectAppointmentLoading,
  selectAppointmentError,
  clearError,
  setSelectedAppointment,
  clearSelectedAppointment,
  clearAppointmentDetails,
} from '../../../store/slices/appointmentSlice'
import {
  APPOINTMENT_STATUS,
  SESSION_FLOW,
  STUDENT_COOP_LEVEL,
} from '../../../constants/enums'
import { selectUser } from '../../../store/slices/authSlice'
import { loadAccount } from '@/store/actions'

const { Search } = Input
const { Title, Text } = Typography

// Status configuration - moved outside component to prevent recreation
const STATUS_CONFIG = {
  [APPOINTMENT_STATUS.PENDING]: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: <ClockCircleOutlined />,
  },
  [APPOINTMENT_STATUS.CONFIRMED]: {
    color: 'geekblue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    icon: <CalendarOutlined />,
  },
  [APPOINTMENT_STATUS.IN_PROGRESS]: {
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    icon: <PlayCircleOutlined />,
  },
  [APPOINTMENT_STATUS.COMPLETED]: {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    icon: <CalendarOutlined />,
  },
  [APPOINTMENT_STATUS.ABSENT]: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    icon: <StopOutlined />,
  },
  [APPOINTMENT_STATUS.CANCELED]: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    icon: <ExclamationCircleOutlined />,
  },
  [APPOINTMENT_STATUS.EXPIRED]: {
    color: 'gray',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    icon: <ExclamationCircleOutlined />,
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
  const config =
    STATUS_CONFIG[status] || STATUS_CONFIG[APPOINTMENT_STATUS.PENDING]
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

const AppointmentManagement = () => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()

  // Redux selectors
  const activeAppointments = useSelector(selectActiveAppointments)
  const pastAppointments = useSelector(selectPastAppointments)
  const loading = useSelector(selectAppointmentLoading)
  const error = useSelector(selectAppointmentError)
  const user = useSelector(selectUser)

  // Local state
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [dateRange, setDateRange] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [createModalVisible, setCreateModalVisible] = useState(false)

  // Check if user is manager (read-only access)
  const isManager = user?.role === 'manager'
  const isCounselor =
    user?.role === 'counselor' &&
    user?.hasAvailable &&
    Array.isArray(user?.categories) &&
    user?.categories?.length > 0

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
    Promise.all([
      dispatch(clearSelectedAppointment()),
      dispatch(clearAppointmentDetails()),
    ])
    // Use user.id from Redux instead of mock account ID
    if (user?.id) {
      Promise.all([
        dispatch(getActiveAppointments(user.id)),
        dispatch(getPastAppointments(user.id)),
      ])
    }
  }, [])

  // Handle error messages
  useEffect(() => {
    if (error) {
      messageApi.error(t('appointment.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, dispatch, messageApi])

  // Handle create appointment modal
  const handleCreateAppointment = () => {
    setCreateModalVisible(true)
  }

  const handleCreateModalCancel = () => {
    setCreateModalVisible(false)
  }

  const handleCreateAppointmentSuccess = () => {
    setCreateModalVisible(false)
    // Refresh appointments
    if (user?.id) {
      Promise.all([
        dispatch(getActiveAppointments(user.id)),
        dispatch(getPastAppointments(user.id)),
      ])
    }
    messageApi.success(t('appointment.createdSuccessfully'))
  }

  // Filter appointments by date range and search text with tab-specific logic
  const filterAppointments = useCallback(
    (appointments, tabType = 'active') => {
      if (!appointments || appointments.length === 0) {
        return []
      }

      let filtered = appointments

      // Filter by date range with tab-specific logic
      if (dateRange && dateRange.length === 2) {
        const [startDate, endDate] = dateRange
        filtered = filtered.filter(appointment => {
          if (!appointment.startDateTime) return false

          const appointmentDate = dayjs(appointment.startDateTime)
          const isInRange =
            appointmentDate.isAfter(startDate, 'day') &&
            appointmentDate.isBefore(endDate.add(1, 'day'), 'day')

          // For active tab, also check if appointment is not in the past
          if (tabType === 'active') {
            const now = dayjs()
            return isInRange && appointmentDate.isAfter(now, 'day')
          }

          // For past tab, check if appointment is in the past
          if (tabType === 'past') {
            const now = dayjs()
            return isInRange && appointmentDate.isBefore(now, 'day')
          }

          return isInRange
        })
      }

      // Filter by search text with enhanced search logic
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase()
        filtered = filtered.filter(appointment => {
          const searchableFields = [
            appointment.hostedBy?.fullName,
            appointment.bookedBy?.fullName,
            appointment.bookedFor?.fullName,
            // Add host type search
            t(
              `appointment.hostType.${appointment.hostType?.toLowerCase() || 'teacher'}`
            ),
          ].filter(Boolean) // Remove undefined values

          return searchableFields.some(field =>
            field.toLowerCase().includes(searchLower)
          )
        })
      }
      // console.log('filtered', filtered)
      return filtered
    },
    [dateRange, searchText, t]
  )

  // Memoized filtered appointments
  const filteredActiveAppointments = useMemo(() => {
    return filterAppointments(activeAppointments, 'active')
  }, [activeAppointments, filterAppointments])

  // Memoized filtered past appointments
  const filteredPastAppointments = useMemo(() => {
    return filterAppointments(pastAppointments, 'past')
  }, [pastAppointments, filterAppointments])

  // Get current tab data
  const currentTabData = useMemo(() => {
    switch (activeTab) {
      case 'active':
        return filteredActiveAppointments
      case 'past':
        return filteredPastAppointments
      default:
        return filteredActiveAppointments
    }
  }, [activeTab, filteredActiveAppointments, filteredPastAppointments])

  // Memoized handlers
  const handleRefresh = useCallback(() => {
    if (!user) return
    if (user?.id) {
      if (user.role.toLowerCase() !== 'manager') {
        Promise.all([
          dispatch(loadAccount()).unwrap(),
          activeTab === 'active'
            ? dispatch(getActiveAppointments(user.id)).unwrap()
            : dispatch(getPastAppointments(user.id)).unwrap(),
        ])
      } else {
        activeTab === 'active'
          ? dispatch(getActiveAppointments(user.id)).unwrap()
          : dispatch(getPastAppointments(user.id)).unwrap()
      }
    }
  }, [activeTab, dispatch, user?.id, user?.role])

  const handleSearch = useCallback(value => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  // Enhanced search with debouncing
  const handleSearchChange = useCallback(e => {
    const value = e.target.value
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  const handleDateRangeChange = useCallback(dates => {
    setDateRange(dates)
    setPagination(prev => ({ ...prev, current: 1 }))
  }, [])

  const handleViewDetails = useCallback(
    item => {
      React.startTransition(() => {
        const appointment = item.appointment || item
        const appointmentId = appointment.id || item.id
        dispatch(setSelectedAppointment(appointment))
        navigate(`/appointment-management/details/${appointmentId}`)
      })
    },
    [navigate, dispatch]
  )

  // For manager, only allow viewing details, no editing
  const handleRowClick = useCallback(
    record => {
      if (isManager) {
        handleViewDetails(record)
      }
    },
    [handleViewDetails, isManager]
  )

  const handleTabChange = useCallback(
    key => {
      React.startTransition(() => {
        setActiveTab(key)
        setPagination(prev => ({ ...prev, current: 1 }))
        if (user?.id) {
          if (key === 'active') {
            dispatch(getActiveAppointments(user.id))
          } else if (key === 'past') {
            dispatch(getPastAppointments(user.id))
          }
        }
      })
    },
    [dispatch, user]
  )

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

  // Memoized table columns for active appointments
  const activeAppointmentColumns = useMemo(
    () => [
      {
        title: t('appointment.table.hostName'),
        dataIndex: 'hostedBy',
        key: 'hostName',
        render: (hostedBy, record) => (
          <div className="flex flex-col">
            <Text strong>{hostedBy?.fullName}</Text>
            <Text type="secondary" className="text-xs">
              <MemoizedHostTypeTag hostType={record.hostType} t={t} />
            </Text>
          </div>
        ),
        hidden: user.role !== 'MANAGER',
      },
      {
        title: t('appointment.table.bookByName'),
        dataIndex: 'bookedBy',
        key: 'bookByName',
        render: (bookedBy, record) => {
          const isSamePerson = record.bookedFor?.id === record.bookedBy?.id
          return (
            <div className="flex flex-col">
              <Text>
                {isSamePerson ? bookedBy?.fullName : record.bookedFor?.fullName}
              </Text>
              {!isSamePerson && (
                <Text type="secondary" className="text-xs">
                  {t('appointment.table.bookByName')}: {bookedBy?.fullName}
                </Text>
              )}
            </div>
          )
        },
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
            {text || t('appointment.table.noLocation', 'Not specified')}
          </Text>
        ),
      },
      {
        title: t('appointment.status.label'),
        dataIndex: 'status',
        key: 'status',
        render: status => <MemoizedStatusBadge status={status} t={t} />,
        filters: [
          {
            text: t('appointment.status.pending'),
            value: APPOINTMENT_STATUS.PENDING,
          },
          {
            text: t('appointment.status.confirmed'),
            value: APPOINTMENT_STATUS.CONFIRMED,
          },
          {
            text: t('appointment.status.inProgress'),
            value: APPOINTMENT_STATUS.IN_PROGRESS,
          },
        ],
        onFilter: (value, record) => record.status === value,
      },
      // Only show actions column if user is not manager
      ...(isManager
        ? []
        : [
            {
              key: 'actions',
              width: 80,
              fixed: 'right',
              render: (_, record) => (
                <Space size="small">
                  <Tooltip title={t('common.viewDetails')}>
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(record)}
                      className="text-blue-600 hover:text-blue-800"
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]),
    ],
    [t, formatDateTime, calculateDuration, handleViewDetails, isManager]
  )

  // Memoized table columns for past appointments
  const pastAppointmentColumns = useMemo(
    () => [
      {
        title: t('appointment.table.hostName'),
        dataIndex: 'hostedBy',
        key: 'hostName',
        render: (hostedBy, record) => (
          <div className="flex flex-col">
            <Text strong>{hostedBy?.fullName}</Text>
            <Text type="secondary" className="text-xs">
              <MemoizedHostTypeTag hostType={record.hostType} t={t} />
            </Text>
          </div>
        ),
        sorter: (a, b) =>
          (a.hostedBy?.fullName || '').localeCompare(
            b.hostedBy?.fullName || ''
          ),
      },
      {
        title: t('appointment.table.bookByName'),
        dataIndex: 'bookedBy',
        key: 'bookByName',
        render: (bookedBy, record) => {
          const isSamePerson = record.bookedFor?.id === record.bookedBy?.id
          return (
            <div className="flex flex-col">
              <Text>
                {isSamePerson ? bookedBy?.fullName : record.bookedFor?.fullName}
              </Text>
              {!isSamePerson && (
                <Text type="secondary" className="text-xs">
                  {t('appointment.table.bookByName')}: {bookedBy?.fullName}
                </Text>
              )}
            </div>
          )
        },
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
        title: t('appointmentRecord.sessionFlowTitle'),
        dataIndex: 'sessionFlow',
        key: 'sessionFlow',
        render: sessionFlow => {
          const config = {
            [SESSION_FLOW.GOOD]: {
              color: 'green',
              text: t('appointmentRecord.sessionFlow.good', 'Good'),
            },
            [SESSION_FLOW.AVERAGE]: {
              color: 'orange',
              text: t('appointmentRecord.sessionFlow.average', 'Average'),
            },
            [SESSION_FLOW.POOR]: {
              color: 'red',
              text: t('appointmentRecord.sessionFlow.poor', 'Poor'),
            },
            [SESSION_FLOW.UNKNOWN]: {
              color: 'gray',
              text: t('appointmentRecord.sessionFlow.unknown', 'Unknown'),
            },
          }
          const flow = config[sessionFlow] || config[SESSION_FLOW.UNKNOWN]
          return <Tag color={flow.color}>{flow.text}</Tag>
        },
        filters: [
          {
            text: t('appointmentRecord.sessionFlow.good', 'Good'),
            value: SESSION_FLOW.GOOD,
          },
          {
            text: t('appointmentRecord.sessionFlow.average', 'Average'),
            value: SESSION_FLOW.AVERAGE,
          },
          {
            text: t('appointmentRecord.sessionFlow.poor', 'Poor'),
            value: SESSION_FLOW.POOR,
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
            [STUDENT_COOP_LEVEL.HIGH]: {
              color: 'green',
              text: t('appointmentRecord.cooperationLevel.high', 'High'),
            },
            [STUDENT_COOP_LEVEL.MEDIUM]: {
              color: 'orange',
              text: t('appointmentRecord.cooperationLevel.medium', 'Medium'),
            },
            [STUDENT_COOP_LEVEL.LOW]: {
              color: 'red',
              text: t('appointmentRecord.cooperationLevel.low', 'Low'),
            },
            [STUDENT_COOP_LEVEL.UNKNOWN]: {
              color: 'gray',
              text: t('appointmentRecord.cooperationLevel.unknown', 'Unknown'),
            },
          }
          const coop = config[level] || config[STUDENT_COOP_LEVEL.UNKNOWN]
          return <Tag color={coop.color}>{coop.text}</Tag>
        },
        filters: [
          {
            text: t('appointmentRecord.cooperationLevel.high', 'High'),
            value: STUDENT_COOP_LEVEL.HIGH,
          },
          {
            text: t('appointmentRecord.cooperationLevel.medium', 'Medium'),
            value: STUDENT_COOP_LEVEL.MEDIUM,
          },
          {
            text: t('appointmentRecord.cooperationLevel.low', 'Low'),
            value: STUDENT_COOP_LEVEL.LOW,
          },
        ],
        onFilter: (value, record) => record.studentCoopLevel === value,
      },
      {
        title: t('appointment.status.label'),
        dataIndex: 'status',
        key: 'status',
        render: status => <MemoizedStatusBadge status={status} t={t} />,
        filters: [
          {
            text: t('appointment.status.completed'),
            value: APPOINTMENT_STATUS.COMPLETED,
          },
          {
            text: t('appointment.status.absent'),
            value: APPOINTMENT_STATUS.ABSENT,
          },
          {
            text: t('appointment.status.canceled'),
            value: APPOINTMENT_STATUS.CANCELED,
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
            <Tooltip title={t('common.viewDetails')}>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetails(record)}
                className="text-blue-600 hover:text-blue-800"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [t, formatDateTime, calculateDuration, handleViewDetails, isManager]
  )

  // Get columns based on active tab
  const getColumns = () => {
    switch (activeTab) {
      case 'active':
        return activeAppointmentColumns
      case 'past':
        return pastAppointmentColumns
      default:
        return activeAppointmentColumns
    }
  }

  // Memoized tab items
  const tabItems = useMemo(
    () => [
      {
        key: 'active',
        label: (
          <span className="flex items-center gap-2">
            {t('appointment.tabs.active')}
            <Badge
              count={filteredActiveAppointments.length}
              style={{ backgroundColor: '#1890ff' }}
            />
          </span>
        ),
      },
      {
        key: 'past',
        label: (
          <span className="flex items-center gap-2">
            {t('appointment.tabs.past')}
            <Badge
              count={filteredPastAppointments.length}
              style={{ backgroundColor: '#faad14' }}
            />
          </span>
        ),
      },
    ],
    [t, filteredActiveAppointments.length, filteredPastAppointments.length]
  )

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
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

          <div className="flex items-center gap-3">
            {isCounselor && (
              <Tooltip title={t('appointment.createButton.tooltip')}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAppointment}
                  className="shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-500 to-blue-600 border-0 hover:from-blue-600 hover:to-blue-700"
                >
                  <span className="flex items-center space-x-2">
                    <span>{t('appointment.createButton.title')}</span>
                  </span>
                </Button>
              </Tooltip>
            )}

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
              className="hover:bg-gray-50 transition-all duration-200"
            >
              {t('appointment.refresh')}
            </Button>
          </div>
        </div>

        {/* Manager Notice */}
        {isManager && (
          <div className="mb-4">
            <Tag color="orange" icon={<ExclamationCircleOutlined />}>
              {t('appointment.manager.readOnly')}
            </Tag>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <Card
        className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              value={searchText}
              placeholder={t('appointment.searchStudent')}
              allowClear
              onSearch={handleSearch}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <DatePicker.RangePicker
              value={dateRange}
              placeholder={[
                t('appointment.filter.startDate'),
                t('appointment.filter.endDate'),
              ]}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              allowClear
              style={{ width: '100%' }}
            />
          </Col>
          {(searchText || dateRange.length > 0) && (
            <Col>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setSearchText('')
                    setDateRange([])
                    setPagination(prev => ({ ...prev, current: 1 }))
                  }}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  {t('appointment.filter.clearFilters')}
                </Button>
              </div>
            </Col>
          )}
        </Row>
      </Card>

      {/* Tabs and Table Section */}
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <div className="mb-4">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            size="large"
            items={tabItems}
          />
        </div>

        <div className="mb-4">
          <Table
            columns={getColumns()}
            dataSource={currentTabData}
            rowKey="id"
            loading={loading}
            onRow={
              isManager
                ? record => ({
                    onClick: () => handleRowClick(record),
                    style: { cursor: 'pointer' },
                  })
                : undefined
            }
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
            size="middle"
            locale={{
              emptyText: (
                <div className="py-12 text-center">
                  <div className="text-gray-400 text-lg mb-4">
                    {t('appointment.messages.noData')}
                  </div>
                </div>
              ),
            }}
          />
        </div>
      </Card>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={createModalVisible}
        onClose={handleCreateModalCancel}
        onSuccess={handleCreateAppointmentSuccess}
      />
    </div>
  )
}

// Add display name for debugging
AppointmentManagement.displayName = 'AppointmentManagement'

export default memo(AppointmentManagement)

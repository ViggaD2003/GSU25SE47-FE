import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

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
  Space,
  Tag,
  Tooltip,
  DatePicker,
  Select,
  Statistic,
  Progress,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  SaveOutlined,
  CloseOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import { assignCase, getCases } from '../../../store/actions/caseActions'
import { clearError } from '../../../store/slices/caseSlice'
import CaseModal from './CaseModal'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { accountAPI } from '@/services/accountApi'
import { useNavigate } from 'react-router-dom'
import { loadAccount } from '@/store/actions'

const { Search } = Input
const { Title, Text } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

// Priority configuration
const PRIORITY_CONFIG = {
  HIGH: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    icon: <ExclamationCircleOutlined />,
  },
  MEDIUM: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    icon: <ClockCircleOutlined />,
  },
  LOW: {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    icon: <CheckCircleOutlined />,
  },
}

// Status configuration
const STATUS_CONFIG = {
  NEW: {
    color: 'blue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  IN_PROGRESS: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  CLOSED: {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
}

// Progress trend configuration
const PROGRESS_CONFIG = {
  IMPROVED: {
    color: 'green',
    text: 'Improved',
  },
  STABLE: {
    color: 'blue',
    text: 'Stable',
  },
  DECLINED: {
    color: 'red',
    text: 'Declined',
  },
}

const CaseManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  const { cases, loading, error } = useSelector(state => state.case)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [editingHostBy, setEditingHostBy] = useState(null)
  const [tempHostBy, setTempHostBy] = useState(null)
  const [availableHosts, setAvailableHosts] = useState([])
  const [hostsLoading, setHostsLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [bulkCounselorId, setBulkCounselorId] = useState(null)
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(getCases({ accountId: user.id }))
  }, [dispatch, user.id])

  useEffect(() => {
    if (error) {
      messageApi.error(t('caseManagement.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, messageApi, dispatch])

  // Load available hosts for managers
  useEffect(() => {
    const loadAvailableHosts = async () => {
      if (user?.role === 'manager') {
        setHostsLoading(true)
        try {
          const response = await accountAPI.getAccounts({
            role: 'COUNSELOR',
          })
          setAvailableHosts(response)
        } catch (error) {
          console.error('Failed to load available hosts:', error)
        } finally {
          setHostsLoading(false)
        }
      }
    }

    loadAvailableHosts()
  }, [user?.role])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!cases)
      return {
        total: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        newStatus: 0,
        inProgressStatus: 0,
        closedStatus: 0,
      }

    const total = cases.length
    const highPriority = cases.filter(c => c.priority === 'HIGH').length
    const mediumPriority = cases.filter(c => c.priority === 'MEDIUM').length
    const lowPriority = cases.filter(c => c.priority === 'LOW').length
    const newStatus = cases.filter(c => c.status === 'NEW').length
    const inProgressStatus = cases.filter(
      c => c.status === 'IN_PROGRESS'
    ).length
    const closedStatus = cases.filter(c => c.status === 'CLOSED').length

    return {
      total,
      highPriority,
      mediumPriority,
      lowPriority,
      newStatus,
      inProgressStatus,
      closedStatus,
    }
  }, [cases])

  // Filter cases
  const filteredCases = useMemo(() => {
    if (!cases) return []

    return cases.filter(caseItem => {
      // Text search
      const matchesSearch =
        !searchText.trim() ||
        caseItem.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        caseItem.description
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        caseItem.student?.fullName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        caseItem.student?.studentCode
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        caseItem.createBy?.fullName
          ?.toLowerCase()
          .includes(searchText.toLowerCase())

      // Date range filter
      const matchesDateRange =
        !dateRange ||
        !dateRange.length ||
        (dayjs(caseItem.createdAt).isAfter(dateRange[0].startOf('day')) &&
          dayjs(caseItem.createdAt).isBefore(dateRange[1].endOf('day')))

      return matchesSearch && matchesDateRange
    })
  }, [cases, searchText, dateRange])

  const handleClearFilters = useCallback(() => {
    setSearchText('')
    setDateRange(null)
  }, [])

  const handleRefresh = useCallback(() => {
    if (!user) return
    if (user?.role.toLowerCase() !== 'manager') {
      Promise.all([
        dispatch(loadAccount()).unwrap(),
        dispatch(getCases({ accountId: user.id })).unwrap(),
      ])
    } else {
      dispatch(getCases({ accountId: user.id })).unwrap()
    }
  }, [dispatch, user])

  // Modal handlers
  // const handleAdd = useCallback(() => {
  //   setEditingCase(null)
  //   setIsModalVisible(true)
  // }, [])

  // HostBy editing handlers
  const handleEditHostBy = useCallback(record => {
    setTempHostBy(record?.counselor?.id || null)
    setEditingHostBy(record.id)
    // Smoothly scroll the edited row into view
    requestAnimationFrame(() => {
      const el = document.querySelector(`.case-row-${record.id}`)
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }, [])

  const handleSaveHostBy = useCallback(
    async record => {
      try {
        if (!tempHostBy) {
          setEditingHostBy(null)
          return
        }
        await dispatch(
          assignCase({
            caseId: [record.id],
            counselorId: tempHostBy,
          })
        ).unwrap()
        messageApi.success(t('caseManagement.messages.assignSuccess'))
        // Refresh data to reflect latest state
        await dispatch(getCases({ accountId: user.id })).unwrap()
        setEditingHostBy(null)
        setTempHostBy(null)
      } catch {
        messageApi.error(t('caseManagement.messages.assignError'))
      }
    },
    [dispatch, messageApi, t, tempHostBy]
  )

  const handleCancelHostBy = useCallback(() => {
    setEditingHostBy(null)
    setTempHostBy(null)
  }, [])

  const handleChangeHostBy = useCallback(value => {
    setTempHostBy(value)
  }, [])

  const handleViewCase = useCallback(
    record => {
      navigate(`/case-management/details/${record.id}`)
    },
    [navigate]
  )

  const editHostByColumn = useCallback(
    (counselor, record) => {
      const isEditing = editingHostBy === record.id

      if (isEditing) {
        return (
          <Select
            placeholder={t('caseManagement.table.hostBy')}
            value={tempHostBy}
            onChange={handleChangeHostBy}
            style={{ width: 200 }} // Auto width + giới hạn nhỏ nhất
            loading={hostsLoading}
            showSearch
            allowClear
            optionLabelProp="label"
            popupMatchSelectWidth={false}
          >
            {availableHosts.map(host => (
              <Option
                key={host.id}
                value={host.id}
                label={`${host.fullName}${host.counselorCode ? ` (${host.counselorCode})` : ''}`}
              >
                <div className="font-medium flex items-center">
                  <UserOutlined className="mr-1" />
                  {host.fullName} -{' '}
                  {host?.gender ? t('common.male') : t('common.female')}
                </div>
                <div className="text-xs text-gray-500">
                  {host?.counselorCode &&
                    `${t('caseManagement.table.counselorCode')}: ${host.counselorCode}`}
                </div>
              </Option>
            ))}
          </Select>
        )
      }
      return (
        <div className="flex items-center justify-between">
          <div>
            {counselor ? (
              <>
                <div className="font-medium flex items-center">
                  <UserOutlined className="mr-1" />
                  {counselor?.fullName} -{' '}
                  {counselor?.gender ? t('common.male') : t('common.female')}
                </div>
                <div className="text-xs text-gray-500">
                  {counselor?.counselorCode &&
                    `${t('caseManagement.table.counselorCode')}: ${counselor.counselorCode}`}
                </div>
              </>
            ) : (
              <div className="text-gray-400">
                {t('caseManagement.table.noHost')}
              </div>
            )}
          </div>
        </div>
      )
    },
    [
      t,
      editingHostBy,
      availableHosts,
      hostsLoading,
      tempHostBy,
      handleChangeHostBy,
    ]
  )

  // Bulk assign selected cases to a counselor (for managers)
  const handleBulkAssign = useCallback(async () => {
    if (!bulkCounselorId || !selectedRowKeys.length) return
    setBulkAssignLoading(true)
    try {
      const caseIds = selectedRowKeys
      await dispatch(
        assignCase({
          caseId: caseIds,
          counselorId: bulkCounselorId,
        })
      ).unwrap()
      messageApi.success(t('caseManagement.messages.assignSuccess'))
      await dispatch(getCases({ accountId: user.id })).unwrap()
      setSelectedRowKeys([])
      setBulkCounselorId(null)
    } catch {
      messageApi.error(t('caseManagement.messages.assignError'))
    } finally {
      setBulkAssignLoading(false)
    }
  }, [bulkCounselorId, selectedRowKeys, dispatch, messageApi, t, user.id])

  // Table columns
  const columns = useMemo(
    () => [
      {
        title: t('caseManagement.table.student'),
        dataIndex: 'student',
        key: 'student',
        render: student => (
          <div>
            <div className="font-medium flex items-center">
              <UserOutlined className="mr-1" />
              {student?.fullName}
            </div>
            <Tooltip title={student?.email}>
              <Text
                type="secondary"
                className="text-xs text-gray-500 "
                ellipsis
              >
                {student?.email}
              </Text>
            </Tooltip>
            <div className="text-xs text-gray-500">
              {t('caseManagement.table.studentCode')}: {student?.studentCode}
            </div>
            <div className="text-xs text-gray-500">
              {student?.classDto?.codeClass} - {student?.classDto?.schoolYear}
            </div>
          </div>
        ),
      },
      {
        title: t('caseManagement.table.title'),
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <div>
            <div className="font-medium">{text}</div>
            <Tooltip
              title={
                record.description || t('caseManagement.table.noDescription')
              }
            >
              <Text className="line-clamp-2">
                {record.description || t('caseManagement.table.noDescription')}
              </Text>
            </Tooltip>
          </div>
        ),
      },
      {
        title: t('caseManagement.table.category'),
        dataIndex: 'category',
        key: 'category',
        render: (text, record) => (
          <div>
            <div className="font-medium">{record.categoryName}</div>
            <div className="text-xs text-gray-500">{record.codeCategory}</div>
          </div>
        ),
      },
      {
        title: t('caseManagement.table.status'),
        dataIndex: 'status',
        key: 'status',
        render: status => {
          const config = STATUS_CONFIG[status]
          const tagColor = config?.color || 'default'
          const className = config
            ? `${config.bgColor} ${config.textColor} ${config.borderColor} border`
            : ''
          return (
            <Tag color={tagColor} className={className}>
              {status
                ? t(`caseManagement.statusOptions.${status}`)
                : t('common.unknown')}
            </Tag>
          )
        },
        filters: [
          { text: t('caseManagement.statusOptions.NEW'), value: 'NEW' },
          {
            text: t('caseManagement.statusOptions.IN_PROGRESS'),
            value: 'IN_PROGRESS',
          },
          { text: t('caseManagement.statusOptions.CLOSED'), value: 'CLOSED' },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: t('caseManagement.table.priority'),
        dataIndex: 'priority',
        key: 'priority',
        render: priority => {
          const config = PRIORITY_CONFIG[priority]
          const tagColor = config?.color || 'default'
          const className = config
            ? `${config.bgColor} ${config.textColor} ${config.borderColor} border`
            : ''
          return (
            <Tag color={tagColor} icon={config?.icon} className={className}>
              {priority
                ? t(`caseManagement.priorityOptions.${priority}`)
                : t('common.unknown')}
            </Tag>
          )
        },
        filters: [
          { text: t('caseManagement.priorityOptions.HIGH'), value: 'HIGH' },
          { text: t('caseManagement.priorityOptions.MEDIUM'), value: 'MEDIUM' },
          { text: t('caseManagement.priorityOptions.LOW'), value: 'LOW' },
        ],
        onFilter: (value, record) => record.priority === value,
      },
      {
        title: t('caseManagement.table.progressTrend'),
        dataIndex: 'progressTrend',
        key: 'progressTrend',
        render: progress => {
          const config = PROGRESS_CONFIG[progress]
          const tagColor = config?.color || 'default'
          return (
            <Tag color={tagColor}>
              {progress
                ? t(`caseManagement.progressTrendOptions.${progress}`)
                : t('common.unknown')}
            </Tag>
          )
        },
      },
      {
        title: t('caseManagement.table.hostBy'),
        dataIndex: 'counselor',
        key: 'counselor',
        render: (counselor, record) => editHostByColumn(counselor, record),
        width: editingHostBy ? 250 : 200,
        editable: record => user?.role === 'manager' && record.status === 'NEW',
        hidden: user?.role === 'counselor',
      },
      {
        title: t('caseManagement.table.currentLevel'),
        dataIndex: 'currentLevel',
        key: 'currentLevel',
        render: currentLevel => (
          <div>
            <div className="font-medium flex items-center">
              <BookOutlined className="mr-1" />
              {currentLevel?.label}
            </div>
            <div className="text-xs text-gray-500">
              {currentLevel?.code} ({currentLevel?.minScore}-
              {currentLevel?.maxScore})
            </div>
          </div>
        ),
      },
      {
        title: t('caseManagement.table.initialLevel'),
        dataIndex: 'initialLevel',
        key: 'initialLevel',
        render: initialLevel => (
          <div>
            <div className="font-medium flex items-center">
              <BookOutlined className="mr-1" />
              {initialLevel?.label}
            </div>
            <div className="text-xs text-gray-500">
              {initialLevel?.code} ({initialLevel?.minScore}-
              {initialLevel?.maxScore})
            </div>
          </div>
        ),
      },
      {
        title: t('caseManagement.table.createBy'),
        dataIndex: 'createBy',
        key: 'createBy',
        render: createBy => (
          <div>
            <div className="font-medium flex items-center">
              <UserOutlined className="mr-1" />
              {createBy?.fullName}
            </div>
            <div className="text-xs text-gray-500">
              {createBy?.teacherCode &&
                `${t('caseManagement.table.teacherCode')}: ${createBy.teacherCode}`}
            </div>
          </div>
        ),
        hidden: user?.role === 'teacher',
      },
      {
        title: t('caseManagement.table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: date => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
        sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      },
      {
        key: 'actions',
        width: 100,
        render: (_, record) =>
          !editingHostBy ? (
            <Space size="small">
              <Tooltip title={t('common.view')}>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  size="small"
                  onClick={() => handleViewCase(record)}
                />
              </Tooltip>
              {user?.role === 'manager' && record.status === 'NEW' && (
                <Tooltip title={t('common.edit')}>
                  <Button
                    type="link"
                    icon={<UserAddOutlined />}
                    size="small"
                    onClick={() => handleEditHostBy(record)}
                  />
                </Tooltip>
              )}
            </Space>
          ) : (
            <Space size="small">
              <Tooltip title={t('common.save')}>
                <Button
                  type="link"
                  icon={<SaveOutlined />}
                  size="small"
                  onClick={() => handleSaveHostBy(record)}
                />
              </Tooltip>
              <Tooltip title={t('common.cancel')}>
                <Button
                  type="text"
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  onClick={handleCancelHostBy}
                />
              </Tooltip>
            </Space>
          ),
        fixed: 'right',
      },
    ],
    [
      t,
      user?.role,
      editHostByColumn,
      handleViewCase,
      handleEditHostBy,
      handleSaveHostBy,
      handleCancelHostBy,
      editingHostBy,
    ]
  )

  // Only render visible columns (support custom hidden flag)
  const visibleColumns = useMemo(
    () => columns.filter(col => !col.hidden),
    [columns]
  )

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          {t('caseManagement.title')}
        </Title>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('caseManagement.statistics.total')}
              value={statistics.total}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('caseManagement.statistics.highPriority')}
              value={statistics.highPriority}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('caseManagement.statistics.mediumPriority')}
              value={statistics.mediumPriority}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title={t('caseManagement.statistics.lowPriority')}
              value={statistics.lowPriority}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={6}>
            <Search
              placeholder={t('caseManagement.search.placeholder')}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={[t('common.startDate'), t('common.endDate')]}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <Space>
              {(searchText || dateRange) && (
                <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                  {t('common.clear')}
                </Button>
              )}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
              >
                {t('common.refresh')}
              </Button>
            </Space>
          </Col>
          {user?.role === 'manager' &&
            cases?.length > 0 &&
            cases.some(caseItem => caseItem.status === 'NEW') && (
              <Col xs={24} sm={24} lg={24}>
                <Space wrap>
                  <Select
                    placeholder={t('caseManagement.table.hostBy')}
                    value={bulkCounselorId}
                    onChange={setBulkCounselorId}
                    style={{ minWidth: 220 }}
                    loading={hostsLoading}
                    showSearch
                    allowClear
                    optionLabelProp="label"
                  >
                    {availableHosts.map(host => (
                      <Option
                        key={host.id}
                        value={host.id}
                        label={
                          // This label will be used for the selected value
                          `${host.fullName}${host.counselorCode ? ` (${host.counselorCode})` : ''}`
                        }
                      >
                        {/* Dropdown content */}
                        <div className="font-medium flex items-center">
                          <UserOutlined className="mr-1" />
                          {host.fullName} -{' '}
                          {host?.gender ? t('common.male') : t('common.female')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {host?.counselorCode &&
                            `${t('caseManagement.table.counselorCode')}: ${host.counselorCode}`}
                        </div>
                      </Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    disabled={!bulkCounselorId || !selectedRowKeys.length}
                    loading={bulkAssignLoading}
                    onClick={handleBulkAssign}
                  >
                    {t('common.assign')}
                  </Button>
                </Space>
              </Col>
            )}
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={visibleColumns}
          dataSource={filteredCases}
          rowKey="id"
          loading={loading}
          sticky
          rowSelection={
            user?.role === 'manager'
              ? {
                  selectedRowKeys,
                  onChange: setSelectedRowKeys,
                  preserveSelectedRowKeys: true,
                  getCheckboxProps: record => ({
                    disabled: record.status !== 'NEW',
                  }),
                }
              : undefined
          }
          rowClassName={record =>
            `case-row-${record.id}` +
            (editingHostBy === record.id ? ' bg-yellow-50' : '')
          }
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
          }}
          scroll={{ x: 2000 }}
        />
      </Card>
    </div>
  )
}

export default CaseManagement

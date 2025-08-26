import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
  Card,
  Button,
  Input,
  message,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  Select,
  Statistic,
} from 'antd'
import {
  ReloadOutlined,
  ClearOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { assignCase, getCases } from '../../../store/actions/caseActions'
import { clearError } from '../../../store/slices/caseSlice'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { accountAPI } from '@/services/accountApi'
import { loadAccount } from '@/store/actions'
import CaseTable from './CaseTable'

const { Search } = Input
const { Title } = Typography
const { Option } = Select
const { RangePicker } = DatePicker

const CaseManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [messageApi, contextHolder] = message.useMessage()

  const { cases, loading, error } = useSelector(state => state.case)
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)
  const [availableHosts, setAvailableHosts] = useState([])
  const [hostsLoading, setHostsLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [bulkCounselorId, setBulkCounselorId] = useState(null)
  const [bulkAssignLoading, setBulkAssignLoading] = useState(false)
  const [editingHostBy, setEditingHostBy] = useState(null)
  const [tempHostBy, setTempHostBy] = useState(null)

  const loadAvailableHosts = async () => {
    try {
      const response = await accountAPI.getAccounts({
        role: 'COUNSELOR',
      })
      setAvailableHosts(response || [])
    } catch (error) {
      console.error('Failed to load available hosts:', error)
    }
  }

  const fetchData = useCallback(async () => {
    if (!user) return
    setHostsLoading(true)
    Promise.all([
      user.role !== 'manager' && dispatch(loadAccount()).unwrap(),
      dispatch(getCases({ accountId: user.id })).unwrap(),
      user.role === 'manager' && loadAvailableHosts(),
    ]).finally(() => {
      setHostsLoading(false)
    })
  }, [dispatch, user])

  useEffect(() => {
    if (cases.length === 0) {
      fetchData()
    }
  }, [cases.length])

  useEffect(() => {
    if (error) {
      messageApi.error(t('caseManagement.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, messageApi, dispatch])

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
        caseItem.student?.fullName
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        caseItem.student?.studentCode
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        caseItem.student?.email
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
    Promise.all([
      user.role !== 'manager' && dispatch(loadAccount()).unwrap(),
      dispatch(getCases({ accountId: user.id })).unwrap(),
    ]).then(() => {
      messageApi.success(t('common.refreshSuccess'))
    })
  }, [dispatch, user, messageApi, t])

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

  const handleSaveHostBy = useCallback(
    async record => {
      if (!tempHostBy) {
        setEditingHostBy(null)
        return
      }
      Promise.all([
        await dispatch(
          assignCase({
            caseId: [record.id],
            counselorId: tempHostBy,
          })
        ).unwrap(),
      ])
        .then(() => {
          messageApi.success(t('caseManagement.messages.assignSuccess'))
          fetchData()
          setEditingHostBy(null)
          setTempHostBy(null)
        })
        .catch(() => {
          messageApi.error(t('caseManagement.messages.assignError'))
        })
    },
    [dispatch, messageApi, t, tempHostBy]
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
            cases.some(caseItem => caseItem.status === 'CONFIRMED') && (
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
        <CaseTable
          loading={loading || hostsLoading}
          t={t}
          user={user}
          availableHosts={availableHosts}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          filteredCases={filteredCases}
          editingHostBy={editingHostBy}
          setEditingHostBy={setEditingHostBy}
          tempHostBy={tempHostBy}
          setTempHostBy={setTempHostBy}
          handleSaveHostBy={handleSaveHostBy}
        />
      </Card>
    </div>
  )
}

export default CaseManagement

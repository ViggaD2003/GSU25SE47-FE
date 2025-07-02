import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
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
} from 'antd'
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAuth } from '../../../contexts/AuthContext'
import {
  fetchSlots,
  selectSlots,
  selectSlotLoading,
  selectSlotError,
  clearError,
} from '../../../store/slices/slotSlice'
import {
  getStatusBadgeConfig,
  getSlotTypeText,
  formatDateTime,
} from '../../../utils/slotUtils'
import SlotModal from './SlotModal'
import SlotFilters from './SlotFilters'
import { useTheme } from '@/contexts/ThemeContext'

const { Search } = Input
const { Title, Text } = Typography

const SlotManagement = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()
  const slots = useSelector(selectSlots)
  const loading = useSelector(selectSlotLoading)
  const error = useSelector(selectSlotError)

  const [searchText, setSearchText] = useState('')
  const [filters, setFilters] = useState({
    slotType: undefined,
    status: undefined,
  })
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Fetch slots on component mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSlots(user.id))
    }
  }, [dispatch, user?.id])

  // Handle error messages
  useEffect(() => {
    if (error) {
      message.error(t('slotManagement.messages.fetchError'))
      dispatch(clearError())
    }
  }, [error, t, dispatch])

  // Filter and search slots
  const filteredSlots = useMemo(() => {
    if (!slots || !Array.isArray(slots)) return []

    return slots.filter(slot => {
      const matchesSearch =
        slot?.slotName?.toLowerCase()?.includes(searchText.toLowerCase()) ??
        false
      const matchesType = !filters.slotType || slot.type === filters.slotType
      const matchesStatus = !filters.status || slot.status === filters.status

      return matchesSearch && matchesType && matchesStatus
    })
  }, [slots, searchText, filters])

  // Update pagination
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSlots.length,
    }))
  }, [filteredSlots.length])

  // Get paginated data
  const paginatedSlots = useMemo(() => {
    return filteredSlots.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    )
  }, [filteredSlots, pagination.current, pagination.pageSize])

  // Handle table pagination change
  const handleTableChange = paginationInfo => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }))
  }

  // Handle search
  const handleSearch = value => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // Handle filters change
  const handleFiltersChange = newFilters => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // Handle refresh
  const handleRefresh = () => {
    if (user?.id) {
      dispatch(fetchSlots(user.id))
    }
  }

  // Get status badge color
  const getStatusBadge = status => {
    const statusInfo = getStatusBadgeConfig(status, t)
    return <Badge color={statusInfo.color} text={statusInfo.text} />
  }

  // Get type text
  const getTypeText = type => {
    return getSlotTypeText(type, t)
  }

  // Table columns
  const columns = [
    {
      title: t('slotManagement.table.slotName'),
      dataIndex: 'slotName',
      key: 'slotName',
      sorter: (a, b) => (a.slotName || '').localeCompare(b.slotName || ''),
    },
    {
      title: t('slotManagement.table.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: fullName => {
        // This would need to be enhanced with actual user data
        return `${fullName}`
      },
      hidden: user?.role !== 'manager',
    },
    {
      title: t('slotManagement.table.hostedBy'),
      dataIndex: 'roleName',
      key: 'roleName',
      render: roleName => {
        // This would need to be enhanced with actual user data
        return `${roleName}`
      },
      hidden: user?.role !== 'manager',
    },
    {
      title: t('slotManagement.table.type'),
      dataIndex: 'slotType',
      key: 'slotType',
      render: slotType => getTypeText(slotType),
      width: user?.role !== 'manager' ? 170 : 150,
      filters: [
        {
          text: t('slotManagement.typeOptions.appointment'),
          value: 'APPOINTMENT',
        },
        { text: t('slotManagement.typeOptions.program'), value: 'PROGRAM' },
      ],
      onFilter: (value, record) => record.slotType === value,
    },
    {
      title: t('slotManagement.table.startTime'),
      dataIndex: 'startDateTime',
      key: 'startDateTime',
      render: dateTime => formatDateTime(dateTime),
      width: 200,
      sorter: (a, b) =>
        dayjs(a.startDateTime || 0).unix() - dayjs(b.startDateTime || 0).unix(),
    },
    {
      title: t('slotManagement.table.endTime'),
      dataIndex: 'endDateTime',
      key: 'endDateTime',
      render: dateTime => formatDateTime(dateTime),
      width: 200,
      sorter: (a, b) =>
        dayjs(a.endDateTime || 0).unix() - dayjs(b.endDateTime || 0).unix(),
    },
    {
      title: t('slotManagement.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusBadge(status),
      width: 200,
      filters: [
        {
          text: t('slotManagement.statusOptions.published'),
          value: 'PUBLISHED',
        },
        { text: t('slotManagement.statusOptions.draft'), value: 'DRAFT' },
        { text: t('slotManagement.statusOptions.closed'), value: 'CLOSED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ]

  return (
    <div className="p-6">
      {contextHolder}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Title
            level={2}
            className={isDarkMode ? 'text-white' : 'text-gray-900'}
          >
            {t('slotManagement.title')}
          </Title>
          <Text className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {t('slotManagement.description')}
          </Text>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button icon={<ExportOutlined />}>Export</Button> */}
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            {t('slotManagement.refresh')}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            {t('slotManagement.addSlot')}
          </Button>
        </div>
      </div>
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder={t('slotManagement.search')}
              allowClear
              onSearch={handleSearch}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={16} lg={18}>
            <SlotFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </Col>
        </Row>
      </Card>
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Table
          columns={columns.filter(col => !col.hidden)}
          dataSource={paginatedSlots}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
        />
      </Card>

      <SlotModal
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        message={messageApi}
        onSuccess={message => {
          setIsModalVisible(false)
          messageApi.success(message)
          handleRefresh()
        }}
      />
    </div>
  )
}

export default SlotManagement

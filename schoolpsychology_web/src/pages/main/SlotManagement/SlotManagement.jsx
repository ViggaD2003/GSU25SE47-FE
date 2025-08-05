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
  DatePicker,
  Space,
  Tag,
} from 'antd'
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchSlots, publishSlot } from '../../../store/actions/slotActions'
import {
  selectSlots,
  selectSlotLoading,
  selectSlotError,
  selectPublishLoading,
  clearError,
} from '../../../store/slices/slotSlice'
import { getStatusBadgeConfig } from '../../../utils/slotUtils'
import SlotModal from './SlotModal'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

const { Search } = Input
const { Title, Text } = Typography
const { RangePicker } = DatePicker

const SlotManagement = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { isDarkMode } = useTheme()
  const [messageApi, contextHolder] = message.useMessage()
  const slots = useSelector(selectSlots)
  const loading = useSelector(selectSlotLoading)
  const error = useSelector(selectSlotError)
  const publishLoading = useSelector(selectPublishLoading)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState(null)

  // Fetch slots on component mount
  useEffect(() => {
    if (user) {
      dispatch(fetchSlots(user?.id))
    }
  }, [dispatch, user])

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

    // Define status priority order: draft → published → closed
    const statusPriority = {
      DRAFT: 1,
      PUBLISHED: 2,
      CLOSED: 3,
    }

    return slots
      .filter(slot => {
        const matchesSearch =
          slot?.fullName?.toLowerCase()?.includes(searchText.toLowerCase()) ??
          false

        const matchesDateRange =
          !dateRange || !dateRange.length
            ? true
            : dayjs(slot.startDateTime).isAfter(dateRange[0].startOf('day')) &&
              dayjs(slot.startDateTime).isBefore(dateRange[1].endOf('day'))

        return matchesSearch && matchesDateRange
      })
      .sort((a, b) => {
        // Sort by status priority first
        const statusA = statusPriority[a.status] || 999
        const statusB = statusPriority[b.status] || 999

        if (statusA !== statusB) {
          return statusA - statusB
        }

        // If status is the same, sort by startDateTime (newest first)
        return (
          dayjs(b.startDateTime || 0).unix() -
          dayjs(a.startDateTime || 0).unix()
        )
      })
  }, [slots, searchText, dateRange])

  // Update pagination
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredSlots.length,
    }))
  }, [filteredSlots.length])

  // Handle search
  const handleSearch = value => {
    setSearchText(value)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

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

  // Handle refresh
  const handleRefresh = () => {
    if (user) {
      dispatch(fetchSlots(user?.id))
    }
  }

  // Handle date range change
  const handleDateRangeChange = dates => {
    setDateRange(dates)
    setPagination(prev => ({ ...prev, current: 1 }))
  }

  // Get status badge color
  const getStatusBadge = status => {
    const statusInfo = getStatusBadgeConfig(status, t)
    return <Badge color={statusInfo.color} text={statusInfo.text} />
  }

  const handlePublish = async record => {
    try {
      await dispatch(publishSlot(record.id)).unwrap()
      messageApi.success(t('slotManagement.messages.publishSuccess'))
      // Refresh slots data after successful publish
      dispatch(fetchSlots())
    } catch (error) {
      messageApi.error(t('slotManagement.messages.publishError'))
      console.error('Publish error:', error)
    }
  }

  // Table columns
  const columns = [
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
      render: (roleName, record) => {
        return (
          <Space direction="vertical" size={2}>
            <Text strong>{record.fullName}</Text>

            {record.roleName === 'TEACHER' ? (
              <Tag color="blue" className="text-xs">
                {roleName}
              </Tag>
            ) : (
              <Tag color="purple" className="text-xs">
                {roleName}
              </Tag>
            )}
          </Space>
        )
      },
      filters: [
        {
          text: t('role.teacher'),
          value: 'TEACHER',
        },
        {
          text: t('role.counselor'),
          value: 'COUNSELOR',
        },
      ],
      onFilter: (value, record) => record.roleName === value,
      hidden: user?.role !== 'manager',
    },
    {
      title: t('slotManagement.table.date'),
      dataIndex: 'startDateTime',
      key: 'date',
      render: dateTime => dayjs(dateTime).format('DD/MM/YYYY'),
      sorter: (a, b) =>
        dayjs(a.startDateTime || 0).unix() - dayjs(b.startDateTime || 0).unix(),
    },
    {
      title: t('slotManagement.table.time'),
      key: 'time',
      render: (_, record) => {
        const startTime = dayjs(record.startDateTime).format('HH:mm')
        const endTime = dayjs(record.endDateTime).format('HH:mm')
        return `${startTime} - ${endTime}`
      },
      sorter: (a, b) =>
        dayjs(a.startDateTime || 0).unix() - dayjs(b.startDateTime || 0).unix(),
    },
    {
      title: t('slotManagement.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusBadge(status),
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
    {
      dataIndex: 'actions',
      key: 'actions',
      render: (_, record) =>
        record.status === 'DRAFT' && (
          <div className="flex items-center space-x-2">
            <Button
              type="link"
              loading={publishLoading}
              onClick={() => handlePublish(record)}
            >
              {t('slotManagement.publish')}
            </Button>
          </div>
        ),
      width: 100,
      fixed: 'right',
      hidden:
        user?.role !== 'manager' ||
        !filteredSlots?.some(slot => slot.status === 'DRAFT'),
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
          {user?.role !== 'manager' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              {t('slotManagement.addSlot')}
            </Button>
          )}
        </div>
      </div>
      <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
        <Row gutter={[16, 16]} className="mb-4">
          {user?.role === 'manager' && (
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder={t('slotManagement.search')}
                allowClear
                onSearch={handleSearch}
                onChange={e => setSearchText(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <RangePicker
              className="w-full"
              onChange={handleDateRangeChange}
              placeholder={[
                t('slotManagement.startDate'),
                t('slotManagement.endDate'),
              ]}
              allowClear
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

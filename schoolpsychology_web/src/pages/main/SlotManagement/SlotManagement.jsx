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
import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
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
import {
  getStatusBadgeConfig,
  getSlotTypeText,
  formatDateTime,
} from '../../../utils/slotUtils'
import SlotModal from './SlotModal'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

const { Search } = Input
const { Title, Text } = Typography

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

  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Fetch slots on component mount
  useEffect(() => {
    if (!slots.length) {
      dispatch(fetchSlots())
    }
  }, [dispatch, slots.length])

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
          slot?.slotName?.toLowerCase()?.includes(searchText.toLowerCase()) ??
          false

        return matchesSearch
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
  }, [slots, searchText])

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

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchSlots())
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
      title: t('slotManagement.table.slotName'),
      dataIndex: 'slotName',
      key: 'slotName',
      hidden: true,
    },
    {
      title: t('slotManagement.table.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: fullName => {
        // This would need to be enhanced with actual user data
        return `${fullName}`
      },
      sorter: (a, b) => (a.fullName || '').localeCompare(b.fullName || ''),
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
      width: 150,
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
          scroll={{ x: 1200 }}
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

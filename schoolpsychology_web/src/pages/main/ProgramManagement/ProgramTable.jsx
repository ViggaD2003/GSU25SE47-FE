import React, { useMemo, useCallback, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  Progress,
  Form,
  Select,
} from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'

const { Text } = Typography

const ProgramTable = ({
  programs = [],
  loading = false,
  pagination,
  onPageChange,
  onView,
  sortConfig,
  onSort,
  onUpdateStatus, // Add this prop for handling status updates
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isManager = user?.role === 'manager'
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  // Status configuration
  const getStatusConfig = useCallback(
    status => {
      switch (status?.toUpperCase()) {
        case 'PLANNING':
          return {
            color: 'purple',
            text: t('programManagement.status.PLANNING'),
          }
        case 'ACTIVE':
          return {
            color: 'blue',
            text: t('programManagement.status.ACTIVE'),
          }
        case 'ON_GOING':
          return {
            color: 'green',
            text: t('programManagement.status.ON_GOING'),
          }
        case 'COMPLETED':
          return {
            color: 'default',
            text: t('programManagement.status.COMPLETED'),
          }
        default:
          return {
            color: 'default',
            text: status || 'Unknown',
          }
      }
    },
    [t]
  )

  // Get participant progress color
  const getParticipantProgressColor = useCallback((_current, _max) => {
    // const percentage = (current / max) * 100
    // if (percentage >= 80) return '#52c41a' // Green
    // if (percentage >= 60) return '#faad14' // Orange
    return '#688EFFFF' // Red
  }, [])

  const handleEdit = useCallback(
    program => {
      setEditingId(program.id)
      form.setFieldsValue({ status: program.status })
    },
    [form]
  )

  const handleCancel = useCallback(() => {
    setEditingId(null)
    form.resetFields()
  }, [form])

  const handleSave = useCallback(
    async record => {
      try {
        const values = await form.validateFields()
        if (onUpdateStatus) {
          await onUpdateStatus(record.id, values.status)
        }
        setEditingId(null)
        form.resetFields()
      } catch (error) {
        console.error('Validation failed:', error)
      }
    },
    [form, onUpdateStatus]
  )

  const renderEditForm = useCallback(
    program => {
      const config = program.status ? getStatusConfig(program.status) : {}
      const isEditing = editingId === program.id

      return isEditing ? (
        <Form form={form}>
          <Form.Item
            name="status"
            rules={[{ required: true, message: t('common.required') }]}
          >
            <Select placeholder={t('programManagement.selectStatus')}>
              <Select.Option value="PLANNING">
                {t('programManagement.status.PLANNING')}
              </Select.Option>
              <Select.Option value="ACTIVE">
                {t('programManagement.status.ACTIVE')}
              </Select.Option>
              <Select.Option value="ON_GOING">
                {t('programManagement.status.ON_GOING')}
              </Select.Option>
              <Select.Option value="COMPLETED">
                {t('programManagement.status.COMPLETED')}
              </Select.Option>
            </Select>
          </Form.Item>
        </Form>
      ) : (
        <Tag color={config.color}>{config.text}</Tag>
      )
    },
    [editingId, form, getStatusConfig, t]
  )

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        title: t('programManagement.table.name'),
        dataIndex: 'name',
        key: 'name',
        width: 150,
        sorter: true,
        sortOrder:
          sortConfig?.field === 'name' ? sortConfig.direction : undefined,
        render: (text, record) => (
          <div>
            <Text strong className="text-primary">
              {text}
            </Text>
            {record.description && (
              <div>
                <Text type="secondary" className="text-xs">
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: t('programManagement.table.participants'),
        dataIndex: 'participants',
        key: 'participants',
        width: 120,
        align: 'center',
        render: (_, record) => {
          const current = record.participants ?? 1
          const max = record.maxParticipants || 0
          const percentage = max > 0 ? (current / max) * 100 : 0

          return (
            <div>
              <Text strong>
                {current}/{max}
              </Text>
              <Progress
                percent={percentage}
                size="small"
                strokeColor={getParticipantProgressColor(current, max)}
                showInfo={false}
                className="mt-1"
              />
            </div>
          )
        },
      },
      {
        title: t('programManagement.table.category'),
        dataIndex: ['category', 'name'],
        key: 'category',
        width: 120,
        render: (text, record) => (
          <div>
            <Text>{text}</Text>
            {record.category?.code && (
              <div>
                <Text type="secondary" className="text-xs">
                  ({record.category.code})
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: t('programManagement.table.date'),
        dataIndex: 'startDate',
        key: 'date',
        width: 120,
        sorter: true,
        sortOrder:
          sortConfig?.field === 'startDate' ? sortConfig.direction : undefined,
        render: (date, record) => (
          <div>
            <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
            {record.startTime && record.endTime && (
              <div>
                <Text type="secondary" className="text-xs">
                  {record.startTime} - {record.endTime}
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        title: t('programManagement.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        filters: [
          { text: t('programManagement.status.PLANNING'), value: 'PLANNING' },
          { text: t('programManagement.status.ACTIVE'), value: 'ACTIVE' },
          { text: t('programManagement.status.ON_GOING'), value: 'ON_GOING' },
          { text: t('programManagement.status.COMPLETED'), value: 'COMPLETED' },
        ],
        render: (_, record) => renderEditForm(record),
      },
      {
        key: 'actions',
        width: 80,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const isEditing = editingId === record.id

          return !isEditing ? (
            <Space size="small">
              <Tooltip title={t('programManagement.actions.view')}>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => onView(record)}
                  size="small"
                />
              </Tooltip>
              {isManager && (
                <Tooltip title={t('programManagement.actions.edit')}>
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    size="small"
                  />
                </Tooltip>
              )}
            </Space>
          ) : (
            <Space size="small">
              <Tooltip title={t('programManagement.actions.cancel')}>
                <Button type="link" danger onClick={handleCancel} size="small">
                  <CloseOutlined />
                </Button>
              </Tooltip>
              <Tooltip title={t('programManagement.actions.save')}>
                <Button
                  type="link"
                  onClick={() => handleSave(record)}
                  size="small"
                >
                  <SaveOutlined />
                </Button>
              </Tooltip>
            </Space>
          )
        },
      },
    ],
    [
      t,
      sortConfig,
      getStatusConfig,
      getParticipantProgressColor,
      onView,
      isManager,
      editingId,
      renderEditForm,
      handleEdit,
      handleCancel,
      handleSave,
    ]
  )

  // Handle table changes (sorting, filtering, pagination)
  const handleTableChange = useCallback(
    (paginationConfig, filters, sorter) => {
      // Handle pagination
      if (
        paginationConfig.current !== pagination.current ||
        paginationConfig.pageSize !== pagination.pageSize
      ) {
        onPageChange({
          current: paginationConfig.current,
          pageSize: paginationConfig.pageSize,
        })
      }

      // Handle sorting
      if (sorter.order) {
        onSort({
          field: sorter.field,
          direction: sorter.order === 'ascend' ? 'asc' : 'desc',
        })
      } else {
        onSort({
          field: 'createdDate',
          direction: 'desc',
        })
      }
    },
    [pagination, onPageChange, onSort]
  )

  return (
    <Table
      columns={columns}
      dataSource={programs}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      onChange={handleTableChange}
      rowKey="id"
      scroll={{ x: 1200 }}
      size="middle"
      className="program-table"
    />
  )
}

export default ProgramTable

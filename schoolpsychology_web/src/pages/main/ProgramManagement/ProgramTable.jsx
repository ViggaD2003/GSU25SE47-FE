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
  FileOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useAuth } from '@/contexts/AuthContext'
import { PROGRAM_STATUS } from '@/constants/enums'
import ActionDropdown from '@/components/common/ActionDropdown'

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
  onUpdate, // Add this prop for handling program updates
  onViewSurvey,
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

  const handleEditStatus = useCallback(
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
            <Select
              placeholder={t('programManagement.selectStatus')}
              optionLabelProp="label"
              popupMatchSelectWidth={false}
              value={program.status} // giá trị ban đầu
            >
              {/* Option ẩn chỉ để hiển thị label khi value=ON_GOING */}
              <Select.Option
                value="ON_GOING"
                label={t('programManagement.status.ON_GOING')}
                hidden // 👈 sẽ không hiển thị trong dropdown
              >
                {t('programManagement.status.ON_GOING')}
              </Select.Option>

              {/* Các option user được phép chọn */}
              {program.status === 'ON_GOING' && (
                <Select.Option
                  value="COMPLETED"
                  label={t('programManagement.status.COMPLETED')}
                >
                  {t('programManagement.status.COMPLETED')}
                </Select.Option>
              )}
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
        render: (text, record) => (
          <div>
            <div className="flex items-center gap-2">
              <Text strong className="text-primary">
                {text}
              </Text>
              {record.category?.code && (
                <Tag color="blue">({record.category.code})</Tag>
              )}
            </div>
            {user?.role === 'manager' && (
              <div>
                <Text
                  style={{ display: 'block' }}
                  title={`${record.hostedBy?.fullName} - ${record.hostedBy?.counselorCode}`}
                >
                  {record.hostedBy?.fullName} - {record.hostedBy?.counselorCode}
                </Text>
                <Text
                  copyable={{ text: record.hostedBy?.email }}
                  title={record.hostedBy?.email}
                  datatype="email"
                >
                  {record.hostedBy?.email}
                </Text>
              </div>
            )}

            {record.description && (
              <div>
                <Text
                  type="secondary"
                  className="text-xs"
                  ellipsis={{
                    expanded: true,
                    tooltip: (
                      <div className="max-w-[300px]">{record.description}</div>
                    ),
                  }}
                >
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
                strokeColor={'#688EFFFF'}
                showInfo={false}
                className="mt-1"
              />
            </div>
          )
        },
      },
      {
        title: t('programManagement.table.date'),
        dataIndex: 'startTime',
        key: 'date',
        width: 120,
        sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
        // sortOrder:
        //   sortConfig?.field === 'startTime' ? sortConfig.direction : undefined,
        render: (_, record) => {
          const startTime = record.startTime
            ? dayjs(record.startTime).format('HH:mm')
            : ''
          const endTime = record.endTime
            ? dayjs(record.endTime).format('HH:mm')
            : ''
          return (
            <div>
              <Text>{dayjs(record.startTime).format('DD/MM/YYYY')}</Text>
              {startTime && endTime && (
                <div>
                  <Text type="secondary" className="text-xs">
                    {startTime} - {endTime}
                  </Text>
                </div>
              )}
            </div>
          )
        },
      },
      {
        title: t('programManagement.table.status'),
        dataIndex: 'status',
        key: 'status',
        width: 120,
        filters: [
          { text: t('programManagement.status.ACTIVE'), value: 'ACTIVE' },
          { text: t('programManagement.status.ON_GOING'), value: 'ON_GOING' },
          { text: t('programManagement.status.COMPLETED'), value: 'COMPLETED' },
        ],
        onFilter: (value, record) => record.status === value,
        render: (_, record) => renderEditForm(record),
      },
      {
        title: t('programManagement.table.createdAt'),
        dataIndex: 'createdDate',
        key: 'createdDate',
        width: 120,
        sorter: (a, b) =>
          dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
        render: (_, record) => (
          <div>
            <Text>{dayjs(record.createdDate).format('DD/MM/YYYY HH:mm')}</Text>
          </div>
        ),
      },
      {
        title: t('programManagement.table.updatedDate'),
        dataIndex: 'updatedDate',
        key: 'updatedDate',
        width: 120,
        sorter: (a, b) =>
          dayjs(a.updatedDate).unix() - dayjs(b.updatedDate).unix(),
        render: (_, record) => (
          <div>
            <Text>{dayjs(record.updatedDate).format('DD/MM/YYYY HH:mm')}</Text>
          </div>
        ),
      },
      {
        key: 'actions',
        width: 60,
        align: 'center',
        fixed: 'right',
        render: (_, record) => {
          const isEditing = editingId === record.id
          return !isEditing ? (
            <ActionDropdown
              actions={[
                {
                  key: 'view',
                  label: t('programManagement.actions.view'),
                  icon: <EyeOutlined />,
                  onClick: () => onView(record),
                },
                {
                  key: 'view_survey',
                  label: t('programManagement.actions.viewSurvey'),
                  icon: <FileOutlined />,
                  onClick: () => onViewSurvey(record.programSurvey.surveyId),
                },
                record.status === 'ON_GOING'
                  ? {
                      key: 'edit_status',
                      label: t('programManagement.actions.editStatus'),
                      icon: <EditOutlined />,
                      onClick: () => handleEditStatus(record),
                    }
                  : null,
                record.status === 'ACTIVE' && isManager
                  ? {
                      key: 'edit',
                      label: t('programManagement.actions.edit'),
                      icon: <EditOutlined />,
                      onClick: () => onUpdate(record),
                    }
                  : null,
              ].filter(Boolean)}
            />
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
      onView,
      isManager,
      editingId,
      renderEditForm,
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
        showTotal: (total, range) =>
          `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
      }}
      onChange={handleTableChange}
      rowKey="id"
      className="program-table"
    />
  )
}

export default ProgramTable

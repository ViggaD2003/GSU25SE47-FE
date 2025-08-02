import React, { useMemo, useCallback } from 'react'
import { Table, Button, Space, Tag, Typography, Tooltip, Progress } from 'antd'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const { Text } = Typography

const ProgramTable = ({
  programs = [],
  loading = false,
  pagination,
  onPageChange,
  onView,
  onEdit,
  sortConfig,
  onSort,
}) => {
  const { t } = useTranslation()

  // Status configuration
  const getStatusConfig = useCallback(
    status => {
      switch (status?.toUpperCase()) {
        case 'UPCOMING':
          return {
            color: 'blue',
            text: t('programManagement.status.UPCOMING'),
          }
        case 'ONGOING':
          return {
            color: 'green',
            text: t('programManagement.status.ONGOING'),
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
  const getParticipantProgressColor = useCallback((current, max) => {
    const percentage = (current / max) * 100
    if (percentage >= 80) return '#52c41a' // Green
    if (percentage >= 60) return '#faad14' // Orange
    return '#ff4d4f' // Red
  }, [])

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        title: t('programManagement.table.name'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
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
        width: 150,
        align: 'center',
        render: (_, record) => {
          const current = record.programRegistrations?.length || 0
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
        width: 150,
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
        align: 'center',
        filters: [
          { text: t('programManagement.status.UPCOMING'), value: 'UPCOMING' },
          { text: t('programManagement.status.ONGOING'), value: 'ONGOING' },
          { text: t('programManagement.status.COMPLETED'), value: 'COMPLETED' },
        ],
        render: status => {
          const config = getStatusConfig(status)
          return <Tag color={config.color}>{config.text}</Tag>
        },
      },
      {
        key: 'actions',
        width: 60,
        align: 'center',
        fixed: 'right',
        render: (_, record) => (
          <Space size="small">
            <Tooltip title={t('programManagement.actions.view')}>
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
                size="small"
              />
            </Tooltip>
            <Tooltip title={t('programManagement.actions.edit')}>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                size="small"
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [
      t,
      sortConfig,
      getStatusConfig,
      getParticipantProgressColor,
      onView,
      onEdit,
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

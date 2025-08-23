import React, { useMemo, useCallback } from 'react'
import { Button, Table, Space, Tag, Tooltip, Select, Typography } from 'antd'
import {
  EyeOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BookOutlined,
  SaveOutlined,
  CloseOutlined,
  UserAddOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'

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
    color: 'geekblue',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  REJECTED: {
    color: 'red',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  CONFIRMED: {
    color: 'green',
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  IN_PROGRESS: {
    color: 'orange',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  CLOSED: {
    color: 'default',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
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

const { Text } = Typography

const CaseTable = ({
  hideStudent = false,
  loading,
  t,
  user,
  availableHosts,
  selectedRowKeys,
  setSelectedRowKeys,
  filteredCases,
  editingHostBy,
  setEditingHostBy,
  tempHostBy,
  setTempHostBy,
  handleSaveHostBy,
}) => {
  const navigate = useNavigate()

  const handleViewCase = useCallback(
    record => {
      navigate(`/case-management/details/${record.id}`)
    },
    [navigate]
  )

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

  const handleCancelHostBy = useCallback(() => {
    setEditingHostBy(null)
    setTempHostBy(null)
  }, [])

  const handleChangeHostBy = useCallback(value => {
    setTempHostBy(value)
  }, [])

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
            loading={loading}
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
    [t, editingHostBy, availableHosts, tempHostBy, handleChangeHostBy]
  )

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
              {student?.classDto?.codeClass} -{' '}
              {student?.classDto?.schoolYear?.name}
            </div>
          </div>
        ),
        hidden: hideStudent,
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
            text: t('caseManagement.statusOptions.CONFIRMED'),
            value: 'CONFIRMED',
          },
          {
            text: t('caseManagement.statusOptions.REJECTED'),
            value: 'REJECTED',
          },
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
        editable: record =>
          user?.role === 'manager' && record.status === 'CONFIRMED',
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
        // hidden: user?.role === 'teacher',
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
        width: 80,
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
              {user?.role === 'manager' && record.status === 'CONFIRMED' && (
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

  return (
    <Table
      columns={columns}
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
                disabled: record.status !== 'CONFIRMED',
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
  )
}

export default CaseTable

import React from 'react'
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Tooltip,
  Badge,
  Card,
  Row,
  Col,
} from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  CloseCircleFilled,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import ActionDropdown from '@/components/common/ActionDropdown'

const { Text } = Typography

const CategoryTable = ({
  data,
  loading,
  pagination,
  onChange,
  onView,
  onEdit,
  onToggleStatus,
  // onDelete,
}) => {
  const { t } = useTranslation()

  const columns = [
    {
      title: t('categoryManagement.table.name'),
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <TagOutlined className="text-blue-500" />
            <Text strong>{text}</Text>
            {record.isActive ? (
              <Badge
                status="success"
                text={t('categoryManagement.table.active')}
              />
            ) : (
              <Badge
                status="default"
                text={t('categoryManagement.table.inactive')}
              />
            )}
          </Space>
          {record.description && (
            <Text type="secondary" className="text-xs">
              {record.description}
            </Text>
          )}
        </Space>
      ),
      // sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: t('categoryManagement.table.code'),
      dataIndex: 'code',
      key: 'code',
      render: text => (
        <Text code className="text-purple-600 font-mono">
          {text}
        </Text>
      ),
      // sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
    },
    {
      title: t('categoryManagement.table.questionLength'),
      dataIndex: 'questionLength',
      key: 'questionLength',
      render: (text, _record) => (
        <Space>
          <QuestionCircleOutlined className="text-green-500" />
          <Text>{text}</Text>
        </Space>
      ),
      // sorter: (a, b) => (a.questionLength || 0) - (b.questionLength || 0),
    },
    {
      title: t('categoryManagement.table.settings'),
      key: 'settings',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <SettingOutlined className="text-orange-500" />
            <Text className="text-xs">
              {t('categoryManagement.table.severityWeight')}:{' '}
              <Text strong>{record.severityWeight}</Text>
            </Text>
          </Space>
          <Space size={8}>
            {record.isSum && (
              <Tag color="blue" size="small">
                {t('categoryManagement.table.isSum')}
              </Tag>
            )}
            {record.isLimited && (
              <Tag color="orange" size="small">
                {t('categoryManagement.table.isLimited')}
              </Tag>
            )}
          </Space>
        </Space>
      ),
      sorter: (a, b) => a.severityWeight - b.severityWeight,
    },
    {
      key: 'actions',
      render: (_, record) => (
        <ActionDropdown
          actions={[
            {
              key: 'view',
              label: t('categoryManagement.table.viewDetails'),
              icon: <EyeOutlined />,
              onClick: () => onView(record),
            },
            {
              key: 'edit',
              label: t('categoryManagement.table.edit'),
              icon: <EditOutlined />,
              onClick: () => onEdit(record),
            },
            {
              key: 'status',
              label: record.isActive
                ? t('categoryManagement.table.inactive')
                : t('categoryManagement.table.active'),
              icon: record.isActive ? <StopOutlined /> : <CheckOutlined />,
              onClick: () => onToggleStatus(record.id, !record.isActive),
              danger: record.isActive,
            },
          ]}
        />
      ),
      width: 50,
      fixed: 'right',
    },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        ...pagination,
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
      }}
      onChange={onChange}
      scroll={{ x: 'auto' }}
      size="middle"
    />
  )
}

export default React.memo(CategoryTable)

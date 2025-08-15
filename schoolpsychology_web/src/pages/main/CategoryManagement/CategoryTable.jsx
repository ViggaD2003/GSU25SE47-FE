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
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const CategoryTable = ({
  data,
  loading,
  pagination,
  onChange,
  onView,
  // onEdit,
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
      title: t('categoryManagement.table.levels'),
      key: 'levels',
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <TrophyOutlined className="text-purple-500" />
            <Text className="text-xs">
              {t('categoryManagement.table.levels')}:{' '}
              <Text strong>{record.levels?.length || 0}</Text>
            </Text>
          </Space>
          {record.levels && record.levels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {record.levels.slice(0, 3).map((level, index) => (
                <Tag
                  key={index}
                  color={
                    level.levelType === 'LOW'
                      ? 'green'
                      : level.levelType === 'MID'
                        ? 'orange'
                        : level.levelType === 'HIGH'
                          ? 'red'
                          : 'purple'
                  }
                  size="small"
                >
                  {level.code}
                </Tag>
              ))}
              {record.levels.length > 3 && (
                <Tag size="small">+{record.levels.length - 3}</Tag>
              )}
            </div>
          )}
        </Space>
      ),
    },
    {
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('categoryManagement.table.viewDetails')}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView && onView(record)}
            />
          </Tooltip>
          {/* <Tooltip title={t('categoryManagement.table.edit')}>
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit && onEdit(record)}
              className="text-green-500 hover:text-green-700"
            />
          </Tooltip>
          <Tooltip title={t('categoryManagement.table.delete')}>
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => onDelete && onDelete(record)}
              className="text-red-500 hover:text-red-700"
            />
          </Tooltip> */}
        </Space>
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
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 'auto' }}
      size="middle"
      // summary={() => (
      //   <Table.Summary.Row>
      //     <Table.Summary.Cell index={0}>
      //       <Text strong>
      //         {t('categoryManagement.table.total')}: {data?.length || 0}
      //       </Text>
      //     </Table.Summary.Cell>
      //     <Table.Summary.Cell index={1} />
      //     <Table.Summary.Cell index={2} />
      //     <Table.Summary.Cell index={3} />
      //     <Table.Summary.Cell index={4} />
      //     <Table.Summary.Cell index={5} />
      //   </Table.Summary.Row>
      // )}
    />
  )
}

export default React.memo(CategoryTable)

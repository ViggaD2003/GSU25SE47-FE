import React from 'react'
import { Table, Button, Space, Typography } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const CategoryTable = ({
  data,
  loading,
  pagination,
  onChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation()

  const columns = [
    {
      title: t('categoryManagement.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: (text, _record) => (
        <Space>
          <TagOutlined className="text-blue-500" />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 250,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: t('categoryManagement.table.code'),
      dataIndex: 'code',
      key: 'code',
      render: text => (
        <Text code className="text-purple-600">
          {text}
        </Text>
      ),
      width: 200,
      sorter: (a, b) => (a.code || '').localeCompare(b.code || ''),
    },
    // {
    //   title: t('categoryManagement.table.actions'),
    //   key: 'action',
    //   fixed: 'right',
    //   width: 150,
    //   render: (_, record) => (
    //     <Space size="small">
    //       <Button
    //         icon={<EyeOutlined />}
    //         onClick={() => onView(record)}
    //         type="text"
    //         size="small"
    //         className="text-blue-500 hover:text-blue-700"
    //         title={t('common.view')}
    //       />
    //       <Button
    //         icon={<EditOutlined />}
    //         onClick={() => onEdit(record)}
    //         type="text"
    //         size="small"
    //         className="text-green-500 hover:text-green-700"
    //         title={t('common.edit')}
    //       />
    //       <Button
    //         icon={<DeleteOutlined />}
    //         onClick={() => onDelete(record)}
    //         type="text"
    //         size="small"
    //         danger
    //         className="text-red-500 hover:text-red-700"
    //         title={t('common.delete')}
    //       />
    //     </Space>
    //   ),
    // },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 600, y: 400 }}
      size="middle"
      className="category-table"
      rowClassName="hover:bg-gray-50"
    />
  )
}

export default React.memo(CategoryTable)

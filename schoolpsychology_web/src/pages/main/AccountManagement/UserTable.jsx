import React from 'react'
import { Table, Button, Tag, Avatar, Space } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  BlockOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const UserTable = ({
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
      title: t('userTable.fullName'),
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, _record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {text}
        </Space>
      ),
      width: 200,
      fixed: 'left',
    },
    {
      title: t('userTable.email'),
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: t('userTable.phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: t('userTable.role'),
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: role => (
        <Tag
          color={
            role === 'counselor' || role === 'guardian' ? 'purple' : 'blue'
          }
        >
          {t(`userTable.roleOptions.${role}`)}
        </Tag>
      ),
    },
    {
      title: t('userTable.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: status => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {t(`userTable.statusOptions.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('userTable.createDate'),
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
    },
    {
      title: t('userTable.lastLogin'),
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 120,
    },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => onView(record)} />
          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          <Button
            icon={<BlockOutlined />}
            danger
            onClick={() => onDelete(record)}
          />
        </Space>
      ),
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
      scroll={{ x: 1200, y: 400 }} // Virtual scroll
      size="middle"
    />
  )
}

export default React.memo(UserTable)

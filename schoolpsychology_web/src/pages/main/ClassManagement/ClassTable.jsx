import React from 'react'
import { Table, Button, Tag, Space, Typography } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

const { Text } = Typography

const ClassTable = ({
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
      title: t('classManagement.table.codeClass'),
      dataIndex: 'codeClass',
      key: 'codeClass',
      render: (text, _record) => (
        <Space>
          <BookOutlined className="text-blue-500" />
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 150,
      fixed: 'left',
      sorter: (a, b) => (a.codeClass || '').localeCompare(b.codeClass || ''),
    },
    {
      title: t('classManagement.table.classYear'),
      dataIndex: 'classYear',
      key: 'classYear',
      render: text => {
        const year = dayjs(text).year()
        return <Tag color="blue">{year}</Tag>
      },
      width: 120,
      sorter: (a, b) => dayjs(a.classYear).unix() - dayjs(b.classYear).unix(),
    },
    {
      title: t('classManagement.table.teacherName'),
      dataIndex: ['teacher', 'fullName'],
      key: 'teacherName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-sm">
            {record.teacher?.teacherCode}
          </Text>
        </div>
      ),
      width: 200,
      sorter: (a, b) =>
        (a.teacher?.fullName || '').localeCompare(b.teacher?.fullName || ''),
    },
    {
      title: t('classManagement.table.teacherEmail'),
      dataIndex: ['teacher', 'email'],
      key: 'teacherEmail',
      render: text => (
        <Text copyable className="text-blue-600">
          {text}
        </Text>
      ),
      width: 200,
      ellipsis: true,
    },
    {
      title: t('classManagement.table.teacherPhone'),
      dataIndex: ['teacher', 'phoneNumber'],
      key: 'teacherPhone',
      render: text => (
        <Text copyable className="text-green-600">
          {text}
        </Text>
      ),
      width: 150,
    },
    {
      title: t('classManagement.table.actions'),
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            type="text"
            size="small"
            className="text-blue-500 hover:text-blue-700"
          />
          {/* <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            type="text"
            size="small"
            className="text-green-500 hover:text-green-700"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => onDelete(record)}
            type="text"
            size="small"
            danger
            className="text-red-500 hover:text-red-700"
          /> */}
        </Space>
      ),
    },
  ]

  return (
    <Table
      rowKey="codeClass"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1200, y: 400 }}
      size="middle"
      className="class-table"
      rowClassName="hover:bg-gray-50"
    />
  )
}

export default React.memo(ClassTable)

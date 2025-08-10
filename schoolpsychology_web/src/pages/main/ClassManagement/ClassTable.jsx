import React from 'react'
import { Table, Button, Tag, Space, Typography, Tooltip } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  UserAddOutlined,
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
  onEnroll,
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
      width: 80,
      fixed: 'left',
      sorter: (a, b) => (a.codeClass || '').localeCompare(b.codeClass || ''),
    },
    {
      title: t('classManagement.table.classYear'),
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      render: classYear => {
        const year = dayjs(classYear).year()
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
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            type="text"
            size="small"
            className="text-blue-500 hover:text-blue-700"
          />
          {onEnroll && (
            <Tooltip title={t('classManagement.enroll')}>
              <Button
                icon={<UserAddOutlined />}
                onClick={() => onEnroll(record)}
                type="link"
                size="small"
                className="text-green-600 hover:text-green-700"
              />
            </Tooltip>
          )}
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

  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <Table
      rowKey="codeClass"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1200, ...(isSmallScreen ? {} : { y: 400 }) }}
      size="middle"
      className="class-table"
      rowClassName="hover:bg-gray-50"
    />
  )
}

export default React.memo(ClassTable)

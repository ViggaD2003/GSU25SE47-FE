import React, { useCallback } from 'react'
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
  const canAddStudents = useCallback(
    record => {
      if (!record || !record.isActive || !record.teacher) return false
      // Check school year is future or current
      const schoolYear = dayjs(String(record.schoolYear).slice(0, 4)).year()
      const currentYear = dayjs().year()
      console.log('schoolYear:', schoolYear, 'currentYear:', currentYear)
      console.log('isBefore:', dayjs(schoolYear).isBefore(currentYear))

      if (!schoolYear || dayjs(schoolYear).isBefore(currentYear)) return false
      return true
    },
    [data]
  )

  const columns = [
    {
      title: t('classManagement.table.codeClass'),
      dataIndex: ['grade', 'codeClass'],
      key: 'codeClass',
      render: (_, record) => (
        <div className="flex justify-between items-center space-x-2">
          <div>
            <BookOutlined className="text-blue-500" />
            <Text strong>{record.codeClass}</Text>
          </div>
          <Tag color="purple">{record.grade}</Tag>
        </div>
      ),
      width: 200,
      fixed: 'left',
      sorter: (a, b) => (a.codeClass || '').localeCompare(b.codeClass || ''),
    },
    {
      title: t('classManagement.table.numberOfstudents'),
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 150,
    },
    {
      title: t('classManagement.table.classYear'),
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      render: classYear => {
        const startYear = String(classYear).slice(0, 4)
        const endYear = String(classYear).slice(5, 9)
        return (
          <Tag color="blue">
            {startYear} - {endYear}
          </Tag>
        )
      },
      width: 180,
      sorter: (a, b) => dayjs(a.classYear).unix() - dayjs(b.classYear).unix(),
    },
    {
      title: t('classManagement.table.isActive'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: v => (
        <Tag color={v ? 'green' : 'red'}>
          {v
            ? t('classManagement.table.active')
            : t('classManagement.table.inactive')}
        </Tag>
      ),
    },
    {
      title: t('classManagement.table.teacherEmail'),
      dataIndex: ['teacher', 'email'],
      key: 'teacherEmail',
      render: text => (
        <Text copyable className="text-blue-600">
          {text ?? '-'}
        </Text>
      ),
      ellipsis: true,
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
          {onEnroll && canAddStudents(record) && (
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
      // className="class-table"
      // rowClassName="hover:bg-gray-50"
    />
  )
}

export default React.memo(ClassTable)

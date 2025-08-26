import React, { useCallback } from 'react'
import { Table, Button, Tag, Space, Typography, Tooltip } from 'antd'
import { BookOutlined, UserAddOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useAuth } from '@/hooks'

const { Text } = Typography

const ClassTable = ({
  data,
  loading,
  pagination,
  onChange,
  onEnroll,
  // onEdit,
  // onDelete,
}) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const canAddStudents = useCallback(
    record => {
      if (!record || !record.teacher) return false
      // Check school year is future or current
      const schoolYear = dayjs(record.schoolYear.startDate).year()
      const currentYear = dayjs().year()

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
      // width: 160,
      fixed: 'left',
      sorter: (a, b) => (a.codeClass || '').localeCompare(b.codeClass || ''),
    },
    {
      title: t('classManagement.table.numberOfstudents'),
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      width: 160,
    },
    {
      title: t('classManagement.table.classYear'),
      dataIndex: 'schoolYear',
      key: 'schoolYear',
      render: classYear => {
        return <Tag color="blue">{classYear.name}</Tag>
      },
      // width: 180,
      sorter: (a, b) =>
        dayjs(a.schoolYear.startDate).unix() -
        dayjs(b.schoolYear.startDate).unix(),
    },
    {
      title: t('classManagement.table.isActive'),
      dataIndex: 'isActive',
      key: 'isActive',
      // width: 130,
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
      hidden: user?.role !== 'manager',
    },
    {
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Space size="small">
          {canAddStudents(record) && user?.role === 'manager' && (
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
        </Space>
      ),
      // hidden: user?.role !== 'manager',
    },
  ]

  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <Table
      rowKey="codeClass"
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
      scroll={{ x: 'auto', ...(isSmallScreen ? {} : { y: 400 }) }}
      size="middle"
      // className="class-table"
      // rowClassName="hover:bg-gray-50"
    />
  )
}

export default React.memo(ClassTable)

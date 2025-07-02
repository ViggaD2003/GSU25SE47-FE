import React from 'react'
import { Table, Tag, Button, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'

const statusColor = {
  PUBLISHED: 'green',
  DRAFT: 'orange',
  ARCHIVED: 'red',
}

const SurveyTable = ({ t, data, loading, pagination, onView }) => {
  const columns = [
    {
      title: t('surveyManagement.table.name'),
      dataIndex: 'name',
      key: 'name',
      render: text => <>{text}</>,
      ellipsis: true,
    },
    {
      title: t('surveyManagement.table.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('surveyManagement.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={statusColor[status] || 'blue'} style={{ fontWeight: 500 }}>
          {status}
        </Tag>
      ),
      width: 120,
    },
    {
      title: t('surveyManagement.table.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
    },
    {
      title: t('surveyManagement.table.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
    },
    {
      title: '',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tooltip title={t('surveyManagement.table.action.viewDetail')}>
          <Button
            icon={<EyeOutlined />}
            type="link"
            onClick={() => onView(record)}
            style={{ padding: 0 }}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <Table
      rowKey={record => record.surveyId || record.id}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={pagination}
      bordered
      size="middle"
      scroll={{ x: 'max-content' }}
      style={{ background: 'transparent' }}
    />
  )
}

export default SurveyTable

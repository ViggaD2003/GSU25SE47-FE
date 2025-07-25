import React from 'react'
import { Table, Tag, Button, Tooltip } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import {
  TARGET_SCOPE,
  getStatusColor,
  formatGradeDisplay,
  SURVEY_STATUS,
  SURVEY_TYPE,
  getSurveyTypePermissions,
  GRADE_LEVEL,
} from '../../../constants/enums'

const SurveyTable = ({ t, data, loading, pagination, onView, userRole }) => {
  const columns = [
    {
      title: t('surveyManagement.table.title'),
      dataIndex: 'title',
      key: 'title',
      render: text => <>{text}</>,
      ellipsis: true,
    },
    {
      title: t('surveyManagement.table.category'),
      dataIndex: ['category', 'name', 'code', 'id'],
      key: 'category',
      render: (text, record) => (
        <Tag color="blue">
          {record.category?.name + ' - ' + record.category?.code || 'N/A'}
        </Tag>
      ),
      filters: data.map(record => ({
        text: record.category?.code,
        value: record.category?.id,
      })),
      onFilter: (value, record) => record.category?.id === value,
    },
    {
      title: t('surveyManagement.table.surveyType'),
      dataIndex: 'surveyType',
      key: 'surveyType',
      render: surveyType => (
        <Tag color={getStatusColor(surveyType)}>
          {t(`surveyManagement.enums.surveyType.${surveyType}`) || surveyType}
        </Tag>
      ),
      filters: getSurveyTypePermissions(userRole).map(surveyType => ({
        text: t(`surveyManagement.enums.surveyType.${surveyType}`),
        value: surveyType,
      })),
      onFilter: (value, record) => record.surveyType === value,
    },
    {
      title: t('surveyManagement.table.targetScope'),
      dataIndex: 'targetScope',
      key: 'targetScope',
      render: (scope, record) => (
        <div>
          <Tag color={getStatusColor(scope)}>
            {t(`surveyManagement.enums.targetScope.${scope}`) || scope}
          </Tag>
          {scope === TARGET_SCOPE.GRADE &&
            record.targetGrade.length > 0 &&
            record.targetGrade.map(grade => (
              <Tag color={getStatusColor(grade)} key={grade}>
                {t(`surveyManagement.enums.gradeLevel.${grade}`) ||
                  formatGradeDisplay(grade)}
              </Tag>
            ))}
        </div>
      ),
      filters: [
        {
          text: t(`surveyManagement.enums.targetScope.${TARGET_SCOPE.ALL}`),
          value: TARGET_SCOPE.ALL,
        },
        {
          text: t(`surveyManagement.enums.targetScope.${TARGET_SCOPE.GRADE}`),
          value: TARGET_SCOPE.GRADE,
          children: Object.values(GRADE_LEVEL).map(grade => ({
            text: t(`surveyManagement.enums.gradeLevel.${grade}`),
            value: grade,
          })),
        },
      ],
      onFilter: (value, record) => {
        return (
          record.targetScope === value || record.targetGrade.includes(value)
        )
      },
    },
    {
      title: t('surveyManagement.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500 }}>
          {t(`surveyManagement.enums.surveyStatus.${status}`) || status}
        </Tag>
      ),
      filters: Object.values(SURVEY_STATUS).map(status => ({
        text: t(`surveyManagement.enums.surveyStatus.${status}`),
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('surveyManagement.table.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: t('surveyManagement.table.endDate'),
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: t('surveyManagement.table.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      fixed: 'right',
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
      rowKey={item => item.surveyId}
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

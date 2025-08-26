import React, { useMemo } from 'react'
import { Table, Button, Tag, Space, Tooltip } from 'antd'
import {
  EyeOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  FlagFilled,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

const UserTable = ({
  user,
  data,
  loading,
  pagination,
  onChange,
  onView,
  onCreateCase,
  isActiveClass,
  // onEdit,
  // onDelete,
}) => {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const hideColumnsWithoutStudentData = useMemo(() => {
    return [
      '/client-management',
      '/staff-management',
      '/teacher-management',
    ].includes(pathname)
  }, [pathname])

  const columns = useMemo(
    () => [
      {
        title: t('userTable.fullName'),
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text, record) => (
          <Space>
            <Tooltip title={record.caseId && t('userTable.activeCase')}>
              {record.caseId && (
                <Button
                  type="link"
                  icon={<FlagFilled style={{ color: 'red' }} />}
                  onClick={() => onView(record.caseId, 'case')}
                />
              )}
            </Tooltip>

            <div>
              <Tooltip title={text}>
                <div
                  style={{
                    fontWeight: 500,
                    // maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text}
                </div>
              </Tooltip>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {record.studentCode}
              </div>
            </div>
          </Space>
        ),
        width: 250,
        fixed: 'left',
      },
      {
        title: t('userTable.gender'),
        dataIndex: 'gender',
        key: 'gender',
        render: gender => (
          <Tag color={gender ? 'blue' : 'pink'}>
            {gender ? t('dashboard.gender.male') : t('dashboard.gender.female')}
          </Tag>
        ),
      },

      {
        title: t('userTable.email'),
        dataIndex: 'email',
        key: 'email',
        render: email =>
          email ? (
            <Tooltip title={email}>
              <Link href={`mailto:${email}`}>{email}</Link>
            </Tooltip>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          ),
      },
      {
        title: t('userTable.surveyStatus'),
        dataIndex: 'isEnableSurvey',
        key: 'isEnableSurvey',
        render: isEnableSurvey => (
          <Tag color={isEnableSurvey ? 'green' : 'orange'}>
            <FileTextOutlined style={{ marginRight: 4 }} />
            {isEnableSurvey
              ? t('userTable.surveyEnabled')
              : t('userTable.surveyDisabled')}
          </Tag>
        ),
        hidden: hideColumnsWithoutStudentData,
      },
      {
        title: t('userTable.latestSurvey'),
        dataIndex: 'latestSurveyRecord',
        key: 'latestSurveyRecord',
        render: latestSurveyRecord => (
          <span style={{ color: latestSurveyRecord ? '#52c41a' : '#999' }}>
            {latestSurveyRecord
              ? t('userTable.hasSurveyRecord')
              : t('userTable.noSurveyRecord')}
          </span>
        ),
        hidden: hideColumnsWithoutStudentData,
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Tooltip title={t('userTable.viewDetails')}>
              <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => onView(record.id, 'user')}
              />
            </Tooltip>
            {user?.role === 'teacher' && !record.caseId && isActiveClass && (
              <Tooltip title={t('userTable.createCase')}>
                <Button
                  type="link"
                  icon={<PlusCircleOutlined />}
                  danger
                  size="small"
                  onClick={() => onCreateCase(record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [data, pathname, user]
  )

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
      scroll={{ x: 'auto' }} // Increased width for new columns
      size="middle"
    />
  )
}

export default React.memo(UserTable)

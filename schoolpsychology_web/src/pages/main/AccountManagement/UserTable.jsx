import React, { useMemo } from 'react'
import { Table, Button, Tag, Avatar, Space, Tooltip } from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  BlockOutlined,
  UserOutlined,
  CalendarOutlined,
  IdcardOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import CaseModal from '../CaseManagement/CaseModal'

const UserTable = ({
  user,
  data,
  loading,
  pagination,
  onChange,
  onView,
  onCreateCase,
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
            <Avatar icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{text}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {record.id}
              </div>
            </div>
          </Space>
        ),
        width: 150,
        fixed: 'left',
      },
      {
        title: t('userTable.studentCode'),
        dataIndex: 'studentCode',
        key: 'studentCode',
        render: text => (
          <Space>
            <IdcardOutlined style={{ color: '#1890ff' }} />
            {text}
          </Space>
        ),
        width: 120,
        hidden: hideColumnsWithoutStudentData,
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
        width: 100,
      },
      {
        title: t('userTable.dob'),
        dataIndex: 'dob',
        key: 'dob',
        render: dob => (
          <Space>
            <CalendarOutlined style={{ color: '#52c41a' }} />
            {dob ? new Date(dob).toLocaleDateString() : '-'}
          </Space>
        ),
        width: 120,
      },
      {
        title: t('userTable.email'),
        dataIndex: 'email',
        key: 'email',
        render: email =>
          email ? (
            <Link href={`mailto:${email}`}>{email}</Link>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          ),
        width: 200,
      },
      {
        title: t('userTable.phone'),
        dataIndex: 'phoneNumber',
        key: 'phoneNumber',
        render: phone =>
          phone ? (
            <Link href={`tel:${phone}`}>{phone}</Link>
          ) : (
            <span style={{ color: '#999' }}>-</span>
          ),
        width: 150,
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
        width: 140,
        hidden: hideColumnsWithoutStudentData,
      },
      {
        title: t('userTable.caseStatus'),
        dataIndex: 'hasActiveCases',
        key: 'hasActiveCases',
        render: hasActiveCases => (
          <Tooltip
            title={
              hasActiveCases
                ? t('userTable.hasActiveCases')
                : t('userTable.noActiveCases')
            }
          >
            <Tag color={hasActiveCases ? 'red' : 'green'}>
              <ExclamationCircleOutlined style={{ marginRight: 4 }} />
              {hasActiveCases
                ? t('userTable.activeCases')
                : t('userTable.noCases')}
            </Tag>
          </Tooltip>
        ),
        width: 140,
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
        width: 140,
        hidden: hideColumnsWithoutStudentData,
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        width: 100,
        render: (_, record) => (
          <Space>
            <Tooltip title={t('userTable.viewDetails')}>
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => onView(record)}
              />
            </Tooltip>
            {user?.role === 'teacher' && !record.hasActiveCases && (
              <Tooltip title={t('userTable.createCase')}>
                <Button
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
      pagination={pagination}
      onChange={onChange}
      scroll={{ x: 1450, y: 400 }} // Increased width for new columns
      size="middle"
    />
  )
}

export default React.memo(UserTable)

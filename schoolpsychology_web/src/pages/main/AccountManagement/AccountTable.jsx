import React, { useMemo } from 'react'
import { Table, Button, Tag, Space, Tooltip, Popconfirm } from 'antd'
import { CheckOutlined, EyeOutlined, StopOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import ActionDropdown from '@/components/common/ActionDropdown'

const AccountTable = ({ data, loading, onView, onUpdateStatus }) => {
  const { t } = useTranslation()
  const getRoleColor = role => {
    if (role === 'TEACHER') return 'blue'
    if (role === 'COUNSELOR') return 'purple'
    if (role === 'PARENTS') return 'green'
    if (role === 'STUDENT') return 'red'
    return 'gray'
  }

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 50,
        sorter: (a, b) => a.id - b.id,
      },
      {
        title: t('userTable.fullName'),
        dataIndex: 'fullName',
        key: 'fullName',
        render: (text, record) => (
          <Space>
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
              <Tooltip title={record.phoneNumber}>
                <div
                  style={{
                    fontWeight: 500,
                    // maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Link to={`tel:${record.phoneNumber}`}>
                    {record.phoneNumber}
                  </Link>
                </div>
              </Tooltip>
              <Tooltip title={record.email}>
                <div
                  style={{
                    fontWeight: 500,
                    // maxWidth: 100,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Link to={`mailto:${record.email}`}>{record.email}</Link>
                </div>
              </Tooltip>
            </div>
          </Space>
        ),
        width: 250,
        fixed: 'left',
      },
      {
        title: t('userTable.role'),
        dataIndex: 'roleName',
        key: 'roleName',
        render: role => (
          <Tag color={getRoleColor(role)}>
            {t(`role.${role.toLowerCase()}`)}
          </Tag>
        ),
        filters: [
          {
            text: t('role.teacher'),
            value: 'TEACHER',
          },
          {
            text: t('role.counselor'),
            value: 'COUNSELOR',
          },
          {
            text: t('role.parent'),
            value: 'PARENTS',
          },
          {
            text: t('role.student'),
            value: 'STUDENT',
          },
        ],
        onFilter: (value, record) => record.roleName === value,
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
        filters: [
          {
            text: t('dashboard.gender.male'),
            value: true,
          },
          {
            text: t('dashboard.gender.female'),
            value: false,
          },
        ],
        onFilter: (value, record) => record.gender === value,
      },
      {
        title: t('userTable.status'),
        dataIndex: 'status',
        key: 'status',
        render: status => (
          <Tag color={status ? 'blue' : 'pink'}>
            {status ? t('common.active') : t('common.inactive')}
          </Tag>
        ),
        filters: [
          {
            text: t('common.active'),
            value: true,
          },
          {
            text: t('common.inactive'),
            value: false,
          },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: '',
        key: 'action',
        fixed: 'right',
        render: (_, record) => {
          return (
            <ActionDropdown
              actions={[
                {
                  key: 'view',
                  label: t('userTable.viewDetails'),
                  icon: <EyeOutlined />,
                  onClick: () => onView(record),
                },
                {
                  key: 'status',
                  label: (
                    <Popconfirm
                      title={
                        !record.status
                          ? t('userTable.actions.activeConfirm')
                          : t('userTable.actions.inactiveConfirm')
                      }
                      onConfirm={() =>
                        onUpdateStatus(record.id, !record.status)
                      }
                      okText={t('common.yes')}
                      cancelText={t('common.no')}
                      okButtonProps={{ danger: record.status }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          color: !record.status ? 'green' : 'red',
                        }}
                      >
                        {!record.status ? <CheckOutlined /> : <StopOutlined />}
                        {!record.status
                          ? t('userTable.actions.active')
                          : t('userTable.actions.inactive')}
                      </div>
                    </Popconfirm>
                  ),
                },
              ]}
            />
          )
        },
      },
    ],
    [data, t]
  )

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={{
        showSizeChanger: true,
        showTotal: (total, range) =>
          `${t('common.showing')} ${range[0]}-${range[1]} ${t('common.of')} ${total} ${t('common.items')}`,
      }}
      scroll={{ x: 'auto' }} // Increased width for new columns
      size="middle"
    />
  )
}

export default React.memo(AccountTable)

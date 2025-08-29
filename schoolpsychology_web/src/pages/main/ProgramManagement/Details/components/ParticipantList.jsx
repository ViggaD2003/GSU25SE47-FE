import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Avatar,
  Tooltip,
  Empty,
  Row,
  Col,
  Divider,
} from 'antd'
import {
  PlusOutlined,
  EyeOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  TrophyOutlined,
  TeamOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FlagFilled,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import Search from 'antd/es/input/Search'

const { Text, Title } = Typography

const ParticipantList = ({
  participants = [],
  _programId,
  _categoryId,
  _onAddedCases,
  onOpenAddCasesModal,
  onViewParticipant,
  userRole = 'counselor',
  hasAvailableCases = false,
  refresh,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchText, setSearchText] = React.useState('')

  const getStatusColor = status => {
    switch (status) {
      case 'ENROLLED':
        return 'blue'
      case 'COMPLETED':
        return 'green'
      case 'ABSENT':
        return 'red'
      case 'ACTIVE':
        return 'cyan'
      case 'IN_PROGRESS':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'ENROLLED':
        return <CheckCircleOutlined />
      case 'COMPLETED':
        return <TrophyOutlined />
      case 'ABSENT':
        return <ExclamationCircleOutlined />
      case 'ACTIVE':
        return <ClockCircleOutlined />
      case 'IN_PROGRESS':
        return <TeamOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const columns = [
    {
      title: t('programManagement.participants.studentInfo'),
      dataIndex: 'student',
      key: 'student',
      width: 120,
      render: (student, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            {record.cases && (
              <Tooltip title={t('caseManagement.details.title')}>
                <Button
                  type="link"
                  danger
                  icon={<FlagFilled />}
                  onClick={() => {
                    navigate(`/case-management/details/${record.cases.id}`)
                  }}
                />
              </Tooltip>
            )}
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <Text
                strong
                style={{
                  fontSize: '14px',
                  minWidth: 100,
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={student?.fullName || t('common.unknown')}
              >
                {student?.fullName || t('common.unknown')}
              </Text>
              <br />
              <Text
                type="secondary"
                style={{
                  fontSize: '12px',
                  minWidth: 100,
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={student?.studentCode || t('common.unknown')}
              >
                {student?.studentCode || t('common.unknown')}
              </Text>
            </div>
          </Space>
          <Space size="small">
            <Tooltip title={student?.email}>
              <MailOutlined style={{ color: '#666' }} />
            </Tooltip>
            <Tooltip title={student?.phoneNumber}>
              <PhoneOutlined style={{ color: '#666' }} />
            </Tooltip>
            <Tooltip title={student?.dob}>
              <CalendarOutlined style={{ color: '#666' }} />
            </Tooltip>
          </Space>
        </Space>
      ),
    },
    {
      title: t('programManagement.participants.typeTitle'),
      dataIndex: 'cases',
      key: 'cases',
      width: 150,
      render: cases => (
        <div>
          <Text style={{ color: !cases ? 'green' : 'red ' }}>
            {' '}
            {cases
              ? t(`programManagement.participants.type.assigned`)
              : t(`programManagement.participants.type.notAssigned`)}
          </Text>
        </div>
      ),
    },
    {
      title: t('programManagement.participants.enrollmentInfo'),
      dataIndex: 'enrollmentInfo',
      key: 'enrollmentInfo',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('programManagement.participants.joinDate')}:
            </Text>
            <br />
            <Text strong>
              {record.joinAt
                ? new Date(record.joinAt).toLocaleDateString()
                : '-'}
            </Text>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('programManagement.participants.status.title')}:
            </Text>
            <br />
            <Tag
              color={getStatusColor(record.status)}
              icon={getStatusIcon(record.status)}
            >
              {t(`programManagement.participants.status.${record.status}`)}
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: t('programManagement.participants.performance'),
      dataIndex: 'performance',
      key: 'performance',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {t('programManagement.participants.finalScore')}:
            </Text>
            <br />
            {record.status === 'COMPLETED' ? (
              <Text
                strong
                style={{
                  fontSize: '16px',
                  color:
                    record.finalScore < 0
                      ? 'green'
                      : record.finalScore > 0
                        ? 'red'
                        : 'gray',
                }}
              >
                {record.finalScore < 0 ? (
                  <ArrowUpOutlined />
                ) : record.finalScore > 0 ? (
                  <ArrowDownOutlined />
                ) : (
                  ''
                )}
                {record.finalScore !== null && record.finalScore !== undefined
                  ? Math.abs(record.finalScore).toFixed(1)
                  : '-'}
              </Text>
            ) : (
              <Text type="secondary">-</Text>
            )}
          </div>
        </Space>
      ),

      sorter: (a, b) => {
        const scoreA =
          a.finalScore !== null && a.finalScore !== undefined
            ? a.finalScore
            : Number.NEGATIVE_INFINITY
        const scoreB =
          b.finalScore !== null && b.finalScore !== undefined
            ? b.finalScore
            : Number.NEGATIVE_INFINITY
        return scoreA - scoreB
      },
    },
    {
      // title: t('common.actions'),
      key: 'actions',
      width: 50,
      fixed: 'right',
      render: (_, record) => (
        <Space align="center">
          <Tooltip title={t('programManagement.participants.viewDetails')}>
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => onViewParticipant(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  const filteredParticipants = useMemo(() => {
    if (!searchText.trim()) return participants
    return participants.filter(p => {
      const matchesSearch =
        p.student?.email.toLowerCase().includes(searchText.toLowerCase()) || ''
      return matchesSearch
    })
  }, [participants, searchText])

  const tableData = useMemo(() => {
    return filteredParticipants.map((participant, index) => ({
      key: participant.id || index,
      ...participant,
    }))
  }, [filteredParticipants])

  const summaryStats = useMemo(() => {
    const total = participants.length
    const withCases = participants.filter(p => p.cases).length
    const withoutCases = total - withCases
    const enrolled = participants.filter(p => p.status === 'ENROLLED').length
    const completed = participants.filter(p => p.status === 'COMPLETED').length

    return { total, withCases, withoutCases, enrolled, completed }
  }, [participants])

  const handleRefresh = useCallback(() => {
    refresh()
  }, [refresh])

  return (
    <div>
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>
              {t('programManagement.participants.title')}
            </Title>
          </Space>
        }
        extra={
          <Space align="center" size="middle">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              {t('common.refresh')}
            </Button>
            {userRole === 'counselor' && hasAvailableCases && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onOpenAddCasesModal}
              >
                {t('programManagement.participants.addCases')}
              </Button>
            )}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {/* Summary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                {summaryStats.total}
              </Title>
              <Text type="secondary">
                {t('programManagement.participants.totalParticipants')}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                {summaryStats.withCases}
              </Title>
              <Text type="secondary">
                {t('programManagement.participants.withCases')}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#faad14', margin: 0 }}>
                {summaryStats.enrolled}
              </Title>
              <Text type="secondary">
                {t('programManagement.participants.enrolled')}
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#722ed1', margin: 0 }}>
                {summaryStats.completed}
              </Title>
              <Text type="secondary">
                {t('programManagement.participants.completed')}
              </Text>
            </Card>
          </Col>
        </Row>

        <Search
          placeholder={t('common.searchByEmail')}
          allowClear
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />

        <Divider />

        {/* Participants Table */}
        {tableData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t('common.pagination.of')} ${total} ${t('common.pagination.items')}`,
            }}
            size="middle"
            bordered
          />
        ) : (
          <Empty
            description={t('programManagement.participants.noParticipants')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  )
}

export default ParticipantList

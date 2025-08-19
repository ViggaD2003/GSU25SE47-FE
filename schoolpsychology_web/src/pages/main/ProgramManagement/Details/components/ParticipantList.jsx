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
} from '@ant-design/icons'

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
}) => {
  const { t } = useTranslation()

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

  const getPriorityColor = priority => {
    switch (priority) {
      case 'HIGH':
        return 'red'
      case 'MEDIUM':
        return 'orange'
      case 'LOW':
        return 'green'
      default:
        return 'default'
    }
  }

  const getProgressTrendColor = trend => {
    switch (trend) {
      case 'IMPROVED':
        return 'green'
      case 'STABLE':
        return 'blue'
      case 'DECLINED':
        return 'red'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: t('programManagement.participants.studentInfo'),
      dataIndex: 'student',
      key: 'student',
      width: 200,
      render: (student, _record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <Avatar
              size="large"
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            />
            <div>
              <Text strong style={{ fontSize: '14px' }}>
                {student?.fullName || t('common.unknown')}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
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
      title: t('programManagement.participants.caseInfo'),
      dataIndex: 'cases',
      key: 'cases',
      width: 250,
      render: (cases, _record) => (
        <div>
          {cases ? (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
                {cases.title}
              </Text>
              <div>
                <Space size="small">
                  <Tag color={getPriorityColor(cases.priority)} size="small">
                    {cases.priority}
                  </Tag>
                  <Tag color={getStatusColor(cases.status)} size="small">
                    {cases.status}
                  </Tag>
                </Space>
              </div>
              <div>
                <Tag
                  color={getProgressTrendColor(cases.progressTrend)}
                  size="small"
                >
                  {cases.progressTrend}
                </Tag>
              </div>
              {cases.description && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {cases.description.length > 50
                    ? `${cases.description.substring(0, 50)}...`
                    : cases.description}
                </Text>
              )}
            </Space>
          ) : (
            <Text type="secondary" italic>
              {t('programManagement.participants.noCaseAssigned')}
            </Text>
          )}
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
            <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
              {record.finalScore !== null && record.finalScore !== undefined
                ? record.finalScore.toFixed(1)
                : '-'}
            </Text>
          </div>
          {record.cases?.currentLevel && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('programManagement.participants.currentLevel')}:
              </Text>
              <br />
              <Tag
                color={getPriorityColor(record.cases.currentLevel.levelType)}
                size="small"
              >
                {record.cases.currentLevel.label}
              </Tag>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: t('common.actions'),
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

  const tableData = useMemo(() => {
    return participants.map((participant, index) => ({
      key: participant.id || index,
      ...participant,
    }))
  }, [participants])

  const summaryStats = useMemo(() => {
    const total = participants.length
    const withCases = participants.filter(p => p.cases).length
    const withoutCases = total - withCases
    const enrolled = participants.filter(p => p.status === 'ENROLLED').length
    const completed = participants.filter(p => p.status === 'COMPLETED').length

    return { total, withCases, withoutCases, enrolled, completed }
  }, [participants])

  const handleRefresh = useCallback(() => {}, [])

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
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              size="large"
            >
              {t('programManagement.participants.refresh')}
            </Button>
            {userRole === 'counselor' && hasAvailableCases && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onOpenAddCasesModal}
                size="large"
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

        <Divider />

        {/* Participants Table */}
        {tableData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t('common.pagination.of')} ${total} ${t('common.pagination.items')}`,
            }}
            scroll={{ x: 1200 }}
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

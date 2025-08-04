import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Progress,
  List,
  Tag,
  Space,
  Divider,
} from 'antd'
import {
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const ProgramStatistics = ({ program, statistics }) => {
  const { t } = useTranslation()

  if (!statistics) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">
            {t('programManagement.details.statistics.noStatisticsAvailable')}
          </Text>
        </div>
      </Card>
    )
  }

  const participants = program.participants || []

  // Calculate status distribution
  const statusDistribution = participants.reduce((acc, participant) => {
    const status = participant.status || 'UNKNOWN'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {})

  // Calculate score ranges
  const scores = participants
    .filter(p => p.finalScore !== null && p.finalScore !== undefined)
    .map(p => p.finalScore)

  const scoreRanges = {
    '0-25': scores.filter(score => score >= 0 && score <= 25).length,
    '26-50': scores.filter(score => score > 25 && score <= 50).length,
    '51-75': scores.filter(score => score > 50 && score <= 75).length,
    '76-100': scores.filter(score => score > 75 && score <= 100).length,
  }

  const getStatusColor = status => {
    switch (status) {
      case 'ENROLLED':
        return 'blue'
      case 'COMPLETED':
        return 'green'
      case 'DROPPED':
        return 'red'
      case 'PENDING':
        return 'orange'
      default:
        return 'default'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'ENROLLED':
        return <UserOutlined />
      case 'COMPLETED':
        return <CheckCircleOutlined />
      case 'DROPPED':
        return <CloseCircleOutlined />
      case 'PENDING':
        return <ClockCircleOutlined />
      default:
        return <UserOutlined />
    }
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Enrollment Statistics */}
        <Col xs={24} lg={12}>
          <Card
            title={t('programManagement.details.statistics.statusDistribution')}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={t('programManagement.details.totalParticipants')}
                  value={statistics.totalParticipants}
                  prefix={<TeamOutlined />}
                  suffix={`/ ${statistics.maxParticipants}`}
                />
                <Progress
                  percent={parseFloat(statistics.enrollmentRate)}
                  status="active"
                  size="small"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('programManagement.details.enrollmentRate')}
                  value={statistics.enrollmentRate}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Completion Statistics */}
        <Col xs={24} lg={12}>
          <Card title={t('programManagement.details.completionRate')}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title={t('programManagement.details.statistics.completed')}
                  value={statistics.completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title={t('programManagement.details.completionRate')}
                  value={statistics.completionRate}
                  suffix="%"
                  prefix={<TrophyOutlined />}
                />
              </Col>
            </Row>
            <Progress
              percent={parseFloat(statistics.completionRate)}
              status="success"
              size="small"
            />
          </Card>
        </Col>

        {/* Status Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={t('programManagement.details.statistics.statusDistribution')}
          >
            <List
              size="small"
              dataSource={Object.entries(statusDistribution)}
              renderItem={([status, count]) => (
                <List.Item>
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space>
                      <Tag
                        color={getStatusColor(status)}
                        icon={getStatusIcon(status)}
                      >
                        {t(
                          `programManagement.details.status.${status.toLowerCase()}`
                        )}
                      </Tag>
                    </Space>
                    <Text strong>{count}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Score Distribution */}
        <Col xs={24} lg={12}>
          <Card title={t('programManagement.details.charts.scoreDistribution')}>
            <List
              size="small"
              dataSource={Object.entries(scoreRanges)}
              renderItem={([range, count]) => (
                <List.Item>
                  <Space
                    style={{ width: '100%', justifyContent: 'space-between' }}
                  >
                    <Text>{range}</Text>
                    <Text strong>{count}</Text>
                  </Space>
                </List.Item>
              )}
            />
            {scores.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Statistic
                  title={t('programManagement.details.averageScore')}
                  value={statistics.averageScore}
                  precision={1}
                  prefix={<TrophyOutlined />}
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Detailed Statistics */}
        <Col span={24}>
          <Card
            title={t('programManagement.details.statistics.detailedStatistics')}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={12}>
                <Statistic
                  title={t('programManagement.details.statistics.completed')}
                  value={statistics.completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={12}>
                <Statistic
                  title={t('programManagement.details.statistics.absent')}
                  value={statistics.absentCount}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title={t(
                    'programManagement.details.statistics.availableSpots'
                  )}
                  value={
                    statistics.maxParticipants - statistics.totalParticipants
                  }
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProgramStatistics

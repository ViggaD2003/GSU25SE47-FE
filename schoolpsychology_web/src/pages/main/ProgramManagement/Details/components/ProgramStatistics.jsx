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
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut, Pie } from 'react-chartjs-2'

const { Text } = Typography
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

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

  const statusDistribution = {
    COMPLETED: participants.filter(p => p.status === 'COMPLETED').length,
    ABSENT: participants.filter(p => p.status === 'ABSENT').length,
  }

  const scoreDistribution = {
    ENHANCED: participants.filter(p => p.finalScore > 0).length,
    STABLE: participants.filter(p => p.finalScore === 0).length,
    DECLINED: participants.filter(p => p.finalScore < 0).length,
  }

  const participantTypeDistribution = {
    NORMAL: participants.filter(p => p.cases === null).length,
    CASE: participants.filter(p => p.cases !== null).length,
  }

  const pieProps = {
    data: {
      labels: [
        t('programManagement.details.charts.case'),
        t('programManagement.details.charts.normal'),
      ],
      datasets: [
        {
          label: t(
            'programManagement.details.charts.participantTypeDistribution'
          ),
          data: [
            participantTypeDistribution.CASE,
            participantTypeDistribution.NORMAL,
          ],
          backgroundColor: ['#7A1BFFFF', '#2ec6d1'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'left',
        },
      },
    },
  }

  const barProps = {
    data: {
      labels: [''],
      datasets: [
        {
          label: t('programManagement.details.charts.declined'),
          data: [scoreDistribution.DECLINED],
          backgroundColor: ['#ff4d4f'],
        },
        {
          label: t('programManagement.details.charts.stable'),
          data: [scoreDistribution.STABLE],
          backgroundColor: ['#faad14'],
        },

        {
          label: t('programManagement.details.charts.enhanced'),
          data: [scoreDistribution.ENHANCED],
          backgroundColor: ['#52c41a'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  }

  const getStatusColor = status => {
    switch (status) {
      case 'ENROLLED':
        return 'blue'
      case 'COMPLETED':
        return 'green'
      case 'ABSENT':
        return 'red'
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
      case 'ABSENT':
        return <CloseCircleOutlined />
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
                <List.Item className="hover:bg-gray-100">
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
            <Pie {...pieProps} />
          </Card>
        </Col>

        {/* Detailed Statistics */}
        <Col span={24}>
          <Card
            title={t('programManagement.details.statistics.detailedStatistics')}
          >
            <Bar {...barProps} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProgramStatistics

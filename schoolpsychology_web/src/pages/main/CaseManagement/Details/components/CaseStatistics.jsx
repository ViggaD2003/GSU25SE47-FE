import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Statistic,
  Progress,
  Alert,
  Empty,
} from 'antd'
import {
  BarChartOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const CaseStatistics = ({ _caseInfo, statistics }) => {
  const { t } = useTranslation()

  // Calculate engagement metrics
  const engagementMetrics = useMemo(() => {
    if (!statistics) return null

    // Calculate totals from active + completed
    const totalSurveys = statistics.activeSurveys + statistics.completedSurveys
    const totalAppointments =
      statistics.activeAppointments + statistics.completedAppointments
    const totalPrograms =
      statistics.activePrograms + statistics.completedPrograms

    const totalAbsent =
      statistics.skippedSurveys +
      statistics.absentAppointments +
      statistics.absentPrograms

    const totalCompletedActivities =
      statistics.completedSurveys +
      statistics.completedAppointments +
      statistics.completedPrograms

    const totalActivities = totalSurveys + totalAppointments + totalPrograms

    const attendanceRate =
      totalCompletedActivities > 0
        ? (totalCompletedActivities /
            (totalAbsent + totalCompletedActivities)) *
          100
        : 0

    const totalSurveysIncludingSkipped =
      statistics.skippedSurveys + statistics.completedSurveys

    const surveyCompletionRate =
      totalSurveysIncludingSkipped > 0
        ? (statistics.completedSurveys / totalSurveysIncludingSkipped) * 100
        : 0

    const appointmentAttendanceRate =
      totalAppointments > 0
        ? (statistics.completedAppointments / totalAppointments) * 100
        : 0

    const programAttendanceRate =
      totalPrograms > 0
        ? (statistics.completedPrograms / totalPrograms) * 100
        : 0

    return {
      totalActivities,
      totalSurveys,
      totalAppointments,
      totalPrograms,
      totalAbsent,
      attendanceRate,
      surveyCompletionRate,
      appointmentAttendanceRate,
      programAttendanceRate,
    }
  }, [statistics])

  if (!statistics || !engagementMetrics) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('caseManagement.details.statistics.noData')}
        />
      </Card>
    )
  }

  const getProgressColor = percentage => {
    if (percentage >= 80) return '#52c41a'
    if (percentage >= 60) return '#faad14'
    return '#ff4d4f'
  }

  const getScoreStatus = score => {
    if (score >= 4) return { color: '#52c41a', icon: <CheckCircleOutlined /> }
    if (score >= 2.5) return { color: '#faad14', icon: <MinusCircleOutlined /> }
    return { color: '#ff4d4f', icon: <ExclamationCircleOutlined /> }
  }

  const scoreStatus = getScoreStatus(statistics.averageScore)

  return (
    <div>
      {/* Overall Performance Alert */}
      {statistics.averageScore < 2.5 && (
        <Alert
          message={t('caseManagement.details.statistics.lowPerformanceAlert')}
          description={t(
            'caseManagement.details.statistics.lowPerformanceDescription'
          )}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Key Metrics */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                {t('caseManagement.details.statistics.keyMetrics')}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Statistic
                  title={t('caseManagement.details.statistics.totalActivities')}
                  value={engagementMetrics.totalActivities}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title={t('caseManagement.details.statistics.averageScore')}
                  value={statistics.averageScore}
                  precision={1}
                  prefix={scoreStatus.icon}
                  valueStyle={{ color: scoreStatus.color }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title={t('caseManagement.details.statistics.totalAbsent')}
                  value={engagementMetrics.totalAbsent}
                  prefix={<CloseCircleOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title={t('caseManagement.details.statistics.attendanceRate')}
                  value={engagementMetrics.attendanceRate}
                  precision={1}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{
                    color: getProgressColor(engagementMetrics.attendanceRate),
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Engagement Breakdown */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <TrophyOutlined />
                {t('caseManagement.details.statistics.engagementBreakdown')}
              </Space>
            }
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Space>
                    <FileTextOutlined />
                    <Text>
                      {t('caseManagement.details.statistics.surveyCompletion')}
                    </Text>
                  </Space>
                  <Text strong>
                    {engagementMetrics.surveyCompletionRate.toFixed(1)}%
                  </Text>
                </Space>
                <Progress
                  percent={engagementMetrics.surveyCompletionRate}
                  strokeColor={getProgressColor(
                    engagementMetrics.surveyCompletionRate
                  )}
                  showInfo={false}
                />
              </div>

              <div>
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Space>
                    <CalendarOutlined />
                    <Text>
                      {t(
                        'caseManagement.details.statistics.appointmentAttendance'
                      )}
                    </Text>
                  </Space>
                  <Text strong>
                    {engagementMetrics.appointmentAttendanceRate.toFixed(1)}%
                  </Text>
                </Space>
                <Progress
                  percent={engagementMetrics.appointmentAttendanceRate}
                  strokeColor={getProgressColor(
                    engagementMetrics.appointmentAttendanceRate
                  )}
                  showInfo={false}
                />
              </div>

              <div>
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Space>
                    <TeamOutlined />
                    <Text>
                      {t('caseManagement.details.statistics.programAttendance')}
                    </Text>
                  </Space>
                  <Text strong>
                    {engagementMetrics.programAttendanceRate.toFixed(1)}%
                  </Text>
                </Space>
                <Progress
                  percent={engagementMetrics.programAttendanceRate}
                  strokeColor={getProgressColor(
                    engagementMetrics.programAttendanceRate
                  )}
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Detailed Breakdown */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                {t('caseManagement.details.statistics.detailedBreakdown')}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <FileTextOutlined style={{ color: '#52c41a' }} />
                      <Text strong>
                        {t('caseManagement.details.statistics.surveys')}
                      </Text>
                    </Space>
                    <Row>
                      <Col span={12}>
                        <Statistic
                          title={t('common.completed')}
                          value={statistics.completedSurveys}
                          valueStyle={{ fontSize: 18 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={t('caseManagement.details.statistics.skipped')}
                          value={statistics.skippedSurveys}
                          valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#f0f5ff',
                    border: '1px solid #adc6ff',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <CalendarOutlined style={{ color: '#1890ff' }} />
                      <Text strong>
                        {t('caseManagement.details.statistics.appointments')}
                      </Text>
                    </Space>
                    <Row>
                      <Col span={12}>
                        <Statistic
                          title={t('common.completed')}
                          value={statistics.completedAppointments}
                          valueStyle={{ fontSize: 18 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={t('caseManagement.details.statistics.absent')}
                          value={statistics.absentAppointments}
                          valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card
                  size="small"
                  style={{
                    backgroundColor: '#f9f0ff',
                    border: '1px solid #d3adf7',
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <TeamOutlined style={{ color: '#722ed1' }} />
                      <Text strong>
                        {t('caseManagement.details.statistics.programs')}
                      </Text>
                    </Space>
                    <Row>
                      <Col span={12}>
                        <Statistic
                          title={t('common.completed')}
                          value={statistics.completedPrograms}
                          valueStyle={{ fontSize: 18 }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title={t('caseManagement.details.statistics.absent')}
                          value={statistics.absentPrograms}
                          valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                        />
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default CaseStatistics

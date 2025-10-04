import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Row, Col, Typography, Space, Empty, Select, Switch } from 'antd'
import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

const { Title, Text } = Typography

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
)

const CaseCharts = ({ caseData, statistics }) => {
  const { t } = useTranslation()

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!caseData?.groupedStatic) return null

    const { survey, appointment, program } = caseData.groupedStatic

    // Calculate totals from active + completed
    const totalSurveys =
      (statistics?.completedSurveys || 0) + (statistics?.skippedSurveys || 0)
    const totalAppointments =
      (statistics?.activeAppointments || 0) +
      (statistics?.completedAppointments || 0) +
      (statistics?.absentAppointments || 0)
    const totalPrograms =
      (statistics?.activePrograms || 0) +
      (statistics?.completedPrograms || 0) +
      (statistics?.absentPrograms || 0)

    // Combine all data points and sort by date
    const allDataPoints = [
      ...survey.dataSet.map(item => ({
        ...item,
        type: 'Survey',
        color: '#52c41a',
      })),
      ...appointment.dataSet.map(item => ({
        ...item,
        type: 'Appointment',
        color: '#1890ff',
      })),
      ...program.dataSet.map(item => ({
        ...item,
        type: 'Program',
        color: '#722ed1',
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    // Prepare score trend data
    const scoreTrendData = {
      labels: allDataPoints.map((item, index) => `${item.type} ${index + 1}`),
      datasets: [
        {
          label: t('caseManagement.details.charts.scoreHistory'),
          data: allDataPoints.map(item => item.score),
          borderColor: '#1890ff',
          backgroundColor: 'rgba(24, 144, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    }

    // Prepare activity type distribution
    const activityDistribution = {
      labels: [
        t('caseManagement.details.charts.surveys'),
        t('caseManagement.details.charts.appointments'),
        t('caseManagement.details.charts.programs'),
      ],
      datasets: [
        {
          data: [totalSurveys, totalAppointments, totalPrograms],
          backgroundColor: ['#52c41a', '#1890ff', '#722ed1'],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    }

    // Prepare score comparison by type
    // const avgScoreByType = {
    //   labels: [
    //     t('caseManagement.details.charts.surveys'),
    //     t('caseManagement.details.charts.appointments'),
    //     t('caseManagement.details.charts.programs'),
    //   ],
    //   datasets: [
    //     {
    //       label: t('caseManagement.details.charts.averageScore'),
    //       data: [
    //         survey.dataSet.length > 0
    //           ? survey.dataSet.reduce((sum, item) => sum + item.score, 0) /
    //             survey.dataSet.length
    //           : 0,
    //         appointment.dataSet.length > 0
    //           ? appointment.dataSet.reduce((sum, item) => sum + item.score, 0) /
    //             appointment.dataSet.length
    //           : 0,
    //         program.dataSet.length > 0
    //           ? program.dataSet.reduce((sum, item) => sum + item.score, 0) /
    //             program.dataSet.length
    //           : 0,
    //       ],
    //       backgroundColor: [
    //         'rgba(82, 196, 26, 0.8)',
    //         'rgba(24, 144, 255, 0.8)',
    //         'rgba(114, 46, 209, 0.8)',
    //       ],
    //       borderColor: ['#52c41a', '#1890ff', '#722ed1'],
    //       borderWidth: 2,
    //     },
    //   ],
    // }

    // Prepare engagement trends
    const engagementData = {
      labels: [
        t('caseManagement.details.charts.surveys'),
        t('caseManagement.details.charts.appointments'),
        t('caseManagement.details.charts.programs'),
      ],
      datasets: [
        {
          label: t('caseManagement.details.charts.upcoming'),
          data: [
            0,
            statistics?.activeAppointments || 0,
            statistics?.activePrograms || 0,
          ],
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          borderWidth: 2,
        },
        {
          label: t('caseManagement.details.charts.completed'),
          data: [
            statistics?.completedSurveys || 0,
            statistics?.completedAppointments || 0,
            statistics?.completedPrograms || 0,
          ],
          backgroundColor: 'rgba(82, 196, 26, 0.8)',
          borderColor: '#52c41a',
          borderWidth: 2,
        },
        {
          label: t('caseManagement.details.charts.missed'),
          data: [
            statistics?.skippedSurveys || 0,
            statistics?.absentAppointments || 0,
            statistics?.absentPrograms || 0,
          ],
          backgroundColor: 'rgba(255, 77, 79, 0.8)',
          borderColor: '#ff4d4f',
          borderWidth: 2,
        },
      ],
    }

    return {
      scoreTrend: scoreTrendData,
      activityDistribution,
      // scoreComparison: avgScoreByType,
      engagement: engagementData,
      dataPoints: allDataPoints,
      totalSurveys,
      totalAppointments,
      totalPrograms,
    }
  }, [caseData, t, statistics])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    },
  }

  if (!chartData) {
    return (
      <Card>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('caseManagement.details.charts.noData')}
        />
      </Card>
    )
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Score Trend Line Chart */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                {t('caseManagement.details.charts.scoreTrend')}
              </Space>
            }
          >
            <div style={{ height: 300 }}>
              <Line data={chartData.scoreTrend} options={chartOptions} />
            </div>
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f0f2f5',
                borderRadius: 6,
              }}
            >
              <Text type="secondary">
                {t('caseManagement.details.charts.scoreTrendDescription')}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Activity Distribution Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                {t('caseManagement.details.charts.activityDistribution')}
              </Space>
            }
          >
            <div style={{ height: 300 }}>
              <Doughnut
                data={chartData.activityDistribution}
                options={doughnutOptions}
              />
            </div>
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Text type="secondary">
                {t('caseManagement.details.charts.totalActivities')}:{' '}
                {(chartData?.totalSurveys || 0) +
                  (chartData?.totalAppointments || 0) +
                  (chartData?.totalPrograms || 0)}
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined />
                {t('caseManagement.details.charts.engagementAnalysis')}
              </Space>
            }
          >
            <div style={{ height: 300 }}>
              <Bar
                data={chartData.engagement}
                options={{
                  ...chartOptions,
                  scales: {
                    ...chartOptions.scales,
                    x: {
                      ...chartOptions.scales.x,
                      stacked: true,
                    },
                    y: {
                      ...chartOptions.scales.y,
                      max: undefined,
                      stacked: true,
                    },
                  },
                }}
              />
            </div>
            {/* <div style={{ marginTop: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card
                    size="small"
                    style={{ backgroundColor: '#f6ffed', textAlign: 'center' }}
                  >
                    <Text strong style={{ color: '#52c41a' }}>
                      {(
                        ((statistics?.completedSurveys +
                          statistics?.completedAppointments +
                          statistics?.completedPrograms) /
                          (statistics?.completedSurveys +
                            statistics?.skippedSurveys +
                            statistics?.completedAppointments +
                            statistics?.absentAppointments +
                            statistics?.completedPrograms +
                            statistics?.absentPrograms)) *
                          100 || 0
                      ).toFixed(1)}
                      %
                    </Text>
                    <br />
                    <Text type="secondary">
                      {t('caseManagement.details.charts.overallEngagement')}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card
                    size="small"
                    style={{ backgroundColor: '#fff7e6', textAlign: 'center' }}
                  >
                    <Text strong style={{ color: '#faad14' }}>
                      {statistics?.averageScore?.toFixed(1) || 0}/5.0
                    </Text>
                    <br />
                    <Text type="secondary">
                      {t('caseManagement.details.charts.averagePerformance')}
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card
                    size="small"
                    style={{ backgroundColor: '#f0f5ff', textAlign: 'center' }}
                  >
                    <Text strong style={{ color: '#1890ff' }}>
                      {chartData.dataPoints?.length || 0}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {t('caseManagement.details.charts.totalDataPoints')}
                    </Text>
                  </Card>
                </Col>
              </Row>
            </div> */}
          </Card>
        </Col>

        {/* Score Comparison Bar Chart */}
        {/* <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                {t('caseManagement.details.charts.scoreComparison')}
              </Space>
            }
          >
            <div style={{ height: 300 }}>
              <Bar
                data={chartData.scoreComparison}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
            <div
              style={{
                marginTop: 16,
                padding: '12px',
                backgroundColor: '#f0f2f5',
                borderRadius: 6,
              }}
            >
              <Text type="secondary">
                {t('caseManagement.details.charts.scoreComparisonDescription')}
              </Text>
            </div>
          </Card>
        </Col> */}
      </Row>
    </div>
  )
}

export default CaseCharts

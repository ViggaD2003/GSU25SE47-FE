import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Row, Col, Typography, Space, Empty } from 'antd'
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  TeamOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const ProgramCharts = ({ program, statistics }) => {
  const { t } = useTranslation()

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!program || !statistics) return null

    const participants = Array.isArray(program.participants)
      ? program.participants
      : []

    // Status distribution for pie chart
    const statusData = participants.reduce((acc, participant) => {
      const status = participant.status || 'UNKNOWN'
      const existing = acc.find(item => item.name === status)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: status, value: 1 })
      }
      return acc
    }, [])

    // Score distribution for bar chart
    const scores = participants
      .filter(p => p.finalScore !== null && p.finalScore !== undefined)
      .map(p => p.finalScore)

    const scoreRanges = [
      {
        range: '0-25',
        count: scores.filter(score => score >= 0 && score <= 25).length,
      },
      {
        range: '26-50',
        count: scores.filter(score => score > 25 && score <= 50).length,
      },
      {
        range: '51-75',
        count: scores.filter(score => score > 50 && score <= 75).length,
      },
      {
        range: '76-100',
        count: scores.filter(score => score > 75 && score <= 100).length,
      },
    ]

    return {
      statusData,
      scoreRanges,
    }
  }, [program, statistics])

  if (!chartData) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <BarChartOutlined
            style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }}
          />
          <Title level={4} type="secondary">
            {t('programManagement.details.statistics.noChartData')}
          </Title>
          <Text type="secondary">
            {t('programManagement.details.statistics.insufficientData')}
          </Text>
        </div>
      </Card>
    )
  }

  const getStatusColor = status => {
    switch (status) {
      case 'ENROLLED':
        return '#90f2ff'
      case 'ABSENT':
        return '#ff4d4f'
      case 'ACTIVE':
        return '#1890ff'
      case 'PLANNING':
        return '#722ed1'
      case 'ON_GOING':
        return '#faad14'
      case 'COMPLETED':
        return '#52c41a'
      default:
        return '#d9d9d9'
    }
  }

  const getStatusLabel = status => {
    return t(`programManagement.details.status.${status.toLowerCase()}`)
  }

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Status Distribution Pie Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                {t('programManagement.details.charts.statusDistribution')}
              </Space>
            }
          >
            {chartData.statusData.length > 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: `conic-gradient(${chartData.statusData
                      .map(
                        (item, index) =>
                          `${getStatusColor(item.name)} ${index * (100 / chartData.statusData.length)}% ${(index + 1) * (100 / chartData.statusData.length)}%`
                      )
                      .join(', ')})`,
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text strong>{statistics.totalParticipants}</Text>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
                  {chartData.statusData.map(item => (
                    <div
                      key={item.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: getStatusColor(item.name),
                          borderRadius: '2px',
                        }}
                      />
                      <Text>
                        {getStatusLabel(item.name)}: {item.value}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Empty
                description={t(
                  'programManagement.details.statistics.noStatusData'
                )}
              />
            )}
          </Card>
        </Col>

        {/* Score Distribution Bar Chart */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                {t('programManagement.details.charts.scoreDistribution')}
              </Space>
            }
          >
            {chartData.scoreRanges.some(range => range.count > 0) ? (
              <div style={{ padding: '20px' }}>
                {chartData.scoreRanges.map(range => (
                  <div key={range.range} style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <Text>{range.range}</Text>
                      <Text strong>{range.count}</Text>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '20px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${(range.count / Math.max(...chartData.scoreRanges.map(r => r.count))) * 100}%`,
                          height: '100%',
                          backgroundColor: '#1890ff',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                description={t(
                  'programManagement.details.statistics.noScoreData'
                )}
              />
            )}
          </Card>
        </Col>

        {/* Enrollment Trend Line Chart */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                {t('programManagement.details.charts.enrollmentTrend')}
              </Space>
            }
          >
            <div
              style={{
                padding: '20px',
                height: '300px',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-around',
              }}
            >
              {chartData.enrollmentTrend.map((item, _index) => {
                const height = 100
                return (
                  <div key={item.month} style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '40px',
                        height: `${height}px`,
                        backgroundColor: '#1890ff',
                        borderRadius: '4px 4px 0 0',
                        marginBottom: '8px',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <Text style={{ fontSize: '12px' }}>{item.month}</Text>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {item.enrolled}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>

        {/* Summary Statistics */}
        <Col span={24}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                {t('programManagement.details.statistics.summaryStatistics')}
              </Space>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                    }}
                  >
                    {statistics.totalParticipants}
                  </div>
                  <Text type="secondary">
                    {t(
                      'programManagement.details.statistics.totalParticipants'
                    )}
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#52c41a',
                    }}
                  >
                    {statistics.completedCount}
                  </div>
                  <Text type="secondary">
                    {t('programManagement.details.statistics.completed')}
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#faad14',
                    }}
                  >
                    {statistics.enrollmentRate}%
                  </div>
                  <Text type="secondary">
                    {t('programManagement.details.statistics.enrollmentRate')}
                  </Text>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#722ed1',
                    }}
                  >
                    {statistics.averageScore}
                  </div>
                  <Text type="secondary">
                    {t('programManagement.details.statistics.averageScore')}
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProgramCharts

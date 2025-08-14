import React, { memo, useMemo } from 'react'
import {
  Card,
  Row,
  Col,
  Progress,
  Typography,
  Tag,
  Space,
  Divider,
  Empty,
} from 'antd'
import { BarChartOutlined, AlertOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const AssessmentScores = memo(({ assessmentScores, isDarkMode, t }) => {
  const calculateTotalScore = useMemo(() => {
    if (!assessmentScores || assessmentScores.length === 0) return 0
    return (
      assessmentScores.reduce(
        (total, score) => total + (score.compositeScore || 0),
        0
      ) / assessmentScores.length
    )
  }, [assessmentScores])

  const getRiskLevel = useMemo(() => {
    if (calculateTotalScore >= 3.9)
      return { level: 'critical', color: '#ff4d4f', percent: 100 }
    if (calculateTotalScore >= 2.9)
      return { level: 'high', color: '#FA7014FF', percent: 60 }
    if (calculateTotalScore >= 1.9)
      return { level: 'moderate', color: '#F6D920FF', percent: 30 }
    return { level: 'low', color: '#52c41a', percent: 30 }
  }, [calculateTotalScore])

  const getScoreColor = score => {
    if (score >= 4) return '#ff4d4f'
    if (score >= 3) return '#fa8c16'
    if (score >= 2) return '#faad14'
    return '#52c41a'
  }

  const getScoreLabel = score => {
    if (score >= 4) return t('assessment.scoreLevel.critical', 'Critical')
    if (score >= 3) return t('assessment.scoreLevel.high', 'High')
    if (score >= 2) return t('assessment.scoreLevel.moderate', 'Moderate')
    if (score >= 1) return t('assessment.scoreLevel.low', 'Low')
    return t('assessment.scoreLevel.low', 'Low')
  }

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          {t('appointmentRecord.assessmentScores')}
        </div>
      }
      className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
      styles={{ body: { width: '100%', height: '100%' } }}
    >
      {assessmentScores.length > 0 ? (
        <Space direction="vertical" size="large" className="w-full">
          {/* Total Score Overview */}
          <div className="text-center">
            <div className="mb-4">
              <Title level={3} className="mb-2">
                {t('appointmentRecord.totalAssessmentScore')}
              </Title>
              <Text type="secondary">
                {t('appointmentRecord.totalAssessmentScoreDesc')}
              </Text>
            </div>
            <Row>
              <Col span={12}>
                <div className="flex justify-center mb-4">
                  <Progress
                    type="circle"
                    percent={getRiskLevel.percent}
                    strokeColor={getRiskLevel.color}
                    format={() => (
                      <div>
                        <Title
                          level={5}
                          style={{
                            color: getRiskLevel.color,
                            margin: 0,
                            fontSize: '3rem',
                          }}
                        >
                          {calculateTotalScore.toFixed(1)}
                        </Title>
                        {/* <Text type="secondary" className="text-sm">
                    {t('appointmentRecord.totalAssessmentScore')}
                  </Text> */}
                      </div>
                    )}
                    size={150}
                  />
                </div>

                <Tag color={getRiskLevel.color} className="text-lg px-4 py-2">
                  {t(
                    `assessment.riskLevels.${getRiskLevel.level}`,
                    getRiskLevel.level.toUpperCase()
                  )}
                </Tag>
              </Col>
              <Col span={12}>
                {/* Score Legend */}
                <div
                  className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}
                >
                  <Title level={5} className="mb-3">
                    {t('appointmentRecord.legend')}
                  </Title>
                  <Row>
                    <Col span={24}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <Text className="text-xs">
                          {t('appointmentRecord.low')} (0-1.9)
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <Text className="text-xs">
                          {t('appointmentRecord.moderate')} (2.0-2.9)
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <Text className="text-xs">
                          {t('appointmentRecord.high')} (3.0-3.9)
                        </Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <Text className="text-xs">
                          {t('appointmentRecord.critical')} (4.0+)
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Category Breakdown */}
          <div>
            <Title level={4} className="mb-4">
              {t('appointmentRecord.categoryBreakdown')}
            </Title>

            <Row gutter={[16, 16]}>
              {assessmentScores.length > 0 ? (
                assessmentScores.map((score, index) => (
                  <Col xs={24} sm={12} lg={8} key={score.id || index}>
                    <Card
                      size="small"
                      className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
                    >
                      <div className="text-center">
                        <Title level={5} className="mb-2">
                          {score.categoryName ||
                            t('appointmentRecord.category')}
                        </Title>

                        <div className="mb-3">
                          <Progress
                            type="circle"
                            percent={Math.min(
                              (score.compositeScore / 4) * 100,
                              100
                            )}
                            strokeColor={getScoreColor(score.compositeScore)}
                            format={() => (
                              <div>
                                <Text
                                  strong
                                  style={{
                                    color: getScoreColor(score.compositeScore),
                                    fontSize: '1.5rem',
                                  }}
                                >
                                  {score.compositeScore?.toFixed(1) || '0.0'}
                                </Text>
                              </div>
                            )}
                            size={80}
                          />
                        </div>

                        <Tag
                          color={getScoreColor(score.compositeScore)}
                          className="mb-2"
                        >
                          {getScoreLabel(score.compositeScore)}
                        </Tag>

                        {/* Score Details */}
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <Text type="secondary">
                              {t('appointmentRecord.severity')}:
                            </Text>
                            <Text strong>
                              {score.severityScore?.toFixed(1) || '0.0'}
                            </Text>
                          </div>
                          <div className="flex justify-between">
                            <Text type="secondary">
                              {t('appointmentRecord.frequency')}:
                            </Text>
                            <Text strong>
                              {score.frequencyScore?.toFixed(1) || '0.0'}
                            </Text>
                          </div>
                          <div className="flex justify-between">
                            <Text type="secondary">
                              {t('appointmentRecord.impairment')}:
                            </Text>
                            <Text strong>
                              {score.impairmentScore?.toFixed(1) || '0.0'}
                            </Text>
                          </div>
                          <div className="flex justify-between">
                            <Text type="secondary">
                              {t('appointmentRecord.chronicity')}:
                            </Text>
                            <Text strong>
                              {score.chronicityScore?.toFixed(1) || '0.0'}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t('appointmentRecord.noAssessmentScores')}
                  />
                </Col>
              )}
            </Row>
          </div>
        </Space>
      ) : (
        <div className="text-center">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('appointmentRecord.noAssessmentScores')}
          />
        </div>
      )}
    </Card>
  )
})

AssessmentScores.displayName = 'AssessmentScores'

export default AssessmentScores

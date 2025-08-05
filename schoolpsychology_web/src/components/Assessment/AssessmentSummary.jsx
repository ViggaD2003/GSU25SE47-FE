import React, { memo } from 'react'
import {
  Card,
  Typography,
  Row,
  Col,
  Progress,
  Badge,
  Divider,
  Space,
  Button,
  Alert,
} from 'antd'
import {
  FileTextOutlined,
  BarChartOutlined,
  UserOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { reportData } from '../../constants/appointmentReport'

const { Title, Text, Paragraph } = Typography

// Helper function to get score color
const getScoreColor = score => {
  if (score <= 1) return { color: '#52c41a', label: 'Thấp', bg: '#f6ffed' }
  if (score <= 3)
    return { color: '#faad14', label: 'Trung bình', bg: '#fffbe6' }
  return { color: '#ff4d4f', label: 'Cao', bg: '#fff2f0' }
}

// Helper function to get session flow label
const getSessionFlowLabel = flow => {
  const labels = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
  }
  return labels[flow] || flow
}

// Helper function to get cooperation level label
const getCoopLevelLabel = level => {
  const labels = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
  }
  return labels[level] || level
}

const AssessmentSummary = memo(
  ({ assessmentData, onEdit, onConfirm, loading = false }) => {
    if (!assessmentData) return null

    const {
      caseId,
      sessionNotes,
      noteSummary,
      noteSuggestion,
      sessionFlow,
      studentCoopLevel,
      assessmentScores,
    } = assessmentData

    // Calculate total scores by category
    const mentalHealthScores = assessmentScores.filter(
      (_, index) => reportData[index]?.categoryCode === 'mental_health'
    )
    const environmentScores = assessmentScores.filter(
      (_, index) => reportData[index]?.categoryCode === 'environment'
    )

    const mentalHealthTotal = mentalHealthScores.reduce(
      (sum, score) => sum + score.severityScore,
      0
    )
    const environmentTotal = environmentScores.reduce(
      (sum, score) => sum + score.severityScore,
      0
    )
    const overallTotal = mentalHealthTotal + environmentTotal

    // Get high-risk items
    const highRiskItems = assessmentScores
      .map((score, index) => ({ score, item: reportData[index] }))
      .filter(({ score }) => score.severityScore >= 4)

    // Get session flow color
    const getSessionFlowColor = flow => {
      const colors = {
        LOW: '#ff4d4f',
        MEDIUM: '#faad14',
        HIGH: '#52c41a',
      }
      return colors[flow] || '#1890ff'
    }

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="shadow-lg">
          <div className="text-center">
            <Title level={2} className="mb-2">
              <CheckCircleOutlined className="mr-2 text-green-500" />
              Báo Cáo Đánh Giá Hoàn Thành
            </Title>
            <Text className="text-gray-600">
              ID: {caseId} | Ngày: {new Date().toLocaleDateString('vi-VN')}
            </Text>
          </div>
        </Card>

        {/* High Risk Alerts */}
        {highRiskItems.length > 0 && (
          <div className="space-y-2">
            {highRiskItems.map(({ score, item }, index) => (
              <Alert
                key={index}
                message={`${item.label} - Điểm nghiêm trọng: ${score.severityScore}`}
                type={item.id === 'self_harm_ideation' ? 'error' : 'warning'}
                showIcon
                icon={<ExclamationCircleOutlined />}
                description={
                  item.id === 'self_harm_ideation'
                    ? 'Cần đánh giá an toàn ngay lập tức và có biện pháp can thiệp khẩn cấp.'
                    : 'Cần theo dõi sát sao và có kế hoạch can thiệp phù hợp.'
                }
              />
            ))}
          </div>
        )}

        {/* Overall Score */}
        <Card className="shadow-lg">
          <div className="text-center p-6">
            <Title
              level={1}
              style={{ color: getScoreColor(overallTotal).color, margin: 0 }}
            >
              {overallTotal}
            </Title>
            <Text
              className="text-xl font-semibold"
              style={{ color: getScoreColor(overallTotal).color }}
            >
              Tổng điểm đánh giá - Mức độ: {getScoreColor(overallTotal).label}
            </Text>
          </div>
        </Card>

        {/* Session Information */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="Thông tin phiên tư vấn" className="shadow-lg">
              <div className="space-y-4">
                <div>
                  <Text strong>Diễn biến phiên tư vấn:</Text>
                  <div
                    className="text-lg font-semibold mt-1"
                    style={{ color: getSessionFlowColor(sessionFlow) }}
                  >
                    {getSessionFlowLabel(sessionFlow)}
                  </div>
                </div>
                <div>
                  <Text strong>Mức độ hợp tác của học sinh:</Text>
                  <div
                    className="text-lg font-semibold mt-1"
                    style={{ color: getSessionFlowColor(studentCoopLevel) }}
                  >
                    {getCoopLevelLabel(studentCoopLevel)}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Phân tích điểm số" className="shadow-lg">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text>Tâm lý</Text>
                    <Text strong>{mentalHealthTotal} điểm</Text>
                  </div>
                  <Progress
                    percent={Math.round(
                      (mentalHealthTotal / (mentalHealthScores.length * 5)) *
                        100
                    )}
                    strokeColor="#1890ff"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Text>Môi trường</Text>
                    <Text strong>{environmentTotal} điểm</Text>
                  </div>
                  <Progress
                    percent={Math.round(
                      (environmentTotal / (environmentScores.length * 5)) * 100
                    )}
                    strokeColor="#52c41a"
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Assessment Details */}
        <Card title="Chi tiết đánh giá" className="shadow-lg">
          <Row gutter={[16, 16]}>
            {/* Mental Health */}
            <Col span={12}>
              <div className="space-y-3">
                <Title level={4} style={{ color: '#1890ff' }}>
                  <BarChartOutlined className="mr-2" />
                  Đánh giá tâm lý
                </Title>
                {mentalHealthScores.map((score, index) => {
                  const item = reportData.find(
                    (_, i) => reportData[i]?.categoryCode === 'mental_health'
                  )[index]
                  const scoreColor = getScoreColor(score.severityScore)
                  return (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>{item.label}</Text>
                        <Badge
                          count={score.severityScore}
                          style={{ backgroundColor: scoreColor.color }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Tần suất: {score.frequencyScore}</div>
                        <div>Ảnh hưởng: {score.impairmentScore}</div>
                        <div>Thời gian: {score.chronicityScore}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Col>

            {/* Environment */}
            <Col span={12}>
              <div className="space-y-3">
                <Title level={4} style={{ color: '#52c41a' }}>
                  <BarChartOutlined className="mr-2" />
                  Đánh giá môi trường
                </Title>
                {environmentScores.map((score, index) => {
                  const item = reportData.find(
                    (_, i) => reportData[i]?.categoryCode === 'environment'
                  )[index]
                  const scoreColor = getScoreColor(score.severityScore)
                  return (
                    <div key={item.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <Text strong>{item.label}</Text>
                        <Badge
                          count={score.severityScore}
                          style={{ backgroundColor: scoreColor.color }}
                        />
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Tần suất: {score.frequencyScore}</div>
                        <div>Ảnh hưởng: {score.impairmentScore}</div>
                        <div>Thời gian: {score.chronicityScore}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Col>
          </Row>
        </Card>

        {/* Counselor Notes */}
        <Card title="Ghi chú của tư vấn viên" className="shadow-lg">
          <div className="space-y-4">
            <div>
              <Text strong className="block mb-2">
                <FileTextOutlined className="mr-2" />
                Ghi chú phiên tư vấn
              </Text>
              <Paragraph className="bg-gray-50 p-3 rounded-lg">
                {sessionNotes || 'Không có ghi chú'}
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Text strong className="block mb-2">
                <UserOutlined className="mr-2" />
                Tóm tắt tình trạng
              </Text>
              <Paragraph className="bg-blue-50 p-3 rounded-lg">
                {noteSummary || 'Không có tóm tắt'}
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Text strong className="block mb-2">
                <SafetyOutlined className="mr-2" />
                Gợi ý can thiệp
              </Text>
              <Paragraph className="bg-green-50 p-3 rounded-lg">
                {noteSuggestion || 'Không có gợi ý'}
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="shadow-lg">
          <div className="flex justify-center space-x-4">
            <Button onClick={onEdit} size="large" icon={<FileTextOutlined />}>
              Chỉnh sửa
            </Button>
            <Button
              type="primary"
              onClick={onConfirm}
              size="large"
              icon={<CheckCircleOutlined />}
              loading={loading}
            >
              Xác nhận và gửi
            </Button>
          </div>
        </Card>
      </div>
    )
  }
)

AssessmentSummary.displayName = 'AssessmentSummary'

export default AssessmentSummary

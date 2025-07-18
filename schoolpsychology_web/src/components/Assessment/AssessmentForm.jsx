import React, { useState, useCallback, memo } from 'react'
import {
  Card,
  Button,
  Typography,
  Badge,
  Checkbox,
  Row,
  Col,
  Space,
  Select,
  Input,
} from 'antd'
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { reportData } from '../../constants/appointmentReport'
import {
  SESSION_FLOW_OPTIONS,
  STUDENT_COOP_LEVEL_OPTIONS,
} from '../../constants/assessmentOptions'

const { Title, Text } = Typography
const { TextArea } = Input

const AssessmentForm = memo(
  ({
    isVisible,
    onClose,
    onSubmit,
    _t,
    isDarkMode,
    appointmentId,
    loading = false,
  }) => {
    // State cho form assessment
    const [selectedMentalHealth, setSelectedMentalHealth] = useState([])
    const [selectedEnvironment, setSelectedEnvironment] = useState([])
    const [sessionFlow, setSessionFlow] = useState('GOOD')
    const [studentCoopLevel, setStudentCoopLevel] = useState('HIGH')
    const [showResults, setShowResults] = useState(false)
    const [totalScoreData, setTotalScoreData] = useState(null)

    // State cho note tổng hợp
    const [noteSummary, setNoteSummary] = useState('')
    const [noteSuggest, setNoteSuggest] = useState('')

    // Hàm tính điểm tổng
    const calculateTotalScore = useCallback(data => {
      const mentalHealthScore = data.mental_health.reduce(
        (sum, item) => sum + item.score,
        0
      )
      const environmentScore = data.environment.reduce(
        (sum, item) => sum + item.score,
        0
      )

      return {
        totalScore: mentalHealthScore + environmentScore,
        breakdown: {
          mental_health: mentalHealthScore,
          environment: environmentScore,
        },
      }
    }, [])

    // Hàm tạo note tổng hợp
    const generateCombinedNotes = useCallback((mentalHealth, environment) => {
      const allSelected = [...mentalHealth, ...environment]
      const summaries = allSelected
        .map(item => item.noteSummary)
        .filter(Boolean)
      const suggestions = allSelected
        .map(item => item.noteSuggest)
        .filter(Boolean)

      setNoteSummary(summaries.join('. '))
      setNoteSuggest(suggestions.join('. '))
    }, [])

    // Hàm xử lý khi checkbox mental health thay đổi
    const handleMentalHealthChange = useCallback(
      checkedValues => {
        const selected = reportData.mental_health.data.filter(item =>
          checkedValues.includes(item.id)
        )
        setSelectedMentalHealth(selected)
        generateCombinedNotes(selected, selectedEnvironment)
      },
      [selectedEnvironment, generateCombinedNotes]
    )

    // Hàm xử lý khi checkbox environment thay đổi
    const handleEnvironmentChange = useCallback(
      checkedValues => {
        const selected = reportData.environment.data.filter(item =>
          checkedValues.includes(item.id)
        )
        setSelectedEnvironment(selected)
        generateCombinedNotes(selectedMentalHealth, selected)
      },
      [selectedMentalHealth, generateCombinedNotes]
    )

    // Hàm xử lý khi submit form
    const handleSubmit = useCallback(() => {
      const data = {
        mental_health: selectedMentalHealth,
        environment: selectedEnvironment,
      }

      const scoreData = calculateTotalScore(data)
      setTotalScoreData(scoreData)
      setShowResults(true)
    }, [selectedMentalHealth, selectedEnvironment, calculateTotalScore])

    // Hàm xử lý khi xác nhận đánh giá cuối cùng
    const handleFinalSubmit = useCallback(() => {
      const submitData = {
        appointmentId: appointmentId,
        sessionFlow: sessionFlow,
        studentCoopLevel: studentCoopLevel,
        status: 'SUBMITTED',
        appointmentStatus: 'COMPLETED',
        noteSummary: noteSummary,
        noteSuggest: noteSuggest,
        reason: '',
        totalScore: totalScoreData.totalScore,
        reportCategoryRequests: [
          {
            categoryId: reportData.mental_health.id,
            score: totalScoreData.breakdown.mental_health,
          },
          {
            categoryId: reportData.environment.id,
            score: totalScoreData.breakdown.environment,
          },
        ],
      }

      onSubmit && onSubmit(submitData)
      onClose()
    }, [
      appointmentId,
      sessionFlow,
      studentCoopLevel,
      noteSummary,
      noteSuggest,
      totalScoreData,
      onSubmit,
      onClose,
    ])

    // Hàm reset form
    const handleReset = useCallback(() => {
      setSelectedMentalHealth([])
      setSelectedEnvironment([])
      setSessionFlow('GOOD')
      setStudentCoopLevel('HIGH')
      setNoteSummary('')
      setNoteSuggest('')
      setShowResults(false)
      setTotalScoreData(null)
    }, [])

    // Hàm đóng modal
    const handleClose = useCallback(() => {
      handleReset()
      onClose()
    }, [handleReset, onClose])

    // Hàm lấy màu sắc theo điểm
    const getScoreColor = useCallback(score => {
      if (score <= 5) return { color: '#52c41a', label: 'Thấp', bg: '#f6ffed' }
      if (score <= 12)
        return { color: '#faad14', label: 'Trung bình', bg: '#fffbe6' }
      return { color: '#ff4d4f', label: 'Cao', bg: '#fff2f0' }
    }, [])

    // Render checkbox table
    const renderCheckboxTable = useCallback(
      (title, data, selectedData, onChange, color) => (
        <Card
          title={
            <Text strong style={{ color }}>
              {title}
            </Text>
          }
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Tick những vấn đề được ghi nhận (điểm từ 0-4)
          </div>
          <Checkbox.Group
            style={{ width: '100%' }}
            onChange={onChange}
            value={selectedData.map(item => item.id)}
          >
            <div className="space-y-2 flex flex-row gap-2 flex-wrap w-full">
              {data.map(item => (
                <div
                  key={item.id}
                  className="min-w-[300px] flex flex-row justify-end items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Checkbox value={item.id} className="w-full">
                    <div className="w-full flex gap-6 items-center">
                      <Text className="text-gray-800 dark:text-gray-200">
                        {item.label}
                      </Text>
                      {/* <Badge
                        count={item.score}
                        style={{
                          backgroundColor:
                            item.score >= 4
                              ? '#ff4d4f'
                              : item.score >= 3
                                ? '#fa8c16'
                                : item.score >= 2
                                  ? '#faad14'
                                  : '#52c41a',
                        }}
                        title={`Điểm nghiêm trọng: ${item.score}`}
                      /> */}
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Card>
      ),
      [isDarkMode]
    )

    if (!isVisible) return null

    return (
      <div className="space-y-6">
        {/* Header */}
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm`}
        >
          <div className="flex items-center justify-between">
            <div>
              <Title level={3} className="mb-1">
                Form Đánh Giá Tình Trạng Học Sinh
              </Title>
              <Text className="text-gray-500 dark:text-gray-400">
                Đánh giá tổng hợp tình trạng tâm lý và môi trường học sinh
              </Text>
            </div>
            <Button
              onClick={handleClose}
              type="text"
              icon={<CloseCircleOutlined />}
            >
              Đóng form
            </Button>
          </div>
        </Card>

        {!showResults ? (
          <Row gutter={[24, 24]}>
            {/* Left side - Assessment Form */}
            <Col span={16}>
              <div className="space-y-6">
                {/* Session Flow and Student Cooperation Level */}
                <Card
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                >
                  <Title level={4} className="mb-4">
                    Đánh giá phiên tư vấn
                  </Title>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div className="mb-2">
                        <Text strong>Diễn biến phiên tư vấn:</Text>
                      </div>
                      <Select
                        value={sessionFlow}
                        onChange={setSessionFlow}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        {SESSION_FLOW_OPTIONS.map(option => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            <span style={{ color: option.color }}>
                              {option.label}
                            </span>
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={12}>
                      <div className="mb-2">
                        <Text strong>Mức độ hợp tác của học sinh:</Text>
                      </div>
                      <Select
                        value={studentCoopLevel}
                        onChange={setStudentCoopLevel}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        {STUDENT_COOP_LEVEL_OPTIONS.map(option => (
                          <Select.Option
                            key={option.value}
                            value={option.value}
                          >
                            <span style={{ color: option.color }}>
                              {option.label}
                            </span>
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                </Card>

                {/* Mental Health Section */}
                {renderCheckboxTable(
                  'Tâm lý',
                  reportData.mental_health.data,
                  selectedMentalHealth,
                  handleMentalHealthChange,
                  '#1890ff'
                )}

                {/* Environment Section */}
                {renderCheckboxTable(
                  'Môi trường sống',
                  reportData.environment.data,
                  selectedEnvironment,
                  handleEnvironmentChange,
                  '#52c41a'
                )}

                {/* Action Buttons */}
                <Card
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={handleReset}
                      icon={<CloseCircleOutlined />}
                    >
                      Đặt lại
                    </Button>
                    <Space>
                      <Button onClick={handleClose}>Hủy</Button>
                      <Button
                        type="primary"
                        onClick={handleSubmit}
                        icon={<CheckCircleOutlined />}
                        disabled={
                          loading ||
                          (selectedMentalHealth.length === 0 &&
                            selectedEnvironment.length === 0)
                        }
                        loading={loading}
                      >
                        Xác nhận đánh giá
                      </Button>
                    </Space>
                  </div>
                </Card>
              </div>
            </Col>

            {/* Right side - Notes */}
            <Col span={8}>
              <div className="space-y-6 sticky top-4">
                {/* Summary Note */}
                <Card
                  title="Tóm tắt tình trạng"
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-fit`}
                >
                  <TextArea
                    value={noteSummary}
                    onChange={e => setNoteSummary(e.target.value)}
                    placeholder="Tóm tắt tình trạng sẽ được tạo tự động khi bạn chọn các vấn đề..."
                    rows={6}
                    style={{
                      resize: 'none',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                  />
                </Card>

                {/* Suggestion Note */}
                <Card
                  title="Gợi ý can thiệp"
                  className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-fit`}
                >
                  <TextArea
                    value={noteSuggest}
                    onChange={e => setNoteSuggest(e.target.value)}
                    placeholder="Gợi ý can thiệp sẽ được tạo tự động khi bạn chọn các vấn đề..."
                    rows={6}
                    style={{
                      resize: 'none',
                      border: 'none',
                      boxShadow: 'none',
                    }}
                  />
                </Card>

                {/* Selected Items Summary */}
                {(selectedMentalHealth.length > 0 ||
                  selectedEnvironment.length > 0) && (
                  <Card
                    title="Vấn đề đã chọn"
                    className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                  >
                    <div className="space-y-3">
                      {selectedMentalHealth.length > 0 && (
                        <div>
                          <Text
                            strong
                            className="text-blue-600 dark:text-blue-400 block mb-2"
                          >
                            Tâm lý ({selectedMentalHealth.length})
                          </Text>
                          <div className="space-y-1">
                            {selectedMentalHealth.map(item => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-900 rounded"
                              >
                                <Text className="text-sm">{item.label}</Text>
                                <Badge
                                  count={item.score}
                                  style={{ backgroundColor: '#1890ff' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedEnvironment.length > 0 && (
                        <div>
                          <Text
                            strong
                            className="text-green-600 dark:text-green-400 block mb-2"
                          >
                            Môi trường ({selectedEnvironment.length})
                          </Text>
                          <div className="space-y-1">
                            {selectedEnvironment.map(item => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900 rounded"
                              >
                                <Text className="text-sm">{item.label}</Text>
                                <Badge
                                  count={item.score}
                                  style={{ backgroundColor: '#52c41a' }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        ) : (
          // Results Section
          <Card
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <div className="space-y-6">
              <div className="text-center py-4">
                <Title level={2} className="mb-2">
                  Kết quả đánh giá
                </Title>
                <Text className="text-gray-600 dark:text-gray-400">
                  Tổng hợp điểm số và phân tích tình trạng học sinh
                </Text>
              </div>

              {/* Session Summary */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="text-center">
                    <Text strong className="block mb-2">
                      Diễn biến phiên tư vấn
                    </Text>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: SESSION_FLOW_OPTIONS.find(
                          opt => opt.value === sessionFlow
                        )?.color,
                      }}
                    >
                      {
                        SESSION_FLOW_OPTIONS.find(
                          opt => opt.value === sessionFlow
                        )?.label
                      }
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="text-center">
                    <Text strong className="block mb-2">
                      Mức độ hợp tác
                    </Text>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        color: STUDENT_COOP_LEVEL_OPTIONS.find(
                          opt => opt.value === studentCoopLevel
                        )?.color,
                      }}
                    >
                      {
                        STUDENT_COOP_LEVEL_OPTIONS.find(
                          opt => opt.value === studentCoopLevel
                        )?.label
                      }
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Total Score */}
              <div
                className="text-center p-6 rounded-lg"
                style={{
                  backgroundColor: getScoreColor(totalScoreData.totalScore).bg,
                }}
              >
                <Title
                  level={1}
                  style={{
                    color: getScoreColor(totalScoreData.totalScore).color,
                    margin: 0,
                    fontSize: '3rem',
                  }}
                >
                  {totalScoreData.totalScore}
                </Title>
                <Text
                  className="text-xl font-semibold"
                  style={{
                    color: getScoreColor(totalScoreData.totalScore).color,
                  }}
                >
                  Mức độ: {getScoreColor(totalScoreData.totalScore).label}
                </Text>
              </div>

              {/* Breakdown */}
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card className="text-center">
                    <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                      {totalScoreData.breakdown.mental_health}
                    </Title>
                    <Text>Tâm lý</Text>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card className="text-center">
                    <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                      {totalScoreData.breakdown.environment}
                    </Title>
                    <Text>Môi trường</Text>
                  </Card>
                </Col>
              </Row>

              {/* Final Notes */}
              {(noteSummary || noteSuggest) && (
                <Row gutter={[16, 16]}>
                  {noteSummary && (
                    <Col span={12}>
                      <Card title="Tóm tắt tình trạng">
                        <Text>{noteSummary}</Text>
                      </Card>
                    </Col>
                  )}
                  {noteSuggest && (
                    <Col span={12}>
                      <Card title="Gợi ý can thiệp">
                        <Text>{noteSuggest}</Text>
                      </Card>
                    </Col>
                  )}
                </Row>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowResults(false)}
                  icon={<ArrowLeftOutlined />}
                >
                  Quay lại chỉnh sửa
                </Button>
                <Button
                  type="primary"
                  onClick={handleFinalSubmit}
                  icon={<CheckCircleOutlined />}
                  loading={loading}
                  disabled={loading}
                >
                  Hoàn thành đánh giá
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }
)

AssessmentForm.displayName = 'AssessmentForm'

export default AssessmentForm

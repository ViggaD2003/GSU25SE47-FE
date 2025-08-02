import React, { useState } from 'react'
import {
  Card,
  Button,
  Typography,
  Space,
  Tabs,
  Alert,
  Row,
  Col,
  Tag,
} from 'antd'
import {
  ExperimentOutlined,
  //   CompareOutlined,
  BugOutlined,
  InfoCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import AssessmentForm from '../../components/Assessment/AssessmentForm'
import ImprovedAssessmentForm from '../../components/Assessment/ImprovedAssessmentForm'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'

const { Title, Text, Paragraph } = Typography

const AssessmentDemo = () => {
  const { t } = useLanguage()
  const { isDarkMode } = useTheme()

  // States for demo
  const [activeTab, setActiveTab] = useState('comparison')
  const [oldSystemVisible, setOldSystemVisible] = useState(false)
  const [newSystemVisible, setNewSystemVisible] = useState(false)
  const [comparisonData, setComparisonData] = useState({
    oldSystem: null,
    newSystem: null,
  })

  // Mock appointment ID for demo
  const mockAppointmentId = 'demo-appointment-123'

  // Demo handlers
  const handleOldSystemSubmit = data => {
    console.log('Old System Data:', data)
    setComparisonData(prev => ({ ...prev, oldSystem: data }))
    setOldSystemVisible(false)
  }

  const handleNewSystemSubmit = data => {
    console.log('New System Data:', data)
    setComparisonData(prev => ({ ...prev, newSystem: data }))
    setNewSystemVisible(false)
  }

  const resetDemo = () => {
    setComparisonData({ oldSystem: null, newSystem: null })
    setOldSystemVisible(false)
    setNewSystemVisible(false)
  }

  // Comparison view component
  const ComparisonView = () => (
    <div className="space-y-6">
      <Alert
        message="Demo Comparison Mode"
        description="Test cả 2 hệ thống đánh giá để so sánh sự khác biệt về chức năng và độ chính xác."
        type="info"
        // icon={<CompareOutlined />}
        showIcon
        className="mb-6"
      />

      <Row gutter={[24, 24]}>
        {/* Old System */}
        <Col span={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <BugOutlined />
                <Text strong>Hệ Thống Hiện Tại (v1.0)</Text>
              </div>
            }
            extra={<Tag color="orange">Production</Tag>}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}
          >
            <div className="space-y-4">
              <div>
                <Text strong>Đặc điểm:</Text>
                <ul className="mt-2 ml-4 space-y-1 text-sm">
                  <li>• Thang điểm 2-4 (3 mức độ)</li>
                  <li>• Đánh giá một chiều</li>
                  <li>• Dựa trên kinh nghiệm thực tế</li>
                  <li>• Không có cultural adaptation</li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  type="primary"
                  onClick={() => setOldSystemVisible(true)}
                  disabled={oldSystemVisible}
                  block
                >
                  {comparisonData.oldSystem
                    ? 'Đã test ✓'
                    : 'Test Hệ Thống Hiện Tại'}
                </Button>

                {comparisonData.oldSystem && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 rounded text-left">
                    <Text strong className="text-green-700 dark:text-green-300">
                      Kết quả: Tổng điểm {comparisonData.oldSystem.totalScore}
                    </Text>
                    <div className="text-sm mt-1">
                      Vấn đề đã chọn:{' '}
                      {comparisonData.oldSystem.reportCategoryRequests
                        ?.length || 0}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* New System */}
        <Col span={12}>
          <Card
            title={
              <div className="flex items-center space-x-2">
                <RocketOutlined />
                <Text strong>Hệ Thống Cải Tiến (v2.0)</Text>
              </div>
            }
            extra={<Tag color="green">Beta</Tag>}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full`}
          >
            <div className="space-y-4">
              <div>
                <Text strong>Đặc điểm:</Text>
                <ul className="mt-2 ml-4 space-y-1 text-sm">
                  <li>• Thang điểm 0-5 (6 mức độ)</li>
                  <li>• Đánh giá đa chiều (4 dimensions)</li>
                  <li>• Dựa trên DSM-5-TR + 40+ references</li>
                  <li>• Cultural adaptation cho Việt Nam</li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  type="primary"
                  onClick={() => setNewSystemVisible(true)}
                  disabled={newSystemVisible}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  block
                >
                  {comparisonData.newSystem
                    ? 'Đã test ✓'
                    : 'Test Hệ Thống Cải Tiến'}
                </Button>

                {comparisonData.newSystem && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded text-left">
                    <Text strong className="text-blue-700 dark:text-blue-300">
                      Kết quả: Tổng điểm{' '}
                      {comparisonData.newSystem.totalRiskScore?.toFixed(1)}
                    </Text>
                    <div className="text-sm mt-1">
                      Vấn đề đã chọn:{' '}
                      {comparisonData.newSystem.selectedIssues?.length || 0}
                    </div>
                    <div className="text-sm">
                      Intervention Zone:{' '}
                      {comparisonData.newSystem.interventionZone}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Comparison Results */}
      {comparisonData.oldSystem && comparisonData.newSystem && (
        <Card
          title="📊 Kết Quả So Sánh"
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
        >
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className="text-center p-4 border rounded">
                <Text strong>Tổng Điểm</Text>
                <div className="text-2xl mt-2">
                  <span className="text-orange-500">
                    {comparisonData.oldSystem.totalScore}
                  </span>
                  {' vs '}
                  <span className="text-green-500">
                    {comparisonData.newSystem.totalRiskScore?.toFixed(1)}
                  </span>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 border rounded">
                <Text strong>Số Vấn Đề</Text>
                <div className="text-2xl mt-2">
                  <span className="text-orange-500">
                    {comparisonData.oldSystem.reportCategoryRequests?.length ||
                      0}
                  </span>
                  {' vs '}
                  <span className="text-green-500">
                    {comparisonData.newSystem.selectedIssues?.length || 0}
                  </span>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className="text-center p-4 border rounded">
                <Text strong>Độ Chi Tiết</Text>
                <div className="text-lg mt-2">
                  <span className="text-orange-500">Cơ bản</span>
                  {' vs '}
                  <span className="text-green-500">Nâng cao</span>
                </div>
              </div>
            </Col>
          </Row>

          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
            <Text strong>💡 Phân tích:</Text>
            <ul className="mt-2 ml-4 space-y-1">
              <li>
                • Hệ thống v2.0 cung cấp thêm context về mức độ nghiêm trọng và
                can thiệp
              </li>
              <li>• Scoring algorithm phức tạp hơn với cultural adjustments</li>
              <li>• Interface trực quan hơn với real-time feedback</li>
              <li>• Evidence-based approach tăng độ tin cậy</li>
            </ul>
          </div>
        </Card>
      )}

      <div className="text-center">
        <Button onClick={resetDemo} type="dashed">
          🔄 Reset Demo
        </Button>
      </div>
    </div>
  )

  // Tab content components
  const IndividualTestView = () => (
    <div className="space-y-6">
      <Alert
        message="Individual Testing Mode"
        description="Test từng hệ thống một cách độc lập để làm quen với interface và workflow."
        type="info"
        showIcon
      />

      <Row gutter={[24, 24]}>
        <Col span={12}>
          <Card title="🔧 Hệ Thống Hiện Tại">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setOldSystemVisible(true)}
              >
                Mở Form Đánh Giá v1.0
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="🚀 Hệ Thống Cải Tiến">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button
                type="primary"
                size="large"
                block
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => setNewSystemVisible(true)}
              >
                Mở Form Đánh Giá v2.0
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )

  const GuideView = () => (
    <div className="space-y-6">
      <Card title="📋 Hướng Dẫn Sử Dụng Demo">
        <div className="space-y-4">
          <div>
            <Text strong>1. So Sánh Hệ Thống:</Text>
            <ul className="mt-2 ml-4">
              <li>• Click "Test Hệ Thống Hiện Tại" để thử nghiệm v1.0</li>
              <li>• Click "Test Hệ Thống Cải Tiến" để thử nghiệm v2.0</li>
              <li>• So sánh kết quả và trải nghiệm người dùng</li>
            </ul>
          </div>

          <div>
            <Text strong>2. Test Riêng Biệt:</Text>
            <ul className="mt-2 ml-4">
              <li>• Test từng hệ thống độc lập</li>
              <li>• Làm quen với interface và workflow</li>
            </ul>
          </div>

          <div>
            <Text strong>3. Điểm Khác Biệt Chính:</Text>
            <ul className="mt-2 ml-4">
              <li>
                • <strong>Thang điểm:</strong> v1.0 (2-4) vs v2.0 (0-5)
              </li>
              <li>
                • <strong>Đánh giá:</strong> v1.0 (1 chiều) vs v2.0 (đa chiều)
              </li>
              <li>
                • <strong>UI/UX:</strong> v2.0 có real-time scoring và visual
                indicators
              </li>
              <li>
                • <strong>Scientific basis:</strong> v2.0 dựa trên DSM-5-TR và
                40+ references
              </li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔬 Technical Details">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="p-4 border rounded">
              <Text strong>Hệ Thống v1.0</Text>
              <ul className="mt-2 text-sm">
                <li>• Simple scoring (2-4 scale)</li>
                <li>• Fixed weightings</li>
                <li>• Experience-based</li>
                <li>• Basic UI</li>
              </ul>
            </div>
          </Col>
          <Col span={12}>
            <div className="p-4 border rounded">
              <Text strong>Hệ Thống v2.0</Text>
              <ul className="mt-2 text-sm">
                <li>• Multi-dimensional scoring (0-5 scale)</li>
                <li>• Composite algorithm</li>
                <li>• Evidence-based (DSM-5-TR)</li>
                <li>• Enhanced UI with real-time feedback</li>
              </ul>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'comparison':
        return <ComparisonView />
      case 'individual':
        return <IndividualTestView />
      case 'guide':
        return <GuideView />
      default:
        return <ComparisonView />
    }
  }

  // Tab items for Ant Design v5
  const tabItems = [
    {
      key: 'comparison',
      label: (
        <span>
          {/* <CompareOutlined /> */}
          So Sánh Hệ Thống
        </span>
      ),
    },
    {
      key: 'individual',
      label: (
        <span>
          <ExperimentOutlined />
          Test Riêng Biệt
        </span>
      ),
    },
    {
      key: 'guide',
      label: (
        <span>
          <InfoCircleOutlined />
          Hướng Dẫn
        </span>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={2} className="mb-2">
          🧪 Assessment System Demo Lab
        </Title>
        <Paragraph className="text-lg text-gray-600 dark:text-gray-400">
          Test và so sánh hệ thống đánh giá tâm lý cũ và mới
        </Paragraph>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="demo-tabs"
      />

      {/* Tab Content */}
      <div className="tab-content">{renderTabContent()}</div>

      {/* Assessment Forms - Old System */}
      {oldSystemVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-full overflow-auto">
            <div className="p-6">
              <AssessmentForm
                isVisible={true}
                onClose={() => setOldSystemVisible(false)}
                onSubmit={handleOldSystemSubmit}
                t={t}
                isDarkMode={isDarkMode}
                appointmentId={mockAppointmentId}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assessment Forms - New System */}
      {newSystemVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-7xl w-full max-h-full overflow-auto">
            <div className="p-6">
              <ImprovedAssessmentForm
                isVisible={true}
                onClose={() => setNewSystemVisible(false)}
                onSubmit={handleNewSystemSubmit}
                isDarkMode={isDarkMode}
                appointmentId={mockAppointmentId}
                loading={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssessmentDemo

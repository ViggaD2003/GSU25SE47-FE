import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Spin,
  message,
  Tabs,
  Tag,
  Divider,
  Statistic,
  Progress,
  Empty,
  Modal,
  Badge,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from '@ant-design/icons'

import { CaseOverview, CaseStatistics, CaseCharts } from './components'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@/contexts/AuthContext'
import { getCaseById } from '@/store/actions'

const { Title, Text, Paragraph } = Typography

const CaseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const {
    currentCase: caseData,
    loading: caseLoading,
    error,
  } = useSelector(state => state.case)
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false)

  const userRole = user?.roleName // Use roleName from user object

  // Get case data from Redux store
  useEffect(() => {
    const fetchCaseData = async () => {
      if (id && (!caseData || caseData.caseInfo?.id !== parseInt(id))) {
        setLoading(true)
        try {
          await dispatch(getCaseById(id)).unwrap()
        } catch (error) {
          console.error('Error fetching case:', error)
          messageApi.error(t('caseManagement.messages.fetchError'))
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchCaseData()
  }, [id, dispatch, messageApi, t, caseData])

  // Update loading state when Redux loading changes
  useEffect(() => {
    setLoading(caseLoading)
  }, [caseLoading])

  // Show error message if API call fails
  useEffect(() => {
    if (error) {
      messageApi.error(t('caseManagement.messages.fetchError'))
    }
  }, [error, messageApi, t])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!caseData) return null

    const { groupedStatic } = caseData
    const allScores = [
      ...groupedStatic.survey.dataSet,
      ...groupedStatic.appointment.dataSet,
      ...groupedStatic.program.dataSet,
    ]

    const avgScore =
      allScores.length > 0
        ? allScores.reduce((sum, item) => sum + item.score, 0) /
          allScores.length
        : 0

    return {
      totalSurveys: groupedStatic.survey.totalSurvey,
      totalCompletedSurveys: groupedStatic.survey.dataSet.length,
      totalAppointments: groupedStatic.appointment.total,
      totalCompletedAppointments: groupedStatic.appointment.dataSet.length,
      totalPrograms: groupedStatic.program.total,
      totalCompletedPrograms: groupedStatic.program.dataSet.length,
      averageScore: avgScore,
      skippedSurveys: groupedStatic.survey.numberOfSkips,
      absentAppointments: groupedStatic.appointment.numOfAbsent,
      absentPrograms: groupedStatic.program.numOfAbsent,
    }
  }, [caseData])

  const handleGoBack = () => {
    navigate('/case-management')
  }

  const handleUpdate = () => {
    if (userRole === 'COUNSELOR') {
      setIsUpdateModalVisible(true)
    } else {
      messageApi.warning(t('caseManagement.details.updatePermissionDenied'))
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'HIGH':
        return '#ff4d4f'
      case 'MEDIUM':
        return '#faad14'
      case 'LOW':
        return '#52c41a'
      default:
        return '#d9d9d9'
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case 'NEW':
        return '#1890ff'
      case 'IN_PROGRESS':
        return '#faad14'
      case 'CLOSED':
        return '#52c41a'
      default:
        return '#d9d9d9'
    }
  }

  const getProgressTrendIcon = trend => {
    switch (trend) {
      case 'IMPROVED':
        return <RiseOutlined style={{ color: '#52c41a' }} />
      case 'DECLINED':
        return <FallOutlined style={{ color: '#ff4d4f' }} />
      case 'STABLE':
        return <MinusOutlined style={{ color: '#faad14' }} />
      default:
        return <MinusOutlined style={{ color: '#d9d9d9' }} />
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16, color: '#666' }}>
          {t('caseManagement.details.loading')}
        </Title>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty
          description={t('caseManagement.details.notFound')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleGoBack}>
            {t('common.goBack')}
          </Button>
        </Empty>
      </div>
    )
  }

  const { caseInfo } = caseData

  const tabItems = [
    {
      key: 'overview',
      label: (
        <Space>
          <UserOutlined />
          {t('caseManagement.details.tabs.overview')}
        </Space>
      ),
      children: <CaseOverview caseInfo={caseInfo} statistics={statistics} />,
    },
    {
      key: 'statistics',
      label: (
        <Space>
          <BarChartOutlined />
          {t('caseManagement.details.tabs.statistics')}
        </Space>
      ),
      children: <CaseStatistics caseInfo={caseInfo} statistics={statistics} />,
    },
    {
      key: 'charts',
      label: (
        <Space>
          <LineChartOutlined />
          {t('caseManagement.details.tabs.charts')}
        </Space>
      ),
      children: <CaseCharts caseData={caseData} statistics={statistics} />,
    },
    // {
    //   key: 'timeline',
    //   label: (
    //     <Space>
    //       <ClockCircleOutlined />
    //       {t('caseManagement.details.tabs.timeline')}
    //     </Space>
    //   ),
    //   children: <CaseTimeline caseInfo={caseInfo} />,
    // },
  ]

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      {contextHolder}

      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                size="large"
              >
                {t('common.back')}
              </Button>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  {caseInfo.title}
                </Title>
                <Space size="middle" style={{ marginTop: 8 }}>
                  <Badge
                    color={getPriorityColor(caseInfo.priority)}
                    text={t(
                      `caseManagement.priorityOptions.${caseInfo.priority}`
                    )}
                  />
                  <Badge
                    color={getStatusColor(caseInfo.status)}
                    text={t(`caseManagement.statusOptions.${caseInfo.status}`)}
                  />
                  <Space>
                    {getProgressTrendIcon(caseInfo.progressTrend)}
                    <Text>
                      {t(
                        `caseManagement.progressTrendOptions.${caseInfo.progressTrend}`
                      )}
                    </Text>
                  </Space>
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            {userRole === 'COUNSELOR' && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleUpdate}
                size="large"
              >
                {t('caseManagement.details.updateCase')}
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('caseManagement.details.quickStats.totalSurveys')}
              value={statistics?.totalSurveys || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('caseManagement.details.quickStats.totalAppointments')}
              value={statistics?.totalAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('caseManagement.details.quickStats.totalPrograms')}
              value={statistics?.totalPrograms || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title={t('caseManagement.details.quickStats.averageScore')}
              value={statistics?.averageScore || 0}
              precision={1}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 24 }}
        />
      </Card>

      {/* Update Modal - placeholder for future implementation */}
      <Modal
        title={t('caseManagement.details.updateCase')}
        open={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text>{t('caseManagement.details.updateModalPlaceholder')}</Text>
        </div>
      </Modal>
    </div>
  )
}

export default CaseDetails

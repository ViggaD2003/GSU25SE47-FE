import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
  Form,
  Select,
  Popconfirm,
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
import { useTheme } from '@/contexts/ThemeContext'
import { caseAPI } from '@/services/caseApi'
import { categoriesAPI } from '@/services/categoryApi'

const { Title, Text, Paragraph } = Typography

const CaseDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
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
  const [isUpdating, setIsUpdating] = useState(false)
  const [form] = Form.useForm()
  const [levels, setLevels] = useState([])

  const userRole = user?.role

  // Memoized options to prevent unnecessary re-renders
  const priorityOptions = useMemo(() => {
    return ['HIGH', 'MEDIUM', 'LOW'].map(priority => ({
      label: t(`caseManagement.priorityOptions.${priority}`),
      value: priority,
    }))
  }, [t])

  const progressTrendOptions = useMemo(() => {
    return ['IMPROVED', 'DECLINED', 'STABLE'].map(progressTrend => ({
      label: t(`caseManagement.progressTrendOptions.${progressTrend}`),
      value: progressTrend,
    }))
  }, [t])

  // Memoized initial values to prevent unnecessary form resets
  const initialValues = useMemo(() => {
    if (!caseData?.caseInfo) return {}

    return {
      status: caseData.caseInfo.status,
      priority: caseData.caseInfo.priority,
      progressTrend: caseData.caseInfo.progressTrend,
      currentLevelId: caseData.caseInfo.currentLevel?.id,
    }
  }, [caseData?.caseInfo])

  const fetchCaseData = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await dispatch(getCaseById(id)).unwrap()
    } catch (error) {
      console.error('Error fetching case:', error)
      messageApi.error(t('caseManagement.messages.fetchError'))
    } finally {
      setLoading(false)
    }
  }, [id, dispatch, messageApi, t])

  const fetchLevelData = useCallback(async () => {
    try {
      const categoryId = caseData?.caseInfo?.categoryId
      if (!categoryId) {
        setLevels([])
        return
      }

      const response = await categoriesAPI.getCategoryLevels(categoryId)
      setLevels(response || [])
    } catch (error) {
      console.error('Error fetching levels:', error)
      messageApi.error(t('caseManagement.messages.fetchError'))
      setLevels([])
    }
  }, [caseData?.caseInfo?.categoryId, messageApi, t])

  // Fetch case data on component mount
  useEffect(() => {
    fetchCaseData()
  }, [fetchCaseData])

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

  // Fetch levels when update modal opens
  useEffect(() => {
    if (isUpdateModalVisible) {
      fetchLevelData()
      form.setFieldsValue(initialValues)
    }
  }, [isUpdateModalVisible, fetchLevelData, form, initialValues])

  // Enhanced statistics calculation with proper error handling
  const statistics = useMemo(() => {
    if (!caseData?.groupedStatic) return null

    try {
      const { groupedStatic } = caseData

      // Safely extract data with fallbacks
      const surveyData = groupedStatic.survey?.dataSet || []
      const appointmentData = groupedStatic.appointment?.dataSet || []
      const programData = groupedStatic.program?.dataSet || []

      const allScores = [...surveyData, ...appointmentData, ...programData]

      // Calculate average score with proper validation
      const avgScore =
        allScores.length > 0
          ? allScores.reduce((sum, item) => sum + (item.score || 0), 0) /
            allScores.length
          : 0

      // Extract counts with safe fallbacks
      const activeSurveys = groupedStatic.survey?.activeSurveys || 0
      const completedSurveys = groupedStatic.survey?.completedSurveys || 0
      const skippedSurveys = groupedStatic.survey?.numberOfSkips || 0

      const activeAppointments =
        groupedStatic.appointment?.activeAppointments || 0
      const completedAppointments =
        groupedStatic.appointment?.completedAppointments || 0
      const absentAppointments = groupedStatic.appointment?.numOfAbsent || 0

      const activePrograms = groupedStatic.program?.activePrograms || 0
      const completedPrograms = groupedStatic.program?.completedPrograms || 0
      const absentPrograms = groupedStatic.program?.numOfAbsent || 0

      // Calculate totals
      const totalSurveys = activeSurveys + completedSurveys + skippedSurveys
      const totalAppointments =
        activeAppointments + completedAppointments + absentAppointments
      const totalPrograms = activePrograms + completedPrograms + absentPrograms

      return {
        activeSurveys,
        completedSurveys,
        skippedSurveys,
        totalSurveys,
        activeAppointments,
        completedAppointments,
        absentAppointments,
        totalAppointments,
        activePrograms,
        completedPrograms,
        absentPrograms,
        totalPrograms,
        averageScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal place
      }
    } catch (error) {
      console.error('Error calculating statistics:', error)
      return null
    }
  }, [caseData])

  const handleGoBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  const handleUpdate = useCallback(() => {
    if (userRole !== 'counselor') {
      messageApi.warning(t('caseManagement.details.updatePermissionDenied'))
      return
    }

    if (caseData?.caseInfo?.status !== 'IN_PROGRESS') {
      messageApi.warning(t('caseManagement.details.cannotUpdateClosedCase'))
      return
    }

    setIsUpdateModalVisible(true)
  }, [userRole, caseData?.caseInfo?.status, messageApi, t])

  const handleUpdateCase = async values => {
    if (!id) return

    setIsUpdating(true)
    try {
      const updateData = {
        priority: values.priority,
        progressTrend: values.progressTrend,
        currentLevelId: values.currentLevelId,
      }

      await caseAPI.updateCase(id, updateData)

      messageApi.success(t('caseManagement.details.updateSuccess'))
      setIsUpdateModalVisible(false)

      // Refresh case data
      await fetchCaseData()

      // Reset form
      form.resetFields()
    } catch (error) {
      console.error('Error updating case:', error)
      messageApi.error(
        t('caseManagement.details.updateError') || 'Cập nhật thất bại'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCloseCase = async () => {
    if (!id) return

    setIsUpdating(true)
    try {
      const values = form.getFieldsValue()
      const updateData = {
        status: 'CLOSED',
        priority: values.priority,
        progressTrend: values.progressTrend,
        currentLevelId: values.currentLevelId,
      }

      await caseAPI.updateCase(id, updateData)

      messageApi.success(t('caseManagement.details.closeCaseSuccess'))
      setIsUpdateModalVisible(false)

      // Refresh case data
      await fetchCaseData()

      // Reset form
      form.resetFields()
    } catch (error) {
      console.error('Error closing case:', error)
      messageApi.error(
        t('caseManagement.details.closeCaseError') || 'Đóng case thất bại'
      )
    } finally {
      setIsUpdating(false)
    }
  }

  // Memoized utility functions to prevent unnecessary re-renders
  const getPriorityColor = useCallback(priority => {
    const colorMap = {
      HIGH: '#ff4d4f',
      MEDIUM: '#faad14',
      LOW: '#52c41a',
    }
    return colorMap[priority] || '#d9d9d9'
  }, [])

  const getStatusColor = useCallback(status => {
    const colorMap = {
      NEW: 'geekblue',
      CONFIRMED: 'green',
      REJECTED: '#ff4d4f',
      IN_PROGRESS: '#faad14',
      CLOSED: 'default',
    }
    return colorMap[status] || '#d9d9d9'
  }, [])

  const getProgressTrendIcon = useCallback(trend => {
    const iconMap = {
      IMPROVED: <RiseOutlined style={{ color: '#52c41a' }} />,
      DECLINED: <FallOutlined style={{ color: '#ff4d4f' }} />,
      STABLE: <MinusOutlined style={{ color: '#faad14' }} />,
    }
    return iconMap[trend] || <MinusOutlined style={{ color: '#d9d9d9' }} />
  }, [])

  // Memoized tab items to prevent unnecessary re-renders
  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: (
          <Space>
            <UserOutlined />
            {t('caseManagement.details.tabs.overview')}
          </Space>
        ),
        children: (
          <CaseOverview caseInfo={caseData?.caseInfo} statistics={statistics} />
        ),
      },
      {
        key: 'statistics',
        label: (
          <Space>
            <BarChartOutlined />
            {t('caseManagement.details.tabs.statistics')}
          </Space>
        ),
        children: (
          <CaseStatistics
            caseInfo={caseData?.caseInfo}
            statistics={statistics}
          />
        ),
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
    ],
    [caseData, statistics, t]
  )

  // Loading state
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

  // Error state
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

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f2f5',
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
            {userRole === 'counselor' && caseInfo.status === 'IN_PROGRESS' && (
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
              title={t('caseManagement.details.quickStats.activeSurveys')}
              value={statistics?.activeSurveys || 0}
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

      {/* Update Modal - Enhanced Design */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <EditOutlined style={{ color: '#1890ff' }} />
            <span>{t('caseManagement.details.updateCase')}</span>
          </div>
        }
        open={isUpdateModalVisible}
        onCancel={() => {
          if (!isUpdating) {
            setIsUpdateModalVisible(false)
            form.resetFields()
          }
        }}
        footer={null}
        width={800}
        centered
        closable={!isUpdating}
        maskClosable={!isUpdating}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: 16,
          },
          body: {
            padding: '24px 0',
          },
        }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={initialValues}
          onFinish={handleUpdateCase}
          disabled={isUpdating}
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={24}>
              <Form.Item
                name="priority"
                label={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                    <span>{t('caseManagement.details.priority')}</span>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: t('caseManagement.details.priorityRequired'),
                  },
                ]}
              >
                <Select
                  options={priorityOptions}
                  placeholder={t('caseManagement.details.selectPriority')}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="progressTrend"
                label={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <LineChartOutlined style={{ color: '#52c41a' }} />
                    <span>{t('caseManagement.details.progressTrend')}</span>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: t('caseManagement.details.progressTrendRequired'),
                  },
                ]}
              >
                <Select
                  options={progressTrendOptions}
                  placeholder={t('caseManagement.details.selectProgressTrend')}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="currentLevelId"
                label={
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <TrophyOutlined style={{ color: '#722ed1' }} />
                    <span>{t('caseManagement.details.currentLevel')}</span>
                  </div>
                }
                rules={[
                  {
                    required: true,
                    message: t('caseManagement.details.currentLevelRequired'),
                  },
                ]}
              >
                <Select
                  options={levels}
                  placeholder={t('caseManagement.details.selectCurrentLevel')}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  fieldNames={{ label: 'code', value: 'id' }}
                  loading={levels.length === 0}
                  notFoundContent={
                    levels.length === 0
                      ? t('caseManagement.details.loadingLevels')
                      : t('caseManagement.details.noLevelFound')
                  }
                  optionRender={option => (
                    <div>
                      {t(`caseManagement.details.levelOptions.${option.label}`)}
                    </div>
                  )}
                  labelRender={option => (
                    <div>
                      {t(`caseManagement.details.levelOptions.${option.label}`)}
                    </div>
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <Popconfirm
              title={t('caseManagement.details.closeCaseConfirm')}
              onConfirm={handleCloseCase}
              disabled={isUpdating}
            >
              <Button
                size="large"
                style={{ minWidth: 100 }}
                danger
                loading={isUpdating}
              >
                {t('caseManagement.details.closeCase')}
              </Button>
            </Popconfirm>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<CheckCircleOutlined />}
              style={{ minWidth: 100 }}
              loading={isUpdating}
            >
              {t('common.update')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default CaseDetails

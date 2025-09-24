import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
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
  Image,
  Divider,
  Statistic,
  Progress,
  Empty,
  Modal,
  List,
  Avatar,
  Tooltip,
  Descriptions,
  Checkbox,
  Input,
} from 'antd'
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
  TrophyOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons'

import { getProgramById } from '@/store/actions/programActions'
import { clearProgram } from '@/store/slices/programSlice'
import { useTheme } from '@/contexts/ThemeContext'
import {
  ProgramOverview,
  ProgramStatistics,
  ParticipantList,
  SurveyInfo,
} from './components'
import { caseAPI } from '@/services/caseApi'
import { programAPI } from '@/services/programApi'

const { Title, Text, Paragraph } = Typography
const { TabPane } = Tabs
// const { confirm } = Modal

const ProgramDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()
  const { isDarkMode } = useTheme()
  const { user } = useSelector(state => state.auth)
  const { program, loading, error } = useSelector(state => state.program)
  const [activeTab, setActiveTab] = useState('overview')
  const [isInitialized, setIsInitialized] = useState(false)

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [fetchingCases, setFetchingCases] = useState(false)
  const [availableCases, setAvailableCases] = useState([])
  const [selectedCaseIds, setSelectedCaseIds] = useState([])
  const [searchText, setSearchText] = useState('')

  const hasAvailableCases = useMemo(() => {
    return (
      user?.role?.toLowerCase() !== 'manager' &&
      user?.categories &&
      user?.categories?.length > 0 &&
      user?.categories?.some(c => c === program?.category?.id)
    )
  }, [user, program])

  // Fetch program details on component mount
  useEffect(() => {
    if (id) {
      setIsInitialized(false)
      dispatch(getProgramById(id))
        .unwrap()
        .then(() => {
          setIsInitialized(true)
        })
        .catch(() => {
          setIsInitialized(true)
        })
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearProgram())
    }
  }, [dispatch, id])

  // Handle error messages
  useEffect(() => {
    if (error && isInitialized) {
      messageApi.error(t('programManagement.details.error'))
    }
  }, [error, t, messageApi, isInitialized])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!program) return null

    const participants = Array.isArray(program.participants)
      ? program.participants
      : []
    const totalParticipants = participants.length
    const maxParticipants = program.maxParticipants || 0
    const enrolledCount = participants.filter(
      p => p.status === 'ENROLLED'
    ).length
    const completedCount = participants.filter(
      p => p.status === 'COMPLETED'
    ).length
    const absentCount = participants.filter(p => p.status === 'ABSENT').length
    const activeCount = participants.filter(p => p.status === 'ACTIVE').length
    return {
      totalParticipants,
      maxParticipants,
      enrolledCount,
      completedCount,
      absentCount,
      activeCount,
      enrollmentRate:
        maxParticipants > 0
          ? ((totalParticipants / maxParticipants) * 100).toFixed(1)
          : 0,
      completionRate:
        totalParticipants > 0
          ? ((completedCount / totalParticipants) * 100).toFixed(1)
          : 0,
    }
  }, [program])

  // Handle back to list
  const handleBack = () => {
    navigate('/program-management')
  }

  // Modal handlers
  const fetchCases = useCallback(async () => {
    if (!program?.id || !program?.category?.id) return

    setFetchingCases(true)
    try {
      const data = await caseAPI.getCases({
        statusCase: ['IN_PROGRESS'],
        categoryId: program?.category?.id,
        accountId: user.id,
      })
      // console.log('Fetched cases:', data)
      // console.log('participants', program.participants)

      console.log('data', data)
      // Filter out cases that are already participants
      const filteredCases = data.filter(
        c => !program.participants?.some(p => p?.student?.id === c.student.id)
      )
      // console.log('Filtered cases:', filteredCases)
      setAvailableCases(filteredCases)
    } catch (error) {
      console.error('Error fetching cases:', error)
      messageApi.error(t('common.error'))
    } finally {
      setFetchingCases(false)
    }
  }, [program, messageApi, t])

  const openAddModal = useCallback(() => {
    if (!program?.id) {
      messageApi.error(t('common.error'))
      return
    }
    fetchCases()
    setIsAddModalVisible(true)
  }, [fetchCases, program?.id, messageApi, t])

  const closeAddModal = useCallback(() => {
    setIsAddModalVisible(false)
    setSelectedCaseIds([])
    setSearchText('')
  }, [])

  const showParticipantDetails = useCallback(participant => {
    setSelectedParticipant(participant)
    setIsModalVisible(true)
  }, [])

  const closeParticipantModal = useCallback(() => {
    setIsModalVisible(false)
    setSelectedParticipant(null)
  }, [])

  const toggleSelectCase = useCallback(caseId => {
    setSelectedCaseIds(prev =>
      prev.includes(caseId)
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    )
  }, [])

  const handleSelectAll = useCallback(
    checked => {
      if (checked && availableCases?.length > 0) {
        setSelectedCaseIds(availableCases.map(c => c.id))
      } else {
        setSelectedCaseIds([])
      }
    },
    [availableCases]
  )

  const handleOpenSurvey = useCallback(async () => {
    if (!program?.id) {
      messageApi.error(t('common.error'))
      return
    }
    try {
      await programAPI.openSurvey(id)
      messageApi.success(t('programManagement.details.openSurveySuccess'))
      dispatch(getProgramById(id))
    } catch {
      messageApi.error(t('programManagement.details.openSurveyError'))
    }
  }, [program?.id, messageApi, t, dispatch, id])

  const filteredCases = useMemo(() => {
    if (!availableCases || !Array.isArray(availableCases)) return []
    if (!searchText) return availableCases
    return availableCases.filter(
      caseItem =>
        caseItem.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [availableCases, searchText])

  const handleAddSelected = useCallback(async () => {
    if (!program?.id) {
      messageApi.error(t('common.error'))
      return
    }

    if (selectedCaseIds.length === 0) {
      messageApi.warning(t('programManagement.participants.selectCases'))
      return
    }

    try {
      await caseAPI.assignCaseToProgram({
        programId: program.id,
        listCaseIds: selectedCaseIds,
      })

      messageApi.success(t('programManagement.participants.addSuccess'))
      closeAddModal()

      // Refresh program data
      dispatch(getProgramById(id))
    } catch (error) {
      console.error('Error adding cases:', error)
      messageApi.error(t('common.error'))
    }
  }, [selectedCaseIds, program?.id, closeAddModal, dispatch, id, messageApi, t])

  // Show loading state
  if (loading || !isInitialized) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>{t('common.loading')}</Text>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !program) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Empty
          description={t('programManagement.details.error')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" onClick={handleBack}>
            {t('programManagement.details.backToList')}
          </Button>
        </Empty>
      </div>
    )
  }

  const getStatusColor = status => {
    switch (status) {
      case 'ACTIVE':
        return 'green'
      case 'PLANNING':
        return 'blue'
      case 'ON_GOING':
        return 'orange'
      case 'IN_PROGRESS':
        return 'orange'
      case 'COMPLETED':
        return 'green'
      case 'ABSENT':
        return 'red'
      case 'ENROLLED':
        return 'blue'
      default:
        return 'default'
    }
  }

  const getStatusIcon = status => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleOutlined />
      case 'PLANNING':
        return <ClockCircleOutlined />
      case 'ON_GOING':
        return <ExclamationCircleOutlined />
      case 'COMPLETED':
        return <TrophyOutlined />
      default:
        return <ClockCircleOutlined />
    }
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case 'CRITICAL':
        return 'red'
      case 'SEVERE':
        return 'orange'
      case 'MODERATE':
        return 'yellow'
      case 'MEDIUM':
        return 'yellow'
      case 'LOW':
        return 'green'
      default:
        return 'default'
    }
  }

  const getProgressTrendColor = trend => {
    switch (trend) {
      case 'IMPROVED':
        return 'green'
      case 'STABLE':
        return 'blue'
      case 'DECLINED':
        return 'red'
      default:
        return 'default'
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      {contextHolder}

      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space direction="vertical" size="small">
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  type="text"
                >
                  {t('programManagement.details.backToList')}
                </Button>
              </Space>
              <Title level={2} style={{ margin: 0 }}>
                {program.name}
              </Title>
              <Space>
                <Tag
                  color={getStatusColor(program.status)}
                  icon={getStatusIcon(program.status)}
                >
                  {t(`programManagement.status.${program.status}`)}
                </Tag>
                {program.category && (
                  <Tag color="blue">{program.category.name}</Tag>
                )}
              </Space>
            </Space>
          </Col>
          {program.status !== 'COMPLETED' && (
            <Col>
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={handleOpenSurvey}
                  type="primary"
                  danger={program.isActiveSurvey}
                >
                  {program.isActiveSurvey
                    ? t('programManagement.details.closeSurvey')
                    : t('programManagement.details.openSurvey')}
                </Button>
              </Space>
            </Col>
          )}
        </Row>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('programManagement.details.totalParticipants')}
                value={statistics.totalParticipants}
                prefix={<UserOutlined />}
                suffix={`/ ${statistics.maxParticipants}`}
              />
              <Progress
                percent={parseFloat(statistics.enrollmentRate)}
                size="small"
                status="active"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('programManagement.details.enrollmentRate')}
                value={statistics.enrollmentRate}
                suffix="%"
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title={t('programManagement.details.completionRate')}
                value={statistics.completionRate}
                suffix="%"
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <BarChartOutlined />
                  {t('programManagement.details.overview')}
                </span>
              ),
              children: <ProgramOverview program={program} />,
            },
            {
              key: 'statistics',
              label: (
                <span>
                  <BarChartOutlined />
                  {t('programManagement.details.statistics.title')}
                </span>
              ),
              children: (
                <ProgramStatistics program={program} statistics={statistics} />
              ),
            },
            {
              key: 'participants',
              label: (
                <span>
                  <TeamOutlined />
                  {t('programManagement.details.participants.title')}
                </span>
              ),
              children: (
                <ParticipantList
                  participants={program.participants}
                  programId={program.id}
                  categoryId={program.category?.id}
                  onAddedCases={() => dispatch(getProgramById(id))}
                  onOpenAddCasesModal={openAddModal}
                  onViewParticipant={showParticipantDetails}
                  userRole={user?.role}
                  hasAvailableCases={hasAvailableCases}
                  refresh={() => dispatch(getProgramById(id))}
                />
              ),
            },
            {
              key: 'survey',
              label: (
                <span>
                  <FileTextOutlined />
                  {t('programManagement.details.survey')}
                </span>
              ),
              children: <SurveyInfo survey={program.programSurvey} />,
            },
          ]}
        />
      </Card>

      {/* Add Cases Modal */}
      <Modal
        title={t('programManagement.participants.addCases')}
        open={isAddModalVisible}
        onCancel={closeAddModal}
        footer={[
          <Button key="cancel" onClick={closeAddModal}>
            {t('common.cancel')}
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleAddSelected}
            disabled={selectedCaseIds.length === 0}
          >
            {t('common.add')} ({selectedCaseIds.length})
          </Button>,
        ]}
        width={900}
        centered
        maskClosable={false}
        zIndex={2000}
        getContainer={() => document.body}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>
              {t('programManagement.participants.selectCases')}
            </Text>
            <br />
            <Text type="secondary">
              {t('programManagement.participants.availableCases')}:{' '}
              {availableCases?.length || 0}
            </Text>
          </div>

          <Input
            placeholder={t('programManagement.participants.searchCases')}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {fetchingCases ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : filteredCases.length > 0 ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <Checkbox
                    checked={
                      filteredCases.length > 0 &&
                      selectedCaseIds.length === filteredCases.length
                    }
                    indeterminate={
                      selectedCaseIds.length > 0 &&
                      selectedCaseIds.length < filteredCases.length
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  >
                    {t('common.selectAll')}
                  </Checkbox>
                </div>
                <List
                  dataSource={filteredCases}
                  renderItem={caseItem => (
                    <List.Item
                      key={caseItem.id}
                      style={{
                        padding: '12px',
                        border: `1px solid ${isDarkMode ? '#374151' : '#f0f0f0'}`,
                        borderRadius: '6px',
                        marginBottom: '8px',
                        backgroundColor: selectedCaseIds.includes(caseItem.id)
                          ? isDarkMode
                            ? '#1f4e3c'
                            : '#f6ffed'
                          : isDarkMode
                            ? '#1f2937'
                            : 'white',
                      }}
                    >
                      <Checkbox
                        checked={selectedCaseIds.includes(caseItem.id)}
                        onChange={() => toggleSelectCase(caseItem.id)}
                      />
                      <div style={{ marginLeft: '16px', flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 'bold',
                            marginBottom: '4px',
                            color: isDarkMode ? '#f9fafb' : '#000000d9',
                          }}
                        >
                          {caseItem?.student?.fullName} - {caseItem?.title}
                        </div>
                        <Text type="secondary" ellipsis>
                          {caseItem?.student?.email}
                        </Text>
                        <div
                          style={{
                            color: isDarkMode ? '#9ca3af' : '#666',
                            fontSize: '14px',
                          }}
                        >
                          {caseItem?.categoryName} - {caseItem?.codeCategory}
                        </div>
                        <div
                          style={{
                            color: isDarkMode ? '#9ca3af' : '#666',
                            fontSize: '14px',
                          }}
                        >
                          {caseItem?.description}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            ) : (
              <Empty
                description={t(
                  'programManagement.participants.noAvailableCases'
                )}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </Space>
      </Modal>

      {/* Participant Details Modal */}
      <Modal
        title={t('programManagement.participants.participantDetails')}
        open={isModalVisible}
        onCancel={closeParticipantModal}
        footer={[
          <Button key="close" onClick={closeParticipantModal}>
            {t('common.close')}
          </Button>,
        ]}
        width={1000}
        centered
        style={{ zIndex: 1000 }}
        styles={{
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
          },
        }}
      >
        {selectedParticipant && (
          <div>
            {/* Student Information Section */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <Text strong>
                    {t('programManagement.participants.studentInfo')}
                  </Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item
                  label={t('programManagement.participants.name')}
                  span={2}
                >
                  <Space>
                    <Avatar
                      size="large"
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {selectedParticipant.student?.fullName ||
                          t('common.unknown')}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {selectedParticipant.student?.studentCode ||
                          t('common.unknown')}
                      </Text>
                    </div>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedParticipant.student?.email || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedParticipant.student?.phoneNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedParticipant.student?.dob
                    ? new Date(
                        selectedParticipant.student.dob
                      ).toLocaleDateString('vi-VN')
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedParticipant.student?.gender ? 'Nữ' : 'Nam'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Case Information Section */}
            {selectedParticipant.cases && (
              <Card
                title={
                  <Space>
                    <FileTextOutlined style={{ color: '#52c41a' }} />
                    <Text strong>
                      {t('programManagement.participants.caseInfo')}
                    </Text>
                  </Space>
                }
                style={{ marginBottom: 16 }}
              >
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Tiêu đề case" span={2}>
                    <Text strong style={{ color: '#1890ff' }}>
                      {selectedParticipant.cases.title}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô tả" span={2}>
                    {selectedParticipant.cases.description || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Độ ưu tiên">
                    <Tag
                      color={getPriorityColor(
                        selectedParticipant.cases.priority
                      )}
                    >
                      {selectedParticipant.cases.priority}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={getStatusColor(selectedParticipant.cases.status)}
                    >
                      {selectedParticipant.cases.status}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Xu hướng tiến triển">
                    <Tag
                      color={getProgressTrendColor(
                        selectedParticipant.cases.progressTrend
                      )}
                    >
                      {selectedParticipant.cases.progressTrend}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Người tạo">
                    {selectedParticipant.cases.createBy?.fullName || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tư vấn viên">
                    {selectedParticipant.cases.counselor?.fullName || '-'}
                  </Descriptions.Item>
                </Descriptions>

                {/* Risk Level Information */}
                <Divider orientation="left">Thông tin mức độ rủi ro</Divider>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card size="small" title="Mức độ ban đầu">
                      {selectedParticipant.cases.initialLevel ? (
                        <div>
                          <Tag
                            color={getPriorityColor(
                              selectedParticipant.cases.initialLevel.levelType
                            )}
                          >
                            {selectedParticipant.cases.initialLevel.label}
                          </Tag>
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Điểm:{' '}
                              {selectedParticipant.cases.initialLevel.minScore}{' '}
                              -{' '}
                              {selectedParticipant.cases.initialLevel.maxScore}
                            </Text>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: '12px' }}>
                              {
                                selectedParticipant.cases.initialLevel
                                  .description
                              }
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <Text type="secondary">Không có thông tin</Text>
                      )}
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Mức độ hiện tại">
                      {selectedParticipant.cases.currentLevel ? (
                        <div>
                          <Tag
                            color={getPriorityColor(
                              selectedParticipant.cases.currentLevel.levelType
                            )}
                          >
                            {selectedParticipant.cases.currentLevel.label}
                          </Tag>
                          <div style={{ marginTop: 8 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Điểm:{' '}
                              {selectedParticipant.cases.currentLevel.minScore}{' '}
                              -{' '}
                              {selectedParticipant.cases.currentLevel.maxScore}
                            </Text>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: '12px' }}>
                              {
                                selectedParticipant.cases.currentLevel
                                  .description
                              }
                            </Text>
                          </div>
                        </div>
                      ) : (
                        <Text type="secondary">Không có thông tin</Text>
                      )}
                    </Card>
                  </Col>
                </Row>
              </Card>
            )}

            {/* Enrollment Information Section */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#722ed1' }} />
                  <Text strong>Thông tin đăng ký</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Ngày tham gia">
                  {selectedParticipant.joinAt
                    ? new Date(selectedParticipant.joinAt).toLocaleDateString(
                        'vi-VN'
                      )
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedParticipant.status)}>
                    {t(
                      `programManagement.participants.status.${selectedParticipant.status}`
                    )}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Điểm cuối cùng">
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {selectedParticipant.finalScore !== null &&
                    selectedParticipant.finalScore !== undefined
                      ? selectedParticipant.finalScore.toFixed(1)
                      : '-'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="ID tham gia">
                  {selectedParticipant.id}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* No Case Assigned Message */}
            {!selectedParticipant.cases && (
              <Card
                title={
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#faad14' }} />
                    <Text strong>Thông báo</Text>
                  </Space>
                }
                style={{ backgroundColor: '#fffbe6', borderColor: '#faad14' }}
              >
                <Text type="secondary">
                  {t('programManagement.participants.noCaseAssigned')}
                </Text>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProgramDetails

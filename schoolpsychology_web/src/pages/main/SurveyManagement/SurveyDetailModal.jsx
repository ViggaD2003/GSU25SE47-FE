import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Modal,
  Typography,
  List,
  Tag,
  Space,
  Descriptions,
  Card,
  Button,
  Form,
  Input,
  Switch,
  DatePicker,
  Select,
  InputNumber,
  Row,
  Col,
  Spin,
  Alert,
  Tooltip,
  Statistic,
  Divider,
  Checkbox,
  Collapse,
  Popconfirm,
} from 'antd'
import {
  EditOutlined,
  SaveOutlined,
  CalendarOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BookOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  LockOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { surveyAPI } from '../../../services/surveyApi'
import {
  SURVEY_STATUS,
  SURVEY_TYPE,
  TARGET_SCOPE,
  GRADE_LEVEL,
  RECURRING_CYCLE,
  QUESTION_TYPE,
  getStatusColor,
} from '../../../constants/enums'
import dayjs from 'dayjs'
import { addCaseToSurvey, getCases } from '@/store/actions'
import { useSelector } from 'react-redux'
import { useTheme } from '@/contexts/ThemeContext'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const InfoCard = React.memo(
  ({ title, value, icon, color = '#1890ff', loading = false }) => (
    <Card size="small" loading={loading}>
      <Statistic
        title={
          <Space>
            {icon}
            <Text type="secondary">{title}</Text>
          </Space>
        }
        value={value}
        valueStyle={{ color }}
      />
    </Card>
  )
)

const AnswerCard = React.memo(({ answer, index, t, isDarkMode }) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        borderRadius: 8,
        border: isDarkMode ? '1px solid #374151' : '1px solid #e9ecef',
      }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isDarkMode ? '#374151' : '#f0f0f0',
                justifyContent: 'center',
                marginRight: 12,
                color: '#262626',
                fontSize: 12,
                fontWeight: 'bold',
              }}
            >
              {index + 1}
            </div>
            <Text
              strong
              style={{
                fontSize: 14,
                color: isDarkMode ? '#f9fafb' : '#262626',
              }}
            >
              {answer.text}
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: 16,
              color: isDarkMode ? '#f9fafb' : '#262626',
              backgroundColor: isDarkMode ? '#374151' : '#f0f0f0',
              fontSize: 12,
              fontWeight: 'bold',
              minWidth: 40,
              textAlign: 'center',
            }}
          >
            {t('surveyManagement.detail.score')}: {answer.score}
          </div>
        </div>
      </div>
    </Card>
  )
})

const QuestionCard = React.memo(
  ({ question, index, t, canEdit, editMode, onStatusChange, isDarkMode }) => (
    <Card
      style={{
        marginBottom: 16,
        width: '100%',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0',
      }}
      title={
        <Space styles={{ item: { marginBottom: 10, marginTop: 6 } }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </div>
          <div>
            <Text
              strong
              style={{
                fontSize: 16,
                color: isDarkMode ? '#f9fafb' : '#262626',
              }}
            >
              {t('surveyManagement.detail.question')} {index + 1}
            </Text>
            <div style={{ marginTop: 4 }}>
              <Tag color={!question.required ? 'green' : 'orange'} size="small">
                {question.required
                  ? t('common.required')
                  : t('common.optional')}
              </Tag>
              <Tag color="blue" size="small" style={{ marginLeft: 8 }}>
                {t(
                  `surveyManagement.enums.questionType.${question.questionType}`
                )}
              </Tag>
              {editMode && canEdit && (
                <Tag
                  color={question.isActive ? 'green' : 'red'}
                  size="small"
                  style={{ marginLeft: 8 }}
                >
                  {question.isActive
                    ? t('common.active')
                    : t('common.inactive')}
                </Tag>
              )}
            </div>
          </div>
          {editMode && canEdit && (
            <div style={{ marginLeft: 'auto' }}>
              <Switch
                checked={question.isActive !== false}
                onChange={checked =>
                  onStatusChange(question.questionId || question.id, checked)
                }
                size="small"
                checkedChildren={t('common.active')}
                unCheckedChildren={t('common.inactive')}
              />
            </div>
          )}
        </Space>
      }
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text
          strong
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: isDarkMode ? '#f9fafb' : '#262626',
          }}
        >
          {question.text}
        </Text>
        {question.description && (
          <Paragraph
            type="secondary"
            style={{
              marginTop: 8,
              marginBottom: 0,
              fontSize: 13,
              lineHeight: 1.5,
              color: isDarkMode ? '#d1d5db' : '#8c8c8c',
            }}
          >
            {question.description}
          </Paragraph>
        )}
      </div>

      {question.answers && question.answers.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
              padding: '12px 16px',
              backgroundColor: isDarkMode ? '#374151' : '#f8f9fa',
              borderRadius: 8,
              border: isDarkMode ? '1px solid #374151' : '1px solid #e9ecef',
            }}
          >
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
            <Text
              strong
              style={{
                color: isDarkMode ? '#f9fafb' : '#262626',
                fontSize: 14,
              }}
            >
              {t('surveyManagement.detail.answers')} ({question.answers.length})
            </Text>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {question.answers.map((answer, answerIndex) => (
              <AnswerCard
                key={answerIndex}
                answer={answer}
                index={answerIndex}
                t={t}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  )
)

const SurveyDetailModal = ({
  t,
  visible,
  surveyId,
  onClose,
  onUpdated,
  messageApi,
  userRole,
  dispatch,
}) => {
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [formValue, setFormValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [survey, setSurvey] = useState(null)
  const [error, setError] = useState(null)
  const [newQuestions, setNewQuestions] = useState([])
  const [updatedQuestions, setUpdatedQuestions] = useState([])
  const [showAddCase, setShowAddCase] = useState(false)
  const [addedCases, setAddedCases] = useState([])
  const [removedCases, setRemovedCases] = useState([])
  const [selectedRemovedCases, setSelectedRemovedCases] = useState([])
  const [selectedAddedCases, setSelectedAddedCases] = useState([])
  const { cases, loading: casesLoading } = useSelector(state => state.case)
  const { user } = useSelector(state => state.auth)
  const { isDarkMode } = useTheme()
  // Fetch survey details when modal opens
  useEffect(() => {
    if (visible && surveyId) {
      fetchSurveyDetails()
    }
  }, [visible, surveyId])

  // Reset state when modal closes
  useEffect(() => {
    if (!visible) {
      setSurvey(null)
      setError(null)
      setEditMode(false)
      setFormValue(null)
      setNewQuestions([])
      setUpdatedQuestions([])
      setShowAddCase(false)
      if (editMode) {
        form.resetFields()
      }
    }
  }, [visible, form, editMode])

  // Fetch survey details by ID
  const fetchSurveyDetails = useCallback(async () => {
    if (!surveyId) return

    try {
      setFetching(true)
      setError(null)
      const response = await surveyAPI.getSurveyById(surveyId)

      const data = {
        ...response,
        targetGrade: response.targetGrade.map(grade => grade.targetLevel),
      }

      setSurvey(data)

      // Prepare form values
      const normalizedCycle = normalizeRecurringCycle(response.recurringCycle)
      const initialValues = {
        ...response,
        startDate: response.startDate ? dayjs(response.startDate) : null,
        endDate: response.endDate ? dayjs(response.endDate) : null,
        questions: response.questions || [],
        recurringCycle: normalizedCycle,
        isRecurring: normalizedCycle !== RECURRING_CYCLE.NONE,
      }
      setFormValue(initialValues)
      form.setFieldsValue(initialValues)
    } catch {
      const errorMessage = t('surveyManagement.detail.messages.fetchError')
      setError(errorMessage)
      messageApi.error(errorMessage)
    } finally {
      setFetching(false)
    }
  }, [visible, surveyId, t, messageApi, form])

  // Helper functions
  const normalizeRecurringCycle = useCallback(cycle => {
    if (!cycle) return RECURRING_CYCLE.NONE
    return cycle.toUpperCase()
  }, [])

  const getRecurringCycleLabel = useCallback(
    cycle => {
      const normalizedCycle = normalizeRecurringCycle(cycle)
      return (
        t(`surveyManagement.enums.recurringCycle.${normalizedCycle}`) || cycle
      )
    },
    [normalizeRecurringCycle, t]
  )

  const formatDate = useCallback(date => {
    return date ? dayjs(date).format('DD/MM/YYYY') : '-'
  }, [])

  // Check if field is editable based on survey status
  const isFieldEditable = useCallback(
    fieldName => {
      if (!survey) return false

      switch (survey.status) {
        case SURVEY_STATUS.PUBLISHED:
          return fieldName === 'status'
        case SURVEY_STATUS.DRAFT:
          return [
            'title',
            'description',
            'isRequired',
            'isRecurring',
            'recurringCycle',
            'surveyType',
            'targetScope',
            'targetGrade',
            'startDate',
            'endDate',
            'categoryId',
            'questions',
          ].includes(fieldName)
        case SURVEY_STATUS.ARCHIVED:
          return [
            'isRecurring',
            'isRequired',
            'startDate',
            'endDate',
            'recurringCycle',
          ].includes(fieldName)
        default:
          return false
      }
    },
    [survey]
  )

  // Check if questions can be edited
  const canEditQuestions = useCallback(() => {
    if (!survey) return false
    return (
      survey.status === SURVEY_STATUS.DRAFT ||
      survey.status === SURVEY_STATUS.ARCHIVED
    )
  }, [survey])

  // Check if can add new questions
  const canAddQuestions = useCallback(() => {
    if (!survey) return false
    return (
      survey.status === SURVEY_STATUS.DRAFT ||
      survey.status === SURVEY_STATUS.ARCHIVED
    )
  }, [survey])

  // Memoized computed values
  const surveyStats = useMemo(() => {
    if (!survey) return null

    return {
      totalQuestions: survey.questions?.length || 0,
      requiredQuestions: survey.questions?.filter(q => q.required).length || 0,
      totalAnswers:
        survey.questions?.reduce(
          (sum, q) => sum + (q.answers?.length || 0),
          0
        ) || 0,
    }
  }, [survey])

  // Event handlers
  const handleEdit = useCallback(() => {
    setEditMode(true)
  }, [])

  const handleCancel = useCallback(() => {
    setEditMode(false)
    setNewQuestions([])
    setUpdatedQuestions([])
    if (formValue && editMode) {
      form.setFieldsValue(formValue)
    }
  }, [formValue, form, editMode])

  const handleSave = useCallback(async () => {
    try {
      if (!editMode) return
      setLoading(true)
      const values = await form.validateFields()

      // Validate date range
      if (values.startDate && values.endDate) {
        if (values.startDate.isAfter(values.endDate)) {
          messageApi.error(t('surveyManagement.form.dateRangeError'))
          return
        }
      }

      // Prepare payload based on survey status
      let payload = {}

      if (survey.status === SURVEY_STATUS.PUBLISHED) {
        // Only status can be updated
        payload = {
          surveyId: survey.surveyId,
          status: values.status,
        }
      } else if (survey.status === SURVEY_STATUS.DRAFT) {
        // All fields can be updated
        payload = {
          surveyId: survey.surveyId,
          title: values.title,
          description: values.description,
          isRequired: values.isRequired,
          isRecurring: values.recurringCycle !== RECURRING_CYCLE.NONE,
          recurringCycle: values.recurringCycle,
          round: values.round,
          surveyType: values.surveyType,
          status: values.status,
          targetScope: values.targetScope,
          targetGrade: values.targetGrade,
          startDate: values.startDate
            ? values.startDate.format('YYYY-MM-DD')
            : null,
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
          categoryId: values.categoryId || survey.category?.id,
          questions:
            values.questions?.map(q => ({
              text: q.text,
              description: q.description,
              questionType: q.questionType,
              answers:
                q.answers?.map(a => ({
                  score: a.score,
                  text: a.text,
                })) || [],
              isRequired: q.required,
            })) || [],
        }
      } else if (survey.status === SURVEY_STATUS.ARCHIVED) {
        // Limited fields can be updated
        payload = {
          surveyId: survey.surveyId,
          isRequired: values.isRequired,
          isRecurring: values.recurringCycle !== RECURRING_CYCLE.NONE,
          recurringCycle: values.recurringCycle,
          startDate: values.startDate
            ? values.startDate.format('YYYY-MM-DD')
            : null,
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
          updateQuestion: updatedQuestions.map(q => ({
            questionId: q.questionId,
            isActive: q.isActive,
          })),
          newQuestions: newQuestions.map(q => ({
            text: q.text,
            description: q.description,
            questionType: q.questionType,
            moduleType: 'SURVEY',
            answers:
              q.answers?.map(a => ({
                score: a.score,
                text: a.text,
              })) || [],
            required: q.required,
          })),
        }
      }

      await surveyAPI.updateSurvey(survey.surveyId, payload)

      messageApi.success(t('surveyManagement.detail.messages.updateSuccess'))
      setEditMode(false)
      setNewQuestions([])
      setUpdatedQuestions([])
      onUpdated()

      // Refresh survey data
      fetchSurveyDetails()
    } catch (err) {
      if (err.errorFields) {
        return // Form validation errors - already displayed by form
      }

      const msg =
        err.response?.data?.message ||
        err.message ||
        t('surveyManagement.detail.messages.updateError')
      messageApi.error(msg)
    } finally {
      setLoading(false)
    }
  }, [
    form,
    survey,
    messageApi,
    t,
    onUpdated,
    fetchSurveyDetails,
    newQuestions,
    updatedQuestions,
    editMode,
  ])

  const handleRefresh = useCallback(() => {
    fetchSurveyDetails()
  }, [fetchSurveyDetails])

  const handleQuestionStatusChange = useCallback((questionId, isActive) => {
    setUpdatedQuestions(prev => {
      const existing = prev.find(q => q.questionId === questionId)
      if (existing) {
        return prev.map(q =>
          q.questionId === questionId ? { ...q, isActive } : q
        )
      } else {
        return [...prev, { questionId, isActive }]
      }
    })
  }, [])

  const handleAddQuestion = useCallback(() => {
    const newQuestion = {
      id: `new_${Date.now()}`,
      text: '',
      description: '',
      questionType: 'LINKERT_SCALE',
      required: false,
      answers: [],
      isNew: true,
    }
    setNewQuestions(prev => [...prev, newQuestion])
  }, [])

  const handleRemoveNewQuestion = useCallback(questionId => {
    setNewQuestions(prev => prev.filter(q => q.id !== questionId))
  }, [])

  const fetchCases = useCallback(() => {
    if (!survey?.category?.id) return
    if (userRole !== 'counselor') return
    const params = {
      categoryId: survey?.category?.id,
      statusCase: ['IN_PROGRESS'],
      surveyId: survey?.surveyId || surveyId,
      accountId: user.id,
    }
    dispatch(getCases(params))
  }, [survey, dispatch, userRole, surveyId, user.id])

  useEffect(() => {
    if (!survey) return
    if (cases.length > 0) {
      setAddedCases(cases.filter(c => c.isAddSurvey))
      setRemovedCases(cases.filter(c => !c.isAddSurvey))
      setSelectedAddedCases([])
      setSelectedRemovedCases([])
    }
  }, [survey, cases])

  // Render functions
  const renderHeader = () => (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {survey?.title || t('surveyManagement.detail.loading')}
          </Title>
          {survey?.description && (
            <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
              {survey.description}
            </Paragraph>
          )}
        </div>
        <Space>
          <Tooltip title={t('surveyManagement.detail.refresh')}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={fetching}
              size="small"
            />
          </Tooltip>
          {!editMode && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              size="small"
              disabled={!survey}
            >
              {t('surveyManagement.detail.edit')}
            </Button>
          )}
        </Space>
      </div>

      {/* Survey Status and Progress */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <InfoCard
            title={t('surveyManagement.detail.status')}
            value={t(`surveyManagement.enums.surveyStatus.${survey?.status}`)}
            icon={<CheckCircleOutlined />}
            color={getStatusColor(survey?.status)}
            loading={fetching}
          />
        </Col>
        <Col span={8}>
          <InfoCard
            title={t('surveyManagement.detail.totalQuestions')}
            value={surveyStats?.totalQuestions || 0}
            icon={<QuestionCircleOutlined />}
            color="#1890ff"
            loading={fetching}
          />
        </Col>
        <Col span={8}>
          <InfoCard
            title={t('surveyManagement.detail.requiredQuestions')}
            value={surveyStats?.requiredQuestions || 0}
            icon={<ExclamationCircleOutlined />}
            color="#52c41a"
            loading={fetching}
          />
        </Col>
      </Row>

      {/* Status-based editing info */}
      {survey && (
        <Alert
          message={
            <Space>
              {survey.status === SURVEY_STATUS.PUBLISHED && (
                <>
                  <LockOutlined />
                  <Text strong>
                    {t('surveyManagement.detail.publishedEditInfo')}
                  </Text>
                </>
              )}
              {survey.status === SURVEY_STATUS.DRAFT && (
                <>
                  <EditOutlined />
                  <Text strong>
                    {t('surveyManagement.detail.draftEditInfo')}
                  </Text>
                </>
              )}
              {survey.status === SURVEY_STATUS.ARCHIVED && (
                <>
                  <InfoCircleOutlined />
                  <Text strong>
                    {t('surveyManagement.detail.archivedEditInfo')}
                  </Text>
                </>
              )}
            </Space>
          }
          type={
            survey.status === SURVEY_STATUS.PUBLISHED
              ? 'warning'
              : survey.status === SURVEY_STATUS.DRAFT
                ? 'info'
                : 'default'
          }
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
      )}
    </div>
  )

  const renderSurveyInfo = () => (
    <Card
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space>
            <InfoCircleOutlined />
            <Text strong>{t('surveyManagement.detail.basicInfo')}</Text>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowAddCase(true)
              setSelectedAddedCases([])
              setSelectedRemovedCases([])
              fetchCases()
            }}
            style={{ marginLeft: 'auto' }}
            loading={casesLoading}
            hidden={
              userRole !== 'counselor' ||
              showAddCase ||
              survey?.status === SURVEY_STATUS.ARCHIVED
            }
          >
            {t('surveyManagement.table.action.addCase')}
          </Button>
        </div>
      }
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label={t('surveyManagement.detail.activeRange')}>
              <Space>
                <CalendarOutlined />
                <Text>
                  {formatDate(survey?.startDate)} -{' '}
                  {formatDate(survey?.endDate)}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label={t('surveyManagement.detail.targetScope')}>
              <Space>
                <Tag color={getStatusColor(survey?.targetScope)}>
                  {t(
                    `surveyManagement.enums.targetScope.${survey?.targetScope}`
                  )}
                </Tag>
                {survey?.targetScope === TARGET_SCOPE.GRADE &&
                  survey?.targetGrade.length > 0 &&
                  survey?.targetGrade.map(grade => (
                    <Tag color={getStatusColor(grade)} key={grade}>
                      {t(`surveyManagement.enums.gradeLevel.${grade}`)}
                    </Tag>
                  ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label={t('surveyManagement.detail.surveyType')}>
              <Tag color={getStatusColor(survey?.surveyType)}>
                {t(`surveyManagement.enums.surveyType.${survey?.surveyType}`)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Col>
        <Col xs={24} sm={12}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label={t('surveyManagement.detail.category')}>
              <Tag color="blue" icon={<BookOutlined />}>
                {survey?.category?.name} ({survey?.category?.code})
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('surveyManagement.detail.required')}>
              <Tag color={!survey?.isRequired ? 'green' : 'orange'}>
                {!survey?.isRequired
                  ? t('common.optional')
                  : t('common.required')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item
              label={t('surveyManagement.detail.recurringCycle')}
            >
              <Tag color={getStatusColor(survey?.recurringCycle)}>
                {getRecurringCycleLabel(survey?.recurringCycle)}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  )

  const renderQuestions = () => (
    <Card
      title={
        <Space>
          <QuestionCircleOutlined />
          <Text strong>{t('surveyManagement.detail.questionsList')}</Text>
          <Tag color="blue">
            {survey?.questions?.length || 0}{' '}
            {t('surveyManagement.detail.questions')}
          </Tag>
          {canAddQuestions() && editMode && (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleAddQuestion}
            >
              {t('surveyManagement.detail.addQuestion')}
            </Button>
          )}
        </Space>
      }
      styles={{
        body: {
          width: '100%',
        },
      }}
    >
      {survey?.questions && survey.questions.length > 0 ? (
        <List
          style={{ width: '100%' }}
          dataSource={survey.questions}
          renderItem={(question, index) => (
            <List.Item style={{ padding: '8px 0', width: '100%' }}>
              <QuestionCard
                question={question}
                index={index}
                t={t}
                canEdit={canEditQuestions()}
                editMode={editMode}
                onStatusChange={handleQuestionStatusChange}
                isDarkMode={isDarkMode}
              />
            </List.Item>
          )}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <QuestionCircleOutlined
            style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}
          />
          <Text type="secondary">
            {t('surveyManagement.detail.noQuestions')}
          </Text>
        </div>
      )}

      {/* New Questions */}
      {newQuestions.length > 0 && (
        <>
          <Divider>{t('surveyManagement.detail.newQuestions')}</Divider>
          <List
            style={{ width: '100%' }}
            dataSource={newQuestions}
            renderItem={(question, index) => (
              <List.Item style={{ padding: '8px 0', width: '100%' }}>
                <Card
                  style={{
                    marginBottom: 16,
                    width: '100%',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px dashed #1890ff',
                    backgroundColor: '#f6ffed',
                  }}
                  title={
                    <Space>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: '#52c41a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {survey?.questions?.length + index + 1}
                      </div>
                      <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                        {t('surveyManagement.detail.newQuestion')} {index + 1}
                      </Text>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={() => handleRemoveNewQuestion(question.id)}
                      />
                    </Space>
                  }
                  styles={{ body: { padding: '20px 24px' } }}
                >
                  <Form form={form} layout="vertical">
                    <Form.Item
                      name={['newQuestions', question.id, 'text']}
                      label={t('surveyManagement.detail.questionText')}
                      rules={[
                        {
                          required: true,
                          message: t(
                            'surveyManagement.form.questionTextRequired'
                          ),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={['newQuestions', question.id, 'description']}
                      label={t('surveyManagement.detail.questionDescription')}
                    >
                      <TextArea rows={2} />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name={['newQuestions', question.id, 'questionType']}
                          label={t('surveyManagement.detail.questionType')}
                          rules={[{ required: true }]}
                        >
                          <Select>
                            {Object.values(QUESTION_TYPE).map(type => (
                              <Option key={type} value={type}>
                                {t(
                                  `surveyManagement.enums.questionType.${type}`
                                )}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={['newQuestions', question.id, 'required']}
                          label={t('surveyManagement.detail.required')}
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>
              </List.Item>
            )}
          />
        </>
      )}
    </Card>
  )

  const renderEditForm = () => (
    <Form form={form}>
      <Row gutter={16}>
        <Col span={10}>
          <Form.Item
            name="title"
            label={t('surveyManagement.detail.title')}
            rules={[
              {
                required: true,
                message: t('surveyManagement.form.titleRequired'),
              },
            ]}
          >
            <Input disabled={!isFieldEditable('title')} />
          </Form.Item>
          <Form.Item
            name="description"
            label={t('surveyManagement.detail.description')}
          >
            <TextArea rows={3} disabled={!isFieldEditable('description')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="surveyType"
                label={t('surveyManagement.detail.surveyType')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.surveyTypeRequired'),
                  },
                ]}
              >
                <Select disabled={!isFieldEditable('surveyType')}>
                  {Object.values(SURVEY_TYPE).map(type => (
                    <Option key={type} value={SURVEY_TYPE[type]}>
                      {t(`surveyManagement.enums.surveyType.${type}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetScope"
                label={t('surveyManagement.detail.targetScope')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.targetScopeRequired'),
                  },
                ]}
              >
                <Select disabled={!isFieldEditable('targetScope')}>
                  {Object.values(TARGET_SCOPE).map(scope => (
                    <Option key={scope} value={scope}>
                      {t(`surveyManagement.enums.targetScope.${scope}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetGrade"
                label={t('surveyManagement.detail.targetGrade')}
              >
                <Select disabled={!isFieldEditable('targetGrade')}>
                  {Object.values(GRADE_LEVEL).map(grade => (
                    <Option key={grade} value={GRADE_LEVEL[grade]}>
                      {t(`surveyManagement.enums.gradeLevel.${grade}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isRequired"
                label={t('surveyManagement.detail.required')}
                valuePropName="checked"
              >
                <Switch disabled={!isFieldEditable('isRequired')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recurringCycle"
                label={t('surveyManagement.detail.recurringCycle')}
              >
                <Select disabled={!isFieldEditable('recurringCycle')}>
                  {Object.values(RECURRING_CYCLE).map(cycle => (
                    <Option key={cycle} value={cycle}>
                      {t(`surveyManagement.enums.recurringCycle.${cycle}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="status"
            label={t('surveyManagement.detail.status')}
            rules={[{ required: true }]}
          >
            <Select disabled={!isFieldEditable('status')}>
              {Object.values(SURVEY_STATUS).map(status => (
                <Option key={status} value={SURVEY_STATUS[status]}>
                  {t(`surveyManagement.enums.surveyStatus.${status}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row> */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label={t('surveyManagement.detail.startDate')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.startDateRequired'),
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabled={!isFieldEditable('startDate')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label={t('surveyManagement.detail.endDate')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.endDateRequired'),
                  },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabled={!isFieldEditable('endDate')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
        <Col span={14}>{renderQuestions()}</Col>
      </Row>
    </Form>
  )

  const handleCaseSelection = (caseId, type) => {
    if (type === 'removed') {
      setSelectedAddedCases(prev => {
        if (prev.includes(caseId)) {
          return prev.filter(id => id !== caseId)
        }
        return [...prev, caseId]
      })
    } else {
      console.log('handleCaseSelection')
      console.log('caseId', caseId)
      console.log('type', type)

      setSelectedRemovedCases(prev => {
        if (prev.includes(caseId)) {
          return prev.filter(id => id !== caseId)
        }
        return [...prev, caseId]
      })
    }
  }

  const handleSelectAll = (checked, type) => {
    if (checked) {
      if (type === 'removed') {
        setSelectedAddedCases(addedCases.map(c => c.id))
      } else {
        setSelectedRemovedCases(removedCases.map(c => c.id))
      }
    } else {
      if (type === 'removed') {
        setSelectedAddedCases([])
      } else {
        setSelectedRemovedCases([])
      }
    }
  }

  const handleAddCase = async () => {
    const params = {
      surveyId: survey?.surveyId || survey?.id || surveyId,
      caseIds: selectedRemovedCases,
    }
    console.log('params', params)

    await dispatch(addCaseToSurvey(params))
      .unwrap()
      .then(() => {
        Promise.all([fetchSurveyDetails(), fetchCases()]).then(() => {
          setSelectedRemovedCases([])
          setSelectedAddedCases([])
        })
      })
  }

  const handleRemoveCase = async () => {
    console.log('selectedAddedCases', selectedAddedCases)
    new Promise(() => {
      surveyAPI
        .removeCaseFromSurveyCaseLink({
          surveyId: survey?.surveyId || survey?.id || surveyId,
          caseIds: selectedAddedCases,
        })
        .then(() => {
          messageApi.success(t('surveyManagement.messages.removeCaseSuccess'))
          Promise.all([fetchSurveyDetails(), fetchCases()]).then(() => {
            setSelectedAddedCases([])
            setSelectedRemovedCases([])
          })
        })
        .catch(() => {
          messageApi.error(t('surveyManagement.messages.removeCaseError'))
        })
    })
  }

  const renderAddedCaseList = () => (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Checkbox
          indeterminate={
            selectedAddedCases.length > 0 &&
            selectedAddedCases.length < addedCases.length
          }
          checked={
            addedCases.length > 0 &&
            selectedAddedCases.length === addedCases.length
          }
          onChange={e => handleSelectAll(e.target.checked, 'removed')}
          disabled={addedCases.length === 0}
        >
          {t('common.selectAll')}
        </Checkbox>
        <Button
          type="primary"
          disabled={selectedAddedCases.length === 0}
          onClick={handleRemoveCase}
        >
          {t('common.remove')} ({selectedAddedCases.length})
        </Button>
      </div>
      <List
        dataSource={addedCases}
        renderItem={item => (
          <List.Item
            style={{
              padding: '12px',
              marginBottom: '8px',
              background: isDarkMode ? '#1f2937' : '#fff',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0',
            }}
          >
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Checkbox
                  checked={selectedAddedCases.includes(item.id)}
                  onChange={() => handleCaseSelection(item.id, 'removed')}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {item.title}
                    </Typography.Title>
                    <Space>
                      <Tag
                        color={
                          item.priority === 'HIGH'
                            ? 'red'
                            : item.priority === 'MEDIUM'
                              ? 'orange'
                              : 'green'
                        }
                      >
                        {item.priority}
                      </Tag>
                    </Space>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Typography.Text type="secondary">
                        Student:
                      </Typography.Text>
                      <div
                        style={{ color: isDarkMode ? '#f9fafb' : '#000000d9' }}
                      >
                        {item.student.fullName}
                      </div>
                    </Col>

                    <Col span={12}>
                      <Typography.Text type="secondary">
                        Current Level:
                      </Typography.Text>
                      <div
                        style={{ color: isDarkMode ? '#f9fafb' : '#000000d9' }}
                      >
                        {item.currentLevel.label}
                      </div>
                    </Col>
                  </Row>

                  {item.description && (
                    <Typography.Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginTop: '8px', marginBottom: 0 }}
                    >
                      {item.description}
                    </Typography.Paragraph>
                  )}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )

  const renderRemovedCaseList = () => (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Checkbox
          indeterminate={
            selectedRemovedCases.length > 0 &&
            selectedRemovedCases.length < removedCases.length
          }
          checked={
            removedCases.length > 0 &&
            selectedRemovedCases.length === removedCases.length
          }
          onChange={e => handleSelectAll(e.target.checked, 'added')}
          disabled={removedCases.length === 0}
        >
          {t('common.selectAll')}
        </Checkbox>
        <Button
          type="primary"
          disabled={selectedRemovedCases.length === 0}
          onClick={handleAddCase}
        >
          {t('common.add')} ({selectedRemovedCases.length})
        </Button>
      </div>
      <List
        dataSource={removedCases}
        renderItem={item => (
          <List.Item
            style={{
              padding: '12px',
              marginBottom: '8px',
              background: isDarkMode ? '#1f2937' : '#fff',
              borderRadius: '8px',
              border: isDarkMode ? '1px solid #374151' : '1px solid #f0f0f0',
            }}
          >
            <div style={{ width: '100%' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Checkbox
                  checked={selectedRemovedCases.includes(item.id)}
                  onChange={() => handleCaseSelection(item.id, 'added')}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {item.title}
                    </Typography.Title>
                    <Space>
                      <Tag
                        color={
                          item.priority === 'HIGH'
                            ? 'red'
                            : item.priority === 'MEDIUM'
                              ? 'orange'
                              : 'green'
                        }
                      >
                        {item.priority}
                      </Tag>
                    </Space>
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Typography.Text type="secondary">
                        Student:
                      </Typography.Text>
                      <div
                        style={{ color: isDarkMode ? '#f9fafb' : '#000000d9' }}
                      >
                        {item.student.fullName}
                      </div>
                    </Col>

                    <Col span={12}>
                      <Typography.Text type="secondary">
                        Current Level:
                      </Typography.Text>
                      <div
                        style={{ color: isDarkMode ? '#f9fafb' : '#000000d9' }}
                      >
                        {item.currentLevel.label}
                      </div>
                    </Col>
                  </Row>

                  {item.description && (
                    <Typography.Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{ marginTop: '8px', marginBottom: 0 }}
                    >
                      {item.description}
                    </Typography.Paragraph>
                  )}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  )

  const itemsCasesCollapse = [
    {
      key: '1',
      label:
        t('surveyManagement.table.action.addedCases') +
        ' (' +
        (addedCases.length ?? 0) +
        ')',
      children: renderAddedCaseList(),
    },
    {
      key: '2',
      label:
        t('surveyManagement.table.action.removedCases') +
        ' (' +
        (removedCases.length ?? 0) +
        ')',
      children: renderRemovedCaseList(),
    },
  ]

  // Main render
  if (error) {
    return (
      <Modal
        title={t('surveyManagement.detail.title')}
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="close" danger onClick={onClose}>
            {t('common.close')}
          </Button>,
          <Button key="retry" type="primary" onClick={fetchSurveyDetails}>
            {t('common.retry')}
          </Button>,
        ]}
        width={1000}
      >
        <Alert
          message={t('surveyManagement.detail.errorTitle')}
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={fetchSurveyDetails}>
              {t('common.retry')}
            </Button>
          }
        />
      </Modal>
    )
  }

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          {t('surveyManagement.detail.title')}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={
        editMode
          ? [
              <Popconfirm
                key={'cancel'}
                title={t('surveyManagement.detail.cancelConfirm')}
                onConfirm={handleCancel}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button key="cancel" danger>
                  {t('surveyManagement.detail.cancel')}
                </Button>
              </Popconfirm>,
              <Popconfirm
                key={'save'}
                title={t('surveyManagement.detail.saveConfirm')}
                onConfirm={handleSave}
                okText={t('common.yes')}
                cancelText={t('common.no')}
              >
                <Button
                  key="save"
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  {t('surveyManagement.detail.save')}
                </Button>
              </Popconfirm>,
            ]
          : [
              <Button key="close" danger onClick={onClose}>
                {t('common.close')}
              </Button>,
            ]
      }
      width={1300}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: 14,
        },
      }}
      centered
    >
      <Spin spinning={fetching} tip={t('surveyManagement.detail.loading')}>
        {survey ? (
          <div>
            {renderHeader()}
            {editMode ? (
              renderEditForm()
            ) : (
              <Row>
                <Col
                  span={showAddCase && userRole === 'counselor' ? 14 : 24}
                  style={{
                    width: showAddCase ? '50%' : '100%',
                    transition: 'all 0.3s ease-in-out',
                    paddingRight: showAddCase ? '8px' : '0',
                  }}
                >
                  {renderSurveyInfo()}
                  {renderQuestions()}
                </Col>
                {userRole === 'counselor' && (
                  <Col
                    span={showAddCase ? 10 : 0}
                    style={{
                      opacity: showAddCase ? 1 : 0,
                      transform: `translateX(${showAddCase ? '0' : '100%'})`,
                      transition: 'all 0.3s ease-in-out',
                      visibility: showAddCase ? 'visible' : 'hidden',
                    }}
                  >
                    <div>
                      <Card
                        title={
                          <Space>
                            <Text strong>
                              {t('surveyManagement.table.action.cases')}
                            </Text>
                          </Space>
                        }
                        extra={
                          <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setShowAddCase(false)}
                          />
                        }
                        // style={{ marginBottom: 16 }}
                      >
                        {Array.isArray(cases) && cases.length > 0 ? (
                          <>
                            <Collapse items={itemsCasesCollapse} />
                          </>
                        ) : (
                          <div
                            style={{ textAlign: 'center', padding: '40px 0' }}
                          >
                            <FileTextOutlined
                              style={{
                                fontSize: 48,
                                color: '#d9d9d9',
                                marginBottom: 16,
                              }}
                            />
                            <Text type="secondary">
                              {t('surveyManagement.detail.noCase')}
                            </Text>
                          </div>
                        )}
                      </Card>
                    </div>
                  </Col>
                )}
              </Row>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <FileTextOutlined
              style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}
            />
            <Text type="secondary">{t('surveyManagement.detail.noData')}</Text>
          </div>
        )}
      </Spin>
    </Modal>
  )
}

export default React.memo(SurveyDetailModal)

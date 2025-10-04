import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
const { Panel } = Collapse

// Constants

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
              <Tag
                color={question.active ? 'green' : 'red'}
                size="small"
                style={{ marginLeft: 8 }}
              >
                {question.active ? t('common.active') : t('common.inactive')}
              </Tag>
            </div>
          </div>
          {editMode && canEdit && (
            <div style={{ marginLeft: 'auto' }}>
              <Switch
                checked={question.active}
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
  const newQuestionsRef = useRef(null)
  const newQuestionRefs = useRef({})
  const filteredRemovedCases = Array.from(removedCases || []).filter(
    c => c.student.isEnableSurvey
  )
  const filteredNoDoneSurveyCases = Array.from(addedCases || []).filter(
    c => !c.alreadyDoneSurvey
  )

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
    } catch {
      const errorMessage = t('surveyManagement.detail.messages.fetchError')
      setError(errorMessage)
      messageApi.error(errorMessage)
    } finally {
      setFetching(false)
    }
  }, [visible, surveyId, t, messageApi])

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
          return false
        case SURVEY_STATUS.DRAFT:
          return [
            'title',
            'description',
            'isRequired',
            'isRecurring',
            'recurringCycle',
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
            'questions',
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
    // Prepare form values
    const normalizedCycle = normalizeRecurringCycle(
      survey.isRecurring
        ? survey.recurringCycle === RECURRING_CYCLE.NONE
          ? RECURRING_CYCLE.WEEKLY
          : survey.recurringCycle
        : RECURRING_CYCLE.NONE
    )
    const initialValues = {
      ...survey,
      targetGrade:
        survey.targetScope === TARGET_SCOPE.GRADE ? survey.targetGrade : [],
      startDate: survey.startDate ? dayjs(survey.startDate) : null,
      endDate: survey.endDate ? dayjs(survey.endDate) : null,
      questions: survey.questions || [],
      recurringCycle: normalizedCycle,
      isRecurring: survey.isRecurring,
      isRequired: survey.isRequired,
    }
    setFormValue(initialValues)
    form.setFieldsValue(initialValues)
    setUpdatedQuestions([])
  }, [survey, normalizeRecurringCycle, form])

  const handleCancel = useCallback(() => {
    setEditMode(false)
    setNewQuestions([])
    setUpdatedQuestions([])
    if (formValue && editMode) {
      form.setFieldsValue(formValue)
    }
  }, [formValue, form, editMode])

  // Clear targetGrade when targetScope changes away from GRADE to avoid setState during render
  const handleFormValuesChange = useCallback(
    (changedValues, allValues) => {
      if (Object.prototype.hasOwnProperty.call(changedValues, 'targetScope')) {
        if (allValues.targetScope !== TARGET_SCOPE.GRADE) {
          form.setFieldsValue({ targetGrade: [] })
        }
      }

      if (Object.prototype.hasOwnProperty.call(changedValues, 'isRecurring')) {
        if (allValues.isRecurring) {
          form.setFieldsValue({ recurringCycle: RECURRING_CYCLE.WEEKLY })
        } else {
          form.setFieldsValue({ recurringCycle: RECURRING_CYCLE.NONE })
        }
      }
    },
    [form]
  )

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

      // Validate question count based on category's isLimited setting
      const questionLimit = survey?.category?.questionLength
      const isLimited = survey?.category?.isLimited

      if (questionLimit) {
        const activeExistingQuestions =
          survey?.questions?.filter(q => getQuestionActiveStatus(q)).length || 0
        const totalActiveQuestions =
          activeExistingQuestions + newQuestions.length

        if (isLimited) {
          // isLimited = true: Must equal exactly the limit
          if (totalActiveQuestions !== questionLimit) {
            if (totalActiveQuestions < questionLimit) {
              messageApi.error(
                t('surveyManagement.messages.questionLimitNotEnough', {
                  current: totalActiveQuestions,
                  required: questionLimit,
                })
              )
            } else {
              messageApi.error(
                t('surveyManagement.messages.questionLimitExceeded', {
                  current: totalActiveQuestions,
                  limit: questionLimit,
                })
              )
            }
            return
          }
        } else {
          // isLimited = false: Must be <= limit
          if (totalActiveQuestions > questionLimit) {
            messageApi.error(
              t('surveyManagement.messages.questionLimitExceeded', {
                current: totalActiveQuestions,
                limit: questionLimit,
              })
            )
            return
          }
        }
      }

      console.log('values', values)

      // Prepare unified payload structure for all survey statuses
      const payload = {
        title: values.title || survey.title,
        description: values.description || survey.description || '',
        surveyType: survey.surveyType, // Always use existing survey type
        isRequired: values.isRequired,
        isRecurring: values.recurringCycle
          ? values.recurringCycle !== RECURRING_CYCLE.NONE
          : survey.isRecurring,
        recurringCycle: values.recurringCycle
          ? values.recurringCycle || RECURRING_CYCLE.WEEKLY
          : RECURRING_CYCLE.NONE,
        startDate: values.startDate
          ? values.startDate.format('YYYY-MM-DD')
          : survey.startDate
            ? dayjs(survey.startDate).format('YYYY-MM-DD')
            : null,
        endDate: values.endDate
          ? values.endDate.format('YYYY-MM-DD')
          : survey.endDate
            ? dayjs(survey.endDate).format('YYYY-MM-DD')
            : null,
        targetScope: values.targetScope || survey.targetScope,
        targetGrade: values.targetGrade || survey.targetGrade || [],
        updateQuestions:
          updatedQuestions.length > 0
            ? updatedQuestions.map(q => ({
                questionId: q.questionId,
                isActive: q.isActive,
              }))
            : [],
        newQuestions:
          newQuestions.length > 0
            ? newQuestions.map(q => {
                const formData = values.newQuestions?.[q.id] || {}
                return {
                  text: formData.text || '',
                  description: formData.description || '',
                  questionType: formData.questionType || 'LINKERT_SCALE',
                  isRequired: survey?.category?.isLimited
                    ? true
                    : formData.required || false,
                  answers:
                    formData.answers?.map(a => ({
                      score: a.score || 1,
                      text: a.text || '',
                    })) ||
                    q.answers?.map(a => ({
                      score: a.score,
                      text: a.text,
                    })) ||
                    null,
                }
              })
            : [],
      }
      console.log('payload', payload)

      await surveyAPI.updateSurvey(survey.surveyId, payload)

      // messageApi.success(t('surveyManagement.detail.messages.updateSuccess'))
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
    if (editMode) {
      handleEdit()
    }
  }, [fetchSurveyDetails, handleEdit])

  const handleQuestionStatusChange = useCallback((questionId, isActive) => {
    // console.log('Changing question status:', { questionId, isActive }) // Debug log
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

  // Helper function to get the current active status of a question
  const getQuestionActiveStatus = useCallback(
    question => {
      const questionId = question.questionId || question.id
      const updatedQuestion = updatedQuestions.find(
        q => q.questionId === questionId
      )
      if (updatedQuestion) {
        return updatedQuestion.isActive
      }
      return question.active
    },
    [updatedQuestions]
  )

  const handleAddQuestion = () => {
    // Count active questions (existing + new) using the helper function
    const activeExistingQuestions =
      survey?.questions?.filter(q => getQuestionActiveStatus(q)).length || 0
    const activeNewQuestions = newQuestions.length
    const totalActiveQuestions = activeExistingQuestions + activeNewQuestions

    // Use a fallback value if questionLength is not available
    const questionLimit = survey?.category?.questionLength || 50

    // Check limit based on category's isLimited setting
    const isLimited = survey?.category?.isLimited
    const { minScore, maxScore } = survey?.category || {
      minScore: 0,
      maxScore: 3,
    }

    if (isLimited) {
      // isLimited = true: Must equal exactly the limit
      if (totalActiveQuestions >= questionLimit) {
        messageApi.warning(
          t('surveyManagement.messages.questionLimitExceeded', {
            current: totalActiveQuestions + 1,
            limit: questionLimit,
          })
        )
        return
      }
    } else {
      // isLimited = false: Must be <= limit
      if (totalActiveQuestions >= questionLimit) {
        messageApi.warning(
          t('surveyManagement.messages.questionLimitExceeded', {
            current: totalActiveQuestions + 1,
            limit: questionLimit,
          })
        )
        return
      }
    }

    const answers = []
    for (let i = minScore; i <= maxScore; i++) {
      answers.push({ id: `answer_${Date.now()}_${i}`, score: i, text: '' })
    }

    const newQuestionId = `new_${Date.now()}`
    const newQuestion = {
      id: newQuestionId,
      text: '',
      description: '',
      questionType: 'LINKERT_SCALE',
      required: false,
      answers,
      isNew: true,
    }
    setNewQuestions(prev => [...prev, newQuestion])

    // Scroll to the specific newly added question after a short delay
    setTimeout(() => {
      const el = newQuestionRefs.current[newQuestionId]
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else if (newQuestionsRef.current) {
        newQuestionsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
    }, 200)
  }

  const handleRemoveNewQuestion = useCallback(questionId => {
    setNewQuestions(prev => prev.filter(q => q.id !== questionId))
  }, [])

  // Handle adding answer to new question
  const handleAddAnswer = useCallback(questionId => {
    setNewQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          const newAnswerId = `answer_${Date.now()}`
          const newScore = Math.max(...q.answers.map(a => a.score), 0) + 1
          return {
            ...q,
            answers: [
              ...q.answers,
              { id: newAnswerId, score: newScore, text: '' },
            ],
          }
        }
        return q
      })
    )
  }, [])

  // Handle removing answer from new question
  const handleRemoveAnswer = useCallback((questionId, answerId) => {
    setNewQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            answers: q.answers.filter(a => a.id !== answerId),
          }
        }
        return q
      })
    )
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
      console.log('cases', cases)

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
          {!editMode &&
            ((userRole === 'manager' &&
              survey.surveyType !== SURVEY_TYPE.FOLLOWUP) ||
              (userRole === 'counselor' &&
                survey.surveyType === SURVEY_TYPE.FOLLOWUP)) &&
            survey.status !== SURVEY_STATUS.PUBLISHED && (
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

  const renderQuestions = () => {
    // Count active questions considering both original and updated states
    const activeExistingQuestions =
      survey?.questions?.filter(q => getQuestionActiveStatus(q)).length || 0
    const totalActiveQuestions = activeExistingQuestions + newQuestions.length

    // Use a fallback value if questionLength is not available
    const questionLimit = survey?.category?.questionLength || 15
    const { minScore, maxScore } = survey?.category || {
      minScore: 0,
      maxScore: 10,
    }

    const canAddAnswers =
      Array.isArray(newQuestions.answers) &&
      newQuestions.answers.length <= maxScore - minScore + 1 &&
      minScore !== maxScore

    const canRemoveAnswers =
      Array.isArray(newQuestions.answers) &&
      newQuestions.answers.length > 0 &&
      newQuestions.answers.length <= maxScore - minScore + 1 &&
      minScore !== maxScore

    return (
      <Card
        title={
          <Space>
            <QuestionCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>{t('surveyManagement.detail.questionsList')}</Text>
            <Tag color="blue">
              {survey?.questions?.length || 0}{' '}
              {t('surveyManagement.detail.questions')}
            </Tag>
            {editMode && (
              <Tag
                color={
                  survey?.category?.isLimited
                    ? // isLimited = true: Must equal exactly
                      totalActiveQuestions === questionLimit
                      ? 'green'
                      : totalActiveQuestions > questionLimit
                        ? 'red'
                        : 'orange'
                    : // isLimited = false: Can be <= limit
                      totalActiveQuestions <= questionLimit
                      ? 'green'
                      : 'red'
                }
              >
                {totalActiveQuestions}/{questionLimit}{' '}
                {t('surveyManagement.detail.activeQuestions')}
                {survey?.category?.isLimited &&
                  totalActiveQuestions !== questionLimit && (
                    <span style={{ marginLeft: 4 }}>
                      {totalActiveQuestions < questionLimit
                        ? `(${t('surveyManagement.detail.needMore')}: ${questionLimit - totalActiveQuestions})`
                        : `(${t('surveyManagement.detail.tooMany')}: ${totalActiveQuestions - questionLimit})`}
                    </span>
                  )}
                {!survey?.category?.isLimited &&
                  totalActiveQuestions > questionLimit && (
                    <span style={{ marginLeft: 4 }}>
                      (${t('surveyManagement.detail.tooMany')}: $
                      {totalActiveQuestions - questionLimit})`
                    </span>
                  )}
              </Tag>
            )}
            {canAddQuestions() && editMode && (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                size="small"
                onClick={handleAddQuestion}
                disabled={totalActiveQuestions >= questionLimit}
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
        style={{
          marginBottom: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          borderRadius: '8px',
        }}
      >
        {survey?.questions && survey.questions.length > 0 ? (
          <div style={{ marginBottom: newQuestions.length > 0 ? 24 : 0 }}>
            {editMode ? (
              // Collapsible view for edit mode
              <Collapse
                defaultActiveKey={[]}
                ghost
                expandIcon={({ isActive }) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      transform: `rotate(${isActive ? 90 : 0}deg)`,
                      transition: 'transform 0.3s',
                    }}
                  >
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </div>
                )}
                items={survey.questions.map((question, index) => ({
                  key: question.questionId || question.id || index,
                  label: (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: getQuestionActiveStatus(question)
                            ? '#1890ff'
                            : '#d9d9d9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          marginRight: 12,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          strong
                          style={{
                            color: getQuestionActiveStatus(question)
                              ? '#262626'
                              : '#8c8c8c',
                            display: 'block',
                          }}
                          ellipsis={{ tooltip: question.text }}
                        >
                          {question.text ||
                            t('surveyManagement.detail.untitledQuestion')}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag
                            color={question.required ? 'orange' : 'green'}
                            size="small"
                          >
                            {question.required
                              ? t('common.required')
                              : t('common.optional')}
                          </Tag>
                          <Tag color="blue" size="small">
                            {t(
                              `surveyManagement.enums.questionType.${question.questionType}`
                            )}
                          </Tag>
                          <Tag
                            color={
                              getQuestionActiveStatus(question)
                                ? 'green'
                                : 'red'
                            }
                            size="small"
                          >
                            {getQuestionActiveStatus(question)
                              ? t('common.active')
                              : t('common.inactive')}
                          </Tag>
                        </div>
                      </div>
                      {canEditQuestions() && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{ marginLeft: 12 }}
                        >
                          <Switch
                            checked={getQuestionActiveStatus(question)}
                            onChange={checked =>
                              handleQuestionStatusChange(
                                question.questionId || question.id,
                                checked
                              )
                            }
                            size="small"
                            checkedChildren={t('common.active')}
                            unCheckedChildren={t('common.inactive')}
                          />
                        </div>
                      )}
                    </div>
                  ),
                  children: (
                    <div style={{ paddingLeft: 36, paddingTop: 16 }}>
                      <QuestionCard
                        question={question}
                        index={index}
                        t={t}
                        canEdit={canEditQuestions()}
                        editMode={false} // Don't show switch again inside
                        onStatusChange={handleQuestionStatusChange}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ),
                }))}
              />
            ) : (
              // Regular list view for non-edit mode
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
            )}
          </div>
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
          <div ref={newQuestionsRef}>
            <Divider style={{ margin: '24px 0' }}>
              <Space>
                <PlusOutlined style={{ color: '#52c41a' }} />
                <Text strong style={{ color: '#52c41a' }}>
                  {t('surveyManagement.detail.newQuestions')}
                </Text>
                <Tag color="green">{newQuestions.length}</Tag>
              </Space>
            </Divider>
            <List
              style={{ width: '100%' }}
              dataSource={newQuestions}
              renderItem={(question, index) => (
                <List.Item
                  ref={el => {
                    if (el) newQuestionRefs.current[question.id] = el
                  }}
                  style={{ padding: '8px 0', width: '100%' }}
                >
                  <Card
                    style={{
                      marginBottom: 16,
                      width: '100%',
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                      border: '2px dashed #52c41a',
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
                          {(survey?.questions?.length || 0) + index + 1}
                        </div>
                        <div>
                          <Text
                            strong
                            style={{ fontSize: 16, color: '#262626' }}
                          >
                            {t('surveyManagement.detail.newQuestion')}{' '}
                            {index + 1}
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            <Tag color="green" size="small">
                              {t('common.new')}
                            </Tag>
                          </div>
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleRemoveNewQuestion(question.id)}
                          style={{ marginLeft: 'auto' }}
                        />
                      </Space>
                    }
                    styles={{ body: { padding: '20px 24px' } }}
                  >
                    <Form.Item
                      name={['newQuestions', question.id, 'text']}
                      label={
                        <Space>
                          <FileTextOutlined />
                          {t('surveyManagement.detail.questionText')}
                        </Space>
                      }
                      rules={[
                        {
                          required: true,
                          message: t(
                            'surveyManagement.form.questionTextRequired'
                          ),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          'surveyManagement.form.questionTextPlaceholder'
                        )}
                        style={{ borderRadius: '6px' }}
                      />
                    </Form.Item>
                    <Form.Item
                      name={['newQuestions', question.id, 'description']}
                      label={
                        <Space>
                          <BookOutlined />
                          {t('surveyManagement.detail.questionDescription')}
                        </Space>
                      }
                    >
                      <TextArea
                        rows={2}
                        placeholder={t(
                          'surveyManagement.form.questionDescriptionPlaceholder'
                        )}
                        style={{ borderRadius: '6px' }}
                      />
                    </Form.Item>
                    <Row gutter={16}>
                      {/* <Col span={12}>
                        <Form.Item
                          name={['newQuestions', question.id, 'questionType']}
                          label={t('surveyManagement.detail.questionType')}
                          rules={[{ required: true }]}
                        >
                          <Select
                            placeholder={t(
                              'surveyManagement.form.questionTypePlaceholder'
                            )}
                          >
                            {Object.values(QUESTION_TYPE).map(type => (
                              <Option key={type} value={type}>
                                {t(
                                  `surveyManagement.enums.questionType.${type}`
                                )}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col> */}
                      <Col span={12}>
                        <Form.Item
                          name={['newQuestions', question.id, 'required']}
                          label={t('surveyManagement.detail.required')}
                          valuePropName="checked"
                          initialValue={
                            survey?.category?.isLimited ? true : false
                          }
                        >
                          <div
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              backgroundColor: survey?.category?.isLimited
                                ? '#f5f5f5'
                                : 'white',
                              opacity: survey?.category?.isLimited ? 0.7 : 1,
                            }}
                          >
                            <Switch
                              checkedChildren={<CheckCircleOutlined />}
                              unCheckedChildren={<CloseOutlined />}
                              disabled={survey?.category?.isLimited}
                              checked={
                                survey?.category?.isLimited ? true : undefined
                              }
                            />
                            <span style={{ marginLeft: 8 }}>
                              {t('surveyManagement.detail.requiredQuestion')}
                              {survey?.category?.isLimited && (
                                <span
                                  style={{
                                    marginLeft: 8,
                                    fontSize: '12px',
                                    color: '#666',
                                  }}
                                >
                                  (
                                  {t(
                                    'surveyManagement.detail.requiredForLimitedCategory'
                                  )}
                                  )
                                </span>
                              )}
                            </span>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>

                    {/* Answers Section */}
                    <Divider style={{ margin: '16px 0' }}>
                      <Space>
                        <FileTextOutlined />
                        <Text strong>
                          {t('surveyManagement.detail.answers')}
                        </Text>
                      </Space>
                    </Divider>

                    {question.answers &&
                      question.answers.map((answer, answerIndex) => (
                        <Row
                          key={answer.id}
                          gutter={8}
                          style={{ marginBottom: 8 }}
                        >
                          <Col span={3}>
                            <Form.Item
                              name={[
                                'newQuestions',
                                question.id,
                                'answers',
                                answerIndex,
                                'score',
                              ]}
                              label={
                                answerIndex === 0
                                  ? t('surveyManagement.detail.score')
                                  : ''
                              }
                              initialValue={answer.score}
                            >
                              <InputNumber
                                min={0}
                                max={10}
                                style={{ width: '100%' }}
                                placeholder="Score"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={18}>
                            <Form.Item
                              name={[
                                'newQuestions',
                                question.id,
                                'answers',
                                answerIndex,
                                'text',
                              ]}
                              label={
                                answerIndex === 0
                                  ? t('surveyManagement.detail.answer')
                                  : ''
                              }
                              initialValue={answer.text}
                              rules={[
                                {
                                  required: true,
                                  message: t(
                                    'surveyManagement.detail.answerTextRequired'
                                  ),
                                },
                              ]}
                            >
                              <Input
                                placeholder={t(
                                  'surveyManagement.detail.answerTextPlaceholder'
                                )}
                                style={{ borderRadius: '6px' }}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={3}>
                            <Form.Item label={answerIndex === 0 ? ' ' : ''}>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                onClick={() =>
                                  handleRemoveAnswer(question.id, answer.id)
                                }
                                disabled={!canRemoveAnswers}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      ))}

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        size="small"
                        onClick={() => handleAddAnswer(question.id)}
                        disabled={!canAddAnswers}
                      >
                        {t('surveyManagement.detail.addAnswer')}
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
        {canAddQuestions() && editMode && (
          <div className="flex justify-center">
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              size="large"
              onClick={handleAddQuestion}
              disabled={totalActiveQuestions >= questionLimit}
            >
              {t('surveyManagement.detail.addQuestion')}
            </Button>
          </div>
        )}
      </Card>
    )
  }

  const renderEditForm = () => (
    <div style={{ padding: '8px 0' }}>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValuesChange}
      >
        <Row gutter={24}>
          <Col span={10}>
            {/* Basic Information Section */}
            <Card
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#1890ff' }} />
                  <span>{t('surveyManagement.detail.basicInformation')}</span>
                </Space>
              }
              size="small"
              style={{
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '8px',
              }}
              styles={{
                header: {
                  backgroundColor: '#fafafa',
                  borderRadius: '8px 8px 0 0',
                },
              }}
            >
              <Form.Item
                name="title"
                label={
                  <Space>
                    <FileTextOutlined />
                    {t('surveyManagement.form.title')}
                  </Space>
                }
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.titleRequired'),
                  },
                ]}
                style={{ marginBottom: 16 }}
              >
                <Input
                  placeholder={t('surveyManagement.form.titlePlaceholder')}
                  disabled={!isFieldEditable('title')}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <Space>
                    <BookOutlined />
                    {t('surveyManagement.form.description')}
                  </Space>
                }
                style={{ marginBottom: 0 }}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={t(
                    'surveyManagement.form.descriptionPlaceholder'
                  )}
                  disabled={!isFieldEditable('description')}
                  style={{ borderRadius: '6px' }}
                />
              </Form.Item>
            </Card>

            {/* Survey Configuration Section */}
            <Card
              title={
                <Space>
                  <QuestionCircleOutlined style={{ color: '#52c41a' }} />
                  <span>
                    {t('surveyManagement.detail.surveyConfiguration')}
                  </span>
                </Space>
              }
              size="small"
              style={{
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '8px',
              }}
              styles={{
                header: {
                  backgroundColor: '#fafafa',
                  borderRadius: '8px 8px 0 0',
                },
              }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="surveyType"
                    label={t('surveyManagement.detail.surveyType')}
                    rules={[
                      {
                        required: true,
                        message: t('surveyManagement.form.surveyTypeRequired'),
                      },
                    ]}
                    style={{ marginBottom: 16 }}
                  >
                    <Select
                      placeholder={t(
                        'surveyManagement.form.surveyTypePlaceholder'
                      )}
                      disabled
                      style={{ borderRadius: '6px' }}
                    >
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
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.surveyType !== currentValues.surveyType
                    }
                  >
                    {({ getFieldValue }) => (
                      <Form.Item
                        name="targetScope"
                        label={t('surveyManagement.form.targetScope')}
                        rules={[
                          {
                            required: true,
                            message: t(
                              'surveyManagement.form.targetScopeRequired'
                            ),
                          },
                        ]}
                        hidden={
                          getFieldValue('surveyType') !== SURVEY_TYPE.SCREENING
                        }
                      >
                        <Select
                          placeholder={t(
                            'surveyManagement.form.targetScopePlaceholder'
                          )}
                        >
                          {Object.values(TARGET_SCOPE)
                            .filter(scope => scope !== TARGET_SCOPE.NONE)
                            .map(scope => (
                              <Option key={scope} value={scope}>
                                {t(
                                  `surveyManagement.enums.targetScope.${scope}`
                                )}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.targetScope !== currentValues.targetScope
                    }
                  >
                    {({ getFieldValue }) => {
                      return (
                        <Form.Item
                          name="targetGrade"
                          label={t('surveyManagement.form.targetGrade')}
                          rules={[
                            {
                              required:
                                getFieldValue('targetScope') ===
                                TARGET_SCOPE.GRADE,
                              message: t(
                                'surveyManagement.form.targetGradeRequired'
                              ),
                            },
                          ]}
                          hidden={
                            getFieldValue('surveyType') !==
                            SURVEY_TYPE.SCREENING
                          }
                        >
                          <Select
                            mode="multiple"
                            allowClear
                            maxCount={2}
                            placeholder={t(
                              'surveyManagement.form.targetGradePlaceholder'
                            )}
                            disabled={
                              getFieldValue('targetScope') !==
                              TARGET_SCOPE.GRADE
                            }
                          >
                            {Object.values(GRADE_LEVEL).map(grade => (
                              <Option key={grade} value={grade}>
                                {t(
                                  `surveyManagement.enums.gradeLevel.${grade}`
                                )}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      )
                    }}
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="isRequired"
                    label={t('surveyManagement.detail.required')}
                    style={{ marginBottom: 16 }}
                  >
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue, setFieldsValue }) => {
                        const value = getFieldValue('isRequired')
                        return (
                          <div
                            style={{
                              padding: '8px 12px',
                              border: '1px solid #d9d9d9',
                              borderRadius: '6px',
                              backgroundColor: !isFieldEditable('isRequired')
                                ? '#f5f5f5'
                                : 'white',
                            }}
                          >
                            <Switch
                              checked={value}
                              disabled={
                                !isFieldEditable('isRequired') ||
                                survey.surveyType === SURVEY_TYPE.PROGRAM
                              }
                              checkedChildren={<CheckCircleOutlined />}
                              unCheckedChildren={<CloseOutlined />}
                              onChange={checked => {
                                setFieldsValue({ isRequired: checked })
                              }}
                            />
                            <span style={{ marginLeft: 8 }}>
                              {t('surveyManagement.detail.requiredSurvey')}
                            </span>
                          </div>
                        )
                      }}
                    </Form.Item>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    shouldUpdate
                    label={t('surveyManagement.form.isRecurring')}
                  >
                    {({ getFieldValue, setFieldsValue }) => {
                      const value = getFieldValue('isRecurring')
                      return (
                        <div
                          style={{
                            padding: '8px 12px',
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            backgroundColor: !isFieldEditable('isRequired')
                              ? '#f5f5f5'
                              : 'white',
                          }}
                        >
                          <Switch
                            checked={value}
                            onChange={checked =>
                              setFieldsValue({ isRecurring: checked })
                            }
                            disabled={
                              !isFieldEditable('isRecurring') ||
                              survey.surveyType === SURVEY_TYPE.PROGRAM
                            }
                            checkedChildren={<CheckCircleOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onClick={value => {
                              if (!value) {
                                setFieldsValue({
                                  recurringCycle: RECURRING_CYCLE.NONE,
                                })
                              } else {
                                setFieldsValue({
                                  recurringCycle: RECURRING_CYCLE.WEEKLY,
                                })
                              }
                            }}
                          />
                          <span style={{ marginLeft: 8 }}>
                            {t('surveyManagement.form.isRecurring')}
                          </span>
                        </div>
                      )
                    }}
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.isRecurring !== currentValues.isRecurring
                    }
                  >
                    {({ getFieldValue }) =>
                      getFieldValue('isRecurring') && (
                        <Form.Item
                          name="recurringCycle"
                          label={t('surveyManagement.form.recurringCycle')}
                          rules={[
                            {
                              required: true,
                              message: t(
                                'surveyManagement.form.recurringCycleRequired'
                              ),
                            },
                            {
                              validator: (_, value) => {
                                if (getFieldValue('isRecurring') && value) {
                                  const validCycles = [
                                    RECURRING_CYCLE.WEEKLY,
                                    RECURRING_CYCLE.MONTHLY,
                                  ]
                                  if (!validCycles.includes(value)) {
                                    return Promise.reject(
                                      new Error(
                                        t(
                                          'surveyManagement.form.recurringValidation.invalidCycle'
                                        )
                                      )
                                    )
                                  }
                                }
                                return Promise.resolve()
                              },
                            },
                          ]}
                          initialValue={
                            survey.recurringCycle === RECURRING_CYCLE.NONE
                              ? RECURRING_CYCLE.WEEKLY
                              : survey.recurringCycle
                          }
                        >
                          <Select
                            placeholder={t(
                              'surveyManagement.form.recurringCyclePlaceholder'
                            )}
                          >
                            <Option value={RECURRING_CYCLE.WEEKLY}>
                              {t(
                                'surveyManagement.enums.recurringCycle.WEEKLY'
                              )}
                            </Option>
                            <Option value={RECURRING_CYCLE.MONTHLY}>
                              {t(
                                'surveyManagement.enums.recurringCycle.MONTHLY'
                              )}
                            </Option>
                          </Select>
                        </Form.Item>
                      )
                    }
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Schedule Section */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#fa8c16' }} />
                  <span>{t('surveyManagement.detail.schedule')}</span>
                </Space>
              }
              size="small"
              style={{
                marginBottom: 16,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderRadius: '8px',
              }}
              styles={{
                header: {
                  backgroundColor: '#fafafa',
                  borderRadius: '8px 8px 0 0',
                },
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label={t('surveyManagement.form.startDate')}
                    rules={[
                      {
                        required: true,
                        message: t('surveyManagement.form.startDateRequired'),
                      },
                      {
                        validator: (_, value) => {
                          if (value) {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const selectedDate = new Date(value)
                            selectedDate.setHours(0, 0, 0, 0)
                            if (selectedDate < today) {
                              return Promise.reject(
                                new Error(
                                  t(
                                    'surveyManagement.form.startDateBeforeToday'
                                  )
                                )
                              )
                            }
                          }
                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      disabledDate={current => {
                        const today = new Date()
                        today.setHours(0, 0, 0, 0)
                        return current && current < today
                      }}
                      disabled={
                        !isFieldEditable('startDate') ||
                        survey.surveyType === SURVEY_TYPE.PROGRAM
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) =>
                      prevValues.startDate !== currentValues.startDate ||
                      prevValues.isRecurring !== currentValues.isRecurring ||
                      prevValues.recurringCycle !== currentValues.recurringCycle
                    }
                  >
                    {() => (
                      <Form.Item
                        name="endDate"
                        label={t('surveyManagement.form.endDate')}
                        rules={[
                          {
                            required: true,
                            message: t('surveyManagement.form.endDateRequired'),
                          },
                          {
                            validator: (_, value) => {
                              const startDate = form.getFieldValue('startDate')
                              const isRecurring =
                                form.getFieldValue('isRecurring')
                              const recurringCycle =
                                form.getFieldValue('recurringCycle')

                              if (value && startDate) {
                                const start = new Date(startDate)
                                start.setHours(0, 0, 0, 0)
                                const end = new Date(value)
                                end.setHours(0, 0, 0, 0)

                                if (end <= start) {
                                  return Promise.reject(
                                    new Error(
                                      t(
                                        'surveyManagement.form.endDateBeforeStartDate'
                                      )
                                    )
                                  )
                                }

                                // Additional validation for recurring surveys
                                if (isRecurring && recurringCycle) {
                                  const daysDiff = Math.ceil(
                                    (end - start) / (1000 * 60 * 60 * 24)
                                  )
                                  let maxDays = 0
                                  let errorKey = ''

                                  switch (recurringCycle) {
                                    case RECURRING_CYCLE.WEEKLY:
                                      maxDays = 6
                                      errorKey = 'endDateWeekly'
                                      break
                                    case RECURRING_CYCLE.MONTHLY:
                                      maxDays = 30
                                      errorKey = 'endDateMonthly'
                                      break
                                  }

                                  if (daysDiff > maxDays) {
                                    return Promise.reject(
                                      new Error(
                                        t(
                                          `surveyManagement.form.recurringValidation.${errorKey}`
                                        )
                                      )
                                    )
                                  }
                                }
                              }
                              return Promise.resolve()
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: '100%' }}
                          disabledDate={current => {
                            const startDate = form.getFieldValue('startDate')
                            const isRecurring =
                              form.getFieldValue('isRecurring')
                            const recurringCycle =
                              form.getFieldValue('recurringCycle')

                            if (!startDate) return false

                            const start = new Date(startDate)
                            start.setHours(0, 0, 0, 0)
                            const currentDate = new Date(current)
                            currentDate.setHours(0, 0, 0, 0)

                            // Basic constraint: end date must be after start date
                            if (currentDate <= start) return true

                            // Additional constraint for recurring surveys
                            if (isRecurring && recurringCycle) {
                              const daysDiff = Math.ceil(
                                (currentDate - start) / (1000 * 60 * 60 * 24)
                              )
                              let maxDays = 0

                              switch (recurringCycle) {
                                case RECURRING_CYCLE.WEEKLY:
                                  maxDays = 6
                                  break
                                case RECURRING_CYCLE.MONTHLY:
                                  maxDays = 30
                                  break
                              }

                              return daysDiff > maxDays
                            }

                            return false
                          }}
                          disabled={
                            !isFieldEditable('endDate') ||
                            survey.surveyType === SURVEY_TYPE.PROGRAM
                          }
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={14}>{renderQuestions()}</Col>
        </Row>
      </Form>
    </div>
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
        setSelectedAddedCases(filteredNoDoneSurveyCases.map(c => c.id))
      } else {
        // console.log('filteredRemovedCases', filteredRemovedCases)

        setSelectedRemovedCases(filteredRemovedCases.map(c => c.id))
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

    await dispatch(addCaseToSurvey(params))
      .unwrap()
      .then(() => {
        Promise.all([fetchSurveyDetails(), fetchCases()]).then(() => {
          setSelectedRemovedCases([])
          setSelectedAddedCases([])
        })
      })
      .catch(error => {
        // console.log('error', error.response?.data?.message)
        const errorMessage =
          error.response?.data?.message ||
          t('surveyManagement.messages.addCaseError')

        messageApi.error(errorMessage)
      })
  }

  const handleRemoveCase = async () => {
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
        .catch(error => {
          console.log('error', error.response?.data?.message)
          const errorMessage =
            error.response?.data?.message ||
            t('surveyManagement.messages.removeCaseError') ||
            'Case not found'
          const caseItem = addedCases.find(c => c.id === parseInt(errorMessage))
          if (caseItem) {
            messageApi.error(
              'Case of ' + caseItem.student.fullName + ' already done survey'
            )
          } else {
            messageApi.error(errorMessage)
          }
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
            selectedAddedCases.length < filteredNoDoneSurveyCases.length
          }
          checked={
            filteredNoDoneSurveyCases.length > 0 &&
            selectedAddedCases.length === filteredNoDoneSurveyCases.length
          }
          onChange={e => handleSelectAll(e.target.checked, 'removed')}
          disabled={filteredNoDoneSurveyCases.length === 0}
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
                  disabled={item?.alreadyDoneSurvey}
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
                  {!item.student.isEnableSurvey && (
                    <Tag
                      color="red"
                      style={{ marginTop: '8px', marginBottom: 0 }}
                    >
                      {t('surveyManagement.detail.studentNotEnableSurvey')}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
            {item?.alreadyDoneSurvey && (
              <Tag color="green" style={{ marginTop: '8px', marginBottom: 0 }}>
                {t('surveyManagement.detail.studentAlreadyDoneSurvey')}
              </Tag>
            )}
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
            selectedRemovedCases.length < filteredRemovedCases.length
          }
          checked={
            filteredRemovedCases.length > 0 &&
            selectedRemovedCases.length === filteredRemovedCases.length
          }
          onChange={e => handleSelectAll(e.target.checked, 'added')}
          disabled={filteredRemovedCases.length === 0}
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
                  disabled={!item?.student?.isEnableSurvey}
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
                  {!item.student.isEnableSurvey && (
                    <Tag
                      color="red"
                      style={{ marginTop: '8px', marginBottom: 0 }}
                    >
                      {t('surveyManagement.detail.studentNotEnableSurvey')}
                    </Tag>
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
      width={1500}
      styles={{
        body: {
          maxHeight: '75vh',
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

import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  Card,
  Button,
  Typography,
  Tabs,
  Collapse,
  Select,
  Input,
  Progress,
  Alert,
  Space,
  Divider,
  Tooltip,
  Badge,
  Row,
  Col,
} from 'antd'
import {
  InfoCircleOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import { reportScore } from '../../constants/appointmentReport'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Panel } = Collapse
const { TabPane } = Tabs

// Helper function to get score color
const getScoreColor = (score, t) => {
  if (score <= 1)
    return {
      color: '#52c41a',
      label: t('assessmentForm.scoreLevel.low'),
      bg: '#f6ffed',
    }
  if (score <= 3)
    return {
      color: '#faad14',
      label: t('assessmentForm.scoreLevel.medium'),
      bg: '#fffbe6',
    }
  return {
    color: '#ff4d4f',
    label: t('assessmentForm.scoreLevel.high'),
    bg: '#fff2f0',
  }
}

const AssessmentForm = memo(
  ({
    isVisible,
    onClose,
    onSubmit,
    t,
    isDarkMode,
    loading = false,
    message,
    categories,
  }) => {
    // State for form data
    const [formData, setFormData] = useState({
      sessionNotes: '',
      noteSummary: '',
      noteSuggestion: '',
      sessionFlow: 'AVERAGE',
      studentCoopLevel: 'MEDIUM',
      assessmentScores: [],
    })

    // State for tracking progress
    const [progress, setProgress] = useState(0)
    const [expandedPanels, setExpandedPanels] = useState([])

    // State for high-risk warnings
    const [highRiskWarnings, setHighRiskWarnings] = useState([])

    // Initialize assessment scores
    useEffect(() => {
      const initialScores = categories.map(category => ({
        categoryId: category.id,
        severityScore: 0,
        frequencyScore: 0,
        impairmentScore: 0,
        chronicityScore: 0,
      }))

      // console.log('initialScores', initialScores)

      setFormData(prev => ({
        ...prev,
        assessmentScores: initialScores,
      }))
    }, [categories])
    // console.log('formData', formData)

    // Calculate progress
    useEffect(() => {
      const totalFields = 3 + categories.length * 3 // session notes + summary + suggestion + each assessment item * 3 questions
      let completedFields = 0

      if (formData.sessionNotes.trim()) completedFields++
      if (formData.noteSummary.trim()) completedFields++
      if (formData.noteSuggestion.trim()) completedFields++
      ;(formData.assessmentScores || []).forEach(score => {
        if (score && score.severityScore > 0) completedFields++
        if (score && score.frequencyScore > 0) completedFields++
        if (score && score.impairmentScore > 0) completedFields++
        if (score && score.chronicityScore > 0) completedFields++
      })

      setProgress(Math.round((completedFields / totalFields) * 100))
    }, [formData, categories])

    // Check for high-risk items
    useEffect(() => {
      const warnings = []
      ;(formData.assessmentScores || []).forEach(score => {
        if (
          score &&
          (score.frequencyScore >= 4 ||
            score.impairmentScore >= 4 ||
            score.chronicityScore >= 4 ||
            score.severityScore >= 4)
        ) {
          const item = categories.find(c => c.id === score.categoryId)
          warnings.push({
            type: 'error',
            message: `${t('assessmentForm.warnings.highRisk')}: ${item?.name} - ${t('assessmentForm.warnings.highRiskDescription')}`,
            item: item,
          })
        }
      })
      setHighRiskWarnings(warnings)
    }, [formData.assessmentScores])

    // Auto-save to localStorage
    useEffect(() => {
      if (progress > 0) {
        localStorage.setItem('assessmentFormData', JSON.stringify(formData))
        localStorage.setItem('assessmentFormProgress', progress.toString())
      }
    }, [formData, progress])

    // Load from localStorage on mount
    useEffect(() => {
      const savedData = localStorage.getItem('assessmentFormData')
      const savedProgress = localStorage.getItem('assessmentFormProgress')

      if (savedData) {
        setFormData(JSON.parse(savedData))
        if (savedProgress) {
          setProgress(parseInt(savedProgress))
          message.success(t('assessmentForm.form.messages.saveSuccess'))
        }
      }
    }, [t, message])

    // Handle assessment score changes
    const handleAssessmentScoreChange = useCallback(
      (categoryId, field, value) => {
        setFormData(prev => {
          const newScores = [...(prev.assessmentScores || [])]
          const categoryIndex = newScores.findIndex(
            score => score.categoryId === categoryId
          )

          if (categoryIndex === -1) {
            newScores.push({
              categoryId: categoryId,
              severityScore: 0,
              frequencyScore: 0,
              impairmentScore: 0,
              chronicityScore: 0,
            })
          }
          newScores[categoryIndex] = {
            ...newScores[categoryIndex],
            [field]: value,
          }

          return {
            ...prev,
            assessmentScores: newScores,
          }
        })
      },
      []
    )

    // Handle form field changes
    const handleFormFieldChange = useCallback((field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }))
    }, [])

    // Handle panel expand/collapse
    const handlePanelChange = useCallback(keys => {
      setExpandedPanels(keys)
    }, [])

    // Handle form submission
    const handleSubmit = useCallback(() => {
      // Validate required fields
      if (!formData.sessionNotes.trim()) {
        message.error(t('assessmentForm.form.validation.sessionNotesRequired'))
        return
      }

      if (!formData.noteSummary.trim()) {
        message.error(t('assessmentForm.form.validation.noteSummaryRequired'))
        return
      }

      if (!formData.noteSuggestion.trim()) {
        message.error(
          t('assessmentForm.form.validation.noteSuggestionRequired')
        )
        return
      }

      // Check if at least one assessment item has been evaluated
      // const hasAssessments = (formData.assessmentScores || []).some(
      //   score =>
      //     score &&
      //     (score.frequencyScore > 0 ||
      //       score.impairmentScore > 0 ||
      //       score.chronicityScore > 0 ||
      //       score.severityScore > 0)
      // )

      // if (!hasAssessments) {
      //   message.error(t('assessmentForm.form.validation.assessmentRequired'))
      //   return
      // }

      // Show high-risk warning if applicable
      if (highRiskWarnings.some(w => w.type === 'error')) {
        message.warning(t('assessmentForm.warnings.highRisk'))
      }

      // Clear localStorage
      localStorage.removeItem('assessmentFormData')
      localStorage.removeItem('assessmentFormProgress')

      // Submit data
      onSubmit && onSubmit(formData)
      onClose()
    }, [formData, highRiskWarnings, onSubmit, onClose, t, message])

    // Reset form
    const handleReset = useCallback(() => {
      setFormData({
        sessionNotes: '',
        noteSummary: '',
        noteSuggestion: '',
        sessionFlow: 'AVERAGE',
        studentCoopLevel: 'MEDIUM',
        assessmentScores: categories.map(category => ({
          categoryId: category.id,
          severityScore: 0,
          frequencyScore: 0,
          impairmentScore: 0,
          chronicityScore: 0,
        })),
      })
      setProgress(0)
      setExpandedPanels([])
      setHighRiskWarnings([])

      localStorage.removeItem('assessmentFormData')
      localStorage.removeItem('assessmentFormProgress')

      message.info(t('assessmentForm.form.messages.resetSuccess'))
    }, [t, message])

    // Close form
    const handleClose = useCallback(() => {
      handleReset()
      onClose()
    }, [handleReset, onClose])

    // Render assessment item header
    const renderAssessmentItemHeader = useCallback(
      item => {
        const score = (formData.assessmentScores &&
          formData.assessmentScores.find(s => s.categoryId === item.id)) || {
          severityScore: 0,
          frequencyScore: 0,
          impairmentScore: 0,
          chronicityScore: 0,
        }
        const isHighRisk =
          score &&
          ((score.frequencyScore ?? 0) >= 4 ||
            (score.impairmentScore ?? 0) >= 4 ||
            (score.chronicityScore ?? 0) >= 4)
        const scoreColor = getScoreColor(
          score ? (score.severityScore ?? 0) : 0,
          t
        )

        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Text strong>{item?.name}</Text>
              {isHighRisk && (
                <Badge
                  count={
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  style={{ backgroundColor: '#fff2f0' }}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Text className="text-sm text-gray-500">
                {t('assessmentForm.totalScore')}:{' '}
                {score ? (score.severityScore ?? 0) : 0}
              </Text>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: scoreColor.color }}
              />
            </div>
          </div>
        )
      },
      [formData.assessmentScores, t]
    )

    // Render assessment item content
    const renderAssessmentItemContent = useCallback(
      item => {
        const score = (formData.assessmentScores &&
          formData.assessmentScores.find(s => s.categoryId === item.id)) || {
          severityScore: 0,
          frequencyScore: 0,
          impairmentScore: 0,
          chronicityScore: 0,
        }
        const isHighRisk =
          score &&
          ((score.frequencyScore ?? 0) >= 4 ||
            (score.impairmentScore ?? 0) >= 4 ||
            (score.chronicityScore ?? 0) >= 4)

        return (
          <div className="space-y-4">
            {/* <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('common.description')}:</strong> {item.description}
              </Text>
              <br />
              <Text className="text-xs text-gray-500 dark:text-gray-500">
                <strong>{t('common.reference')}:</strong> {item.reference}
              </Text>
            </div> */}

            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="space-y-2">
                  <Text strong>{t('appointmentRecord.severity')}</Text>
                  <Select
                    value={score ? (score.severityScore ?? 0) : 0}
                    onChange={value =>
                      handleAssessmentScoreChange(
                        item.id,
                        'severityScore',
                        value
                      )
                    }
                    style={{ width: '100%' }}
                    placeholder={t('assessmentForm.options.severity.0')}
                  >
                    {reportScore.severity.options.map(option => (
                      <Select.Option key={option.score} value={option.score}>
                        {option.text} ({option.score})
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col span={8}>
                <div className="space-y-2">
                  <Text strong>{t('appointmentRecord.frequency')}</Text>
                  <Select
                    value={score ? (score.frequencyScore ?? 0) : 0}
                    onChange={value =>
                      handleAssessmentScoreChange(
                        item.id,
                        'frequencyScore',
                        value
                      )
                    }
                    style={{ width: '100%' }}
                    placeholder={t('assessmentForm.options.frequency.0')}
                  >
                    {reportScore.frequency.options.map(option => (
                      <Select.Option key={option.score} value={option.score}>
                        {option.text} ({option.score})
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col span={8}>
                <div className="space-y-2">
                  <Text strong>{t('appointmentRecord.impairment')}</Text>
                  <Select
                    value={score ? (score.impairmentScore ?? 0) : 0}
                    onChange={value =>
                      handleAssessmentScoreChange(
                        item.id,
                        'impairmentScore',
                        value
                      )
                    }
                    style={{ width: '100%' }}
                    placeholder={t('assessmentForm.options.impairment.0')}
                  >
                    {reportScore.impairment.options.map(option => (
                      <Select.Option key={option.score} value={option.score}>
                        {option.text} ({option.score})
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>

              <Col span={8}>
                <div className="space-y-2">
                  <Text strong>{t('appointmentRecord.chronicity')}</Text>
                  <Select
                    value={score ? (score.chronicityScore ?? 0) : 0}
                    onChange={value =>
                      handleAssessmentScoreChange(
                        item.id,
                        'chronicityScore',
                        value
                      )
                    }
                    style={{ width: '100%' }}
                    placeholder={t('assessmentForm.options.chronicity.0')}
                  >
                    {reportScore.chronicity.options.map(option => (
                      <Select.Option key={option.score} value={option.score}>
                        {option.text} ({option.score})
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>

            {isHighRisk && (
              <Alert
                message={t('assessmentForm.warnings.highRiskDescription')}
                type="warning"
                showIcon
                icon={<SafetyOutlined />}
              />
            )}
          </div>
        )
      },
      [formData.assessmentScores, handleAssessmentScoreChange, t]
    )

    if (!isVisible) return null

    return (
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={3} className="mb-2">
                <FileTextOutlined className="mr-2" />
                {t('assessmentForm.form.title')}
              </Title>
              <Text
                type="secondary"
                className="text-gray-600 dark:text-gray-400"
              >
                {t('assessmentForm.title')}
              </Text>
            </div>
            {/* <div className="flex items-center gap-4">
              <div className="text-right">
                <Text className="text-sm text-gray-500">
                  {t('assessmentForm.form.progress')}
                </Text>
                <div className="text-lg font-semibold">{progress}%</div>
              </div>
              <Progress
                type="circle"
                percent={progress}
                size={60}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div> */}
          </div>

          {/* Progress Bar */}
          {/* <Progress
            percent={progress}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            showInfo={false}
          /> */}
        </Card>

        {/* High Risk Warnings */}
        {highRiskWarnings?.length > 0 && (
          <div className="space-y-2">
            {highRiskWarnings.map((warning, index) => (
              <Alert
                key={index}
                message={warning.message}
                type={warning.type}
                showIcon
                icon={<ExclamationCircleOutlined />}
                action={
                  <Button size="small" type="link">
                    {t('common.viewDetails')}
                  </Button>
                }
              />
            ))}
          </div>
        )}

        {/* Main Form */}
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
        >
          <div className="space-y-6 p-4">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div className="space-y-2">
                  <Text strong>{t('assessmentForm.form.sessionFlow')} *</Text>
                  <Select
                    value={formData.sessionFlow}
                    onChange={value =>
                      handleFormFieldChange('sessionFlow', value)
                    }
                    style={{ width: '100%' }}
                    size="large"
                    placeholder={t('assessmentForm.form.sessionFlow')}
                  >
                    <Select.Option value="LOW">
                      {t('assessmentForm.options.sessionFlow.LOW')}
                    </Select.Option>
                    <Select.Option value="AVERAGE">
                      {t('assessmentForm.options.sessionFlow.AVERAGE')}
                    </Select.Option>
                    <Select.Option value="GOOD">
                      {t('assessmentForm.options.sessionFlow.GOOD')}
                    </Select.Option>
                  </Select>
                </div>
              </Col>

              <Col span={12}>
                <div className="space-y-2">
                  <Text strong>
                    {t('assessmentForm.form.studentCoopLevel')} *
                  </Text>
                  <Select
                    value={formData.studentCoopLevel}
                    onChange={value =>
                      handleFormFieldChange('studentCoopLevel', value)
                    }
                    style={{ width: '100%' }}
                    size="large"
                    placeholder={t('assessmentForm.form.studentCoopLevel')}
                  >
                    <Select.Option value="LOW">
                      {t('assessmentForm.options.cooperationLevel.LOW')}
                    </Select.Option>
                    <Select.Option value="MEDIUM">
                      {t('assessmentForm.options.cooperationLevel.MEDIUM')}
                    </Select.Option>
                    <Select.Option value="HIGH">
                      {t('assessmentForm.options.cooperationLevel.HIGH')}
                    </Select.Option>
                  </Select>
                </div>
              </Col>
            </Row>

            <div className="p-4">
              <Text strong>{t('assessmentForm.form.assessement')} *</Text>
              <Collapse
                activeKey={expandedPanels}
                onChange={handlePanelChange}
                ghost
                items={categories.map(category => ({
                  key: category.id,
                  label: renderAssessmentItemHeader(category),
                  children: renderAssessmentItemContent(category),
                  extra: (
                    <Tooltip title={category.description}>
                      <InfoCircleOutlined className="text-blue-500" />
                    </Tooltip>
                  ),
                }))}
              />
            </div>

            <div className="space-y-2">
              <Text strong>{t('assessmentForm.form.sessionNotes')} *</Text>
              <TextArea
                value={formData.sessionNotes}
                onChange={e =>
                  handleFormFieldChange('sessionNotes', e.target.value)
                }
                placeholder={t('assessmentForm.form.sessionNotesPlaceholder')}
                rows={4}
                showCount
                maxLength={1000}
                required
              />
            </div>

            <div className="space-y-2">
              <Text strong>{t('assessmentForm.form.noteSummary')} *</Text>
              <TextArea
                value={formData.noteSummary}
                onChange={e =>
                  handleFormFieldChange('noteSummary', e.target.value)
                }
                placeholder={t('assessmentForm.form.noteSummaryPlaceholder')}
                rows={3}
                showCount
                maxLength={500}
                required
              />
            </div>

            <div className="space-y-2">
              <Text strong>{t('assessmentForm.form.noteSuggestion')} *</Text>
              <TextArea
                value={formData.noteSuggestion}
                onChange={e =>
                  handleFormFieldChange('noteSuggestion', e.target.value)
                }
                placeholder={t('assessmentForm.form.noteSuggestionPlaceholder')}
                rows={3}
                showCount
                maxLength={500}
                required
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
        >
          <div className="flex justify-between items-center">
            <Space>
              <Button
                onClick={handleReset}
                icon={<SaveOutlined />}
                size="large"
              >
                {t('assessmentForm.reset')}
              </Button>
              <Button onClick={handleClose} size="large">
                {t('assessmentForm.cancel')}
              </Button>
            </Space>

            <Space>
              <Button
                type="primary"
                onClick={handleSubmit}
                icon={<CheckCircleOutlined />}
                size="large"
                loading={loading}
                disabled={loading || progress < 20}
              >
                {t('assessmentForm.complete')}
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    )
  }
)

AssessmentForm.displayName = 'AssessmentForm'

export default AssessmentForm

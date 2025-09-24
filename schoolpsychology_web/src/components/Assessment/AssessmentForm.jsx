import React, { useState, useCallback, useEffect, memo } from 'react'
import {
  Card,
  Button,
  Typography,
  Collapse,
  Select,
  Input,
  Alert,
  Space,
  Tooltip,
  Badge,
  Row,
  Col,
  Checkbox,
} from 'antd'
import {
  InfoCircleOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { reportScore } from '@/constants/appointmentReport'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const AssessmentForm = memo(
  ({
    userRole,
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
      notificationSettings: {
        notifyTeachers: false,
        notifyParents: false,
        notiType: 'APPOINTMENT_WARNING',
        // notifyAdministrators: false,
      },
    })

    // State for tracking progress
    const [progress, setProgress] = useState(0)
    const [expandedPanels, setExpandedPanels] = useState([])

    // Initialize assessment scores
    useEffect(() => {
      if (userRole === 'TEACHER')
        return setFormData(prev => ({
          ...prev,
          assessmentScores: [],
        }))

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
    }, [categories, userRole])

    // console.log('formData', formData)

    // Calculate progress
    useEffect(() => {
      if (userRole === 'TEACHER') return
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

      if (formData.notificationSettings.notifyTeachers) completedFields++
      if (formData.notificationSettings.notifyParents) completedFields++
      // if (formData.notificationSettings.notifyAdministrators)
      //   completedFields++

      setProgress(Math.round((completedFields / totalFields) * 100))
    }, [formData, categories, userRole])

    // Check for high-risk items
    useEffect(() => {
      if (userRole === 'TEACHER') return
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
    }, [formData.assessmentScores, userRole])

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
          // message.success(t('assessmentForm.form.messages.saveSuccess'))
        }
      }
    }, [])

    // Handle notification settings changes
    const handleNotificationChange = useCallback((field, value) => {
      setFormData(prev => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [field]: value,
        },
      }))
    }, [])

    // Handle assessment score changes
    const handleAssessmentScoreChange = useCallback(
      (categoryId, field, value) => {
        if (userRole === 'TEACHER') return
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
      [userRole]
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
    const handleSubmit = useCallback(async () => {
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

      // Clear localStorage
      localStorage.removeItem('assessmentFormData')
      localStorage.removeItem('assessmentFormProgress')
      console.log('formData', formData)
      // Submit data
      await onSubmit(formData)
      onClose()
    }, [formData, onSubmit, t, message, onClose])

    // Reset form
    const handleReset = useCallback(() => {
      setFormData({
        sessionNotes: '',
        noteSummary: '',
        noteSuggestion: '',
        sessionFlow: 'AVERAGE',
        studentCoopLevel: 'MEDIUM',
        assessmentScores:
          userRole === 'TEACHER'
            ? []
            : categories.map(category => ({
                categoryId: category.id,
                severityScore: 0,
                frequencyScore: 0,
                impairmentScore: 0,
                chronicityScore: 0,
              })),
        notificationSettings: {
          notifyTeachers: false,
          notifyParents: false,
          notiType: 'APPOINTMENT_WARNING',
        },
      })
      setProgress(0)
      setExpandedPanels([])

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

        // const scoreColor = getScoreColor(
        //   score ? (score.severityScore ?? 0) : 0,
        //   t
        // )

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
            (score.chronicityScore ?? 0) >= 4 ||
            (score.severityScore ?? 0) >= 4)

        return (
          <div className="space-y-4">
            <Row gutter={[16, 16]}>
              <Col span={12}>
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

              <Col span={12}>
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

              <Col span={12}>
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

              <Col span={12}>
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
      <div className="w-full">
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
          </div>
        </Card>

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
                    <Select.Option value="GOOD">
                      {t('assessmentForm.options.cooperationLevel.GOOD')}
                    </Select.Option>
                  </Select>
                </div>
              </Col>
            </Row>

            {userRole !== 'TEACHER' && (
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
            )}

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

        {/* Notification Settings */}
        <Card
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BellOutlined className="text-blue-500 text-lg" />
              <Title level={4} className="mb-0">
                {t('assessmentForm.notification.title') ||
                  'Notification Settings'}
              </Title>
            </div>

            <div
              className={`${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} p-4 rounded-lg`}
            >
              {/* <Checkbox
                checked={formData.notificationSettings?.notifyTeachers}
                onChange={e =>
                  handleNotificationChange('sendNotification', e.target.checked)
                }
                className="text-base font-medium"
              >
                {t('assessmentForm.notification.enableNotifications') ||
                  'Send notifications about this assessment'}
              </Checkbox> */}

              {/* notifyTeachers */}
              <div className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-gray-700 ' : 'bg-white'} rounded-lg`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} rounded-full flex items-center justify-center`}
                    >
                      <UserOutlined
                        className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`}
                      />
                    </div>
                    <div>
                      {userRole !== 'TEACHER' && (
                        <Text
                          strong
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {t('assessmentForm.notification.notifyTeachers') ||
                            'Notify Teachers'}
                        </Text>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t('assessmentForm.notification.teacherDescription') ||
                          'Send assessment results to relevant teachers'}
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={formData.notificationSettings?.notifyTeachers}
                    onChange={e =>
                      handleNotificationChange(
                        'notifyTeachers',
                        e.target.checked
                      )
                    }
                  />
                </div>

                {/* //notifyParents */}
                {/* <div
                    className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'} rounded-full flex items-center justify-center`}
                      >
                        <UserOutlined
                          className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                        />
                      </div>
                      <div>
                        <Text
                          strong
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {t('assessmentForm.notification.notifyParents') ||
                            'Notify Parents'}
                        </Text>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('assessmentForm.notification.parentDescription') ||
                            'Coming soon - notify parents about assessment'}
                        </div>
                      </div>
                    </div>
                    <Checkbox
                      checked={formData.notificationSettings?.notifyParents}
                      onChange={e =>
                        handleNotificationChange(
                          'notifyParents',
                          e.target.checked
                        )
                      }
                      disabled={
                        !formData.notificationSettings?.sendNotification
                      }
                    />
                  </div> */}
                {formData.notificationSettings?.notifyTeachers && (
                  <div
                    className={`flex items-center justify-between p-3 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-white'
                    } rounded-lg`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 ${
                          isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                        } rounded-full flex items-center justify-center`}
                      >
                        <BellOutlined
                          className={`${
                            isDarkMode ? 'text-amber-400' : 'text-amber-600'
                          }`}
                        />
                      </div>
                      <div>
                        <Text
                          strong
                          className="text-gray-900 dark:text-gray-100"
                        >
                          {t('assessmentForm.notification.type') ||
                            'Notification Type'}
                        </Text>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {t('assessmentForm.notification.typeDescription') ||
                            'Choose severity level to notify teachers'}
                        </div>
                      </div>
                    </div>
                    <Select
                      value={formData.notificationSettings?.notiType}
                      onChange={value =>
                        handleNotificationChange('notiType', value)
                      }
                      style={{ width: 220 }}
                    >
                      <Select.Option value="APPOINTMENT_WARNING">
                        {t('common.warning') || 'Warning'}
                      </Select.Option>
                      <Select.Option value="APPOINTMENT_DANGER">
                        {t('common.danger') || 'Danger'}
                      </Select.Option>
                    </Select>
                  </div>
                )}
              </div>
              {/* )} */}
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

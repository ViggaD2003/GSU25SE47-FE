import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  Typography,
  Card,
  Row,
  Col,
  message,
  Switch,
  InputNumber,
  Select,
  Divider,
  Spin,
  List,
  Tag,
  Badge,
  Descriptions,
  Empty,
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  TrophyOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { categoriesAPI } from '@/services/categoryApi'

const { Text, Title } = Typography
const { TextArea } = Input
const { Option } = Select

// Constants moved outside component to prevent recreation
const LEVEL_TYPE_OPTIONS = [
  { value: 'LOW', label: 'categoryManagement.form.levelTypes.low' },
  { value: 'MID', label: 'categoryManagement.form.levelTypes.medium' },
  { value: 'HIGH', label: 'categoryManagement.form.levelTypes.high' },
  { value: 'CRITICAL', label: 'categoryManagement.form.levelTypes.critical' },
]

const LEVEL_TYPE_CONFIG = {
  LOW: { color: 'green', icon: CheckCircleOutlined },
  MID: { color: 'orange', icon: ClockCircleOutlined },
  HIGH: { color: 'red', icon: AlertOutlined },
  CRITICAL: { color: 'purple', icon: ExclamationCircleOutlined },
}

const LevelCard = React.memo(
  ({ level, index, isView, isDarkMode, onEdit, onDelete, t }) => {
    const { color, icon: IconComponent } =
      LEVEL_TYPE_CONFIG[level.levelType] || {}

    if (isView) {
      return (
        <Card
          size="small"
          className={`mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
          title={
            <Space>
              <IconComponent />
              <Text strong>{level.label}</Text>
              <Tag color={color} size="small">
                {level.code}
              </Tag>
            </Space>
          }
        >
          <Descriptions size="small" column={1}>
            <Descriptions.Item
              label={t('categoryManagement.form.levelDescription')}
            >
              {level.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('categoryManagement.form.symptomsDescription')}
            >
              {level.symptomsDescription || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('categoryManagement.form.interventionRequired')}
            >
              {level.interventionRequired || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('categoryManagement.form.scoreRange')}>
              {level.minScore} - {level.maxScore}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )
    }

    return (
      <Card
        size="small"
        className={`mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} hover:shadow-md transition-shadow cursor-pointer`}
        title={
          <Space>
            <IconComponent />
            <Text strong>{level.label}</Text>
            <Tag color={color} size="small">
              {level.code}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={e => {
                e.stopPropagation()
                onEdit(index)
              }}
              title={t('categoryManagement.form.editLevel')}
            >
              {t('categoryManagement.form.editLevel')}
            </Button>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={e => {
                e.stopPropagation()
                onDelete(index)
              }}
              size="small"
              title={t('common.delete')}
            />
          </Space>
        }
        onClick={() => onEdit(index)}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {level.description}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('categoryManagement.form.scoreRange')}: {level.minScore} -{' '}
            {level.maxScore}
          </Text>
          {level.symptomsDescription && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <strong>
                {t('categoryManagement.form.symptomsDescription')}:
              </strong>{' '}
              {level.symptomsDescription}
            </Text>
          )}
          {level.interventionRequired && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <strong>
                {t('categoryManagement.form.interventionRequired')}:
              </strong>{' '}
              {level.interventionRequired}
            </Text>
          )}
        </Space>
      </Card>
    )
  }
)

const CategoryModal = ({
  visible,
  onCancel,
  onOk,
  selectedCategory,
  isEdit,
  isView,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  // Single form instance for all form management
  const [form] = Form.useForm()

  // Unified state management
  const [state, setState] = useState({
    loading: false,
    detailLoading: false,
    detailedCategory: null,
    levelModalVisible: false,
    editingLevelIndex: null,
  })

  // Memoized values
  const levelTypeOptions = useMemo(
    () =>
      LEVEL_TYPE_OPTIONS.map(option => ({
        ...option,
        label: t(option.label),
      })),
    [t]
  )

  // Unified form values using Form.useWatch
  const formValues = Form.useWatch([], form)
  const isLimited = Form.useWatch('isLimited', form)
  const levels = Form.useWatch('levels', form) || []
  const minScore = Form.useWatch('minScore', form)
  const maxScore = Form.useWatch('maxScore', form)

  // Optimized state updates
  const updateState = useCallback(updates => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Fetch category details for view mode
  useEffect(() => {
    let isMounted = true

    const fetchCategoryDetails = async () => {
      if (visible && isView && selectedCategory?.id) {
        try {
          updateState({ detailLoading: true })
          const response = await categoriesAPI.getCategoryLevels(
            selectedCategory.id
          )
          if (isMounted) {
            updateState({
              detailedCategory: { ...selectedCategory, levels: response },
              detailLoading: false,
            })
          }
        } catch (error) {
          console.error('Failed to fetch category details:', error)
          if (isMounted) {
            message.error(t('categoryManagement.messages.fetchDetailError'))
            updateState({ detailLoading: false })
          }
        }
      } else if (visible && !isView) {
        if (isMounted) {
          updateState({ detailedCategory: null })
        }
      }
    }

    fetchCategoryDetails()

    return () => {
      isMounted = false
    }
  }, [visible, isView, selectedCategory?.id, t, updateState])

  // Form initialization
  useEffect(() => {
    if (!visible) return

    if (selectedCategory) {
      const categoryData = isView
        ? state.detailedCategory || selectedCategory
        : selectedCategory

      form.setFieldsValue({
        name: categoryData.name || '',
        code: categoryData.code || '',
        description: categoryData.description || '',
        isSum: categoryData.isSum ?? true,
        isLimited: categoryData.isLimited ?? true,
        questionLength: categoryData.questionLength || null,
        questionCount: categoryData.questionCount || null,
        severityWeight: categoryData.severityWeight || null,
        isActive: categoryData.isActive ?? true,
        maxScore: categoryData.maxScore || null,
        minScore: categoryData.minScore || null,
        levels: categoryData.levels || [],
      })
    } else {
      // Reset form with default values
      form.resetFields()
      form.setFieldsValue({
        isSum: true,
        isLimited: true,
        isActive: true,
        levels: [],
      })
    }
  }, [visible, selectedCategory, state.detailedCategory, form, isView])

  // Validation functions
  const validateScoreRange = useCallback(
    levels => {
      if (!levels || levels.length === 0) return true

      const sortedLevels = [...levels].sort((a, b) => a.minScore - b.minScore)

      for (let i = 0; i < sortedLevels.length; i++) {
        const level = sortedLevels[i]

        if (level.minScore >= level.maxScore) {
          message.error(
            t('categoryManagement.messages.invalidScoreRange', {
              level: level.label || level.code,
            })
          )
          return false
        }

        if (i > 0) {
          const prevLevel = sortedLevels[i - 1]
          if (level.minScore < prevLevel.maxScore) {
            message.error(
              t('categoryManagement.messages.overlappingScores', {
                level1: prevLevel.label || prevLevel.code,
                level2: level.label || level.code,
              })
            )
            return false
          }
        }
      }

      return true
    },
    [t]
  )

  // Form submission handler
  const handleOk = useCallback(async () => {
    if (isView) {
      onCancel()
      return
    }

    try {
      updateState({ loading: true })
      const values = await form.validateFields()

      // Additional validation
      if (!validateScoreRange(values.levels)) {
        updateState({ loading: false })
        return
      }

      if (values.minScore >= values.maxScore) {
        message.error(
          t('categoryManagement.messages.categoryScoreRangeInvalid')
        )
        updateState({ loading: false })
        return
      }

      if (
        values.isLimited &&
        (!values.questionCount || values.questionCount <= 0)
      ) {
        message.error(t('categoryManagement.messages.questionCountRequired'))
        updateState({ loading: false })
        return
      }

      const categoryData = {
        name: values.name?.trim(),
        code: values.code?.trim().toUpperCase(),
        description: values.description?.trim() || null,
        isSum: values.isSum,
        isLimited: values.isLimited,
        questionLength: values.questionLength,
        questionCount: values.isLimited ? values.questionCount : null,
        severityWeight: values.severityWeight,
        isActive: values.isActive,
        maxScore: values.maxScore,
        minScore: values.minScore,
        levels: values.levels || [],
      }

      await onOk(categoryData)
      form.resetFields()
      updateState({ detailedCategory: null })
    } catch (error) {
      console.error('Validation failed:', error)
      if (error.errorFields) {
        message.error(t('categoryManagement.messages.validationError'))
      } else {
        message.error(t('categoryManagement.messages.addError'))
      }
    } finally {
      updateState({ loading: false })
    }
  }, [isView, onCancel, form, onOk, t, updateState, validateScoreRange])

  const handleCancel = useCallback(() => {
    form.resetFields()
    updateState({
      detailedCategory: null,
      levelModalVisible: false,
      editingLevelIndex: null,
    })
    onCancel()
  }, [form, onCancel, updateState])

  const getModalTitle = useCallback(() => {
    if (isView) return t('categoryManagement.modal.viewTitle')
    if (isEdit) return t('categoryManagement.modal.editTitle')
    return t('categoryManagement.modal.addTitle')
  }, [isView, isEdit, t])

  // Level management functions
  const addLevel = useCallback(() => {
    updateState({
      editingLevelIndex: null,
      levelModalVisible: true,
    })
  }, [updateState])

  const editLevel = useCallback(
    index => {
      const currentLevels = form.getFieldValue('levels') || []
      const level = currentLevels[index]
      if (level) {
        updateState({
          editingLevelIndex: index,
          levelModalVisible: true,
        })
      }
    },
    [form, updateState]
  )

  const handleLevelSubmit = useCallback(() => {
    // Get level form values from the main form
    const levelFormValues = {
      label: form.getFieldValue('levelLabel'),
      code: form.getFieldValue('levelCode'),
      description: form.getFieldValue('levelDescription'),
      symptomsDescription: form.getFieldValue('levelSymptomsDescription'),
      interventionRequired: form.getFieldValue('levelInterventionRequired'),
      minScore: form.getFieldValue('levelMinScore'),
      maxScore: form.getFieldValue('levelMaxScore'),
      levelType: form.getFieldValue('levelType'),
    }

    // Validate level form
    const levelValidationRules = {
      label: [
        {
          required: true,
          message: t('categoryManagement.form.levelLabelRequired'),
        },
        { min: 2, message: t('categoryManagement.form.levelLabelMinLength') },
        { max: 50, message: t('categoryManagement.form.levelLabelMaxLength') },
      ],
      code: [
        {
          required: true,
          message: t('categoryManagement.form.levelCodeRequired'),
        },
        {
          pattern: /^[A-Z0-9_]+$/,
          message: t('categoryManagement.form.levelCodePattern'),
        },
        { min: 2, message: t('categoryManagement.form.levelCodeMinLength') },
        { max: 20, message: t('categoryManagement.form.levelCodeMaxLength') },
      ],
      minScore: [
        {
          required: true,
          message: t('categoryManagement.form.levelMinScoreRequired'),
        },
      ],
      maxScore: [
        {
          required: true,
          message: t('categoryManagement.form.levelMaxScoreRequired'),
        },
      ],
      levelType: [
        {
          required: true,
          message: t('categoryManagement.form.levelTypeRequired'),
        },
      ],
    }

    // Validate each field
    for (const [field, rules] of Object.entries(levelValidationRules)) {
      const value = levelFormValues[field]
      for (const rule of rules) {
        if (rule.required && !value) {
          message.error(rule.message)
          return
        }
        if (rule.min && value && value.length < rule.min) {
          message.error(rule.message)
          return
        }
        if (rule.max && value && value.length > rule.max) {
          message.error(rule.message)
          return
        }
        if (rule.pattern && value && !rule.pattern.test(value)) {
          message.error(rule.message)
          return
        }
      }
    }

    // Additional validations
    if (levelFormValues.minScore >= levelFormValues.maxScore) {
      message.error(t('categoryManagement.form.levelMinScoreLessThanMax'))
      return
    }

    const currentLevels = form.getFieldValue('levels') || []

    // Check duplicate code
    const isDuplicateCode = currentLevels.some(
      (level, index) =>
        level.code === levelFormValues.code && index !== state.editingLevelIndex
    )

    if (isDuplicateCode) {
      message.error(t('categoryManagement.messages.duplicateLevelCode'))
      return
    }

    // Trim and prepare level data
    const levelData = {
      ...levelFormValues,
      label: levelFormValues.label?.trim(),
      code: levelFormValues.code?.trim().toUpperCase(),
      description: levelFormValues.description?.trim() || null,
      symptomsDescription: levelFormValues.symptomsDescription?.trim() || null,
      interventionRequired:
        levelFormValues.interventionRequired?.trim() || null,
    }

    let newLevels
    if (state.editingLevelIndex !== null) {
      newLevels = [...currentLevels]
      newLevels[state.editingLevelIndex] = levelData
      message.success(t('categoryManagement.messages.levelEditSuccess'))
    } else {
      newLevels = [...currentLevels, levelData]
      message.success(t('categoryManagement.messages.levelAddSuccess'))
    }

    form.setFieldsValue({ levels: newLevels })

    // Clear level form fields
    form.setFieldsValue({
      levelLabel: '',
      levelCode: '',
      levelDescription: '',
      levelSymptomsDescription: '',
      levelInterventionRequired: '',
      levelMinScore: null,
      levelMaxScore: null,
      levelType: 'MID',
    })

    updateState({
      levelModalVisible: false,
      editingLevelIndex: null,
    })
  }, [form, state.editingLevelIndex, t, updateState])

  const handleLevelCancel = useCallback(() => {
    // Clear level form fields
    form.setFieldsValue({
      levelLabel: '',
      levelCode: '',
      levelDescription: '',
      levelSymptomsDescription: '',
      levelInterventionRequired: '',
      levelMinScore: null,
      levelMaxScore: null,
      levelType: 'MID',
    })

    updateState({
      levelModalVisible: false,
      editingLevelIndex: null,
    })
  }, [form, updateState])

  const addQuickLevels = useCallback(() => {
    const categoryMinScore = minScore || 0
    const categoryMaxScore = maxScore || 100
    const scoreRange = categoryMaxScore - categoryMinScore
    const stepSize = Math.floor(scoreRange / 4)

    const quickLevels = [
      {
        label: t('categoryManagement.form.quickLevels.low'),
        code: 'LOW',
        description: t('categoryManagement.form.quickLevels.lowDescription'),
        symptomsDescription: t(
          'categoryManagement.form.quickLevels.lowSymptoms'
        ),
        interventionRequired: t(
          'categoryManagement.form.quickLevels.lowIntervention'
        ),
        minScore: categoryMinScore,
        maxScore: categoryMinScore + stepSize,
        levelType: 'LOW',
      },
      {
        label: t('categoryManagement.form.quickLevels.medium'),
        code: 'MEDIUM',
        description: t('categoryManagement.form.quickLevels.mediumDescription'),
        symptomsDescription: t(
          'categoryManagement.form.quickLevels.mediumSymptoms'
        ),
        interventionRequired: t(
          'categoryManagement.form.quickLevels.mediumIntervention'
        ),
        minScore: categoryMinScore + stepSize + 1,
        maxScore: categoryMinScore + stepSize * 2,
        levelType: 'MID',
      },
      {
        label: t('categoryManagement.form.quickLevels.high'),
        code: 'HIGH',
        description: t('categoryManagement.form.quickLevels.highDescription'),
        symptomsDescription: t(
          'categoryManagement.form.quickLevels.highSymptoms'
        ),
        interventionRequired: t(
          'categoryManagement.form.quickLevels.highIntervention'
        ),
        minScore: categoryMinScore + stepSize * 2 + 1,
        maxScore: categoryMinScore + stepSize * 3,
        levelType: 'HIGH',
      },
      {
        label: t('categoryManagement.form.quickLevels.critical'),
        code: 'CRITICAL',
        description: t(
          'categoryManagement.form.quickLevels.criticalDescription'
        ),
        symptomsDescription: t(
          'categoryManagement.form.quickLevels.criticalSymptoms'
        ),
        interventionRequired: t(
          'categoryManagement.form.quickLevels.criticalIntervention'
        ),
        minScore: categoryMinScore + stepSize * 3 + 1,
        maxScore: categoryMaxScore,
        levelType: 'CRITICAL',
      },
    ]

    form.setFieldsValue({ levels: quickLevels })
    message.success(t('categoryManagement.messages.quickLevelsAdded'))
  }, [form, t, minScore, maxScore])

  const removeLevel = useCallback(
    index => {
      const currentLevels = form.getFieldValue('levels') || []
      const newLevels = currentLevels.filter((_, i) => i !== index)
      form.setFieldsValue({ levels: newLevels })
      message.success(t('categoryManagement.messages.levelRemoved'))
    },
    [form, t]
  )

  // Memoized helper functions
  const getLevelTypeColor = useCallback(levelType => {
    return LEVEL_TYPE_CONFIG[levelType]?.color || 'default'
  }, [])

  const getLevelTypeIcon = useCallback(levelType => {
    const IconComponent =
      LEVEL_TYPE_CONFIG[levelType]?.icon || InfoCircleOutlined
    return <IconComponent />
  }, [])

  // Memoized level summary
  const levelSummary = useMemo(() => {
    const summary = {}
    levelTypeOptions.forEach(option => {
      const count = levels?.filter(
        level => level.levelType === option.value
      ).length
      if (count > 0) {
        summary[option.value] = { count, ...option }
      }
    })
    return summary
  }, [levels, levelTypeOptions])

  // Initialize level form when editing
  useEffect(() => {
    if (state.levelModalVisible && state.editingLevelIndex !== null) {
      const currentLevels = form.getFieldValue('levels') || []
      const level = currentLevels[state.editingLevelIndex]
      if (level) {
        form.setFieldsValue({
          levelLabel: level.label,
          levelCode: level.code,
          levelDescription: level.description,
          levelSymptomsDescription: level.symptomsDescription,
          levelInterventionRequired: level.interventionRequired,
          levelMinScore: level.minScore,
          levelMaxScore: level.maxScore,
          levelType: level.levelType,
        })
      }
    } else if (state.levelModalVisible && state.editingLevelIndex === null) {
      // Set default values for new level
      form.setFieldsValue({
        levelLabel: '',
        levelCode: '',
        levelDescription: '',
        levelSymptomsDescription: '',
        levelInterventionRequired: '',
        levelMinScore: 0,
        levelMaxScore: 100,
        levelType: 'MID',
      })
    }
  }, [state.levelModalVisible, state.editingLevelIndex, form])

  if (state.detailLoading) {
    return (
      <Modal open={visible} footer={null} closable={false} centered width={400}>
        <div className="text-center py-8">
          <Spin
            spinning={true}
            tip={t('categoryManagement.loadingDetails')}
            size="large"
          />
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Modal
        title={getModalTitle()}
        open={visible}
        onCancel={handleCancel}
        footer={
          <div className="flex justify-end">
            <Space>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
              {!isView && (
                <Button
                  type="primary"
                  onClick={handleOk}
                  loading={state.loading}
                >
                  {isEdit ? t('common.save') : t('common.create')}
                </Button>
              )}
            </Space>
          </div>
        }
        width={1200}
        style={{ top: '5%' }}
        styles={{
          body: {
            height: '75vh',
          },
        }}
        className={isDarkMode ? 'dark-modal' : ''}
        destroyOnClose
      >
        <Row gutter={24} style={{ height: '100%' }}>
          {/* Left Column - Category Information */}
          <Col span={12} style={{ height: '100%', overflowY: 'auto' }}>
            <Form
              form={form}
              layout="vertical"
              disabled={isView}
              style={{
                height: '100%',
                paddingRight: '5px',
              }}
            >
              <Card
                title={
                  <Space>
                    <InfoCircleOutlined className="text-blue-500" />
                    <Text strong>{t('categoryManagement.form.basicInfo')}</Text>
                  </Space>
                }
                size="small"
                className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                <Row gutter={16}>
                  <Col span={16}>
                    <Form.Item
                      label={t('categoryManagement.form.name')}
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: t('categoryManagement.form.nameRequired'),
                        },
                        {
                          min: 2,
                          message: t('categoryManagement.form.nameMinLength'),
                        },
                        {
                          max: 100,
                          message: t('categoryManagement.form.nameMaxLength'),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          'categoryManagement.form.namePlaceholder'
                        )}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.code')}
                      name="code"
                      rules={[
                        {
                          required: true,
                          message: t('categoryManagement.form.codeRequired'),
                        },
                        {
                          pattern: /^[A-Z0-9_]+$/,
                          message: t('categoryManagement.form.codePattern'),
                        },
                        {
                          min: 2,
                          message: t('categoryManagement.form.codeMinLength'),
                        },
                        {
                          max: 20,
                          message: t('categoryManagement.form.codeMaxLength'),
                        },
                      ]}
                    >
                      <Input
                        placeholder={t(
                          'categoryManagement.form.codePlaceholder'
                        )}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      label={t('categoryManagement.form.description')}
                      name="description"
                      rules={[
                        {
                          max: 500,
                          message: t(
                            'categoryManagement.form.descriptionMaxLength'
                          ),
                        },
                      ]}
                    >
                      <TextArea
                        placeholder={t(
                          'categoryManagement.form.descriptionPlaceholder'
                        )}
                        rows={3}
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>

              <Card
                title={
                  <Space>
                    <TrophyOutlined className="text-green-500" />
                    <Text strong>
                      {t('categoryManagement.form.questionSettings')}
                    </Text>
                  </Space>
                }
                size="small"
                className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.questionLength')}
                      name="questionLength"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.questionLengthRequired'
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={100}
                        placeholder={t(
                          'categoryManagement.form.questionLengthPlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.severityWeight')}
                      name="severityWeight"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.severityWeightRequired'
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        min={0.1}
                        max={10}
                        step={0.1}
                        placeholder={t(
                          'categoryManagement.form.severityWeightPlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.isActive')}
                      name="isActive"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren={t('categoryManagement.form.active')}
                        unCheckedChildren={t(
                          'categoryManagement.form.inactive'
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {isLimited && (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        label={t('categoryManagement.form.questionCount')}
                        name="questionCount"
                        rules={[
                          {
                            required: isLimited,
                            message: t(
                              'categoryManagement.form.questionCountRequired'
                            ),
                          },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={100}
                          placeholder={t(
                            'categoryManagement.form.questionCountPlaceholder'
                          )}
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </Card>

              <Card
                title={
                  <Space>
                    <AlertOutlined className="text-orange-500" />
                    <Text strong>
                      {t('categoryManagement.form.scoreSettings')}
                    </Text>
                  </Space>
                }
                size="small"
                className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.minScore')}
                      name="minScore"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.minScoreRequired'
                          ),
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const maxScore = getFieldValue('maxScore')
                            if (!value || !maxScore || value < maxScore) {
                              return Promise.resolve()
                            }
                            return Promise.reject(
                              new Error(
                                t('categoryManagement.form.minScoreLessThanMax')
                              )
                            )
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={1073741824}
                        placeholder={t(
                          'categoryManagement.form.minScorePlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.maxScore')}
                      name="maxScore"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.maxScoreRequired'
                          ),
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const minScore = getFieldValue('minScore')
                            if (!value || !minScore || value > minScore) {
                              return Promise.resolve()
                            }
                            return Promise.reject(
                              new Error(
                                t(
                                  'categoryManagement.form.maxScoreGreaterThanMin'
                                )
                              )
                            )
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={1073741824}
                        placeholder={t(
                          'categoryManagement.form.maxScorePlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.isSum')}
                      name="isSum"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren={t('categoryManagement.form.yes')}
                        unCheckedChildren={t('categoryManagement.form.no')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.isLimited')}
                      name="isLimited"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren={t('categoryManagement.form.yes')}
                        unCheckedChildren={t('categoryManagement.form.no')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Form>
          </Col>

          {/* Right Column - Levels List */}
          <Col span={12} style={{ height: '100%', overflowY: 'auto' }}>
            <div style={{ height: '100%', paddingLeft: '5px' }}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined className="text-purple-500" />
                    <Text strong>{t('categoryManagement.form.levels')}</Text>
                    <Badge count={levels?.length} showZero />
                  </Space>
                }
                size="small"
                className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                extra={
                  !isView && (
                    <Space>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addLevel}
                        size="small"
                      >
                        {t('categoryManagement.form.addLevel')}
                      </Button>
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addQuickLevels}
                        size="small"
                        disabled={!minScore || !maxScore}
                        title={
                          !minScore || !maxScore
                            ? t(
                                'categoryManagement.form.quickLevelsRequireScores'
                              )
                            : ''
                        }
                      >
                        {t('categoryManagement.form.addQuickLevels')}
                      </Button>
                    </Space>
                  )
                }
              >
                {levels?.length === 0 ? (
                  <Empty
                    description={t('categoryManagement.form.noLevels')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <div>
                    {/* Level Summary */}
                    <div
                      className={`mb-4 p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}
                    >
                      <Text strong className="mb-2 block">
                        {t('categoryManagement.form.levelSummary')}:{' '}
                        {levels?.length} {t('categoryManagement.form.levels')}
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(levelSummary).map(
                          ({ value, label, count }) => (
                            <Tag
                              key={value}
                              color={getLevelTypeColor(value)}
                              icon={getLevelTypeIcon(value)}
                            >
                              {label}: {count}
                            </Tag>
                          )
                        )}
                      </div>
                    </div>

                    {/* Level Cards */}
                    <div>
                      {!isView && levels?.length > 0 && (
                        <div
                          className={`mb-3 p-2 text-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-50 text-blue-600'} rounded text-xs`}
                        >
                          <Text type="secondary">
                            💡 {t('categoryManagement.form.clickToEdit')}
                          </Text>
                        </div>
                      )}
                      {levels?.map((level, index) => (
                        <LevelCard
                          key={`${level.code}-${index}`}
                          level={level}
                          index={index}
                          isView={isView}
                          isDarkMode={isDarkMode}
                          onEdit={editLevel}
                          onDelete={removeLevel}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </Col>
        </Row>
      </Modal>

      {/* Level Form Modal */}
      <Modal
        title={
          <Space>
            {state.editingLevelIndex !== null ? (
              <>
                <InfoCircleOutlined className="text-blue-500" />
                <Text strong>{t('categoryManagement.form.editLevel')}</Text>
                <Tag color="blue" size="small">
                  {t('categoryManagement.form.level')}{' '}
                  {state.editingLevelIndex + 1}
                </Tag>
              </>
            ) : (
              <>
                <PlusOutlined className="text-green-500" />
                <Text strong>{t('categoryManagement.form.addLevel')}</Text>
              </>
            )}
          </Space>
        }
        open={state.levelModalVisible}
        onCancel={handleLevelCancel}
        footer={
          <div className="flex justify-end">
            <Space>
              <Button onClick={handleLevelCancel}>{t('common.cancel')}</Button>
              <Button type="primary" onClick={handleLevelSubmit}>
                {state.editingLevelIndex !== null
                  ? t('common.save')
                  : t('common.create')}
              </Button>
            </Space>
          </div>
        }
        width={800}
        className={isDarkMode ? 'dark-modal' : ''}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="levelLabel"
                label={t('categoryManagement.form.levelLabel')}
              >
                <Input
                  placeholder={t(
                    'categoryManagement.form.levelLabelPlaceholder'
                  )}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="levelCode"
                label={t('categoryManagement.form.levelCode')}
              >
                <Input
                  placeholder={t(
                    'categoryManagement.form.levelCodePlaceholder'
                  )}
                  style={{ textTransform: 'uppercase' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="levelDescription"
                label={t('categoryManagement.form.levelDescription')}
              >
                <TextArea
                  placeholder={t(
                    'categoryManagement.form.levelDescriptionPlaceholder'
                  )}
                  rows={2}
                  showCount
                  maxLength={300}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="levelSymptomsDescription"
                label={t('categoryManagement.form.symptomsDescription')}
              >
                <TextArea
                  placeholder={t(
                    'categoryManagement.form.symptomsDescriptionPlaceholder'
                  )}
                  rows={2}
                  showCount
                  maxLength={300}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="levelInterventionRequired"
                label={t('categoryManagement.form.interventionRequired')}
              >
                <TextArea
                  placeholder={t(
                    'categoryManagement.form.interventionRequiredPlaceholder'
                  )}
                  rows={2}
                  showCount
                  maxLength={300}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="levelMinScore"
                label={t('categoryManagement.form.levelMinScore')}
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder={t(
                    'categoryManagement.form.levelMinScorePlaceholder'
                  )}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="levelMaxScore"
                label={t('categoryManagement.form.levelMaxScore')}
              >
                <InputNumber
                  min={0}
                  max={10000}
                  placeholder={t(
                    'categoryManagement.form.levelMaxScorePlaceholder'
                  )}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="levelType"
                label={t('categoryManagement.form.levelType')}
              >
                <Select
                  placeholder={t(
                    'categoryManagement.form.levelTypePlaceholder'
                  )}
                >
                  {levelTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {getLevelTypeIcon(option.value)}
                        {option.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default React.memo(CategoryModal)

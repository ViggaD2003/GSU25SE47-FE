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
  Switch,
  InputNumber,
  Select,
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
} from '@ant-design/icons'
import { categoriesAPI } from '@/services/categoryApi'

const { Text, Title } = Typography
const { TextArea } = Input
const { Option } = Select

// Constants moved outside component to prevent recreation
const LEVEL_TYPE_OPTIONS = [
  { value: 'LOW', label: 'categoryManagement.form.levelTypes.low' },
  { value: 'MODERATE', label: 'categoryManagement.form.levelTypes.medium' },
  { value: 'HIGH', label: 'categoryManagement.form.levelTypes.high' },
  { value: 'CRITICAL', label: 'categoryManagement.form.levelTypes.critical' },
]

const LEVEL_TYPE_CONFIG = {
  LOW: { color: 'green' },
  MODERATE: { color: 'yellow' },
  HIGH: { color: 'orange' },
  CRITICAL: { color: 'red' },
}

const LevelCard = React.memo(
  ({ level, index, isView, isDarkMode, onEdit, onDelete, t }) => {
    const { color } = LEVEL_TYPE_CONFIG[level?.levelType] || {}

    if (isView) {
      return (
        <Card
          size="small"
          style={{ marginBottom: '10px' }}
          className={`mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}
          title={
            <Space>
              <Text strong>{level?.label || 'Unknown'}</Text>
              <Tag color={color} size="small">
                {level?.code || 'N/A'}
              </Tag>
            </Space>
          }
        >
          <Descriptions size="small" column={1}>
            <Descriptions.Item
              label={t('categoryManagement.form.levelDescription')}
            >
              {level?.description || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('categoryManagement.form.symptomsDescription')}
            >
              {level?.symptomsDescription || '-'}
            </Descriptions.Item>
            <Descriptions.Item
              label={t('categoryManagement.form.interventionRequired')}
            >
              {level?.interventionRequired || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('categoryManagement.form.scoreRange')}>
              {level?.minScore || 0} - {level?.maxScore || 0}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )
    }

    return (
      <Card
        size="small"
        style={{ marginBottom: '10px' }}
        className={`mb-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'} hover:shadow-md transition-shadow cursor-pointer`}
        title={
          <Space>
            <Text strong>{level?.label || 'Unknown'}</Text>
            <Tag color={color} size="small">
              {level?.code || 'N/A'}
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
            {level?.description || '-'}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {t('categoryManagement.form.scoreRange')}: {level?.minScore || 0} -{' '}
            {level?.maxScore || 0}
          </Text>
          {level?.symptomsDescription && (
            <Text type="secondary" style={{ fontSize: '11px' }}>
              <strong>
                {t('categoryManagement.form.symptomsDescription')}:
              </strong>{' '}
              {level.symptomsDescription}
            </Text>
          )}
          {level?.interventionRequired && (
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

// Separate Level Modal Component to fix form connection issue
const LevelModal = React.memo(
  ({
    visible,
    onCancel,
    onSubmit,
    editingLevel,
    t,
    isDarkMode,
    levelTypeOptions,
    getLevelTypeIcon,
  }) => {
    const [levelForm] = Form.useForm()

    // Reset form when modal opens/closes
    useEffect(() => {
      if (visible) {
        if (editingLevel) {
          levelForm.setFieldsValue({
            label: editingLevel.label,
            code: editingLevel.code,
            description: editingLevel.description,
            symptomsDescription: editingLevel.symptomsDescription,
            interventionRequired: editingLevel.interventionRequired,
            minScore: editingLevel.minScore,
            maxScore: editingLevel.maxScore,
            levelType: editingLevel.levelType,
          })
        } else {
          levelForm.resetFields()
          levelForm.setFieldsValue({
            levelType: 'LOW',
            minScore: 0,
            maxScore: 3,
          })
        }
      }
    }, [visible, editingLevel, levelForm])

    const handleSubmit = async () => {
      try {
        const values = await levelForm.validateFields()
        onSubmit(values)
      } catch (error) {
        console.error('Level form validation failed:', error)
      }
    }

    const handleCancel = () => {
      levelForm.resetFields()
      onCancel()
    }

    return (
      <Modal
        title={
          <Space>
            {editingLevel ? (
              <>
                <InfoCircleOutlined className="text-blue-500" />
                <Text strong>{t('categoryManagement.form.editLevel')}</Text>
              </>
            ) : (
              <>
                <PlusOutlined className="text-green-500" />
                <Text strong>{t('categoryManagement.form.addLevel')}</Text>
              </>
            )}
          </Space>
        }
        open={visible}
        onCancel={handleCancel}
        footer={
          <div className="flex justify-end">
            <Space>
              <Button onClick={handleCancel}>{t('common.cancel')}</Button>
              <Button type="primary" onClick={handleSubmit}>
                {editingLevel ? t('common.save') : t('common.create')}
              </Button>
            </Space>
          </div>
        }
        width={800}
        className={isDarkMode ? 'dark-modal' : ''}
        destroyOnHidden
      >
        <Form
          form={levelForm}
          layout="vertical"
          initialValues={{
            levelType: 'LOW',
            minScore: 0,
            maxScore: 3,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="label"
                label={t('categoryManagement.form.levelLabel')}
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.levelLabelRequired'),
                  },
                  {
                    min: 2,
                    message: t('categoryManagement.form.levelLabelMinLength'),
                  },
                  {
                    max: 50,
                    message: t('categoryManagement.form.levelLabelMaxLength'),
                  },
                  {
                    whitespace: true,
                    message: t(
                      'categoryManagement.form.levelLabelNoWhitespace'
                    ),
                  },
                ]}
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
                name="code"
                label={t('categoryManagement.form.levelCode')}
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.levelCodeRequired'),
                  },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message: t('categoryManagement.form.levelCodePattern'),
                  },
                  {
                    min: 2,
                    message: t('categoryManagement.form.levelCodeMinLength'),
                  },
                  {
                    max: 20,
                    message: t('categoryManagement.form.levelCodeMaxLength'),
                  },
                ]}
              >
                <Input
                  placeholder={t(
                    'categoryManagement.form.levelCodePlaceholder'
                  )}
                  style={{ textTransform: 'uppercase' }}
                  onChange={e => {
                    e.target.value = e.target.value.toUpperCase()
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="description"
                label={t('categoryManagement.form.levelDescription')}
                rules={[
                  {
                    max: 300,
                    message: t(
                      'categoryManagement.form.levelDescriptionMaxLength'
                    ),
                  },
                ]}
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
                name="symptomsDescription"
                label={t('categoryManagement.form.symptomsDescription')}
                rules={[
                  {
                    max: 300,
                    message: t(
                      'categoryManagement.form.symptomsDescriptionMaxLength'
                    ),
                  },
                ]}
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
                name="interventionRequired"
                label={t('categoryManagement.form.interventionRequired')}
                rules={[
                  {
                    max: 300,
                    message: t(
                      'categoryManagement.form.interventionRequiredMaxLength'
                    ),
                  },
                ]}
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
                name="minScore"
                label={t('categoryManagement.form.levelMinScore')}
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.levelMinScoreRequired'),
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: t('categoryManagement.form.levelMinScoreMin'),
                  },
                  {
                    type: 'number',
                    max: 1000,
                    message: t('categoryManagement.form.levelMinScoreMax'),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const levelMaxScore = getFieldValue('maxScore')
                      if (!value || !levelMaxScore || value < levelMaxScore) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error(
                          t('categoryManagement.form.levelMinScoreLessThanMax')
                        )
                      )
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  max={1000}
                  placeholder={t(
                    'categoryManagement.form.levelMinScorePlaceholder'
                  )}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="maxScore"
                label={t('categoryManagement.form.levelMaxScore')}
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.levelMaxScoreRequired'),
                  },
                  {
                    type: 'number',
                    min: 0,
                    message: t('categoryManagement.form.levelMaxScoreMin'),
                  },
                  {
                    type: 'number',
                    max: 1000,
                    message: t('categoryManagement.form.levelMaxScoreMax'),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const levelMinScore = getFieldValue('minScore')
                      if (!value || !levelMinScore || value > levelMinScore) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error(
                          t(
                            'categoryManagement.form.levelMaxScoreGreaterThanMin'
                          )
                        )
                      )
                    },
                  }),
                ]}
              >
                <InputNumber
                  min={0}
                  max={1000}
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
                rules={[
                  {
                    required: true,
                    message: t('categoryManagement.form.levelTypeRequired'),
                  },
                ]}
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
  message,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()

  // Only one form for main category
  const [form] = Form.useForm()

  // Unified state management - BỎ levels ra khỏi state, dùng form values thay thế
  const [state, setState] = useState({
    loading: false,
    detailLoading: false,
    detailedCategory: null,
    levelModalVisible: false,
    editingLevelIndex: null,
    levels: [], // State riêng cho levels để đảm bảo reactivity
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

  // Optimized state updates
  const updateState = useCallback(updates => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Reset all forms
  const resetAllForms = useCallback(() => {
    form.resetFields()
    updateState({
      detailedCategory: null,
      levelModalVisible: false,
      editingLevelIndex: null,
      levels: [],
    })
  }, [form, updateState])

  // Fetch category details for view mode
  useEffect(() => {
    let isMounted = true

    const fetchCategoryDetails = async () => {
      const isViewOrEdit = isView || isEdit

      if (visible && isViewOrEdit && selectedCategory?.id) {
        try {
          updateState({ detailLoading: true })
          const response = await categoriesAPI.getCategoryLevels(
            selectedCategory.id
          )
          if (isMounted) {
            const categoryWithLevels = { ...selectedCategory, levels: response }
            updateState({
              detailedCategory: categoryWithLevels,
              detailLoading: false,
              levels: response || [],
            })
          }
        } catch (error) {
          console.error('Failed to fetch category details:', error)
          if (isMounted) {
            message?.error(t('categoryManagement.messages.fetchDetailError'))
            updateState({ detailLoading: false })
          }
        }
      } else if (!visible) {
        // Reset when modal is closed
        if (isMounted) {
          resetAllForms()
        }
      }
    }

    fetchCategoryDetails()

    return () => {
      isMounted = false
    }
  }, [
    visible,
    isView,
    isEdit,
    selectedCategory?.id,
    t,
    updateState,
    resetAllForms,
  ])

  // Form initialization - CẢI THIỆN CÁCH SET FORM VALUES
  useEffect(() => {
    if (!visible) return

    if (selectedCategory) {
      const categoryData =
        isView || isEdit
          ? state.detailedCategory || selectedCategory
          : selectedCategory

      const formData = {
        name: categoryData.name || '',
        code: categoryData.code || '',
        description: categoryData.description || '',
        isSum: categoryData.isSum ?? true,
        isLimited: categoryData.isLimited ?? true,
        questionLength: categoryData.questionLength ?? 0,
        severityWeight: categoryData.severityWeight ?? 0,
        isActive: categoryData.isActive ?? true,
        maxScore: categoryData.maxScore ?? 0,
        minScore: categoryData.minScore ?? 0,
        levels: categoryData.levels || [],
      }

      form.setFieldsValue(formData)
      // Đồng bộ levels với state
      updateState({ levels: categoryData.levels || [] })
    } else {
      // Reset form with default values for new category
      form.resetFields()
      const defaultValues = {
        isSum: true,
        isLimited: true,
        isActive: true,
        levels: [],
      }
      form.setFieldsValue(defaultValues)
      updateState({ levels: [] })
    }
  }, [
    visible,
    selectedCategory,
    state.detailedCategory,
    form,
    isView,
    updateState,
  ])

  // Comprehensive validation functions
  const validateLevelScoreRanges = useCallback(
    levels => {
      if (!levels || levels.length === 0) return { isValid: true }

      // Sort levels by minScore for validation
      const sortedLevels = [...levels].sort((a, b) => a.minScore - b.minScore)

      for (let i = 0; i < sortedLevels.length; i++) {
        const level = sortedLevels[i]

        // Check if level minScore >= maxScore
        if (level.minScore >= level.maxScore) {
          return {
            isValid: false,
            message: t('categoryManagement.messages.invalidLevelScoreRange', {
              level: level.label || level.code,
            }),
          }
        }

        // Check for overlapping ranges
        if (i > 0) {
          const prevLevel = sortedLevels[i - 1]
          if (level.minScore <= prevLevel.maxScore) {
            return {
              isValid: false,
              message: t('categoryManagement.messages.overlappingScores', {
                level1: prevLevel.label || prevLevel.code,
                level2: level.label || level.code,
              }),
            }
          }
        }
      }

      return { isValid: true }
    },
    [t]
  )

  const validateLevelCodes = useCallback(
    levels => {
      if (!levels || levels.length === 0) return { isValid: true }

      const codes = levels
        .map(level => level.code?.toUpperCase())
        .filter(Boolean)
      const uniqueCodes = new Set(codes)

      if (codes.length !== uniqueCodes.size) {
        const duplicates = codes.filter(
          (code, index) => codes.indexOf(code) !== index
        )
        return {
          isValid: false,
          message: t('categoryManagement.messages.duplicateLevelCodes', {
            codes: duplicates.join(', '),
          }),
        }
      }

      return { isValid: true }
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

      // Sử dụng levels từ state thay vì form values
      const levelsToValidate = state.levels

      // Additional comprehensive validation
      const scoreRangeValidation = validateLevelScoreRanges(levelsToValidate)
      if (!scoreRangeValidation.isValid) {
        message?.error(scoreRangeValidation.message)
        updateState({ loading: false })
        return
      }

      const codeValidation = validateLevelCodes(levelsToValidate)
      if (!codeValidation.isValid) {
        message?.error(codeValidation.message)
        updateState({ loading: false })
        return
      }

      // Validate category score range (if both values are provided)
      if (
        values.minScore !== null &&
        values.maxScore !== null &&
        values.minScore >= values.maxScore
      ) {
        message?.error(
          t('categoryManagement.messages.categoryScoreRangeInvalid')
        )
        updateState({ loading: false })
        return
      }

      // Validate question count when limited
      if (
        values.isLimited &&
        (!values.questionLength || values.questionLength <= 0)
      ) {
        message?.error(t('categoryManagement.messages.questionCountRequired'))
        updateState({ loading: false })
        return
      }

      // Prepare clean data
      const categoryData = {
        name: values.name?.trim(),
        code: values.code?.trim().toUpperCase(),
        description: values.description?.trim() || null,
        isSum: values.isSum,
        isLimited: values.isLimited,
        questionLength: values.isLimited ? values.questionLength : null,
        severityWeight: values.severityWeight,
        isActive: values.isActive,
        maxScore: values.maxScore ?? 0,
        minScore: values.minScore ?? 0,
        levels: levelsToValidate.map(level => ({
          ...level,
          label: level.label?.trim(),
          code: level.code?.trim().toUpperCase(),
          description: level.description?.trim() || null,
          symptomsDescription: level.symptomsDescription?.trim() || null,
          interventionRequired: level.interventionRequired?.trim() || null,
        })),
      }
      await onOk(selectedCategory?.id, categoryData)

      resetAllForms()
    } catch (error) {
      console.error('Form submission failed:', error)
      message?.error(t('categoryManagement.messages.validationError'))
    } finally {
      updateState({ loading: false })
    }
  }, [
    isView,
    onCancel,
    form,
    onOk,
    t,
    updateState,
    validateLevelScoreRanges,
    validateLevelCodes,
    resetAllForms,
    isEdit,
    state.levels,
  ])

  const handleCancel = useCallback(() => {
    resetAllForms()
    onCancel()
  }, [resetAllForms, onCancel])

  const getModalTitle = useCallback(() => {
    if (isView) return t('categoryManagement.modal.viewTitle')
    if (isEdit) return t('categoryManagement.modal.editTitle')
    return t('categoryManagement.modal.addTitle')
  }, [isView, isEdit, t])

  // Level management functions - SỬA LẠI CÁC HÀM NÀY
  const addLevel = useCallback(() => {
    updateState({
      editingLevelIndex: null,
      levelModalVisible: true,
    })
  }, [updateState])

  const editLevel = useCallback(
    index => {
      const level = state.levels[index]
      if (level) {
        updateState({
          editingLevelIndex: index,
          levelModalVisible: true,
        })
      }
    },
    [state.levels, updateState]
  )

  const handleLevelSubmit = useCallback(
    async levelValues => {
      try {
        // Additional level validation
        if (levelValues.minScore >= levelValues.maxScore) {
          message?.error(t('categoryManagement.form.levelMinScoreLessThanMax'))
          return
        }

        // Check duplicate code (excluding current editing level)
        const isDuplicateCode = state.levels.some(
          (level, index) =>
            level.code?.toUpperCase() === levelValues.code?.toUpperCase() &&
            index !== state.editingLevelIndex
        )

        if (isDuplicateCode) {
          message?.error(t('categoryManagement.messages.duplicateLevelCode'))
          return
        }

        // Clean and prepare level data
        const levelData = {
          label: levelValues.label?.trim(),
          code: levelValues.code?.trim().toUpperCase(),
          description: levelValues.description?.trim() || null,
          symptomsDescription: levelValues.symptomsDescription?.trim() || null,
          interventionRequired:
            levelValues.interventionRequired?.trim() || null,
          minScore: levelValues.minScore,
          maxScore: levelValues.maxScore,
          levelType: levelValues.levelType,
        }

        let newLevels
        if (state.editingLevelIndex !== null) {
          newLevels = [...state.levels]
          newLevels[state.editingLevelIndex] = levelData
          message?.success(t('categoryManagement.messages.levelEditSuccess'))
        } else {
          newLevels = [...state.levels, levelData]
          message?.success(t('categoryManagement.messages.levelAddSuccess'))
        }

        // Update cả state và form
        updateState({ levels: newLevels })
        form.setFieldsValue({ levels: newLevels })

        // Close level modal and reset
        updateState({
          levelModalVisible: false,
          editingLevelIndex: null,
        })
      } catch (error) {
        console.error('Level form validation failed:', error)
        message?.error(t('categoryManagement.messages.levelValidationError'))
      }
    },
    [state.levels, state.editingLevelIndex, t, form, updateState]
  )

  const handleLevelCancel = useCallback(() => {
    updateState({
      levelModalVisible: false,
      editingLevelIndex: null,
    })
  }, [updateState])

  const addQuickLevels = useCallback(() => {
    // Create default score ranges for quick levels (independent of category scores)
    const defaultMinScore = 0
    const defaultMaxScore = 100
    const stepSize = Math.floor((defaultMaxScore - defaultMinScore) / 4) // Divide into 4 ranges

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
        minScore: defaultMinScore,
        maxScore: defaultMinScore + stepSize,
        levelType: 'LOW',
      },
      {
        label: t('categoryManagement.form.quickLevels.medium'),
        code: 'MODERATE',
        description: t('categoryManagement.form.quickLevels.mediumDescription'),
        symptomsDescription: t(
          'categoryManagement.form.quickLevels.mediumSymptoms'
        ),
        interventionRequired: t(
          'categoryManagement.form.quickLevels.mediumIntervention'
        ),
        minScore: defaultMinScore + stepSize + 1,
        maxScore: defaultMinScore + stepSize * 2,
        levelType: 'MODERATE',
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
        minScore: defaultMinScore + stepSize * 2 + 1,
        maxScore: defaultMinScore + stepSize * 3,
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
        minScore: defaultMinScore + stepSize * 3 + 1,
        maxScore: defaultMaxScore,
        levelType: 'CRITICAL',
      },
    ]

    // Update cả state và form
    updateState({ levels: quickLevels })
    form.setFieldsValue({ levels: quickLevels })
    message?.success(t('categoryManagement.messages.quickLevelsAdded'))
  }, [form, t, updateState])

  const removeLevel = useCallback(
    index => {
      const newLevels = state.levels.filter((_, i) => i !== index)
      // Update cả state và form
      updateState({ levels: newLevels })
      form.setFieldsValue({ levels: newLevels })
      message?.success(t('categoryManagement.messages.levelRemoved'))
    },
    [state.levels, form, t, updateState]
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

  // Memoized level summary - SỬ DỤNG state.levels thay vì levels từ form
  const levelSummary = useMemo(() => {
    const summary = {}
    levelTypeOptions.forEach(option => {
      const count = state.levels?.filter(
        level => level.levelType === option.value
      ).length
      if (count > 0) {
        summary[option.value] = { count, ...option }
      }
    })
    return summary
  }, [state.levels, levelTypeOptions])

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
        destroyOnHidden
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
                        {
                          whitespace: true,
                          message: t(
                            'categoryManagement.form.nameNoWhitespace'
                          ),
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
                          pattern: /^[A-Z0-9_-]+$/,
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
                        onChange={e => {
                          e.target.value = e.target.value.toUpperCase()
                        }}
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
                  {/* <Col span={8}>
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
                        {
                          type: 'number',
                          min: 1,
                          message: t(
                            'categoryManagement.form.questionLengthMin'
                          ),
                        },
                        {
                          type: 'number',
                          max: 1000,
                          message: t(
                            'categoryManagement.form.questionLengthMax'
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={1000}
                        placeholder={t(
                          'categoryManagement.form.questionLengthPlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col> */}
                  <Col span={12}>
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
                        {
                          type: 'number',
                          min: 0.1,
                          message: t(
                            'categoryManagement.form.severityWeightMin'
                          ),
                        },
                        {
                          type: 'number',
                          max: 10,
                          message: t(
                            'categoryManagement.form.severityWeightMax'
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
                  <Col span={12}>
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
                <Row gutter={16}>
                  <Col span={12}>
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

                  <Col span={12}>
                    <Form.Item
                      label={t('categoryManagement.form.questionCount')}
                      name="questionLength"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.questionCountRequired'
                          ),
                        },
                        {
                          type: 'number',
                          min: 5,
                          message: t(
                            'categoryManagement.form.questionCountMin'
                          ),
                        },
                        {
                          type: 'number',
                          max: 50,
                          message: t(
                            'categoryManagement.form.questionCountMax'
                          ),
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder={t(
                          'categoryManagement.form.questionCountPlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                </Row>
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
                      label={t('categoryManagement.form.scoreRangeStart')}
                      name="minScore"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.minScoreRequired'
                          ),
                        },
                        {
                          type: 'number',
                          min: 0,
                          message: t('categoryManagement.form.minScoreMin'),
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
                        max={100}
                        placeholder={t(
                          'categoryManagement.form.minScorePlaceholder'
                        )}
                        className="w-full"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={t('categoryManagement.form.scoreRangeEnd')}
                      name="maxScore"
                      rules={[
                        {
                          required: true,
                          message: t(
                            'categoryManagement.form.maxScoreRequired'
                          ),
                        },
                        {
                          type: 'number',
                          min: 1,
                          message: t('categoryManagement.form.maxScoreMin'),
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
                        min={0}
                        max={100}
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
                    <Badge count={state.levels?.length} showZero />
                  </Space>
                }
                size="small"
                className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
                extra={
                  !isView &&
                  !isEdit && (
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
                        title={t(
                          'categoryManagement.form.addQuickLevelsTooltip'
                        )}
                      >
                        {t('categoryManagement.form.addQuickLevels')}
                      </Button>
                    </Space>
                  )
                }
              >
                {state.levels?.length === 0 ? (
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
                        {state.levels?.length}{' '}
                        {t('categoryManagement.form.levels')}
                      </Text>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(levelSummary || {}).map(
                          ({ value, label, count }) => (
                            <Tag
                              key={value || 'unknown'}
                              color={getLevelTypeColor(value)}
                              icon={getLevelTypeIcon(value)}
                            >
                              {label || 'Unknown'}: {count || 0}
                            </Tag>
                          )
                        )}
                      </div>
                    </div>

                    {/* Level Cards */}
                    <div>
                      {!isView && !isEdit && state.levels?.length > 0 && (
                        <div
                          className={`mb-3 p-2 text-center ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-50 text-blue-600'} rounded text-xs`}
                        >
                          <Text type="secondary">
                            💡 {t('categoryManagement.form.clickToEdit')}
                          </Text>
                        </div>
                      )}
                      {state.levels?.map((level, index) => (
                        <LevelCard
                          key={`${level?.code || 'unknown'}-${index}`}
                          level={level || {}}
                          index={index}
                          isView={isView || isEdit}
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

      {/* Level Modal Component */}
      <LevelModal
        visible={state.levelModalVisible}
        onCancel={handleLevelCancel}
        onSubmit={handleLevelSubmit}
        editingLevel={
          state.editingLevelIndex !== null
            ? state.levels[state.editingLevelIndex]
            : null
        }
        t={t}
        isDarkMode={isDarkMode}
        levelTypeOptions={levelTypeOptions}
        getLevelTypeIcon={getLevelTypeIcon}
      />
    </>
  )
}

export default React.memo(CategoryModal)

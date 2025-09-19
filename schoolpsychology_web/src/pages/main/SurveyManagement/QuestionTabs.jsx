import React, { useState, useEffect, useCallback } from 'react'
import {
  Form,
  Input,
  Checkbox,
  Button,
  Select,
  Row,
  Col,
  InputNumber,
  Tabs,
  Typography,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { QUESTION_TYPE } from '../../../constants/enums'
import { IMPROVED_SCORING_SYSTEM } from '../../../constants/improvedAssessmentScoring'
import { useTheme } from '../../../contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'

const { Option } = Select
const { Text } = Typography

const QuestionTabs = ({
  t,
  fields,
  add,
  remove,
  selectedCategory,
  messageApi,
}) => {
  const [activeKey, setActiveKey] = useState()
  const { isDarkMode } = useTheme()
  const { currentLanguage } = useLanguage()

  // Function to get current category data
  const getCurrentCategory = useCallback(() => {
    if (!selectedCategory) return null
    return selectedCategory
  }, [selectedCategory])

  // Function to validate question count for limited surveys
  const validateQuestionCount = useCallback(
    (currentCount, categoryData) => {
      if (!categoryData) return { isValid: true, message: null }

      const { isLimited, questionLength, code } = categoryData

      if (isLimited && questionLength !== null) {
        if (currentCount > questionLength) {
          return {
            isValid: false,
            message: t('questionTabs.message.questionLengthExceeded', {
              code: code,
              limit: questionLength,
              current: currentCount,
            }),
          }
        } else if (currentCount < questionLength) {
          return {
            isValid: false,
            message: t('questionTabs.message.questionLengthRequired', {
              code: code,
              limit: questionLength,
              current: currentCount,
            }),
          }
        }
      }

      return { isValid: true, message: null }
    },
    [t]
  )

  // Function to get category scoring range
  const getCategoryScoringRange = useCallback(() => {
    const category = getCurrentCategory()
    if (!category) {
      return { minScore: 0, maxScore: 3 } // Default range
    }

    // Use category's minScore and maxScore properties
    if (category.minScore !== undefined && category.maxScore !== undefined) {
      return { minScore: category.minScore, maxScore: category.maxScore }
    }

    // Fallback to default range
    return { minScore: 0, maxScore: 3 }
  }, [getCurrentCategory])

  // Function to generate answer text based on score
  const generateAnswerText = useCallback(
    (score, minScore, maxScore) => {
      const severityLevels = IMPROVED_SCORING_SYSTEM.SEVERITY_LEVELS
      const frequencyGuidelines =
        IMPROVED_SCORING_SYSTEM.ASSESSMENT_GUIDELINES.frequency
      const impairmentGuidelines =
        IMPROVED_SCORING_SYSTEM.ASSESSMENT_GUIDELINES.impairment

      // Normalize score to 0-5 range for text generation
      const normalizedScore = Math.round(
        ((score - minScore) * 3) / (maxScore - minScore)
      )
      const clampedScore = Math.max(0, Math.min(3, normalizedScore))

      // Get severity level text
      const severityText =
        severityLevels[clampedScore]?.label ||
        t('questionTabs.severity', { score: score })

      // Get frequency text
      const frequencyText =
        frequencyGuidelines[clampedScore] ||
        t('questionTabs.frequency', { score: score })

      // Get impairment text
      const impairmentText =
        impairmentGuidelines[clampedScore] ||
        t('questionTabs.impairment', { score: score })

      // For very small ranges (1-2 points), use simple labels
      if (maxScore - minScore <= 2) {
        if (score === minScore) return t('common.no')
        if (score === maxScore) return t('common.yes')
        return t('questionTabs.severity', { score: score })
      }

      // For small ranges (3-4 points), use basic severity labels
      if (maxScore - minScore <= 4) {
        if (currentLanguage === 'en') {
          if (clampedScore < 1) return 'Low'
          if (clampedScore < 2) return 'Moderate'
          if (clampedScore < 3) return 'High'
          return 'Critical'
        } else {
          if (clampedScore < 1) return 'Thấp'
          if (clampedScore < 2) return 'Vừa phải'
          if (clampedScore < 3) return 'Cao'
          return 'Nghiêm trọng'
        }
      }

      // For larger ranges, use more detailed text
      if (clampedScore <= 1) {
        return `${severityText} - ${frequencyText}`
      } else if (clampedScore <= 3) {
        return `${severityText} - ${impairmentText}`
      } else {
        return `${severityText} - ${frequencyText}`
      }
    },
    [t, currentLanguage]
  )

  // Function to generate answers based on minScore and maxScore
  const generateAnswers = useCallback(
    (minScore, maxScore) => {
      const answers = []
      const scoreRange = maxScore - minScore + 1

      for (let i = 0; i < scoreRange; i++) {
        const score = minScore + i
        const text = generateAnswerText(score, minScore, maxScore)
        answers.push({ text, score })
      }

      return answers
    },
    [generateAnswerText]
  )

  // Define addQuestion function before useEffect hooks that depend on it
  const addQuestion = useCallback(() => {
    const { minScore, maxScore } = getCategoryScoringRange()
    const answers = generateAnswers(minScore, maxScore)

    add({
      isRequired: true, // Always default to required
      questionType: QUESTION_TYPE.LINKERT_SCALE,
      answers: answers,
    })
  }, [add, getCategoryScoringRange, generateAnswers])

  // Tách logic thành các functions riêng biệt
  const updateQuestionAnswers = useCallback(
    answers => {
      fields.forEach((field, index) => {
        const form = field.field?.form
        if (form) {
          form.setFieldsValue({
            [`questions[${index}].answers`]: answers,
          })
        }
      })
    },
    [fields]
  )

  const adjustQuestionCount = useCallback(
    targetCount => {
      const currentCount = fields.length

      if (currentCount < targetCount) {
        // Add missing questions
        const questionsToAdd = targetCount - currentCount
        for (let i = 0; i < questionsToAdd; i++) {
          addQuestion()
        }
      } else if (currentCount > targetCount) {
        // Remove excess questions (keep the first ones)
        const questionsToRemove = currentCount - targetCount
        for (let i = 0; i < questionsToRemove; i++) {
          const lastField = fields[fields.length - 1 - i]
          if (lastField) {
            remove(lastField.key)
          }
        }
      }
    },
    [fields, addQuestion, remove]
  )

  // Cải thiện useEffect chính
  useEffect(() => {
    if (!selectedCategory) return

    try {
      const category = getCurrentCategory()
      const { isLimited, questionLength } = category || {}

      // Generate new answers based on category scoring
      const { minScore, maxScore } = getCategoryScoringRange()
      const answers = generateAnswers(minScore, maxScore)

      // Update existing questions with new answers
      if (fields.length > 0) {
        updateQuestionAnswers(answers)
      }

      // Handle question count for limited surveys
      if (isLimited) {
        adjustQuestionCount(questionLength)
      } else {
        // console.log('adjustQuestionCount')
        adjustQuestionCount(1)
      }
    } catch (error) {
      console.error('Error updating questions for category change:', error)
      messageApi?.error(t('questionTabs.message.failedToUpdateQuestions'))
    }
  }, [selectedCategory, t]) // Chỉ depend on selectedCategory

  // Watch for new fields being added and set active key to the newest tab
  useEffect(() => {
    if (fields.length > 0) {
      // Set active key to the last (newest) tab
      const lastField = fields[fields.length - 1]
      if (lastField) {
        setActiveKey(lastField.key.toString())
      }
    }
  }, [fields]) // Only depend on fields.length to avoid infinite loops

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      // Get category data for validation
      const category = getCurrentCategory()

      // Validate before adding
      const validation = validateQuestionCount(fields.length + 1, category)
      if (!validation.isValid) {
        messageApi.warning(validation.message)
        return
      }

      addQuestion()
    } else if (action === 'remove') {
      // Get category data for validation
      const category = getCurrentCategory()

      // For removal, we need to check if we can remove without violating constraints
      const newCount = fields.length - 1

      // Always allow removal if we have more than 1 question
      if (fields.length <= 1) {
        messageApi.warning(t('questionTabs.message.atLeastOneQuestionRequired'))
        return
      }

      // For limited surveys, check if removal would violate the constraint
      if (category && category.isLimited && category.questionLength !== null) {
        if (newCount < category.questionLength) {
          messageApi.warning(
            t('questionTabs.message.questionLengthRequired', {
              code: category.code,
              limit: category.questionLength,
              current: newCount,
            })
          )
          return
        }
      }

      console.log('Removing tab with key:', targetKey)
      console.log('Current fields:', fields)
      console.log('Remove function:', remove)

      // Proceed with removal
      // Find the field by key and use its name for removal
      const fieldToRemove = fields.find(
        field => field.key.toString() === targetKey.toString()
      )
      if (fieldToRemove) {
        console.log('Field to remove:', fieldToRemove)
        remove(fieldToRemove.name)
      } else {
        console.error('Field not found for key:', targetKey)
        messageApi.error(t('questionTabs.message.failedToRemoveQuestion'))
      }

      // Set active key to the previous tab if current tab is removed
      const currentIndex = fields.findIndex(
        field => field.key.toString() === targetKey.toString()
      )
      if (currentIndex > 0) {
        setActiveKey(fields[currentIndex - 1].key.toString())
      } else if (fields.length > 1) {
        setActiveKey(fields[1].key.toString())
      }
    }
  }

  const renderQuestionForm = (field, index) => {
    // Extract key and other properties to avoid spreading key prop
    const { key, ...fieldProps } = field

    return (
      <div key={key} style={{ padding: '16px 0' }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'text']}
              label={`${t('surveyManagement.form.question')} ${index + 1}`}
              rules={[
                {
                  required: true,
                  message: t('questionTabs.message.questionTextRequired'),
                },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder={t('questionTabs.form.questionTextPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'description']}
              label={t('questionTabs.form.questionDescription')}
            >
              <Input.TextArea
                rows={2}
                placeholder={t(
                  'questionTabs.form.questionDescriptionPlaceholder'
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16} className="flex items-end">
          <Col span={12}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'questionType']}
              label="Question Type"
              rules={[
                {
                  required: true,
                  message: 'Please select question type',
                },
              ]}
            >
              <Select placeholder="Select question type">
                {Object.values(QUESTION_TYPE).map(type => (
                  <Option key={type} value={type}>
                    {t(`surveyManagement.enums.questionType.${type}`)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'isRequired']}
              valuePropName="checked"
            >
              <Checkbox>Required</Checkbox>
            </Form.Item>
          </Col>
        </Row> */}

        {/* Answers Section */}
        <Form.List name={[field.name, 'answers']}>
          {(answerFields, { add: addAnswer, remove: removeAnswer }) => {
            const { minScore, maxScore } = getCategoryScoringRange()
            return (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{t('questionTabs.form.answers')}</Text>
                  {minScore !== maxScore && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      ({t('questionTabs.form.scoreRange')}: {minScore} -{' '}
                      {maxScore})
                    </Text>
                  )}
                  {minScore === maxScore && (
                    <Button
                      type="dashed"
                      onClick={() => {
                        const newScore = maxScore + 1
                        const newText = generateAnswerText(
                          newScore,
                          minScore,
                          newScore
                        )
                        addAnswer({ text: newText, score: newScore })
                      }}
                      icon={<PlusOutlined />}
                      style={{ marginLeft: 8 }}
                    >
                      Add Answer
                    </Button>
                  )}
                </div>
                {answerFields.map((answerField, _answerIndex) => {
                  // Extract key and other properties to avoid spreading key prop
                  const { key, ...answerFieldProps } = answerField

                  return (
                    <Row gutter={16} key={key} style={{ marginBottom: 8 }}>
                      <Col span={8}>
                        <Form.Item
                          {...answerFieldProps}
                          name={[answerField.name, 'text']}
                          rules={[
                            {
                              required: true,
                              message: t(
                                'questionTabs.form.answerTextRequired'
                              ),
                            },
                          ]}
                        >
                          <Input
                            placeholder={t(
                              'questionTabs.form.answerTextPlaceholder'
                            )}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...answerFieldProps}
                          name={[answerField.name, 'score']}
                          rules={[
                            {
                              required: true,
                              message: t('questionTabs.form.scoreRequired'),
                            },
                          ]}
                        >
                          <InputNumber
                            placeholder={t(
                              'questionTabs.form.scorePlaceholder'
                            )}
                            min={minScore}
                            max={maxScore + 10} // Allow some flexibility
                            style={{ width: '100%' }}
                            disabled={minScore !== maxScore} // Disable if only one score option
                          />
                        </Form.Item>
                      </Col>
                      {minScore === maxScore && answerFields.length > 2 && (
                        <Col span={2}>
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            onClick={() => removeAnswer(answerField.name)}
                            disabled={answerFields.length <= 1}
                          />
                        </Col>
                      )}
                    </Row>
                  )
                })}
              </div>
            )
          }}
        </Form.List>
      </div>
    )
  }

  return (
    <div>
      {/* Scoring Information */}
      {selectedCategory && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: isDarkMode ? '#1a3a1a' : '#f6ffed',
            border: `1px solid ${isDarkMode ? '#4caf50' : '#b7eb8f'}`,
            borderRadius: 6,
            color: isDarkMode ? '#e8f5e8' : '#000000d9',
          }}
        >
          <Text
            strong
            style={{
              color: isDarkMode ? '#e8f5e8' : '#000000d9',
            }}
          >
            {t('questionTabs.form.scoringSystemInformation')}
          </Text>
          <br />
          <Text
            type="secondary"
            style={{
              color: isDarkMode ? '#a0a0a0' : '#00000073',
            }}
          >
            {t('questionTabs.form.scoreRangeDesc')}:{' '}
            {getCategoryScoringRange().minScore} -{' '}
            {getCategoryScoringRange().maxScore}
            <br />
            {t(
              'questionTabs.form.answersWillBeAutomaticallyGeneratedBasedOnThisRange'
            )}
            . {t('questionTabs.form.manuallyEditTheTextAndScoresAsNeeded')}.
          </Text>

          {/* Question Limitations Information */}
          {(() => {
            const category = getCurrentCategory()
            if (!category) return null

            const { isLimited, questionLength, code } = category
            const validation = validateQuestionCount(fields.length, category)

            if (isLimited && questionLength) {
              return (
                <div style={{ marginTop: 8 }}>
                  <Text
                    strong
                    style={{
                      color: validation.isValid
                        ? isDarkMode
                          ? '#4caf50'
                          : '#52c41a'
                        : isDarkMode
                          ? '#ff6b6b'
                          : '#ff4d4f',
                    }}
                  >
                    {t('questionTabs.form.questionLimitations')}
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{
                      color: isDarkMode ? '#a0a0a0' : '#00000073',
                    }}
                  >
                    {t('questionTabs.form.questionLengthRequired', {
                      code: code,
                      limit: questionLength,
                    })}
                    <br />
                    {t('questionTabs.form.current', {
                      current: fields.length,
                      limit: questionLength,
                    })}
                    {!validation.isValid && (
                      <Text
                        type="danger"
                        style={{
                          display: 'block',
                          marginTop: 4,
                          color: isDarkMode ? '#ff6b6b' : '#ff4d4f',
                        }}
                      >
                        ⚠️ {validation.message}
                      </Text>
                    )}
                  </Text>
                </div>
              )
            }
            return null
          })()}
        </div>
      )}

      <Tabs
        type="editable-card"
        onChange={setActiveKey}
        activeKey={activeKey}
        onEdit={onEdit}
        items={fields.map((field, index) => {
          const category = getCurrentCategory()
          const canRemove =
            fields.length > 1 &&
            (!category ||
              !category.isLimited ||
              !category.questionLength ||
              fields.length > category.questionLength)

          return {
            label: `${t('questionTabs.question')} ${index + 1}`,
            key: field.key.toString(),
            children: renderQuestionForm(field, index),
            closable: canRemove,
          }
        })}
      />
    </div>
  )
}

export default QuestionTabs

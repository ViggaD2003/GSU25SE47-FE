import React, { useState, useEffect, useCallback } from 'react'
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  InputNumber,
  Tabs,
  Typography,
  Switch,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { QUESTION_TYPE } from '../../../constants/enums'
import { IMPROVED_SCORING_SYSTEM } from '../../../constants/improvedAssessmentScoring'
import { useTheme } from '../../../contexts/ThemeContext'

const { Option } = Select
const { Text } = Typography

const QuestionEditTabs = ({
  t,
  fields,
  add,
  remove,
  selectedCategory,
  messageApi,
  existingQuestions = [],
  form,
}) => {
  const [activeKey, setActiveKey] = useState()
  const [initialized, setInitialized] = useState(false)
  const { isDarkMode } = useTheme()

  // Function to get current category data
  const getCurrentCategory = useCallback(() => {
    if (!selectedCategory) return null
    return selectedCategory
  }, [selectedCategory])

  // Function to get category scoring range
  const getCategoryScoringRange = useCallback(() => {
    const category = getCurrentCategory()
    if (!category) {
      return { minScore: 0, maxScore: 3 } // Default range
    }

    if (category.minScore !== undefined && category.maxScore !== undefined) {
      return { minScore: category.minScore, maxScore: category.maxScore }
    }

    return { minScore: 0, maxScore: 3 }
  }, [getCurrentCategory])

  // Function to generate answer text based on score
  const generateAnswerText = useCallback((score, minScore, maxScore) => {
    const severityLevels = IMPROVED_SCORING_SYSTEM.SEVERITY_LEVELS
    const frequencyGuidelines =
      IMPROVED_SCORING_SYSTEM.ASSESSMENT_GUIDELINES.frequency
    const impairmentGuidelines =
      IMPROVED_SCORING_SYSTEM.ASSESSMENT_GUIDELINES.impairment

    const normalizedScore = Math.round(
      ((score - minScore) * 3) / (maxScore - minScore)
    )
    const clampedScore = Math.max(0, Math.min(3, normalizedScore))

    const severityText =
      severityLevels[clampedScore]?.label || `Severity ${score}`
    const frequencyText =
      frequencyGuidelines[clampedScore] || `Frequency ${score}`
    const impairmentText =
      impairmentGuidelines[clampedScore] || `Impairment ${score}`

    if (maxScore - minScore <= 2) {
      if (score === minScore) return 'No'
      if (score === maxScore) return 'Yes'
      return `Severity ${score}`
    }

    if (maxScore - minScore <= 4) {
      if (clampedScore < 1) return 'Low'
      if (clampedScore < 2) return 'Moderate'
      if (clampedScore < 3) return 'High'
      return 'Critical'
    }

    if (clampedScore <= 1) {
      return `${severityText} - ${frequencyText}`
    } else if (clampedScore <= 3) {
      return `${severityText} - ${impairmentText}`
    } else {
      return `${severityText} - ${frequencyText}`
    }
  }, [])

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

  // Count active questions
  const getActiveQuestionsCount = useCallback(() => {
    return fields.reduce((count, field) => {
      const isActive = form.getFieldValue(['questions', field.name, 'isActive'])
      return count + (isActive !== false ? 1 : 0) // Default to active if undefined
    }, 0)
  }, [fields, form])

  // Add new question function
  const addNewQuestion = useCallback(() => {
    const category = getCurrentCategory()
    if (!category) return

    const { isLimited, questionLength } = category

    if (isLimited) {
      const activeCount = getActiveQuestionsCount()
      console.log(
        'AddNewQuestion check - Active count:',
        activeCount,
        'Limit:',
        questionLength
      )

      if (activeCount >= questionLength) {
        messageApi.warning(
          `Không thể thêm câu hỏi. Danh mục này chỉ cho phép tối đa ${questionLength} câu hỏi active.`
        )
        return
      }
    }

    const { minScore, maxScore } = getCategoryScoringRange()
    const answers = generateAnswers(minScore, maxScore)

    add({
      isNew: true, // Mark as new question
      isActive: true,
      isRequired: true,
      questionType: QUESTION_TYPE.LINKERT_SCALE,
      answers: answers,
    })
  }, [
    add,
    getCategoryScoringRange,
    generateAnswers,
    getActiveQuestionsCount,
    getCurrentCategory,
    messageApi,
  ])

  useEffect(() => {
    // Debug logging - Remove in production
    console.log('QuestionEditTabs Debug:', {
      fieldsLength: fields.length,
      existingQuestionsLength: existingQuestions.length,
      selectedCategory: selectedCategory?.name,
      initialized,
      fields: fields.map(f => ({ key: f.key, name: f.name })),
    })

    // If we have no fields but have existing questions, and haven't initialized yet
    if (fields.length === 0 && existingQuestions.length > 0 && !initialized) {
      console.log(
        'Initializing questions from existing data:',
        existingQuestions
      )
      existingQuestions.forEach(question => {
        add({
          ...question,
          questionId: question.id || question.questionId,
          isNew: false,
          isActive: question.isActive !== undefined ? question.isActive : true,
        })
      })
      setInitialized(true)
    }
  }, [fields, existingQuestions, selectedCategory, initialized, add])

  // Watch for new fields being added and set active key to the newest tab
  useEffect(() => {
    if (fields.length > 0) {
      const lastField = fields[fields.length - 1]
      if (lastField) {
        setActiveKey(lastField.key.toString())
      }
    }
  }, [fields])

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      const category = getCurrentCategory()
      if (!category) return

      const { isLimited, questionLength } = category

      if (isLimited) {
        const activeCount = getActiveQuestionsCount()
        console.log(
          'Add check - Active count:',
          activeCount,
          'Limit:',
          questionLength
        )

        if (activeCount >= questionLength) {
          messageApi.warning(
            `Không thể thêm câu hỏi. Danh mục này chỉ cho phép tối đa ${questionLength} câu hỏi active.`
          )
          return
        }
      }

      addNewQuestion()
    } else if (action === 'remove') {
      if (fields.length <= 1) {
        messageApi.warning(t('surveyManagement.messages.atLeastOneQuestion'))
        return
      }

      const fieldToRemove = fields.find(
        field => field.key.toString() === targetKey.toString()
      )
      if (fieldToRemove) {
        remove(fieldToRemove.name)
      } else {
        messageApi.error(t('surveyManagement.messages.failedToRemoveQuestion'))
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
    const { key, ...fieldProps } = field
    const { minScore, maxScore } = getCategoryScoringRange()

    return (
      <div key={key} style={{ padding: '16px 0' }}>
        {/* Question Status for Existing Questions */}
        <Form.Item
          {...fieldProps}
          name={[field.name, 'isActive']}
          valuePropName="checked"
          style={{ marginBottom: '16px' }}
        >
          <Switch
            checkedChildren={t('common.active')}
            unCheckedChildren={t('common.inactive')}
            onChange={checked => {
              const category = getCurrentCategory()
              if (!category?.isLimited) return

              if (checked) {
                // Đếm số câu hỏi active hiện tại (không bao gồm câu hỏi đang được toggle)
                const currentActiveCount = fields.reduce((count, f) => {
                  if (f.name === field.name) return count // Skip câu hỏi đang được toggle
                  const isActive = form.getFieldValue([
                    'questions',
                    f.name,
                    'isActive',
                  ])
                  return count + (isActive !== false ? 1 : 0)
                }, 0)

                console.log(
                  'Switch check - Current active:',
                  currentActiveCount,
                  'Limit:',
                  category.questionLength
                )

                if (currentActiveCount >= category.questionLength) {
                  messageApi.warning(
                    `Không thể kích hoạt thêm câu hỏi. Danh mục này chỉ cho phép tối đa ${category.questionLength} câu hỏi active.`
                  )
                  // Prevent the switch from being toggled
                  setTimeout(() => {
                    form.setFieldValue(
                      ['questions', field.name, 'isActive'],
                      false
                    )
                  }, 0)
                  return
                }
              }
            }}
          />
        </Form.Item>

        {/* Question ID (hidden for existing questions) */}
        <Form.Item
          {...fieldProps}
          name={[field.name, 'questionId']}
          style={{ display: 'none' }}
        >
          <Input type="hidden" />
        </Form.Item>

        {/* Is New Question Flag (hidden) */}
        <Form.Item
          {...fieldProps}
          name={[field.name, 'isNew']}
          style={{ display: 'none' }}
        >
          <Input type="hidden" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'text']}
              label={`${t('surveyManagement.form.question')} ${index + 1}`}
              rules={[
                {
                  required: true,
                  message: t('surveyManagement.form.questionRequired'),
                },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder={t('surveyManagement.form.questionPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              {...fieldProps}
              name={[field.name, 'description']}
              label={t('surveyManagement.form.description')}
            >
              <Input.TextArea
                rows={2}
                placeholder={t('surveyManagement.form.descriptionPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Answers Section */}
        <Form.List name={[field.name, 'answers']}>
          {(answerFields, { add: addAnswer, remove: removeAnswer }) => (
            <div>
              <div style={{ marginBottom: 8 }}>
                <Text strong>{t('surveyManagement.form.answers')}:</Text>
                {minScore !== maxScore && (
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({t('surveyManagement.form.scoreRange')}: {minScore} -{' '}
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
                    {t('surveyManagement.form.addAnswer')}
                  </Button>
                )}
              </div>
              {answerFields.map((answerField, _answerIndex) => {
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
                              'surveyManagement.form.answerTextRequired'
                            ),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t(
                            'surveyManagement.form.answerTextPlaceholder'
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
                            message: t('surveyManagement.form.scoreRequired'),
                          },
                        ]}
                      >
                        <InputNumber
                          placeholder={t(
                            'surveyManagement.form.scorePlaceholder'
                          )}
                          min={minScore}
                          max={maxScore + 10}
                          style={{ width: '100%' }}
                          disabled={minScore !== maxScore}
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
          )}
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
            Scoring System Information:
          </Text>
          <br />
          <Text
            type="secondary"
            style={{
              color: isDarkMode ? '#a0a0a0' : '#00000073',
            }}
          >
            Category score range: {getCategoryScoringRange().minScore} -{' '}
            {getCategoryScoringRange().maxScore}
            <br />
            {selectedCategory?.isLimited && (
              <>
                Question limit: {getActiveQuestionsCount()}/
                {selectedCategory.questionLength} active questions
                <br />
              </>
            )}
            Edit mode: You can toggle question status and add new questions.
          </Text>
        </div>
      )}

      {fields.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <Text>
            No questions available. Click the + button to add a question.
          </Text>
          <br />
          <Button
            type="dashed"
            onClick={addNewQuestion}
            style={{ marginTop: 16 }}
            icon={<PlusOutlined />}
          >
            Add First Question
          </Button>
        </div>
      ) : (
        <Tabs
          type="editable-card"
          onChange={setActiveKey}
          activeKey={activeKey}
          onEdit={onEdit}
          items={fields.map((field, index) => ({
            label: `Question ${index + 1}`,
            key: field.key.toString(),
            children: renderQuestionForm(field, index),
            closable: fields.length > 1,
          }))}
        />
      )}
    </div>
  )
}

export default QuestionEditTabs

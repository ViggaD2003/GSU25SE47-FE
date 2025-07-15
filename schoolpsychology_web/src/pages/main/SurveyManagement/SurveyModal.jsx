import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Checkbox,
  Select,
  Row,
  Col,
  Typography,
  Card,
  Space,
} from 'antd'
import { useTranslation } from 'react-i18next'
import QuestionTabs from './QuestionTabs'
import { surveyAPI } from '../../../services/surveyApi'
import { surveyCode, surveyData } from '../../../constants/surveyData'

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

const SurveyModal = ({ visible, onCancel, onOk, messageApi }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSurveyCode, setSelectedSurveyCode] = useState(null)
  const [sampleSurveys, setSampleSurveys] = useState([])

  // Fetch categories when modal opens
  useEffect(() => {
    if (visible) {
      fetchCategories()
    }
  }, [visible])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await surveyAPI.getCategories()
      if (response.success) {
        setCategories(response.data)
      }
      form.setFieldValue('categoryId', categories[0].id)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId)
    const category = categories.find(cat => cat.id === categoryId)

    if (category && surveyData[category.code]) {
      setSampleSurveys(surveyData[category.code])
    } else {
      setSampleSurveys([])
    }

    // Reset survey code when category changes
    form.setFieldsValue({
      surveyCode: undefined,
    })
    setSelectedSurveyCode(null)
  }

  const handleSurveyCodeChange = selectedCode => {
    setSelectedSurveyCode(selectedCode)
    console.log('Selected survey code:', selectedCode)

    // Get survey code info for validation
    const categoryCode = categories.find(
      cat => cat.id === selectedCategory
    )?.code
    const surveyInfo = surveyCode[categoryCode]?.find(
      code => code.code === selectedCode
    )

    // Auto-load questions based on survey code
    const selectedSurvey = sampleSurveys.find(
      survey => survey.code === selectedCode
    )
    if (selectedSurvey) {
      form.setFieldsValue({
        name: selectedSurvey.name,
        description: selectedSurvey.description,
        questions: selectedSurvey.questions,
      })
    }

    // For limited surveys, ensure questions are required
    if (
      surveyInfo?.limitedQuestions &&
      (selectedCode === 'GAD-7' || selectedCode === 'PHQ-9')
    ) {
      const currentQuestions = form.getFieldValue('questions') || []
      const updatedQuestions = currentQuestions.map(q => ({
        ...q,
        required: true,
      }))
      form.setFieldsValue({ questions: updatedQuestions })
    }
  }

  const loadSampleSurvey = sampleSurvey => {
    form.setFieldsValue({
      name: sampleSurvey.name,
      surveyCode: sampleSurvey.code,
      description: sampleSurvey.description,
      questions: sampleSurvey.questions,
    })
    setSelectedSurveyCode(sampleSurvey.code)
  }

  const validateLimitedSurvey = values => {
    if (!selectedSurveyCode) return true

    const categoryCode = categories.find(
      cat => cat.id === selectedCategory
    )?.code
    const surveyInfo = surveyCode[categoryCode]?.find(
      code => code.code === selectedSurveyCode
    )

    if (surveyInfo?.limitedQuestions) {
      const questionsCount = values.questions?.length || 0
      const requiredCount = surveyInfo.length

      if (questionsCount !== requiredCount) {
        messageApi.error(
          `Survey ${selectedSurveyCode} yêu cầu đúng ${requiredCount} câu hỏi, hiện tại có ${questionsCount} câu hỏi`
        )
        return false
      }

      // Check if all questions are required for GAD-7 and PHQ-9
      if (selectedSurveyCode === 'GAD-7' || selectedSurveyCode === 'PHQ-9') {
        const hasOptionalQuestions = values.questions?.some(q => !q.required)
        if (hasOptionalQuestions) {
          messageApi.error(
            `Tất cả câu hỏi trong ${selectedSurveyCode} phải là bắt buộc`
          )
          return false
        }
      }
    }

    return true
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        // Validate limited surveys
        if (!validateLimitedSurvey(values)) {
          return
        }

        const { categoryId, ...surveyData } = values
        const requestData = {
          ...surveyData,
          recurringCycle: surveyData.isRecurring
            ? surveyData.recurringCycle
            : 'NONE',
          questions: values.questions.map(question => ({
            ...question,
            description: question?.description || '',
            categoryId: categoryId,
            moduleType: 'SURVEY',
          })),
        }

        onOk(requestData, form.resetFields, handleCategoryChange)
      })
      .catch(info => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    form.resetFields()
    setSelectedSurveyCode(null)
    onCancel()
  }

  return (
    <Modal
      title={t('surveyManagement.addSurvey')}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      width={1200}
      okText={t('common.create')}
      cancelText={t('common.cancel')}
      cancelButtonProps={{
        style: {
          color: 'red',
          borderColor: 'red',
        },
      }}
      style={{ height: '70vh', top: '5%' }}
    >
      <Form form={form} layout="vertical" name="surveyForm">
        <Row gutter={24}>
          {/* Survey Info Column (Left) */}
          <Col span={11}>
            <Title level={5}>Survey Information</Title>

            {/* Category & Survey Code*/}
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="categoryId"
                  label={t('surveyManagement.form.category')}
                  rules={[
                    {
                      required: true,
                      message: t('surveyManagement.form.categoryRequired'),
                    },
                  ]}
                >
                  <Select
                    loading={loading}
                    placeholder={t('surveyManagement.form.categoryPlaceholder')}
                    onChange={handleCategoryChange}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="surveyCode"
                  label={t('surveyManagement.form.surveyCode')}
                  rules={[
                    {
                      required: true,
                      message: t('surveyManagement.form.surveyCodeRequired'),
                    },
                  ]}
                >
                  <Select
                    loading={loading}
                    placeholder={t(
                      'surveyManagement.form.surveyCodePlaceholder'
                    )}
                    onChange={handleSurveyCodeChange}
                    disabled={!selectedCategory}
                  >
                    {selectedCategory &&
                      categories.find(cat => cat.id === selectedCategory) &&
                      surveyCode[
                        categories.find(cat => cat.id === selectedCategory)
                          ?.code
                      ] &&
                      surveyCode[
                        categories.find(cat => cat.id === selectedCategory)
                          ?.code
                      ].map(code => (
                        <Option key={code.code} value={code.code}>
                          {code.code}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Survey Code Requirements Note */}
            {selectedCategory && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#f6f8fa',
                    border: '1px solid #d0d7de',
                    borderRadius: '6px',
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: '#1f2328',
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    📋 Yêu cầu số lượng câu hỏi cho từng loại survey:
                  </Text>
                  {categories.find(cat => cat.id === selectedCategory) &&
                    surveyCode[
                      categories.find(cat => cat.id === selectedCategory)?.code
                    ] &&
                    surveyCode[
                      categories.find(cat => cat.id === selectedCategory)?.code
                    ].map(code => (
                      <div key={code.code} style={{ marginBottom: '4px' }}>
                        <Text style={{ fontSize: '13px' }}>
                          <span
                            style={{
                              fontWeight: 'bold',
                              color:
                                selectedSurveyCode === code.code
                                  ? '#0969da'
                                  : '#656d76',
                              backgroundColor:
                                selectedSurveyCode === code.code
                                  ? '#ddf4ff'
                                  : 'transparent',
                              padding: '2px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {code.code}
                          </span>
                          {code.limitedQuestions ? (
                            <span
                              style={{ color: '#cf222e', marginLeft: '8px' }}
                            >
                              → Yêu cầu đúng {code.length} câu hỏi (tất cả bắt
                              buộc)
                            </span>
                          ) : (
                            <span
                              style={{ color: '#1f883d', marginLeft: '8px' }}
                            >
                              → Không giới hạn số lượng câu hỏi
                            </span>
                          )}
                        </Text>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedCategory && sampleSurveys.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    marginBottom: 8,
                  }}
                >
                  <Text strong style={{ display: 'block' }}>
                    {t('surveyManagement.form.sampleSurveys')}
                  </Text>
                  <Text strong style={{ display: 'block' }}>
                    {categories.find(cat => cat.id === selectedCategory)?.name}
                  </Text>
                </div>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {sampleSurveys.map((survey, index) => (
                    <Card
                      key={index}
                      size="small"
                      style={{ cursor: 'pointer' }}
                      onClick={() => loadSampleSurvey(survey)}
                      hoverable
                    >
                      <div>
                        <Text strong>{survey.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {survey.description}
                        </Text>
                      </div>
                    </Card>
                  ))}
                </Space>
              </div>
            )}

            <Form.Item
              name="name"
              label={t('surveyManagement.form.name')}
              rules={[
                {
                  required: true,
                  message: t('surveyManagement.form.nameRequired'),
                },
              ]}
            >
              <Input placeholder={t('surveyManagement.form.namePlaceholder')} />
            </Form.Item>

            <Form.Item
              name="description"
              label={t('surveyManagement.form.description')}
            >
              <TextArea
                rows={3}
                placeholder={t('surveyManagement.form.descriptionPlaceholder')}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isRequired"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Checkbox>{t('surveyManagement.form.isRequired')}</Checkbox>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isRecurring"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Checkbox>{t('surveyManagement.form.isRecurring')}</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isRecurring !== currentValues.isRecurring
              }
            >
              {({ getFieldValue }) => (
                <Form.Item
                  name="recurringCycle"
                  label={t('surveyManagement.form.recurringCycle')}
                  rules={[
                    {
                      required: getFieldValue('isRecurring'),
                      message: t(
                        'surveyManagement.form.recurringCycleRequired'
                      ),
                    },
                  ]}
                  hidden={!getFieldValue('isRecurring')}
                  initialValue={'DAILY'}
                >
                  <Select
                    placeholder={t(
                      'surveyManagement.form.recurringCyclePlaceholder'
                    )}
                  >
                    <Option value="DAILY">{t('common.daily')}</Option>
                    <Option value="WEEKLY">{t('common.weekly')}</Option>
                    <Option value="MONTHLY">{t('common.monthly')}</Option>
                  </Select>
                </Form.Item>
              )}
            </Form.Item>

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
                                'Ngày bắt đầu phải là ngày hiện tại hoặc sau ngày hiện tại'
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
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
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
                        if (value && startDate) {
                          const start = new Date(startDate)
                          start.setHours(0, 0, 0, 0)
                          const end = new Date(value)
                          end.setHours(0, 0, 0, 0)
                          if (end <= start) {
                            return Promise.reject(
                              new Error('Ngày kết thúc phải sau ngày bắt đầu')
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
                      const startDate = form.getFieldValue('startDate')
                      if (!startDate) return false
                      const start = new Date(startDate)
                      start.setHours(0, 0, 0, 0)
                      return current && current <= start
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          {/* Questions Column (Right) */}
          <Col span={13}>
            <Title level={5}>{t('surveyManagement.form.questions')}</Title>
            <div
              style={{
                height: '100%',
                overflowY: 'auto',
                padding: '0 1px',
              }}
            >
              <Form.List name="questions">
                {(fields, { add, remove }) => (
                  <QuestionTabs
                    fields={fields}
                    add={add}
                    remove={remove}
                    surveyCode={selectedSurveyCode}
                  />
                )}
              </Form.List>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default SurveyModal

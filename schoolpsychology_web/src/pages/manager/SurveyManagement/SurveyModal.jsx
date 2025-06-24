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
import { SAMPLE_SURVEYS } from '../../../constants'

const { TextArea } = Input
const { Option } = Select
const { Title, Text } = Typography

const SurveyModal = ({ visible, onCancel, onOk }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
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
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = categoryId => {
    setSelectedCategory(categoryId)
    const category = categories.find(cat => cat.id === categoryId)

    if (category && SAMPLE_SURVEYS[category.code]) {
      setSampleSurveys(SAMPLE_SURVEYS[category.code])
    } else {
      setSampleSurveys([])
    }
  }

  const loadSampleSurvey = sampleSurvey => {
    form.setFieldsValue({
      name: sampleSurvey.name,
      description: sampleSurvey.description,
      questions: sampleSurvey.questions,
    })
  }

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
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

  return (
    <Modal
      title={t('surveyManagement.addSurvey')}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
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

            {/* Sample Surveys Section */}
            {sampleSurveys.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t('surveyManagement.form.sampleSurveys')}
                  {categories.find(cat => cat.id === selectedCategory)?.name}
                </Text>
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
                  <QuestionTabs fields={fields} add={add} remove={remove} />
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

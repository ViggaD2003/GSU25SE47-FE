import React, { useState, useEffect, useCallback } from 'react'
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
} from 'antd'
import { useTranslation } from 'react-i18next'
import QuestionTabs from './QuestionTabs'
import {
  SURVEY_TYPE,
  TARGET_SCOPE,
  GRADE_LEVEL,
  RECURRING_CYCLE,
  getSurveyTypePermissions,
} from '../../../constants/enums'
import { categoriesAPI } from '@/services/categoryApi'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { Title } = Typography

// Custom scrollbar styles
const scrollbarStyles = `
  .survey-modal-scroll::-webkit-scrollbar {
    width: 6px;
  }
  .survey-modal-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .survey-modal-scroll::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
  }
  .survey-modal-scroll::-webkit-scrollbar-thumb:hover {
    background: #bfbfbf;
  }
`

const SurveyModal = ({ visible, onCancel, onOk, messageApi, user }) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const userRole = user?.role?.toUpperCase()
  const [createLoading, setCreateLoading] = useState(false)

  // Fetch categories when modal opens
  useEffect(() => {
    if (visible) {
      fetchCategories()
    }
  }, [visible])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesAPI.getCategories()
      if (response.length > 0) {
        if (userRole === 'COUNSELOR') {
          if (!user.hasAvailable) {
            setCategories([])
            return
          }
          const availableCategories =
            user?.categories &&
            Array.isArray(user.categories) &&
            user.categories.length > 0
              ? response.filter(category =>
                  user.categories.includes(category.id)
                )
              : response

          setCategories(availableCategories)
          Promise.all([
            resetFormFields({
              categoryId: availableCategories[0]?.id,
              questions: [],
            }),
            setSelectedCategory(availableCategories[0]),
          ])
        } else {
          const activeCategories = [...response].filter(c => c?.isActive)
          setCategories(activeCategories || [])
          Promise.all([
            resetFormFields({
              categoryId: activeCategories[0]?.id,
              questions: [],
            }),
            setSelectedCategory(activeCategories[0]),
          ])
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  // Optimized reset form fields function
  const resetFormFields = useCallback(
    fieldsToSet => {
      const defaultFields = {
        isRequired: false,
        isRecurring: false,
        recurringCycle: RECURRING_CYCLE.WEEKLY,
        surveyType: getSurveyTypePermissions(userRole)[0],
        targetScope: TARGET_SCOPE.ALL,
        targetGrade: null,
        startDate: null,
        endDate: null,
        questions: [],
      }

      form.setFieldsValue({ ...defaultFields, ...fieldsToSet })
    },
    [form, userRole]
  )

  const handleCategoryChange = useCallback(
    categoryId => {
      const category = categories.find(category => category.id === categoryId)

      setSelectedCategory(category)

      resetFormFields({
        categoryId: categoryId,
        title: '',
        description: '',
        questions: [],
      })
    },
    [resetFormFields, categories]
  )

  // const handleTargetScopeChange = useCallback(
  //   scope => {
  //     if (TARGET_SCOPE.ALL === scope) {
  //       form.setFieldValue({
  //         targetGrade: [],
  //       })
  //     }
  //   },
  //   [form]
  // )

  const handleSurveyTypeChange = useCallback(
    type => {
      if (type === SURVEY_TYPE.SCREENING) {
        form.setFieldsValue({
          targetScope: TARGET_SCOPE.ALL,
          targetGrade: [],
        })
      } else {
        form.setFieldsValue({ targetScope: TARGET_SCOPE.NONE, targetGrade: [] })
      }
    },
    [form]
  )

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setCreateLoading(true)

      const targetGrade =
        values.targetScope === TARGET_SCOPE.GRADE
          ? values.targetGrade
          : values.targetScope === TARGET_SCOPE.ALL
            ? Object.values(GRADE_LEVEL).map(grade => grade.toString())
            : []

      const requestData = {
        title: values.title,
        description: values.description || '',
        surveyType: values.surveyType,
        isRequired: values.isRequired || false,
        isRecurring: values.isRecurring || false,
        recurringCycle: values.isRecurring
          ? values.recurringCycle
          : RECURRING_CYCLE.NONE,
        startDate: dayjs(values.startDate).startOf('day').format('YYYY-MM-DD'),
        endDate: dayjs(values.endDate).startOf('day').format('YYYY-MM-DD'),
        categoryId: values.categoryId,
        targetScope: values.targetScope,
        targetGrade: targetGrade,
        questions:
          values.questions?.map(question => ({
            text: question.text,
            description: question.description || '',
            questionType: question.questionType,
            isRequired: question.isRequired || false,
            answers:
              question.answers?.map(answer => ({
                score: answer.score,
                text: answer.text,
              })) || [],
          })) || [],
      }

      // console.log('requestData', requestData)
      if (onOk) {
        await onOk(requestData, form.resetFields, handleCategoryChange)
      }
    } catch (info) {
      console.log('Validate Failed:', info)
      const errMsg = info?.errorFields?.[0]?.errors?.[0]
      if (errMsg) {
        messageApi.error(errMsg)
      }
    } finally {
      setCreateLoading(false)
    }
  }

  const handleCancel = async () => {
    await Promise.all([
      form.resetFields(),
      setSelectedCategory(null),
      form.setFieldsValue({
        questions: [],
      }),
    ])
    onCancel()
  }

  return (
    <>
      <style>{scrollbarStyles}</style>
      <Modal
        title={t('surveyManagement.addSurvey')}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1200}
        okText={t('common.create')}
        okButtonProps={{
          loading: createLoading,
        }}
        cancelText={t('common.cancel')}
        cancelButtonProps={{
          disabled: loading || createLoading, // 👈 disable nút OK
          danger: true,
        }}
        styles={{
          body: {
            height: '76vh',
            overflow: 'hidden',
            padding: '16px 24px',
          },
        }}
        centered
      >
        <Form
          form={form}
          layout="vertical"
          name="surveyForm"
          style={{ height: '100%' }}
        >
          <Row gutter={24} style={{ height: '100%' }}>
            {/* Survey Info Column (Left) */}
            <Col
              span={11}
              className="survey-modal-scroll"
              style={{
                height: '100%',
                overflowY: 'auto',
                paddingRight: '12px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d9d9d9 transparent',
              }}
            >
              <Title level={5} style={{ marginBottom: '16px' }}>
                {t('surveyManagement.form.surveyInformation')}
              </Title>

              {/* Category */}
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
                      {category.name} - {category.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Survey Type */}
              <Form.Item
                name="surveyType"
                label={t('surveyManagement.form.surveyType')}
                initialValue={getSurveyTypePermissions(userRole)[0]}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.surveyTypeRequired'),
                  },
                ]}
              >
                <Select
                  placeholder={t('surveyManagement.form.surveyTypePlaceholder')}
                  onChange={handleSurveyTypeChange}
                >
                  {getSurveyTypePermissions(userRole).map(type => (
                    <Option key={type} value={type}>
                      {t(`surveyManagement.enums.surveyType.${type}`)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Target Scope and Grade */}
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
                    {({ getFieldValue, resetFields }) => {
                      // khi scope thay đổi thì reset
                      if (getFieldValue('targetScope') !== TARGET_SCOPE.GRADE) {
                        resetFields(['targetGrade'])
                      }

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

              <Form.Item
                name="title"
                label={t('surveyManagement.form.title')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.titleRequired'),
                  },
                ]}
              >
                <Input
                  placeholder={t('surveyManagement.form.titlePlaceholder')}
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={t('surveyManagement.form.description')}
                rules={[
                  {
                    required: true,
                    message: t('surveyManagement.form.descriptionRequired'),
                  },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder={t(
                    'surveyManagement.form.descriptionPlaceholder'
                  )}
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
                    <Checkbox>
                      {t('surveyManagement.form.isRecurring')}
                    </Checkbox>
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
                    hidden={!getFieldValue('isRecurring')}
                    initialValue={RECURRING_CYCLE.WEEKLY}
                  >
                    <Select
                      placeholder={t(
                        'surveyManagement.form.recurringCyclePlaceholder'
                      )}
                    >
                      <Option value={RECURRING_CYCLE.WEEKLY}>
                        {t('surveyManagement.enums.recurringCycle.WEEKLY')}
                      </Option>
                      <Option value={RECURRING_CYCLE.MONTHLY}>
                        {t('surveyManagement.enums.recurringCycle.MONTHLY')}
                      </Option>
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
                                  maxDays = 7
                                  break
                                case RECURRING_CYCLE.MONTHLY:
                                  maxDays = 30
                                  break
                              }

                              return daysDiff > maxDays
                            }

                            return false
                          }}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Questions Column (Right) */}
            <Col
              span={13}
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                paddingLeft: '12px',
              }}
            >
              <Title level={5} style={{ marginBottom: '16px' }}>
                {t('surveyManagement.form.questions')}
              </Title>
              <div
                className="survey-modal-scroll"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  padding: '0 1px',
                  marginTop: '8px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d9d9d9 transparent',
                  paddingRight: '12px',
                  paddingLeft: '12px',
                }}
              >
                <Form.List name="questions">
                  {(fields, { add, remove }) => (
                    <QuestionTabs
                      t={t}
                      fields={fields}
                      add={add}
                      remove={remove}
                      selectedCategory={selectedCategory}
                      messageApi={messageApi}
                    />
                  )}
                </Form.List>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default SurveyModal

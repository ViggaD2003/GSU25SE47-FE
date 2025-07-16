import React, { useState, useEffect } from 'react'
import {
  Modal,
  Typography,
  Divider,
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
} from 'antd'
import { surveyAPI } from '../../../services/surveyApi'
import dayjs from 'dayjs'

const SurveyDetailModal = ({
  t,
  visible,
  survey,
  onClose,
  onUpdated,
  messageApi,
}) => {
  const [form] = Form.useForm()
  const [editMode, setEditMode] = useState(false)
  const [formValue, setFormValue] = useState(null)
  const [loading, setLoading] = useState(false)

  const recurringOptions = [
    {
      value: 'NONE',
      label: t('surveyManagement.detail.recurringOptions.none'),
    },
    {
      value: 'WEEKLY',
      label: t('surveyManagement.detail.recurringOptions.weekly'),
    },
    {
      value: 'MONTHLY',
      label: t('surveyManagement.detail.recurringOptions.monthly'),
    },
  ]

  // Helper function to normalize recurring cycle values
  const normalizeRecurringCycle = cycle => {
    if (!cycle) return 'NONE'
    return cycle.toUpperCase()
  }

  // Helper function to get display label for recurring cycle
  const getRecurringCycleLabel = cycle => {
    const normalizedCycle = normalizeRecurringCycle(cycle)
    const option = recurringOptions.find(opt => opt.value === normalizedCycle)
    return option?.label || cycle
  }

  useEffect(() => {
    if (visible && survey) {
      const normalizedCycle = normalizeRecurringCycle(survey.recurringCycle)
      const initialValues = {
        ...survey,
        startDate: survey.startDate ? dayjs(survey.startDate) : null,
        endDate: survey.endDate ? dayjs(survey.endDate) : null,
        questions: survey.questions || [],
        recurringCycle: normalizedCycle,
        isRecurring: normalizedCycle !== 'NONE',
      }

      setFormValue(initialValues)
      form.setFieldsValue(initialValues)
      setEditMode(false)
    }
  }, [visible, survey, form])

  if (!survey || !formValue) return null

  // Check if dates can be edited based on status
  const canEditDates = ['DRAFT', 'ARCHIVED'].includes(
    formValue.status?.toUpperCase()
  )

  // Calculate max end date based on recurring cycle
  const getMaxEndDate = () => {
    if (
      !formValue.startDate ||
      !formValue.recurringCycle ||
      formValue.recurringCycle === 'NONE'
    )
      return null

    const startDate = dayjs(formValue.startDate)
    switch (formValue.recurringCycle) {
      case 'WEEKLY':
        return startDate.add(7, 'day')
      case 'MONTHLY':
        return startDate.add(30, 'day')
      default:
        return null // No restriction for 'NONE'
    }
  }

  const handleEdit = () => {
    setEditMode(true)
    form.setFieldsValue(formValue)
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    // Reset to original survey values
    const normalizedCycle = normalizeRecurringCycle(survey.recurringCycle)
    const resetValues = {
      ...survey,
      startDate: survey.startDate ? dayjs(survey.startDate) : null,
      endDate: survey.endDate ? dayjs(survey.endDate) : null,
      questions: survey.questions || [],
      recurringCycle: normalizedCycle,
      isRecurring: normalizedCycle !== 'NONE',
    }
    setFormValue(resetValues)
    form.setFieldsValue(resetValues)
  }

  const handleFormChange = (changedFields, _allFields) => {
    // Get current form values
    const currentFormValues = form.getFieldsValue()

    // Merge with existing formValue to preserve unchanged fields
    const newFormValue = { ...formValue, ...currentFormValues }

    // Handle isRecurring logic based on recurringCycle
    if (changedFields.recurringCycle !== undefined) {
      const recurringCycle = changedFields.recurringCycle
      newFormValue.isRecurring =
        recurringCycle !== 'NONE' &&
        recurringCycle !== null &&
        recurringCycle !== undefined

      // Auto-adjust end date if recurring cycle changes and exceeds limit
      if (newFormValue.startDate && newFormValue.endDate) {
        const startDate = dayjs(newFormValue.startDate)
        let maxEndDate = null

        switch (recurringCycle) {
          case 'WEEKLY':
            maxEndDate = startDate.add(7, 'day')
            break
          case 'MONTHLY':
            maxEndDate = startDate.add(30, 'day')
            break
          default:
            maxEndDate = null
        }

        if (maxEndDate && dayjs(newFormValue.endDate).isAfter(maxEndDate)) {
          newFormValue.endDate = maxEndDate
          form.setFieldValue('endDate', maxEndDate)
        }
      }

      // Update the form field without triggering another change event
      form.setFieldValue('isRecurring', newFormValue.isRecurring)
    }

    // Update formValue state to preserve all data
    setFormValue(newFormValue)
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)

      // Validate form
      const values = await form.validateFields()

      // Check if any values have actually changed
      let hasChanges = false
      Object.keys(values).forEach(key => {
        if (key === 'startDate' || key === 'endDate') {
          const formattedValue = values[key]
            ? values[key].format('YYYY-MM-DD')
            : null
          const originalValue = survey[key]
            ? dayjs(survey[key]).format('YYYY-MM-DD')
            : null
          if (formattedValue !== originalValue) {
            hasChanges = true
          }
        } else if (key === 'recurringCycle') {
          const apiValue = values[key] === 'NONE' ? null : values[key]
          const originalValue = survey[key] || null
          if (apiValue !== originalValue) {
            hasChanges = true
          }
        } else if (key !== 'questions' && values[key] !== survey[key]) {
          hasChanges = true
        }
      })

      // If no changes, don't make API call
      if (!hasChanges) {
        messageApi.info(t('surveyManagement.detail.messages.noChanges'))
        setEditMode(false)
        setLoading(false)
        return
      }

      // Prepare full payload as required by API
      const payload = {
        name: values.name || survey.name,
        description: values.description || survey.description,
        isRequired:
          values.isRequired !== undefined
            ? values.isRequired
            : survey.isRequired,
        isRecurring: values.recurringCycle !== 'NONE',
        recurringCycle:
          values.recurringCycle === 'NONE'
            ? 'NONE'
            : values.recurringCycle || survey.recurringCycle,
        surveyCode: values.surveyCode || survey.surveyCode,
        startDate: values.startDate
          ? values.startDate.format('YYYY-MM-DD')
          : survey.startDate,
        endDate: values.endDate
          ? values.endDate.format('YYYY-MM-DD')
          : survey.endDate,
        questions:
          survey.questions?.map(q => ({
            text: q.text,
            description: q.description,
            questionType: q.questionType,
            moduleType: q.moduleType,
            categoryId: q.category?.id || q.categoryId,
            answers:
              q.answers?.map(a => ({
                score: a.score,
                text: a.text,
              })) || [],
            required: q.required,
          })) || [],
      }

      console.log('Update payload:', payload)

      await surveyAPI.updateSurvey(survey.id || survey.surveyId, payload)

      messageApi.success(t('surveyManagement.detail.messages.updateSuccess'))
      setEditMode(false)
      onUpdated()
    } catch (err) {
      if (err.errorFields) {
        // Form validation errors - already displayed by form
        return
      }

      let msg = t('surveyManagement.detail.messages.updateError')

      if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data
        } else if (typeof err.response.data === 'object') {
          msg = Object.values(err.response.data).join(', ')
        }
      } else if (err?.message) {
        msg = err.message
      }

      messageApi.error(msg)
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const disabledEndDate = current => {
    if (!formValue.startDate) return current && current < dayjs().startOf('day')

    const maxEndDate = getMaxEndDate()
    if (maxEndDate) {
      return (
        current &&
        (current < dayjs(formValue.startDate) || current > maxEndDate)
      )
    }

    return current && current < dayjs(formValue.startDate)
  }

  // Validation rules
  const validationRules = {
    description: [
      {
        required: true,
        message: t('surveyManagement.detail.validation.descriptionRequired'),
      },
    ],
    startDate: [
      {
        required: true,
        message: t('surveyManagement.detail.validation.startDateRequired'),
      },
      {
        validator: (_, value) => {
          if (value && dayjs(value).isBefore(dayjs(), 'day')) {
            return Promise.reject(
              new Error(t('surveyManagement.detail.validation.startDateFuture'))
            )
          }
          return Promise.resolve()
        },
      },
      {
        validator: (_, value) => {
          const endDate = form.getFieldValue('endDate')
          if (value && endDate && dayjs(value).isAfter(dayjs(endDate))) {
            return Promise.reject(
              new Error(
                t('surveyManagement.detail.validation.startDateBeforeEnd')
              )
            )
          }
          return Promise.resolve()
        },
      },
    ],
    endDate: [
      {
        required: true,
        message: t('surveyManagement.detail.validation.endDateRequired'),
      },
    ],
    recurringCycle: [
      {
        validator: (_, value) => {
          const isRecurring = form.getFieldValue('isRecurring')
          if (isRecurring && (!value || value === 'NONE')) {
            return Promise.reject(
              new Error(
                t('surveyManagement.detail.validation.recurringCycleRequired')
              )
            )
          }
          return Promise.resolve()
        },
      },
    ],
  }

  return (
    <Modal
      open={visible}
      title={<span style={{ fontWeight: 600 }}>{formValue.name}</span>}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: '5%' }}
    >
      <div className="flex flex-col h-[80vh]">
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item
                label={t('surveyManagement.detail.description')}
                span={2}
              >
                {editMode ? (
                  <Form.Item
                    name="description"
                    rules={validationRules.description}
                    style={{ marginBottom: 0 }}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>
                ) : (
                  formValue.description
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={t('surveyManagement.detail.status')}
                span={1}
              >
                <Tag
                  color={
                    formValue.status === 'PUBLISHED'
                      ? 'green'
                      : formValue.status === 'COMPLETED'
                        ? 'blue'
                        : formValue.status === 'DRAFT'
                          ? 'orange'
                          : 'red'
                  }
                >
                  {formValue.status}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={t('surveyManagement.detail.required')}
                span={1}
              >
                {editMode ? (
                  <Form.Item
                    name="isRequired"
                    valuePropName="checked"
                    style={{ marginBottom: 0 }}
                  >
                    <Switch
                      checkedChildren={t('common.yes')}
                      unCheckedChildren={t('common.no')}
                    />
                  </Form.Item>
                ) : formValue.isRequired ? (
                  t('common.yes')
                ) : (
                  t('common.no')
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={t('surveyManagement.detail.startDate')}
                span={1}
              >
                {editMode && canEditDates ? (
                  <Form.Item
                    name="startDate"
                    rules={validationRules.startDate}
                    style={{ marginBottom: 0 }}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabledDate={current =>
                        current && current < dayjs().startOf('day')
                      }
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ) : formValue.startDate ? (
                  dayjs(formValue.startDate).format('YYYY-MM-DD')
                ) : (
                  ''
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={t('surveyManagement.detail.endDate')}
                span={1}
              >
                {editMode && canEditDates ? (
                  <Form.Item
                    name="endDate"
                    rules={validationRules.endDate}
                    style={{ marginBottom: 0 }}
                  >
                    <DatePicker
                      format="YYYY-MM-DD"
                      disabledDate={disabledEndDate}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                ) : formValue.endDate ? (
                  dayjs(formValue.endDate).format('YYYY-MM-DD')
                ) : (
                  ''
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={t('surveyManagement.detail.recurringCycle')}
                span={2}
              >
                {editMode ? (
                  <Form.Item
                    name="recurringCycle"
                    rules={validationRules.recurringCycle}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      options={recurringOptions}
                      placeholder={t(
                        'surveyManagement.form.recurringCyclePlaceholder'
                      )}
                      style={{ width: 200 }}
                      allowClear
                    />
                  </Form.Item>
                ) : formValue.isRecurring &&
                  formValue.recurringCycle &&
                  formValue.recurringCycle !== 'NONE' ? (
                  getRecurringCycleLabel(formValue.recurringCycle)
                ) : (
                  t('common.no')
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left" style={{ fontWeight: 600 }}>
              {t('surveyManagement.detail.questionsList')}
            </Divider>
          </div>
        </Form>

        <div className="h-full" style={{ overflowY: 'auto', marginBottom: 16 }}>
          <List
            dataSource={formValue.questions}
            renderItem={(q, qIdx) => (
              <Card
                key={q.questionId || qIdx}
                style={{ marginBottom: 16, borderRadius: 8 }}
                type="inner"
                title={<Typography.Text>{q.text}</Typography.Text>}
                extra={<Tag>{q.category?.name || ''}</Tag>}
              >
                <Typography.Text type="secondary">
                  {q.description}
                </Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <List
                    size="small"
                    dataSource={q.answers}
                    renderItem={(a, _aIdx) => (
                      <List.Item style={{ paddingLeft: 16 }}>
                        <Space>
                          <Tag color="blue">{a.score}</Tag>
                          {a.text}
                        </Space>
                      </List.Item>
                    )}
                  />
                </div>
              </Card>
            )}
          />
        </div>

        <div style={{ textAlign: 'right' }}>
          {!editMode ? (
            <Button type="primary" onClick={handleEdit}>
              {t('surveyManagement.detail.edit')}
            </Button>
          ) : (
            <>
              <Button onClick={handleCancelEdit} style={{ marginRight: 8 }}>
                {t('surveyManagement.detail.cancel')}
              </Button>
              <Button type="primary" onClick={handleUpdate} loading={loading}>
                {t('surveyManagement.detail.update')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default SurveyDetailModal

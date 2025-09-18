import React, { useState, useEffect, useCallback } from 'react'
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
  DatePicker,
  TimePicker,
  InputNumber,
  Switch,
  Select,
  Checkbox,
  Upload,
} from 'antd'
import { BulbOutlined, UploadOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import dayjs from 'dayjs'
// import { RECURRING_CYCLE } from '@/constants/enums'
import Title from 'antd/es/typography/Title'
import QuestionTabs from '../SurveyManagement/QuestionTabs'
import QuestionEditTabs from './QuestionEditTabs'
// import { useWebSocket } from '@/contexts/WebSocketContext'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

const MIN_DATE = dayjs().add(1, 'day')

const ProgramModal = ({
  visible,
  onCancel,
  onOk,
  categories = [],
  counselors = [],
  messageApi,
  isEdit = false,
  program = null,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [startTimeValue, setStartTimeValue] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  // const { sendMessage } = useWebSocket()

  useEffect(() => {
    if (isEdit && program) {
      // Find category from the program data structure
      setSelectedCategory(program.category?.id || null)

      const currentDate = dayjs()
      const startTime = dayjs(program.startTime)
      const endTime = dayjs(program.endTime)
      const updatedStartTime = currentDate
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(startTime.second())

      const updatedEndTime = currentDate
        .hour(endTime.hour())
        .minute(endTime.minute())
        .second(endTime.second())

      setStartTimeValue(updatedStartTime)

      // Set form values with proper mapping
      form.setFieldsValue({
        name: program.name || '',
        description: program.description || '',
        location: program.location || '',
        maxParticipants: program.maxParticipants || 10,
        categoryId: program.category?.id,
        hostedBy: program.hostedBy?.id,
        date: dayjs(program.startTime).startOf('day'),
        startTime: updatedStartTime,
        endTime: updatedEndTime,
      })

      // Handle thumbnail for edit mode
      if (program.thumbnail?.url) {
        const thumbnailFile = {
          uid: '-1',
          name: 'thumbnail.jpg',
          status: 'done',
          url: program.thumbnail.url,
        }
        setThumbnail(thumbnailFile)
        form.setFieldValue('thumbnail', thumbnailFile)
      }
    }
  }, [isEdit, program])

  const uploadProps = {
    name: 'image',
    accept: '.jpg, .jpeg, .png',
    maxCount: 1,
    fileList: thumbnail ? [thumbnail] : [],
    showUploadList: {
      extra: ({ size = 0 }) => (
        <span style={{ color: '#cccccc' }}>
          {size > 0 ? `(${(size / 1024 / 1024).toFixed(2)}MB)` : ''}
        </span>
      ),
    },
    onRemove: () => {
      setThumbnail(null)
      form.setFieldValue('thumbnail', undefined)
    },
    customRequest(info) {
      const { file } = info
      const isLt10M = file.size / 1024 / 1024 < 10 // Giới hạn 10MB
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(
        file.type
      )

      // Check file size
      if (!isLt10M) {
        messageApi.error(t('programManagement.form.thumbnailSizeLimit'))
        info.onError(new Error(t('programManagement.form.thumbnailSizeLimit')))
        return
      }

      // Check file type
      if (!isValidType) {
        messageApi.error(t('programManagement.form.thumbnailType'))
        info.onError(new Error(t('programManagement.form.thumbnailType')))
        return
      }

      // File is valid
      const fileObj = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      }

      form.setFieldValue('thumbnail', file)
      info.onSuccess(file)
      messageApi.success(t('programManagement.messages.fileUploadSuccess'))
      setThumbnail(fileObj)
    },
  }

  const setDefaultValues = useCallback(() => {
    const defaultCategoryId = categories.length > 0 ? categories[0].id : null
    const defaultCounselorId = counselors.length > 0 ? counselors[0].id : null

    Promise.all([
      form.setFieldsValue({
        name: '',
        description: '',
        maxParticipants: 10,
        date: MIN_DATE, // Changed to 7 days to match validation
        categoryId: defaultCategoryId,
        hostedBy: defaultCounselorId,
        thumbnail: null,
        location: '',
      }),
      setSelectedCategory(categories.length > 0 ? categories[0] : null),
    ])
  }, [form, categories, counselors])

  useEffect(() => {
    if (visible && !isEdit) {
      setDefaultValues()
    }
  }, [visible, isEdit])

  const handleFormValuesChange = (changedValues, _allValues) => {
    if (changedValues.startTime !== undefined) {
      setStartTimeValue(changedValues.startTime)
      // Re-validate endTime when startTime changes
      if (form.getFieldValue('endTime')) {
        form.validateFields(['endTime'])
      }
    }

    // Update time fields with new date when date changes
    if (changedValues.date !== undefined) {
      const newDate = changedValues.date

      // Update startTime with new date if it exists
      const currentStartTime = form.getFieldValue('startTime')
      if (currentStartTime) {
        const updatedStartTime = newDate
          .hour(currentStartTime.hour())
          .minute(currentStartTime.minute())
          .second(currentStartTime.second())
        form.setFieldValue('startTime', updatedStartTime)
        setStartTimeValue(updatedStartTime)
      }

      // Update endTime with new date if it exists
      const currentEndTime = form.getFieldValue('endTime')
      if (currentEndTime) {
        const updatedEndTime = newDate
          .hour(currentEndTime.hour())
          .minute(currentEndTime.minute())
          .second(currentEndTime.second())
        form.setFieldValue('endTime', updatedEndTime)
      }

      // Re-validate time fields
      if (currentStartTime) {
        form.validateFields(['startTime'])
      }
      if (currentEndTime) {
        form.validateFields(['endTime'])
      }
    }

    if (changedValues.categoryId !== undefined) {
      setSelectedCategory(
        categories.find(category => category.id === changedValues.categoryId)
      )
    }
  }

  // Handle form submission
  const handleOk = async () => {
    try {
      setLoading(true)
      let values

      try {
        // In edit mode, skip questions validation
        if (isEdit) {
          // Get all form values first
          const allValues = form.getFieldsValue()

          console.log('allValues', allValues)
          console.log('thumbnail', thumbnail)

          // Validate only non-question fields
          values = await form.validateFields([
            'name',
            'description',
            'maxParticipants',
            'date',
            'startTime',
            'endTime',
            'location',
            'categoryId',
            'hostedBy',
            'thumbnail',
          ])

          // Add questions from form values without validation
          values.questions = allValues.questions || []
        } else {
          // For create mode, validate all fields including questions
          values = await form.validateFields()
        }
      } catch (errorInfo) {
        // Focus on the first field with error
        if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
          const firstErrorField = errorInfo.errorFields[0].name[0]
          // Scroll to and focus the first error field
          form.scrollToField(firstErrorField)

          // Show specific error message for the first field
          const firstError = errorInfo.errorFields[0].errors[0]
          messageApi.error(
            firstError || t('programManagement.messages.fillAllFields')
          )
        } else {
          messageApi.error(t('programManagement.messages.fillAllFields'))
        }
        setLoading(false)
        return
      }

      const startDate = dayjs(values.date).format('YYYY-MM-DD')
      const endDate = dayjs(values.date).format('YYYY-MM-DD')

      // Transform data to match API format
      const programData = {
        name: values.name,
        description: values.description,
        maxParticipants: values.maxParticipants,
        startTime:
          startDate + 'T' + values.startTime.format('HH:mm:ss.SSS') + 'Z',
        endTime: endDate + 'T' + values.endTime.format('HH:mm:ss.SSS') + 'Z',
        location: values.location || '',
        hostedBy: values.hostedBy,
      }

      if (isEdit) {
        // Format data for update API
        programData.surveyId =
          program?.programSurvey?.surveyId || program?.surveyId

        // Process questions for update format
        if (values.questions && values.questions.length > 0) {
          programData.survey = {
            title: program?.programSurvey?.title || 'Support Program Survey',
            description:
              program?.programSurvey?.description ||
              'Support Program Survey is created when creating support program',
            surveyType: program?.programSurvey?.surveyType || 'PROGRAM',
            isRequired:
              program?.programSurvey?.isRequired !== undefined
                ? program.programSurvey.isRequired
                : true,
            isRecurring:
              program?.programSurvey?.isRecurring !== undefined
                ? program.programSurvey.isRecurring
                : false,
            recurringCycle: program?.programSurvey?.recurringCycle || 'NONE',
            startDate: startDate,
            endDate: dayjs(values.date).add(1, 'day').format('YYYY-MM-DD'),
            targetScope: program?.programSurvey?.targetScope || 'NONE',
            targetGrade: program?.programSurvey?.targetGrade || [],
            updateQuestions: [],
            newQuestions: [],
          }
        }
      } else {
        // Format data for create API
        programData.categoryId = values.categoryId
        programData.addNewSurveyDto = {
          title: 'Support Program Survey',
          description:
            'Support Program Survey is created when creating support program',
          isRequired: true,
          isRecurring: false,
          recurringCycle: 'NONE',
          startDate: startDate,
          endDate: dayjs(values.date).add(1, 'day').format('YYYY-MM-DD'),
          categoryId: values.categoryId,
          surveyType: 'PROGRAM',
          targetScope: 'NONE',
          targetGrade: [],
          questions:
            values.questions?.map(q => ({
              text: q.text,
              description: q.description || '',
              questionType: q.questionType,
              isRequired: q.isRequired || false,
              answers: q.answers?.map(a => ({
                text: a.text,
                score: a.score,
              })),
            })) || [],
        }
      }

      // console.log('programData', programData)

      // Handle thumbnail data
      let thumbnailData = null
      let hasNewThumbnail = false

      if (thumbnail) {
        if (thumbnail.originFileObj) {
          // New thumbnail upload
          thumbnailData = thumbnail.originFileObj
          hasNewThumbnail = true
        } else if (!isEdit) {
          // For create mode with existing URL (shouldn't happen)
          thumbnailData = thumbnail.url
        }
      }

      const requestData = {
        thumbnail: thumbnailData,
        request: { ...programData },
        hasNewThumbnail: hasNewThumbnail,
        programId: isEdit ? program?.id : null,
        existingThumbnail: isEdit ? program?.thumbnail : null,
      }

      const selectedCounselor = counselors.find(c => c.id === values.hostedBy)

      await onOk(requestData, selectedCounselor?.email, !isEdit)
    } catch (error) {
      console.error('Submit failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    await Promise.all([form.resetFields(), setSelectedCategory(null)])
    setThumbnail(null)
    setStartTimeValue(null)
    onCancel()
  }

  const getModalTitle = () => {
    const title = !isEdit
      ? t('programManagement.modal.addTitle')
      : t('programManagement.modal.editTitle')

    return (
      <div className="flex items-center justify-between">
        <span>{title}</span>
      </div>
    )
  }

  const validateDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('programManagement.form.dateRequired')))
    }

    // For edit mode, allow current date if it's not in the past
    const minDate = isEdit ? dayjs().startOf('day') : MIN_DATE
    if (value.isBefore(minDate, 'day')) {
      const errorMessage = isEdit
        ? t('programManagement.form.dateNotPast')
        : t('programManagement.form.dateMinDays')
      return Promise.reject(new Error(errorMessage))
    }

    return Promise.resolve()
  }

  const validateStartTime = (_, value) => {
    if (!value) {
      return Promise.reject(
        new Error(t('programManagement.form.startTimeRequired'))
      )
    }

    // Get the selected date from form
    const selectedDate = form.getFieldValue('date')
    if (!selectedDate) {
      return Promise.reject(new Error(t('programManagement.form.dateRequired')))
    }

    // Update the value to use the selected date while keeping the time
    const updatedValue = selectedDate
      .hour(value.hour())
      .minute(value.minute())
      .second(value.second())

    console.log('updated value', updatedValue.format('DD/MM/YYYY HH:mm'))

    // Check if start time is after 15:00 (3 PM)
    const minStartTime = selectedDate.hour(15).minute(0).second(0)
    if (updatedValue.isBefore(minStartTime, 'minute')) {
      return Promise.reject(
        new Error(t('programManagement.form.startTimeAfter17'))
      )
    }

    // Check if start time is before 20:00 (8 PM)
    const maxStartTime = selectedDate.hour(20).minute(0).second(0)
    if (updatedValue.isAfter(maxStartTime, 'minute')) {
      return Promise.reject(
        new Error(t('programManagement.form.startTimeBefore20'))
      )
    }

    // Update the form field value with the correct date
    form.setFieldValue('startTime', updatedValue)

    return Promise.resolve()
  }

  const validateEndTime = (_, value) => {
    if (!value) {
      return Promise.reject(
        new Error(t('programManagement.form.endTimeRequired'))
      )
    }

    const startTime = form.getFieldValue('startTime')
    if (!startTime) {
      return Promise.reject(
        new Error(t('programManagement.form.startTimeFirst'))
      )
    }

    // Get the selected date from form
    const selectedDate = form.getFieldValue('date')
    if (!selectedDate) {
      return Promise.reject(new Error(t('programManagement.form.dateRequired')))
    }

    // Update the value to use the selected date while keeping the time
    const updatedValue = selectedDate
      .hour(value.hour())
      .minute(value.minute())
      .second(value.second())

    // Check if time range is at least 1 hour
    const timeDiff = updatedValue.diff(startTime, 'hour', true)
    if (timeDiff < 1) {
      return Promise.reject(
        new Error(t('programManagement.form.timeRangeMinHour'))
      )
    }

    // Check if end time is not too late (before 21:00)
    const maxEndTime = selectedDate.hour(21).minute(0).second(0)
    if (updatedValue.isAfter(maxEndTime, 'minute')) {
      return Promise.reject(
        new Error(t('programManagement.form.endTimeBefore21'))
      )
    }

    // Update the form field value with the correct date
    form.setFieldValue('endTime', updatedValue)

    return Promise.resolve()
  }

  const disabledDate = current => {
    // For edit mode, allow current date if it's not in the past
    const minDate = isEdit ? dayjs().startOf('day') : MIN_DATE
    return current && current < minDate
  }

  const disabledStartTime = () => {
    const date = form.getFieldValue('date')
    if (!date) return {}

    let disabledHours = []

    // Disable hours before 15:00 (3 PM)
    disabledHours = disabledHours.concat(
      Array.from({ length: 15 }, (_, i) => i)
    )
    // Disable hours after 20:00 (8 PM)
    disabledHours = disabledHours.concat(
      Array.from({ length: 4 }, (_, i) => i + 20)
    )

    // Remove duplicates and sort
    disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

    return { disabledHours: () => disabledHours }
  }

  const disabledEndTime = () => {
    const date = form.getFieldValue('date')
    const startTime = form.getFieldValue('startTime')

    if (!date || !startTime) return {}

    let disabledHours = []

    // Calculate minimum end hour (start time + 1 hour)
    const minEndHour = dayjs(startTime).add(1, 'hour').hour()

    // Disable hours before minimum end time
    disabledHours = disabledHours.concat(
      Array.from({ length: minEndHour }, (_, i) => i)
    )

    // Disable hours after 21:00 (9 PM) to ensure programs end by reasonable time
    disabledHours = disabledHours.concat(
      Array.from({ length: 3 }, (_, i) => i + 21)
    )

    // Remove duplicates and sort
    disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

    return { disabledHours: () => disabledHours }
  }

  const handleCategoryChange = value => {
    const category = categories.find(category => category.id === value)

    // For create mode, clear questions and let QuestionTabs handle generation
    if (!isEdit) {
      Promise.all([
        setSelectedCategory(category),
        form.setFieldsValue({
          questions: [],
        }),
      ])
    } else {
      // For edit mode, just update the selected category
      // Don't clear questions as they should be preserved in edit mode
      setSelectedCategory(category)
    }
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={
        <Space size="middle" style={{ paddingTop: '10px' }}>
          <Button onClick={handleCancel} size="large" danger>
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            size="large"
            disabled={loading}
          >
            {isEdit ? t('common.update') : t('common.create')}
          </Button>
        </Space>
      }
      width={1200}
      className={isDarkMode ? 'dark-modal' : ''}
      style={{ top: '5%', paddingBottom: '10px' }}
      styles={{
        body: { maxHeight: '70vh' },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleFormValuesChange}
      >
        <Row style={{ height: 'calc(100vh - 250px)' }}>
          <Col
            span={!isEdit ? 12 : 24}
            style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}
          >
            {/* Basic Information */}
            <Card
              title={t('programManagement.form.basicInfo')}
              size="small"
              className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('programManagement.form.name')}
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.nameRequired'),
                      },
                      {
                        min: 3,
                        message: t('programManagement.form.nameMinLength'),
                      },
                      {
                        max: 50,
                        message: t('programManagement.form.nameMaxLength'),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t('programManagement.form.namePlaceholder')}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('programManagement.form.category')}
                    name="categoryId"
                    initialValue={
                      categories.length > 0 ? categories[0].id : undefined
                    }
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.categoryRequired'),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t(
                        'programManagement.form.categoryPlaceholder'
                      )}
                      size="large"
                      style={{ minWidth: 200 }} // Auto width + giới hạn nhỏ nhất
                      loading={loading}
                      showSearch
                      allowClear
                      popupMatchSelectWidth={false}
                      onChange={handleCategoryChange}
                      optionLabelProp="label"
                      disabled={isEdit} // Disable category selection in edit mode
                    >
                      {categories.map(category => (
                        <Option
                          key={category.id}
                          value={category.id}
                          label={`${category.name}`}
                        >
                          {category.name} ({category.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={t('programManagement.form.hostedBy')}
                    name="hostedBy"
                    initialValue={
                      counselors.length > 0 ? counselors[0].id : undefined
                    }
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.hostedByRequired'),
                      },
                    ]}
                  >
                    <Select
                      placeholder={t(
                        'programManagement.form.hostedByPlaceholder'
                      )}
                      size="large"
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {Array.isArray(counselors) &&
                        counselors?.map(counselor => (
                          <Option key={counselor.id} value={counselor.id}>
                            {counselor.fullName} - {counselor.counselorCode}
                          </Option>
                        ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={t('programManagement.form.thumbnail')}
                    name="thumbnail"
                    rules={[
                      {
                        required: true,
                        message: '',
                      },
                      {
                        validator: (_, value) => {
                          // Check conditions: thumbnail exists and not removed
                          const hasValidThumbnail =
                            thumbnail != null &&
                            form.getFieldValue('thumbnail').status !==
                              'removed' &&
                            value != null

                          if (!hasValidThumbnail) {
                            return Promise.reject(
                              new Error(
                                t('surveyManagement.form.thumbnailRequired')
                              )
                            )
                          }

                          return Promise.resolve()
                        },
                      },
                    ]}
                  >
                    {/* <Text type="secondary">{uploadProps.accept}</Text> */}
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />}>
                        {t('programManagement.form.uploadThumbnail')}
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={t('programManagement.form.description')}
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: t(
                          'programManagement.form.descriptionRequired'
                        ),
                      },
                      {
                        min: 10,
                        message: t(
                          'programManagement.form.descriptionMinLength'
                        ),
                      },
                      {
                        max: 500,
                        message: t(
                          'programManagement.form.descriptionMaxLength'
                        ),
                      },
                    ]}
                  >
                    <TextArea
                      placeholder={t(
                        'programManagement.form.descriptionPlaceholder'
                      )}
                      rows={4}
                      size="large"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Program Settings */}
            <Card
              title={t('programManagement.form.settings')}
              size="small"
              className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={t('programManagement.form.maxParticipants')}
                    name="maxParticipants"
                    rules={[
                      {
                        required: true,
                        message: t(
                          'programManagement.form.maxParticipantsRequired'
                        ),
                      },
                      {
                        type: 'number',
                        min: 10,
                        message: t('programManagement.form.maxParticipantsMin'),
                      },
                      {
                        type: 'number',
                        max: 50,
                        message: t('programManagement.form.maxParticipantsMax'),
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder={t(
                        'programManagement.form.maxParticipantsPlaceholder'
                      )}
                      size="large"
                      style={{ width: '100%' }}
                      min={10}
                      max={50}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Schedule & Location */}
            <Card
              title={t('programManagement.form.schedule')}
              size="small"
              className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label={t('programManagement.form.date')}
                    name="date"
                    dependencies={['startTime']}
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.dateRequired'),
                      },
                      {
                        validator: validateDate,
                      },
                    ]}
                  >
                    <DatePicker
                      size="large"
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      placeholder={t('programManagement.form.datePlaceholder')}
                      disabledDate={disabledDate}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={t('programManagement.form.startTime')}
                    name="startTime"
                    dependencies={['date']}
                    rules={[
                      {
                        validator: validateStartTime,
                      },
                    ]}
                  >
                    <TimePicker
                      size="large"
                      style={{ width: '100%' }}
                      format="HH:mm"
                      placeholder={t(
                        'programManagement.form.startTimePlaceholder'
                      )}
                      disabledTime={disabledStartTime}
                      minuteStep={30}
                      showSecond={false}
                      showNow={false}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={t('programManagement.form.endTime')}
                    name="endTime"
                    dependencies={['startTime']}
                    rules={[
                      {
                        validator: validateEndTime,
                      },
                    ]}
                  >
                    <TimePicker
                      size="large"
                      style={{ width: '100%' }}
                      format="HH:mm"
                      placeholder={t(
                        'programManagement.form.endTimePlaceholder'
                      )}
                      disabledTime={disabledEndTime}
                      minuteStep={30}
                      showSecond={false}
                      showNow={false}
                      disabled={!startTimeValue}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={t('programManagement.form.location')}
                    name="location"
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.locationRequired'),
                      },
                      {
                        max: 200,
                        message: t('programManagement.form.locationMaxLength'),
                      },
                    ]}
                  >
                    <Input
                      placeholder={t(
                        'programManagement.form.locationPlaceholder'
                      )}
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Survey Information */}
          <Col
            span={!isEdit ? 12 : 0}
            style={{ height: '100%', overflowY: 'auto', paddingLeft: '12px' }}
          >
            <Card
              title={t('surveyManagement.form.questions')}
              size="small"
              className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              {/* <Title level={5} style={{ marginBottom: '16px' }}>
                {t('surveyManagement.form.questions')}
              </Title> */}
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
                  {(fields, { add, remove }) => {
                    return (
                      <QuestionTabs
                        t={t}
                        fields={fields}
                        add={add}
                        remove={remove}
                        selectedCategory={selectedCategory}
                        messageApi={messageApi}
                        form={form}
                      />
                    )
                  }}
                </Form.List>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default ProgramModal

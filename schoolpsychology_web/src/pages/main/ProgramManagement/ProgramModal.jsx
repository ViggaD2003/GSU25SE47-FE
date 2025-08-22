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
import { ProgramCreationHelper } from '@/components'
// import { RECURRING_CYCLE } from '@/constants/enums'
import Title from 'antd/es/typography/Title'
import QuestionTabs from '../SurveyManagement/QuestionTabs'
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
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showHelper, setShowHelper] = useState(false)
  const [startTimeValue, setStartTimeValue] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  // const { sendMessage } = useWebSocket()

  const uploadProps = {
    name: 'image',
    accept: '.jpg, .jpeg, .png',
    maxCount: 1,
    fileList: thumbnail ? [thumbnail] : [],
    showUploadList: {
      extra: ({ size = 0 }) => (
        <span style={{ color: '#cccccc' }}>
          ({(size / 1024 / 1024).toFixed(2)}MB)
        </span>
      ),
      showRemoveIcon: true,
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
      form.setFieldValue('thumbnail', file)
      info.onSuccess(file)
      messageApi.success(t('programManagement.messages.fileUploadSuccess'))
      setThumbnail(file)
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
    if (visible) {
      setDefaultValues()
    }
  }, [visible, setDefaultValues])

  const handleFormValuesChange = (changedValues, _allValues) => {
    if (changedValues.startTime !== undefined) {
      setStartTimeValue(changedValues.startTime)
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
        // Validate both forms simultaneously
        ;[values] = await Promise.all([form.validateFields()])
      } catch {
        messageApi.error(t('programManagement.messages.fillAllFields'))
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
        categoryId: values.categoryId,
        // Add survey data
        addNewSurveyDto: {
          title: 'Khảo sát chương trình',
          description: 'Khảo sát chương trình được tạo khi tạo chương trình',
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
        },
      }

      // console.log('programData', programData)

      const requestData = {
        thumbnail: thumbnail,
        request: { ...programData },
      }

      const selectedCounselor = counselors.find(c => c.id === values.hostedBy)

      console.log('selectedCounselor', selectedCounselor)

      await onOk(requestData, selectedCounselor.email)

      handleCancel()
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
    const title = t('programManagement.modal.addTitle')

    return (
      <div className="flex items-center justify-between">
        <span>{title}</span>
        <Button
          type="text"
          icon={<BulbOutlined className="text-yellow-500" />}
          onClick={() => setShowHelper(!showHelper)}
          className="mr-4"
          size="small"
        >
          {t('programHelper.toggle')}
        </Button>
      </div>
    )
  }

  const validateDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error(t('programManagement.form.dateRequired')))
    }

    const minDate = MIN_DATE // Minimum 7 days from now
    if (value.isBefore(minDate, 'day')) {
      return Promise.reject(new Error(t('programManagement.form.dateMinDays')))
    }

    return Promise.resolve()
  }

  const validateTimeRange = () => {
    const startTime = form.getFieldValue('startTime')
    const endTime = form.getFieldValue('endTime')

    if (!startTime || !endTime) {
      return Promise.resolve()
    }

    // Check if start time is after 15:00 (3 PM)
    const minStartTime = dayjs().hour(15).minute(0).second(0)
    if (startTime.isBefore(minStartTime, 'minute')) {
      return Promise.reject(
        new Error(t('programManagement.form.startTimeAfter17'))
      )
    }

    // Check if time range is at least 1 hour
    const timeDiff = endTime.diff(startTime, 'hour', true)
    if (timeDiff < 1) {
      return Promise.reject(
        new Error(t('programManagement.form.timeRangeMinHour'))
      )
    }

    return Promise.resolve()
  }

  const disabledDate = current => {
    const minDate = MIN_DATE // Must be at least 7 days from now
    return current && current < minDate.startOf('day')
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
    Promise.all([
      setSelectedCategory(category),
      form.setFieldsValue({
        questions: [],
      }),
    ])
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={
        <Space size="middle" style={{ paddingTop: '10px' }}>
          <Button onClick={handleCancel} size="large">
            {t('common.cancel')}
          </Button>
          <Button
            type="primary"
            onClick={handleOk}
            loading={loading}
            size="large"
          >
            {t('common.create')}
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
            span={12}
            style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}
          >
            {/* Program Creation Helper */}
            <ProgramCreationHelper
              visible={showHelper}
              onClose={() => setShowHelper(false)}
            />

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
                        message: t('surveyManagement.form.thumbnailRequired'),
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
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.startTimeRequired'),
                      },
                      {
                        validator: validateTimeRange,
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
                      minuteStep={15}
                      showSecond={false}
                      showNow={false}
                    />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item
                    label={t('programManagement.form.endTime')}
                    name="endTime"
                    dependencies={['startTime', 'date']}
                    rules={[
                      {
                        required: true,
                        message: t('programManagement.form.endTimeRequired'),
                      },
                      {
                        validator: validateTimeRange,
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
                      minuteStep={15}
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
            span={12}
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
            </Card>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default ProgramModal

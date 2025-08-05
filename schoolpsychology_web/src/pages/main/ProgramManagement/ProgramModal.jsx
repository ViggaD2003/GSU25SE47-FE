import React, { useState, useEffect } from 'react'
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
import { useWebSocket } from '@/contexts/WebSocketContext'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select

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
  const [surveyForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [showHelper, setShowHelper] = useState(false)
  const [startTimeValue, setStartTimeValue] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const { sendMessage } = useWebSocket()

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
      const isLt2M = file.size / 1024 / 1024 < 10 // Giới hạn 10MB
      if (!isLt2M) {
        messageApi.error(t('programManagement.form.thumbnailSizeLimit'))
        info.onError(new Error(t('programManagement.form.thumbnailSizeLimit')))
      } else {
        form.setFieldValue('thumbnail', file)
        info.onSuccess(file)
        messageApi.success(t('programManagement.messages.fileUploadSuccess'))
        setThumbnail(file)
      }
    },
  }

  useEffect(() => {
    if (visible) {
      // Reset and set default values for new program
      form.resetFields()
      surveyForm.resetFields()
      setThumbnail(null)
      setStartTimeValue(null)

      form.setFieldsValue({
        maxParticipants: 10,
        date: dayjs().add(5, 'day'),
        categoryId: categories[0]?.id,
        hostedBy: counselors[0]?.id,
        thumbnail: null,
      })
      setSelectedCategory(categories[0]?.id)
    }
  }, [visible, form, surveyForm, categories, counselors])

  const handleFormValuesChange = (changedValues, _allValues) => {
    if (changedValues.startTime !== undefined) {
      setStartTimeValue(changedValues.startTime)
    }
    if (changedValues.categoryId !== undefined) {
      setSelectedCategory(changedValues.categoryId)
    }
  }

  // Handle form submission
  const handleOk = async () => {
    try {
      setLoading(true)
      let values
      let surveyValues

      try {
        // Validate both forms simultaneously
        ;[values, surveyValues] = await Promise.all([
          form.validateFields(),
          surveyForm.validateFields(),
        ])
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
          title: surveyValues.title,
          description: surveyValues.description,
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
            surveyValues.questions?.map(q => ({
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

      const requestData = {
        thumbnail: thumbnail,
        request: { ...programData },
      }

      const selectedCounselor = counselors.find(c => c.id === values.hostedBy)

      await onOk(requestData)
      sendMessage({
        title: 'New Program',
        content: `You have a new program ${values.name}`,
        username: selectedCounselor.email,
      })

      handleCancel()
    } catch (error) {
      console.error('Submit failed:', error)
      messageApi.error(t('programManagement.messages.submitError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    surveyForm.resetFields()
    setThumbnail(null)
    setStartTimeValue(null)
    setSelectedCategory(null)
    onCancel()
  }

  const handleCreateSession = async () => {
    try {
      setSessionLoading(true)
      const values = await sessionForm.validateFields()

      const sessionData = {
        supportProgramId: selectedProgram?.id,
        topic: values.topic,
        description: values.sessionDescription,
        status: 'UPCOMING',
        date: values.sessionDate.format('YYYY-MM-DD'),
        createSlotRequest: {
          slotName: values.slotName,
          startDateTime: dayjs(values.startDateTime).format(
            'YYYY-MM-DDTHH:mm:ss'
          ),
          endDateTime: dayjs(values.endDateTime).format('YYYY-MM-DDTHH:mm:ss'),
          status: 'PUBLISHED',
          hostById: values.hostBy,
          type: 'PROGRAM',
        },
      }

      await programAPI.postProgramSession(sessionData)
      message.success(t('programManagement.form.sessionCreatedSuccess'))
      sessionForm.resetFields()
      setSessionDate(null)

      // Refresh sessions list
      try {
        const sessionsData = await programAPI.getProgramSessions(
          selectedProgram.id
        )
        setProgramSessions(sessionsData.data || [])
        onRefresh()
      } catch (error) {
        console.error('Error refreshing sessions:', error)
      }
    } catch (error) {
      console.error('Error creating session:', error)
      message.error(t('programManagement.form.sessionCreatedError'))
    } finally {
      setSessionLoading(false)
    }
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

    const minDate = dayjs().add(5, 'day')
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

    // Check if start time is after 15:00
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
    const minDate = dayjs().add(5, 'day')
    return current && current < minDate.startOf('day')
  }

  const disabledStartTime = () => {
    const date = form.getFieldValue('date')
    if (!date) return {}

    let disabledHours = []

    disabledHours = disabledHours.concat(
      Array.from({ length: 17 }, (_, i) => i)
    )
    disabledHours = disabledHours.concat(
      Array.from({ length: 4 }, (_, i) => i + 20)
    )

    // Remove duplicates and sort
    disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

    return { disabledHours: () => disabledHours }
  }

  const disabledEndTime = () => {
    const date = form.getFieldValue('date')
    if (!date) return {}

    const startTime = form.getFieldValue('startTime')

    let disabledHours = []

    const startHour = dayjs(startTime).add(1, 'hour').hour()

    disabledHours = disabledHours.concat(
      Array.from({ length: startHour }, (_, i) => i)
    )
    disabledHours = disabledHours.concat(
      Array.from({ length: 3 }, (_, i) => i + 21)
    )

    // Remove duplicates and sort
    disabledHours = Array.from(new Set(disabledHours)).sort((a, b) => a - b)

    // End time must be at least 1 hour after start time

    return { disabledHours: () => disabledHours }
  }

  const handleCategoryChange = value => {
    setSelectedCategory(value)
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
      style={{ top: '5%' }}
      styles={{
        body: { maxHeight: '70vh' },
      }}
    >
      <Row style={{ height: 'calc(100vh - 200px)' }}>
        <Col
          span={12}
          style={{ height: '100%', overflowY: 'auto', paddingRight: '12px' }}
        >
          <Form
            form={form}
            layout="vertical"
            onValuesChange={handleFormValuesChange}
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
                    initialValue={categories[0]?.id}
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
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={handleCategoryChange}
                    >
                      {categories.map(category => (
                        <Option key={category.id} value={category.id}>
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
                    initialValue={counselors[0]?.id}
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
          </Form>
        </Col>

        {/* Survey Information */}
        <Col
          span={12}
          style={{ height: '100%', overflowY: 'auto', paddingLeft: '12px' }}
        >
          <Form
            form={surveyForm}
            layout="vertical"
            name="surveyForm"
            style={{ height: '100%' }}
          >
            <Card
              title={t('programManagement.form.basicInfo')}
              size="small"
              className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
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
                  showCount
                  maxLength={500}
                  placeholder={t(
                    'surveyManagement.form.descriptionPlaceholder'
                  )}
                />
              </Form.Item>

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
            </Card>
          </Form>
        </Col>
      </Row>
    </Modal>
  )
}

export default ProgramModal

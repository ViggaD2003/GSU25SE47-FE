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
  InputNumber,
  Switch,
  Select,
} from 'antd'
import { BulbOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import dayjs from 'dayjs'
import { ProgramCreationHelper } from '@/components'
import { programAPI } from '@/services/programApi'
import accountApi from '@/services/accountApi'

const { Text } = Typography
const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const ProgramModal = ({
  visible,
  onCancel,
  onOk,
  onRefresh,
  selectedProgram,
  isEdit,
  isView,
  categories = [],
  message,
}) => {
  const { t } = useTranslation()
  const { isDarkMode } = useTheme()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [startDate, setStartDate] = useState(null)
  const [showHelper, setShowHelper] = useState(false)
  const [sessionForm] = Form.useForm()
  const [sessionLoading, setSessionLoading] = useState(false)
  const [counselors, setCounselors] = useState([])
  const [sessionDate, setSessionDate] = useState(null)
  const [programSessions, setProgramSessions] = useState([])
  const [sessionsLoading, setSessionsLoading] = useState(false)

  useEffect(() => {
    if (visible && selectedProgram) {
      const programIsOnline = selectedProgram.isOnline
      setIsOnline(programIsOnline)
      setStartDate(dayjs(selectedProgram.startDate))

      form.setFieldsValue({
        name: selectedProgram.name,
        description: selectedProgram.description,
        maxParticipants: selectedProgram.maxParticipants,
        dateRange: [
          dayjs(selectedProgram.startDate),
          dayjs(selectedProgram.endDate),
        ],
        isOnline: programIsOnline,
        location: selectedProgram.location,
        categoryId: selectedProgram.category?.id || selectedProgram.categoryId,
      })
    } else if (visible && !selectedProgram) {
      form.resetFields()
      setIsOnline(true)
      setStartDate(null)
      // Set default values for new program
      form.setFieldsValue({
        isOnline: true,
        maxParticipants: 10,
      })
    }
  }, [visible, selectedProgram, form])

  // Fetch counselors and sessions when modal opens in edit mode
  useEffect(() => {
    if (visible && isEdit && selectedProgram) {
      const fetchData = async () => {
        // Fetch counselors
        const counselorData = await accountApi.getCounselors()
        if (counselorData) {
          setCounselors(counselorData)
        }

        // Fetch program sessions
        setSessionsLoading(true)
        try {
          const sessionsData = await programAPI.getProgramSessions(
            selectedProgram.id
          )
          setProgramSessions(sessionsData.data || [])
        } catch (error) {
          console.error('Error fetching program sessions:', error)
          setProgramSessions([])
        } finally {
          setSessionsLoading(false)
        }
      }
      fetchData()
    }
  }, [visible, isEdit, selectedProgram])

  const handleOk = async () => {
    if (isView) {
      onCancel()
      return
    }

    try {
      setLoading(true)
      const values = await form.validateFields()

      // Transform data to match API format
      const programData = {
        name: values.name,
        description: values.description,
        maxParticipants: values.maxParticipants,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        isOnline: values.isOnline,
        status: 'UPCOMING',
        location: values.location || '',
        categoryId: values.categoryId,
      }

      await onOk(programData)
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
      message.error(t('programManagement.messages.formError'))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    sessionForm.resetFields()
    setSessionDate(null)
    setProgramSessions([])
    setCounselors([])
    setSessionsLoading(false)
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
    const title = isView
      ? t('programManagement.modal.viewTitle')
      : isEdit
        ? t('programManagement.modal.editTitle')
        : t('programManagement.modal.addTitle')

    return (
      <div className="flex items-center justify-between">
        <span>{title}</span>
        {!isView && (
          <Button
            type="text"
            icon={<BulbOutlined className="text-yellow-500" />}
            onClick={() => setShowHelper(!showHelper)}
            className="mr-4"
            size="small"
          >
            {t('programHelper.toggle')}
          </Button>
        )}
      </div>
    )
  }

  const validateDateRange = (_, value) => {
    if (!value || value.length !== 2) {
      return Promise.reject(
        new Error(t('programManagement.form.dateRangeRequired'))
      )
    }

    const [selectedStartDate, selectedEndDate] = value
    const minStartDate = dayjs().add(5, 'day')

    // Ngày bắt đầu phải cách ngày hiện tại ít nhất 5 ngày
    if (selectedStartDate.isBefore(minStartDate, 'day')) {
      return Promise.reject(
        new Error(t('programManagement.form.startDateMinDays'))
      )
    }

    // Ngày kết thúc phải sau ngày bắt đầu ít nhất 1 ngày
    if (selectedEndDate.isBefore(selectedStartDate.add(1, 'day'), 'day')) {
      return Promise.reject(
        new Error(t('programManagement.form.endDateMinDays'))
      )
    }

    return Promise.resolve()
  }

  // Handle online/offline change
  const handleTypeChange = checked => {
    setIsOnline(checked)
    // Clear location if switching to online
    if (checked) {
      form.setFieldsValue({ location: '' })
    }
  }

  // Handle date range change
  const handleDateRangeChange = dates => {
    if (dates && dates.length === 2) {
      setStartDate(dates[0])
    } else {
      setStartDate(null)
    }
  }

  // Disable dates before minimum start date
  const disabledDate = current => {
    const minDate = dayjs().add(5, 'day')
    return current && current < minDate.startOf('day')
  }

  // Disable dates outside program duration for session date
  const disabledSessionDate = current => {
    if (
      !selectedProgram ||
      !selectedProgram.startDate ||
      !selectedProgram.endDate
    ) {
      return false
    }

    const programStartDate = dayjs(selectedProgram.startDate).startOf('day')
    const programEndDate = dayjs(selectedProgram.endDate).endOf('day')

    // Check if date is outside program duration
    const outsideProgramDuration =
      current && (current < programStartDate || current > programEndDate)

    // Check if date already has a session
    const hasExistingSession = programSessions.some(session => {
      if (!session.date) return false
      const sessionDate = dayjs(session.date).startOf('day')
      return current && current.isSame(sessionDate, 'day')
    })

    return outsideProgramDuration || hasExistingSession
  }

  // Validate session date within program duration
  const validateSessionDate = (_, value) => {
    if (!value) {
      return Promise.resolve()
    }

    if (
      !selectedProgram ||
      !selectedProgram.startDate ||
      !selectedProgram.endDate
    ) {
      return Promise.resolve()
    }

    const sessionDate = dayjs(value)
    const programStartDate = dayjs(selectedProgram.startDate)
    const programEndDate = dayjs(selectedProgram.endDate)

    // Check if date is within program duration
    if (
      sessionDate.isBefore(programStartDate, 'day') ||
      sessionDate.isAfter(programEndDate, 'day')
    ) {
      return Promise.reject(
        new Error(t('programManagement.form.sessionDateInvalid'))
      )
    }

    // Check if date already has a session
    const hasExistingSession = programSessions.some(session => {
      if (!session.date) return false
      const existingSessionDate = dayjs(session.date).startOf('day')
      return sessionDate.isSame(existingSessionDate, 'day')
    })

    if (hasExistingSession) {
      return Promise.reject(
        new Error(t('programManagement.form.sessionDateExists'))
      )
    }

    return Promise.resolve()
  }

  // Handle session date change and auto-generate slot times
  const handleSessionDateChange = date => {
    setSessionDate(date)
    if (date) {
      // Set fixed time: 6:00 PM to 8:00 PM
      const startDateTime = dayjs(date).hour(18).minute(0).second(0)
      const endDateTime = dayjs(date).hour(20).minute(0).second(0)

      sessionForm.setFieldsValue({
        startDateTime: startDateTime,
        endDateTime: endDateTime,
      })
    } else {
      sessionForm.setFieldsValue({
        startDateTime: null,
        endDateTime: null,
      })
    }
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      className={isDarkMode ? 'dark-modal' : ''}
      style={{ maxHeight: '90vh' }}
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto', padding: '20px' },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleOk} disabled={isView}>
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
                    max: 100,
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
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.categoryRequired'),
                  },
                ]}
              >
                <Select
                  placeholder={t('programManagement.form.categoryPlaceholder')}
                  size="large"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
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
            <Col span={24}>
              <Form.Item
                label={t('programManagement.form.description')}
                name="description"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.descriptionRequired'),
                  },
                  {
                    min: 10,
                    message: t('programManagement.form.descriptionMinLength'),
                  },
                  {
                    max: 500,
                    message: t('programManagement.form.descriptionMaxLength'),
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
            <Col span={8}>
              <Form.Item
                label={t('programManagement.form.type')}
                name="isOnline"
                valuePropName="checked"
              >
                <div className="flex items-center space-x-2">
                  <Switch size="default" onChange={handleTypeChange} />
                  <Text type="secondary">
                    {isOnline
                      ? t('programManagement.form.typeOnline')
                      : t('programManagement.form.typeOffline')}
                  </Text>
                </div>
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
            <Col span={12}>
              <Form.Item
                label={t('programManagement.form.dateRange')}
                name="dateRange"
                rules={[
                  {
                    required: true,
                    message: t('programManagement.form.dateRangeRequired'),
                  },
                  {
                    validator: validateDateRange,
                  },
                ]}
              >
                <RangePicker
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={[
                    t('programManagement.form.startDate'),
                    t('programManagement.form.endDate'),
                  ]}
                  disabledDate={disabledDate}
                  onChange={handleDateRangeChange}
                />
              </Form.Item>
            </Col>
            {!isOnline && (
              <Col span={12}>
                <Form.Item
                  label={t('programManagement.form.location')}
                  name="location"
                  rules={[
                    {
                      required: !isOnline,
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
            )}
            {isOnline && startDate && (
              <Col span={12}>
                <Form.Item label={t('programManagement.form.programInfo')}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Text type="secondary" className="text-sm">
                      {t('programManagement.form.onlineInfo')}
                    </Text>
                  </div>
                </Form.Item>
              </Col>
            )}
          </Row>
        </Card>

        {/* Session Creation - Only show in edit mode */}
        {isEdit && selectedProgram && (
          <Card
            title={t('programManagement.form.sessionCreation')}
            size="small"
            className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
          >
            <Row gutter={24}>
              {/* Session Form - Left Side */}
              <Col span={14}>
                <Form
                  form={sessionForm}
                  layout="vertical"
                  onFinish={handleCreateSession}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.topic')}
                        name="topic"
                        rules={[
                          {
                            required: true,
                            message: t('programManagement.form.topicRequired'),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t(
                            'programManagement.form.topicPlaceholder'
                          )}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.sessionDate')}
                        name="sessionDate"
                        rules={[
                          {
                            required: true,
                            message: t(
                              'programManagement.form.sessionDateRequired'
                            ),
                          },
                          {
                            validator: validateSessionDate,
                          },
                        ]}
                      >
                        <DatePicker
                          size="large"
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY"
                          disabledDate={disabledSessionDate}
                          onChange={handleSessionDateChange}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={t('programManagement.form.sessionDescription')}
                    name="sessionDescription"
                    rules={[
                      {
                        required: true,
                        message: t(
                          'programManagement.form.sessionDescriptionRequired'
                        ),
                      },
                    ]}
                  >
                    <TextArea
                      placeholder={t(
                        'programManagement.form.sessionDescriptionPlaceholder'
                      )}
                      rows={3}
                      size="large"
                    />
                  </Form.Item>

                  <Text strong className="block mb-3">
                    {t('programManagement.form.slotDetails')}
                  </Text>

                  {sessionDate && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Text className="text-yellow-700">
                        ⏰ {t('programManagement.form.fixedTimeInfo')}
                      </Text>
                    </div>
                  )}

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.slotName')}
                        name="slotName"
                        rules={[
                          {
                            required: true,
                            message: t(
                              'programManagement.form.slotNameRequired'
                            ),
                          },
                        ]}
                      >
                        <Input
                          placeholder={t(
                            'programManagement.form.slotNamePlaceholder'
                          )}
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.hostBy')}
                        name="hostBy"
                        rules={[
                          {
                            required: true,
                            message: t('programManagement.form.hostByRequired'),
                          },
                        ]}
                      >
                        <Select
                          placeholder={t(
                            'programManagement.form.hostByPlaceholder'
                          )}
                          size="large"
                          showSearch
                          loading={!counselors || counselors.length === 0}
                          notFoundContent={
                            !counselors || counselors.length === 0
                              ? 'Loading counselors...'
                              : 'No counselors found'
                          }
                          filterOption={(input, option) =>
                            option.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {counselors.map(counselor => (
                            <Option key={counselor.id} value={counselor.id}>
                              {counselor.fullName} ({counselor.email})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.startDateTime')}
                        name="startDateTime"
                        rules={[
                          {
                            required: true,
                            message: t(
                              'programManagement.form.startDateTimeRequired'
                            ),
                          },
                        ]}
                      >
                        <DatePicker
                          showTime
                          size="large"
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY HH:mm"
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={t('programManagement.form.endDateTime')}
                        name="endDateTime"
                        rules={[
                          {
                            required: true,
                            message: t(
                              'programManagement.form.endDateTimeRequired'
                            ),
                          },
                        ]}
                      >
                        <DatePicker
                          showTime
                          size="large"
                          style={{ width: '100%' }}
                          format="DD/MM/YYYY HH:mm"
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button
                      type="primary"
                      loading={sessionLoading}
                      size="large"
                      className="w-full"
                      onClick={handleCreateSession}
                    >
                      {t('programManagement.form.createSession')}
                    </Button>
                  </Form.Item>
                </Form>
              </Col>

              {/* Session Info - Right Side */}
              <Col span={10}>
                <div className="space-y-4">
                  {/* Program Info */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Text strong className="block mb-3 text-blue-700">
                      {t('programManagement.form.sessionInfo')}
                    </Text>
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <Text strong>Program:</Text> {selectedProgram?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <Text strong>Category:</Text>{' '}
                        {selectedProgram?.category?.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        <Text strong>Duration:</Text>{' '}
                        {selectedProgram?.startDate && selectedProgram?.endDate
                          ? `${dayjs(selectedProgram.startDate).format('DD/MM/YYYY')} - ${dayjs(selectedProgram.endDate).format('DD/MM/YYYY')}`
                          : 'N/A'}
                      </div>
                      <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                        <Text strong>⚠️ Important:</Text> Session date must be
                        within program duration
                      </div>
                      <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                        <Text strong>👥 Available Counselors:</Text>{' '}
                        {counselors?.length || 0} counselors available
                      </div>
                      <div className="text-sm text-gray-600">
                        <Text strong>Max Participants:</Text>{' '}
                        {selectedProgram?.maxParticipants}
                      </div>
                      <div className="text-sm text-gray-600">
                        <Text strong>Type:</Text>{' '}
                        {selectedProgram?.isOnline ? 'Online' : 'Offline'}
                      </div>
                      {!selectedProgram?.isOnline &&
                        selectedProgram?.location && (
                          <div className="text-sm text-gray-600">
                            <Text strong>Location:</Text>{' '}
                            {selectedProgram.location}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Existing Sessions */}
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <Text strong className="block mb-3 text-gray-700">
                      📅 {t('programManagement.form.existingSessions')} (
                      {programSessions.length})
                    </Text>
                    {programSessions.length > 0 && (
                      <div className="mb-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <Text className="text-xs text-yellow-700">
                          ⚠️ {t('programManagement.form.disabledDatesWarning')}
                        </Text>
                      </div>
                    )}
                    {sessionsLoading ? (
                      <div className="text-center text-gray-500">
                        {t('programManagement.form.loadingSessions')}
                      </div>
                    ) : programSessions.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {programSessions.map((session, index) => (
                          <div
                            key={session.id || index}
                            className="p-2 bg-white rounded border border-gray-200 border-l-4 border-l-red-400"
                          >
                            <div className="text-sm font-medium text-gray-800">
                              {session.topic ||
                                `${t('programManagement.form.sessionItem')} ${index + 1}`}
                            </div>
                            <div className="text-xs text-gray-600">
                              📅{' '}
                              <span className="font-medium text-red-600">
                                {session.date
                                  ? dayjs(session.date).format('DD/MM/YYYY')
                                  : 'No date'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              ⏰ 6:00 PM - 8:00 PM
                            </div>
                            <div className="text-xs text-gray-600">
                              👤{' '}
                              {session.createSlotRequest?.hostById || 'No host'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm">
                        {t('programManagement.form.noSessionsYet')}
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Space size="middle">
            <Button onClick={handleCancel} size="large">
              {t('common.cancel')}
            </Button>
            {!isView && (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                {isEdit ? t('common.save') : t('common.create')}
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </Modal>
  )
}

export default ProgramModal
